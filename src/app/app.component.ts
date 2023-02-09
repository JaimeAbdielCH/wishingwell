import { ApplicationRef, Component, isDevMode, Optional } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { EMPTY, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { traceUntilFirst } from '@angular/fire/performance';
import { Auth, authState, signInAnonymously, signOut, User, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';

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
    @Optional() private auth: Auth,
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
    if (auth) {
      this.user = authState(this.auth);
      this.userDisposable = authState(this.auth).pipe(
        traceUntilFirst('auth'),
        map(u => !!u)
      ).subscribe(isLoggedIn => {
        this.showLoginButton = isLoggedIn;
      });
    }
  }
}
