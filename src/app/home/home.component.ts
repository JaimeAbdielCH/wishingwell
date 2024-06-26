import { Component, OnInit, Optional } from '@angular/core';
import { Evento, Invitado } from '../interfaces/evento.interface';
import { Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreCollectionGroup } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AppConstant } from '../Constants';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private misEventos: AngularFirestoreCollection<Evento> | undefined;
  
  private publicEvents: AngularFirestoreCollection<Evento> | undefined;

  eventos$: Observable<Evento[]> | undefined;
 
  publicEventos$: Observable<Evento[]> | undefined;


  user: any;
  constructor(
    private route: Router, 
    public readonly auth: AngularFireAuth, 
    public firestore: AngularFirestore) {
    this.loadEventos();
  }
  

  ngOnInit(): void {
  }

  loadEventos = async () => {
    this.user = await this.auth.currentUser;
    this.misEventos = this.firestore.collection<Evento>
    ('eventos', ref => ref.where('ownerId', '==', this.user.uid).where('publicado', '==', true));
    this.eventos$ = this.misEventos.valueChanges();

    this.publicEvents = this.firestore.collection<Evento>
    ('eventos', ref => ref.where('private', '==', false));
    this.publicEventos$ = this.publicEvents.valueChanges();

  }

  nuevoEvento = async () => {
    const today = new Date();
    const newDocId = this.firestore.createId();
    const currUser = await this.auth.currentUser;
    const userId = currUser?.uid;
    const nuevoEvento: Evento = {
      id: newDocId,
      ownerId: userId as string,
      nombre: "",
      descripcion: "",
      imagenesEventos: [],
      fecha: today.toLocaleString().split(',')[0],
      invitados: [],
      regalos: [],
      publicado: false,
    }

    this.misEventos?.doc(newDocId).set(nuevoEvento).then(() => {
      this.route.navigateByUrl('evento/'+newDocId);
    });
    
  }

  seeEventId(id:string) {
      this.route.navigateByUrl('evento-detail/'+id);
  }

}
