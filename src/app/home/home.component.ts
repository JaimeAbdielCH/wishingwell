import { Component, OnInit } from '@angular/core';
import { Evento } from '../interfaces/evento.interface';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private misEventos: AngularFirestoreCollection<Evento> | undefined;
  private eventosInvitado: AngularFirestoreCollection<Evento> | undefined;
  eventos$: Observable<Evento[]> | undefined;
  invitado$: Observable<Evento[]> | undefined;
  user: any;
  constructor(private afs: AngularFirestore, private route: Router, private auth: AngularFireAuth) {
    this.loadEventos();
  }
  

  ngOnInit(): void {
  }

  loadEventos = async () => {
    this.user = await this.auth.currentUser;
    this.misEventos = this.afs.collection<Evento>
    ('eventos', ref => ref.where('ownerId', '==', this.user.uid));
    this.eventos$ = this.misEventos.valueChanges();
    this.eventosInvitado = this.afs.collection<Evento>
    ('eventos', ref => ref.where('invitados', 'array-contains', this.user.email));
    this.invitado$ = this.eventosInvitado.valueChanges();
  }

  nuevoEvento = async () => {
    const today = new Date();
    const id = this.afs.createId();
    const currUser = await this.auth.currentUser;
    const userId = currUser?.uid;
    const nuevoEvento: Evento = {
      id: id,
      ownerId: userId as string,
      nombre: "",
      descripcion: "",
      imagenesEventos: [],
      fecha: today.toLocaleString().split(',')[0],
      invitados: [],
      regalos: []
    }

    this.misEventos?.doc(id).set(nuevoEvento).then(() => {
      this.route.navigateByUrl('evento/'+id);
    });
    
  }

  seeEventId(id:string) {
      this.route.navigateByUrl('evento-detail/'+id);
  }

}
