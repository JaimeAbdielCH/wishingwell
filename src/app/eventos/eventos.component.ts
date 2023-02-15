import { Component, OnInit, Optional } from '@angular/core';
import { Evento } from '../interfaces/evento.interface';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { collection, CollectionReference, deleteDoc, doc, Firestore, getDocs, query, QuerySnapshot, setDoc, where } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.scss']
})
export class EventosComponent implements OnInit {
  private misEventos?: AngularFirestoreCollection<Evento>;
  eventos?: Observable<Evento[]>;
  user: any;
  constructor(private route: Router,  private auth: AngularFireAuth, private firestore: AngularFirestore) { 
    
  }

  async ngOnInit(): Promise<void> {
    this.user = await this.auth.currentUser;
    this.misEventos = this.firestore.collection<Evento>('eventos', ref => ref.where('ownerId', '==', this.user.uid));
    this.eventos = this.misEventos.valueChanges();
  }

  openEvent = (eventid: number) => {
    this.route.navigateByUrl('evento/'+eventid);
  }

  removeEvent = (eventid: string) => {
    this.misEventos?.doc(eventid).delete();
  }

  nuevoEvento = async () => {
    const today = new Date();
    const id = this.firestore.createId();
    const nuevoEvento: Evento = {
      id: id,
      ownerId: this.user.uid,
      nombre: "",
      descripcion: "",
      imagenPortada: "",
      imagenesEventos: [],
      imagenHeader: "",
      fecha: today.toLocaleString().split(',')[0],
      invitados: [],
      regalos: []
    }

    this.misEventos?.doc(id).set(nuevoEvento).then(() => {
      this.route.navigateByUrl('evento/'+id);
    });
    
  }

  displayedColumns: string[] = ["nombre", "fecha", "opciones"]
  
  goHome = () => {
    this.route.navigateByUrl('');
  }  

}
