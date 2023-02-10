import { Component, OnInit, Optional } from '@angular/core';
import { Evento } from '../interfaces/evento.interface';
import { Router } from '@angular/router';
import { CollectionReference, doc, Firestore, getDocs, query, setDoc, where } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { collection } from '@firebase/firestore';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private misEventos: CollectionReference<Evento> | undefined;
  
  eventos: Evento[] | undefined;
  
  user: any;
  constructor(private route: Router, private auth: Auth, private firestore: Firestore) {
    this.loadEventos();
  }
  

  ngOnInit(): void {
  }

  loadEventos = async () => {
    this.user = await this.auth.currentUser;
    this.misEventos = collection(this.firestore, 'eventos') as CollectionReference<Evento>;
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

  nuevoEvento = async () => {
    const today = new Date();
    const newDoc = doc(this.firestore, 'eventos');
    const currUser = await this.auth.currentUser;
    const userId = currUser?.uid;
    const nuevoEvento: Evento = {
      id: newDoc.id,
      ownerId: userId as string,
      nombre: "",
      descripcion: "",
      imagenesEventos: [],
      fecha: today.toLocaleString().split(',')[0],
      invitados: [],
      regalos: []
    }

    setDoc(newDoc, nuevoEvento).then(() => {
      this.route.navigateByUrl('evento/'+newDoc.id);
    });
    
  }

  seeEventId(id:string) {
      console.log(id);
      //this.route.navigateByUrl('evento-detail/'+id);
  }

}
