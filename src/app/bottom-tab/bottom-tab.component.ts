import { Component, OnInit } from '@angular/core';
import { getDownloadURL, getStorage, ref, Storage } from '@angular/fire/storage';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Title } from '@angular/platform-browser';

const TRANSPARENT_PNG
  = 'https://via.placeholder.com/150';

@Component({
  selector: 'app-bottom-tab',
  templateUrl: './bottom-tab.component.html',
  styleUrls: ['./bottom-tab.component.scss']
})
export class BottomTabComponent implements OnInit {
  screenTitle: string | undefined;
  constructor(
    public title: Title, 
    public readonly auth: AngularFireAuth, 
    public router: Router, 
    private storage: AngularFireStorage, 
    private route: ActivatedRoute, ) {
    this.screenTitle = title.getTitle();
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
