import { Component, OnInit, Optional } from '@angular/core';
import { Evento } from '../interfaces/evento.interface';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { collection, CollectionReference, deleteDoc, doc, Firestore, getDocs, query, QuerySnapshot, setDoc, where } from '@angular/fire/firestore';
@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.scss']
})
export class EventosComponent implements OnInit {
  private misEventos?: CollectionReference<Evento>;
  eventos?: Evento[];
  user: any;
  constructor(private route: Router,  @Optional() private auth: Auth, private firestore: Firestore) { 
    
  }

  async ngOnInit(): Promise<void> {
    this.user = await this.auth.currentUser;
    this.misEventos = collection(this.firestore, 'eventos', ) as CollectionReference<Evento>;
    
    const q = query(this.misEventos, where('ownerId', '==', this.user.uid));
    getDocs<Evento>(q).then(querySnapshot => {
      if(this.eventos == undefined) {
        this.eventos = [];
      }
      querySnapshot.forEach(ele => {
        this.eventos?.push(ele.data());
      })
    });
  }

  openEvent = (eventid: number) => {
    this.route.navigateByUrl('evento/'+eventid);
  }

  removeEvent = (eventid: string) => {
    const docToDelete = doc(this.firestore, 'evento', eventid);
    deleteDoc(docToDelete);
  }

  nuevoEvento = async () => {
    const today = new Date();
    const id = doc<Evento>(this.misEventos as CollectionReference<Evento>, 'evento');
    const nuevoEvento: Evento = {
      id: id.id,
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
    setDoc<Evento>(id, nuevoEvento).then(() => {
      this.route.navigateByUrl('evento/'+id.id);
    });
    
  }

  displayedColumns: string[] = ["nombre", "fecha", "opciones"]
  
  goHome = () => {
    this.route.navigateByUrl('');
  }
  

}
