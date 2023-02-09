import { Component, OnInit } from '@angular/core';
import { from, Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { TransferState } from '@angular/platform-browser';
import { traceUntilFirst } from '@angular/fire/performance';
import { getDownloadURL, getStorage, ref, Storage } from '@angular/fire/storage';
import { keepUnstableUntilFirst } from '@angular/fire';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

const TRANSPARENT_PNG
  = 'https://via.placeholder.com/150';

@Component({
  selector: 'app-bottom-tab',
  templateUrl: './bottom-tab.component.html',
  styleUrls: ['./bottom-tab.component.scss']
})
export class BottomTabComponent implements OnInit {
  public readonly taylorHill$: Observable<string>;

  constructor(public auth: AngularFireAuth,
    public router: Router) {
    const storage = getStorage(); 
    const icon = ref(storage, 'taylorhill.png');
    this.taylorHill$ = from(getDownloadURL(icon)).pipe(
      keepUnstableUntilFirst,
      traceUntilFirst('storage'),
      startWith(TRANSPARENT_PNG),
    );
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
