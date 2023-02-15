import { Component, ElementRef, Inject, OnInit, Optional, PLATFORM_ID } from '@angular/core';
import firebase from 'firebase/compat/app';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';
import { Router } from '@angular/router';
//## swipper
import Swiper, { Autoplay } from 'swiper';
//##swiper
import { register } from 'swiper/element';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FacebookAuthProvider, GoogleAuthProvider } from '@angular/fire/auth';

interface userlogin {
  username: string,
  password: string,
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  GOOGLEICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/></svg>'
  FACEBOOKICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/></svg>'
  userForm: userlogin = {
    username: "",
    password: ""
  };
  imagesURLS = ["../../assets/img/couple.jpg", "../../assets/img/booties.jpg", "../../assets/img/baptism.jpg"];
  swiper: any;
  constructor(public router: Router,
    public readonly auth: AngularFireAuth, @Inject(PLATFORM_ID) platformId: object, 
    iconRegistry: MatIconRegistry, 
    sanitizer: DomSanitizer,
    private _elementRef : ElementRef) { 
      iconRegistry.addSvgIconLiteral('googleicon', sanitizer.bypassSecurityTrustHtml(this.GOOGLEICON));
      iconRegistry.addSvgIconLiteral('facebookicon', sanitizer.bypassSecurityTrustHtml(this.FACEBOOKICON))
    }
  ngOnInit(): void {
    register();
    this.swiper = new Swiper('.swiper', {
            modules: [Autoplay],
            speed: 2000,
            spaceBetween: 4,
            navigation: false,
            autoplay: {
              delay: 3500,
              disableOnInteraction: true
            },
            slidesPerView: 1
    });
  }

  loginWithGoogle() {
    this.auth.signInWithPopup(new GoogleAuthProvider()).then((res) => {
      if(res.user){
        this.router.navigateByUrl('');
      }
    });
  }
  loginWithFacebook() {
    this.auth.signInWithPopup(new FacebookAuthProvider()).then((res) => {
      if(res.user){
        this.router.navigateByUrl('');
      }
    });
  }

}
