import { ApplicationRef, Component, Inject, isDevMode, Optional, PLATFORM_ID } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { EMPTY, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { trace, traceUntilFirst } from '@angular/fire/performance';
import { Auth, authState, signInAnonymously, signOut, User, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { isPlatformServer } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'wishingwell';

  private readonly userDisposable: Subscription|undefined;
  public readonly user: Observable<User | null> = EMPTY;
  showLoginButton = false;
  constructor(
    public readonly auth: AngularFireAuth, @Inject(PLATFORM_ID) platformId: object,
    appRef: ApplicationRef,
  ) {
    if (isDevMode()) {
      appRef.isStable.pipe(
        debounceTime(200),
        distinctUntilChanged(),
      ).subscribe(it => {
        console.log('isStable', it);
      });
    }
    if (!isPlatformServer(platformId)) {
      this.userDisposable = this.auth.authState.pipe(
        traceUntilFirst('auth'),
        map(u => !!u)
      ).subscribe(isLoggedIn => {
        this.showLoginButton = isLoggedIn as boolean;
      });
    }
  }
}
