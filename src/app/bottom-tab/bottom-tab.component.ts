import { Component, OnInit } from '@angular/core';
import { getDownloadURL, getStorage, ref, Storage } from '@angular/fire/storage';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Title } from '@angular/platform-browser';
import { AngularFirestore, AngularFirestoreCollectionGroup } from '@angular/fire/compat/firestore';
import { AppConstant } from '../Constants';
import { Invitado } from '../interfaces/evento.interface';
import { Observable } from 'rxjs';

const TRANSPARENT_PNG
  = 'https://via.placeholder.com/150';

@Component({
  selector: 'app-bottom-tab',
  templateUrl: './bottom-tab.component.html',
  styleUrls: ['./bottom-tab.component.scss']
})
export class BottomTabComponent implements OnInit {
  screenTitle: string | undefined;
  private invitedEventos: AngularFirestoreCollectionGroup<Invitado> | undefined;
  invitedEventos$: Observable<Invitado[]> | undefined;
  user: any;
  eventInvitedCound: any;
  constructor(
    public title: Title, 
    public readonly auth: AngularFireAuth, 
    public router: Router, 
    private storage: AngularFireStorage, 
    private route: ActivatedRoute,
    public firestore: AngularFirestore) {
    this.screenTitle = title.getTitle();
    this.loadData();
   }
   
   async loadData() {
    this.user = await this.auth.currentUser;
    this.invitedEventos = this.firestore.collectionGroup(AppConstant.EVENTOS_INVITADOS_COLLECTION, ref => ref.where('email', '==', this.user.email));
    this.invitedEventos$ = this.invitedEventos.valueChanges();
    this.invitedEventos$.subscribe((evento: Invitado[]) => {
      console.log(evento);
      this.eventInvitedCound = evento.length;
    })
   }

  ngOnInit(): void {

  }

  logOut(){
    this.auth.signOut();
  }

  goToEventos(){
    this.router.navigateByUrl('eventos');
  }

  goToUserInfo() {
    this.router.navigateByUrl('user-info');
  }

}
