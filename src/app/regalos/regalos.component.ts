import { Component, Inject, OnInit } from '@angular/core';
import {MatDialogRef as MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Regalo, ImageInfo } from '../interfaces/regalo.interface';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "@angular/fire/storage";
import { Observable } from 'rxjs';
import { CONFIG } from '@angular/fire/compat/analytics';


@Component({
  selector: 'app-regalos',
  templateUrl: './regalos.component.html',
  styleUrls: ['./regalos.component.scss']
})
export class RegalosComponent implements OnInit {

  selectedFiles?: FileList;
  selectedFileNames: string[] = [];
  pruebadePagoFile: string = "";
  progressInfos: any[] = [];
  message: string[] = [];
  previews: string[] = [];
  canSave: boolean = false;
  constructor(@Inject(MAT_DIALOG_DATA) public data: {eventid: string, regalo: Regalo},public dialogRef: MatDialogRef<RegalosComponent>) { 
  }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  selectFiles(event: any): void {
    this.message = [];
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
    }
  }

  pruebadePago(event: any): void {
    this.pruebadePagoFile = "";
    if(event.target.files.length)
    {
      this.uploadPruebadepago(event.target.files[0]);
    }
    
  }

  uploadFiles(): void {
    this.message = [];
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
      // Create a root reference
      const storage = getStorage();

      // Create a reference to 'mountains.jpg'
      const fileToUploadRef = ref(storage, 'evento/'+this.data.eventid+'/regalos/'+file.name);
      const uploadingFile = uploadBytesResumable(fileToUploadRef, file);
      
      uploadingFile.on('state_changed', 
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        this.progressInfos[idx].value = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        
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
          this.data.regalo.imagenUrl?.push({
            name: file.name,
            url: downloadURL
          });
        });
        
        this.message.push('Archivo subido satisfactoriamente, '+file.name);
      }
    );
    }
  }

  uploadPruebadepago(file: File): void {
    if (file) {
      // Create a root reference
      const storage = getStorage();
      const metadata = {
        contentType: file.type,
      };
      // Create a reference to 'mountains.jpg'
      const fileToUploadRef = ref(storage, 'evento/'+this.data.eventid+'/regalos/'+file.name);
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
        this.message.push(error.message);
      }, 
      () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        getDownloadURL(uploadingFile.snapshot.ref).then((downloadURL) => {
          this.data.regalo.pruebadePagoUrl = downloadURL;
          this.data.regalo.estado = 'PAGADO';
        });
        
        this.message.push('Prueba de pago subida, '+file.name);
      }
    );
    }
  }
}
