import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { formatDate } from '@angular/common';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, ObservableInput, of } from 'rxjs';
import { Evento } from '../interfaces/evento.interface';
import { ImageInfo, Regalo } from '../interfaces/regalo.interface';
import { RegalosComponent } from '../regalos/regalos.component';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, FirebaseStorage, deleteObject } from "@angular/fire/storage";
import { docData, doc, Firestore, DocumentReference, updateDoc, arrayRemove, arrayUnion } from '@angular/fire/firestore';
import { Loader } from "@googlemaps/js-api-loader";
import { MatDialog } from '@angular/material/dialog';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-editar-evento',
  templateUrl: './editar-evento.component.html',
  styleUrls: ['./editar-evento.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class EditarEventoComponent implements OnInit {
  eventoDoc: DocumentReference<Evento>;
  evento$: Observable<Evento>;
  fechaPicker = new FormControl(new Date('7/28/2022'));
  evento_indentifier = "";
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  public persistenceEnabled: Promise<boolean> = Promise.resolve(false);
  addOnBlur = true;
  regalosColumns = ['imgThumb', 'nombre', 'precio', 'estado', 'opciones'];
  regalos: Regalo[] = [];
  nombreEvento?: string;
  eventoHora?: string;
  descripcionEvento?: string;
  tituloEvento?: string;
  informacionPago?: string;
  headerImageFile: string = "";
  portadaImageFile: string = "";
  imagenesEventos: ImageInfo[] = new Array<ImageInfo>();
  storage: FirebaseStorage;

  selectedFiles?: FileList;
  selectedFileNames: string[] = [];
  progressInfos: any[] = [];
  previews: string[] = [];
  message: string[] = [];

  loader = new Loader({
    apiKey: "AIzaSyCoo-KSGgJHoEVbK0DblDeFqxg287-TGBw",
    version: "weekly",
  });

  map?: google.maps.Map;
  zoom = 15;
  center: google.maps.LatLngLiteral = { lat: 8.9923203, lng: -79.5101788 };
  latlng?: string = ' 8.9923203,-79.5101788';
  marker?: google.maps.Marker;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private firestore: Firestore,
    @Inject(LOCALE_ID) private locale: string,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef) {

    this.evento_indentifier = this.route.snapshot.paramMap.get('id')!;
    this.eventoDoc = doc(firestore, 'eventos/'+this.evento_indentifier) as DocumentReference<Evento>;
    this.evento$ = docData(this.eventoDoc) as Observable<Evento>;

    this.evento$.subscribe((evento: Evento) => {
        this.nombreEvento = evento.nombre;
        this.descripcionEvento = evento.descripcion;
        this.tituloEvento = evento.tituloDescripcion;
        this.informacionPago = evento.informacionDePago;
        this.fechaPicker = new FormControl(new Date(evento.fecha as string));
        this.eventoHora = evento.hora;
        this.regalos = evento.regalos as Regalo[];
        this.imagenesEventos = evento.imagenesEventos as ImageInfo[];
        if (evento.latlng) {
          this.latlng = evento.latlng;
          this.center = {
            lat: +evento.latlng.split(',')[0],
            lng: +evento.latlng.split(',')[1]
          };
        }
        this.loader.load().then(() => {
          this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
            center: this.center,
            zoom: this.zoom,
          });
          this.marker = new google.maps.Marker({
            position: this.center,
            map: this.map,
          });
          this.map.addListener("click", (e:any) => {
            const pos = e.latLng;
            if (this.marker) {
              this.latlng = pos.lat() + ',' + pos.lng();
              this.marker.setPosition(pos);
              evento.latlng = this.latlng;
              updateDoc(this.eventoDoc, {latlng: this.latlng})
            }
          });
        });
  
      });
    
    this.storage = getStorage();
  }

  ngOnInit(): void {

  }

  update(evento: Evento): void {
    evento.regalos = this.regalos;
    evento.descripcion = this.descripcionEvento as string;
    evento.tituloDescripcion = this.tituloEvento;
    evento.informacionDePago = this.informacionPago;
    evento.nombre = this.nombreEvento;
    this.previews = [];
    this.progressInfos = [];
    updateDoc(this.eventoDoc, evento);
  }

  remove(invitado: string): void {
    updateDoc(this.eventoDoc, {
      invitados: arrayRemove(invitado) as any as string[]
    });
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our fruit
    if (value) {
      updateDoc(this.eventoDoc, {
        invitados: arrayUnion(value) as any as string[]
      })
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  edit(invitado: string, event: MatChipEditedEvent) {
    /* const value = event.value.trim();

    // Remove fruit if it no longer has a name
    if (!value) {
      this.remove(invitado);
      return;
    }

    // Edit existing fruit
    const index = this.fruits.indexOf(invitado);
    if (index >= 0) {
      this.fruits[index].name = value;
    } */
  }

  addRegalo(evento: Evento) {
    const newRegalo: Regalo = {
      nombre: '',
      precio: 0,
      imagenUrl: [],
      estado: 'LIBRE',
      pruebadePagoUrl: '',
    }
    const regaloDialogRef = this.dialog.open(RegalosComponent, {
      data: { eventid: this.evento_indentifier, regalo: newRegalo }
    });

    regaloDialogRef.afterClosed().subscribe((data: { eventid: string, regalo: Regalo }) => {
      if (data.regalo != undefined) {
        evento.regalos?.push(data.regalo);
        updateDoc(this.eventoDoc, evento);
      }
    });
  }

  editRegalo(regalo: Regalo, evento: Evento) {
    const regaloDialogRef = this.dialog.open(RegalosComponent, {
      data: { eventid: this.evento_indentifier, regalo: regalo }
    });

    regaloDialogRef.afterClosed().subscribe((regalo: Regalo) => {
      if (regalo != undefined) {
        const regaloId = this.regalos?.indexOf(regalo);
        if (regaloId != undefined) {
          this.regalos[regaloId] = regalo;
          evento.regalos = this.regalos;
          updateDoc(this.eventoDoc, evento);
        }
      }
    });
  }

  goBack() {
    this.router.navigateByUrl('eventos');
  }

  textChanged = (element: string) => {
    switch (element) {
      case 'nombre':
        if (this.nombreEvento) {
          updateDoc(this.eventoDoc, {
            nombre: this.nombreEvento
          })
        }
        break;
      case 'fecha':
        if (this.fechaPicker) {
          updateDoc(this.eventoDoc, {
            fecha: formatDate(this.fechaPicker.value as Date, 'MM/dd/YYYY', this.locale)
          })
        }
        break;
      case 'tituloEvento':
        if (this.tituloEvento) {
          updateDoc(this.eventoDoc, {
            tituloDescripcion: this.tituloEvento
          })
        }
        break;
      case 'descripcionEvento':
        if (this.descripcionEvento) {
          updateDoc(this.eventoDoc, {
            descripcion: this.descripcionEvento
          })
        }
        break;
      case 'informacionPago':
        if (this.informacionPago) {
          updateDoc(this.eventoDoc, {
            informacionDePago: this.informacionPago
          })
        }
        break;
      case 'hora':
        if (this.eventoHora) {
          updateDoc(this.eventoDoc, {
            hora: this.eventoHora
          })
        }
    }
  }

  onImageHeaderChanged(event: any): void {
    if (event.target.files.length) {
      this.subirArchvivoUnico(event.target.files[0], "header");
    }

  }

  onImagePortadaChanged(event: any): void {
    if (event.target.files.length) {
      this.subirArchvivoUnico(event.target.files[0], "portada");
    }
  }

  subirArchvivoUnico(file: File, para: "header" | "portada"): void {
    if (file) {
      // Create a root reference
      const metadata = {
        contentType: file.type,
      };
      // Create a reference to 'mountains.jpg'
      const fileToUploadRef = ref(this.storage, 'evento/' + this.evento_indentifier + '/images/' + file.name);
      const uploadingFile = uploadBytesResumable(fileToUploadRef, file, metadata);

      uploadingFile.on('state_changed',
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded        
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
            case 'error':
              console.log(snapshot.metadata);
          }
        },
        (error) => {
          // Handle unsuccessful uploads

        },
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          getDownloadURL(uploadingFile.snapshot.ref).then((downloadURL) => {
            switch (para) {
              case "header":
                this.headerImageFile = downloadURL;
                updateDoc(this.eventoDoc, {
                  imagenHeader: downloadURL
                })
                break;
              case "portada":
                this.portadaImageFile = downloadURL;
                updateDoc(this.eventoDoc, {
                  imagenPortada: downloadURL
                })
            }
          });


        }
      );
    }
  }

  selectFiles(event: any): void {
    this.progressInfos = [];
    this.selectedFileNames = [];
    this.selectedFiles = event.target.files;
    this.previews = [];
    if (this.selectedFiles && this.selectedFiles[0]) {
      const numberOfFiles = this.selectedFiles.length;
      for (let i = 0; i < numberOfFiles; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previews.push(e.target.result);
        };
        reader.readAsDataURL(this.selectedFiles[i]);
        this.selectedFileNames.push(this.selectedFiles[i].name);
      }
      this.uploadFiles();
    }
  }

  uploadFiles(): void {
    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.upload(i, this.selectedFiles[i]);
      }
    }
  }

  upload(idx: number, file: File): void {
    this.progressInfos[idx] = { value: 0, fileName: file.name };
    //place where go the code for upload to storage
    if (file) {

      // Create a reference to 'mountains.jpg'
      const fileToUploadRef = ref(this.storage, 'evento/' + this.evento_indentifier + '/images/' + file.name);
      const uploadingFile = uploadBytesResumable(fileToUploadRef, file);

      uploadingFile.on('state_changed',
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          this.progressInfos[idx].value = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(2);

          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        },
        (error) => {
          // Handle unsuccessful uploads
          this.message.push(error.message);
          this.progressInfos[idx].value = 0;
        },
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          getDownloadURL(uploadingFile.snapshot.ref).then((downloadURL) => {
            const imgInf: ImageInfo = {
              name: file.name,
              url: downloadURL
            }
            this.imagenesEventos?.push(imgInf);
            updateDoc(this.eventoDoc, {
              imagenesEventos: arrayUnion(imgInf) as any as ImageInfo[]
            })
          });

          this.message.push('Archivo subido satisfactoriamente, ' + file.name);
          setTimeout(() => {
            this.progressInfos[idx] = null;
          }, 7000)
        }
      );
    }
  }

  deleteImage(image: ImageInfo) {
    updateDoc(this.eventoDoc, {
      imagenesEventos: arrayRemove(image) as any as ImageInfo[]
    })
    const imageStorageRef = ref(this.storage, image.url);
    deleteObject(imageStorageRef).catch((error) => {
      console.log('error deleting file');
    })
  }

}
