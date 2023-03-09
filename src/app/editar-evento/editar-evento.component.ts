import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { formatDate } from '@angular/common';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, ObservableInput, of } from 'rxjs';
import { Evento, Invitado } from '../interfaces/evento.interface';
import { ImageInfo, Regalo } from '../interfaces/regalo.interface';
import { RegalosComponent } from '../regalos/regalos.component';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, FirebaseStorage, deleteObject } from "@angular/fire/storage";
import { arrayRemove, arrayUnion } from '@angular/fire/firestore';
import { Loader } from "@googlemaps/js-api-loader";
import { MatDialog } from '@angular/material/dialog';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatRadioChange } from '@angular/material/radio';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { AppConstant } from '../Constants';

@Component({
  selector: 'app-editar-evento',
  templateUrl: './editar-evento.component.html',
  styleUrls: ['./editar-evento.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class EditarEventoComponent implements OnInit {
  eventoDoc: AngularFirestoreDocument<Evento>;
  evento$: Observable<Evento>;
  invitados$: Observable<Invitado[]>;
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
  defaultImages = false;
  public color:string;
  
  
  minDate?:Date;
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

  tiposDeEventos = ["Boda", "Bautizo", "Baby Shower", "Cumpleaños"];
  defUrl:string = "";
  imagenesDefault = {
    boda: [
      "./assets/img/happy-mothers-day.jpg",
      "./assets/img/heart.jpg",
      "./assets/img/peonies.jpg",
      "./assets/img/rose.jpg"
    ],
    babyshower: [
      "./assets/img/rusk-with-mice.jpg",
      "./assets/img/desktop.jpg",
      "./assets/img/rusk-with-mice-cyan.jpg"
    ],
    bautizo: [
      "./assets/img/christening.jpg",
      "./assets/img/cross.jpg",
      "./assets/img/church.jpg"
    ],
    cumples: [
      "./assets/img/happy-birthday-ballons.jpg",
      "./assets/img/happy-birthday-valentine.jpg",
      "./assets/img/happy-birthday-cake.jpg"
    ]
  };

  imagenesDefaultUrl: string[] = [];
  mensajeInvitacion: any;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    @Inject(LOCALE_ID) private locale: string,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef) {
    this.minDate = new Date()
    this.color = '';
    this.evento_indentifier = this.route.snapshot.paramMap.get('id')!;
    this.eventoDoc = this.firestore.doc<Evento>(AppConstant.EVENTOS_COLLECTION+'/'+this.evento_indentifier);
    
    this.invitados$ = this.eventoDoc.collection<Invitado>(AppConstant.EVENTOS_INVITADOS_COLLECTION).valueChanges();
    this.evento$ = this.eventoDoc.valueChanges() as Observable<Evento>;
    
    this.evento$.subscribe((evento: Evento) => {
        console.log(evento);
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
              this.eventoDoc.update({
                latlng: this.latlng
              })
            }
          });
        });
        if(evento.defaultImage){
          switch(evento.tipoEvento) {
            case "Boda": {
              this.imagenesDefaultUrl = this.imagenesDefault.boda;
              break;
            };
            case "Bautizo": {
              this.imagenesDefaultUrl = this.imagenesDefault.bautizo;
              break;
            };
            case "Baby Shower": {
              this.imagenesDefaultUrl = this.imagenesDefault.babyshower;
              break;
            };
            case "Cumpleaños": {
              this.imagenesDefaultUrl = this.imagenesDefault.cumples;
              break;
            };
          }
        }
      });
    
    this.storage = getStorage();
  }

  ngOnInit(): void {

  }

  onImagenDisponible(event: MatCheckboxChange) {
    this.eventoDoc.update({
      defaultImage: event.checked
    });
    if(!event.checked) {
      this.eventoDoc.update({
        imagenHeader: 'https://via.placeholder.com/700x300?text='
      })
    }
  }

  onDefaultImageChanged(event: any) {
    this.eventoDoc.update({
      imagenHeader: event
    })
  }

  eventTypeChanged(event: any) {
    this.eventoDoc.update({
      tipoEvento: event
    });
    switch(event) {
      case "Boda": {
        this.imagenesDefaultUrl = this.imagenesDefault.boda;
        break;
      };
      case "Bautizo": {
        this.imagenesDefaultUrl = this.imagenesDefault.bautizo;
        break;
      };
      case "Baby Shower": {
        this.imagenesDefaultUrl = this.imagenesDefault.babyshower;
        break;
      };
      case "Cumpleaños": {
        this.imagenesDefaultUrl = this.imagenesDefault.cumples;
        break;
      };
    }
  }

  colorChanged(event: any) {
    this.eventoDoc.update({
      fontColor: event.srcElement.value
    });
  }

  onTogle(event: MatSlideToggleChange) {
    this.eventoDoc.update({
      private: event.checked
    });
  }

  onPublicadoTogle(event: MatSlideToggleChange) {
    this.eventoDoc.update({
      publicado: event.checked
    });
  }

  onFontChoose(event: MatRadioChange) {
    this.eventoDoc.update({
      fontFamily: event.value
    });
  }

  update(evento: Evento): void {
    evento.regalos = this.regalos;
    evento.descripcion = this.descripcionEvento as string;
    evento.tituloDescripcion = this.tituloEvento;
    evento.informacionDePago = this.informacionPago;
    evento.nombre = this.nombreEvento;
    this.previews = [];
    this.progressInfos = [];
    this.eventoDoc.update(evento);
  }

  remove(invitado: Invitado): void {
    this.eventoDoc.collection(AppConstant.EVENTOS_INVITADOS_COLLECTION).doc(invitado.id).delete().then(() => {
      console.log('collection deleted');
    });
  }

  add(event: MatChipInputEvent): void {
    const id = this.firestore.createId();
    const value:Invitado = {id: id, email: event.value, notificado: false}
    // Add our fruit
    if (value.email != '') {
      this.eventoDoc.collection(AppConstant.EVENTOS_INVITADOS_COLLECTION).doc(id).set(value);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  edit(invitado: Invitado, event: MatChipEditedEvent) {
    const value = event.value;

    // Remove fruit if it no longer has a name
    if (!value) {
      this.remove(invitado);
      return;
    }
    this.eventoDoc.collection(AppConstant.EVENTOS_INVITADOS_COLLECTION).doc(invitado.id).update(invitado);
  }

  addRegalo(evento: Evento) {
    console.log(evento);
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
        this.eventoDoc.update(evento);
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
          this.eventoDoc.update(evento);
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
          this.eventoDoc.update({
            nombre: this.nombreEvento
          });
        }
        break;
      case 'fecha':
        if (this.fechaPicker) {
          
          this.eventoDoc.update({
            fecha: formatDate(this.fechaPicker.value as Date, 'MM/dd/YYYY', this.locale)
          });
        }
        break;
      case 'tituloEvento':
        if (this.tituloEvento) {
          this.eventoDoc.update({
            tituloDescripcion: this.tituloEvento
          });
        }
        break;
      case 'descripcionEvento':
        if (this.descripcionEvento) {
          this.eventoDoc.update({
            descripcion: this.descripcionEvento
          });
        }
        break;
      case 'informacionPago':
        if (this.informacionPago) {
          this.eventoDoc.update({
            informacionDePago: this.informacionPago
          });
        }
        break;
      case 'mensajeInvitacion':
        if(this.mensajeInvitacion) {
          this.eventoDoc.update({
            mensajeInvitacion: this.mensajeInvitacion
          });
        }
        break;
      case 'hora':
        if (this.eventoHora) {
          this.eventoDoc.update({
            hora: this.eventoHora
          });
        }
        break;
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
                this.eventoDoc.update({
                  imagenHeader: downloadURL
                });
                break;
              case "portada":
                this.portadaImageFile = downloadURL;
                this.eventoDoc.update({
                  imagenPortada: downloadURL
                });
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
            this.eventoDoc.update({
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
    this.eventoDoc.update({
      imagenesEventos: arrayRemove(image) as any as ImageInfo[]
    })
    const imageStorageRef = ref(this.storage, image.url);
    deleteObject(imageStorageRef).catch((error) => {
      console.log('error deleting file');
    })
  }

}
