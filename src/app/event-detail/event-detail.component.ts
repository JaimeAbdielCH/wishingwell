import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, NgModule, OnDestroy, OnInit, Optional, Type, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { doc, onSnapshot, Firestore } from "firebase/firestore";
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Subscription, interval } from 'rxjs';
import { Evento } from '../interfaces/evento.interface';

import { Loader } from "@googlemaps/js-api-loader";
import Swiper, { Autoplay, Pagination } from 'swiper';
import { Auth } from '@angular/fire/auth';

interface ConteoRegresivo {
  dia: string,
  hrs: string,
  min: string,
  seg: string,
}

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss',],
  encapsulation: ViewEncapsulation.None,
})
export class EventDetailComponent implements OnInit, OnDestroy {
  event_iden: string;
  owner_iden?: string;
  Event: Evento | undefined;
  timer: any;
  conteoRegresivo: ConteoRegresivo;
  conteo$: Subscription;
  eventDate: Date = new Date();

  loader = new Loader({
    apiKey: "AIzaSyCoo-KSGgJHoEVbK0DblDeFqxg287-TGBw",
    version: "weekly",
  });

  map?: google.maps.Map;
  zoom = 15;
  center: google.maps.LatLngLiteral = { lat: 8.9923203, lng: -79.5101788 };
  latlng?: string = ' 8.9923203,-79.5101788';
  marker?: google.maps.Marker;
  unsub: any;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  swiper: any;
  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private cdr: ChangeDetectorRef,
    @Optional() private auth: Auth,
  ) {
    this.event_iden = this.route.snapshot.paramMap.get('id')!;
    const getEvent = doc(firestore, 'eventos/' + this.event_iden);
    

    this.unsub = onSnapshot(getEvent, (ele) => {
      this.Event = ele.data() as Evento;
      this.eventDate = new Date(this.Event.fecha+' '+this.Event.hora+':00');
      this.conteoRegresivo = getCountDownObject(this.eventDate);
      if (this.Event.latlng) {
        this.latlng = this.Event.latlng;
        this.center = {
          lat: +this.Event.latlng.split(',')[0],
          lng: +this.Event.latlng.split(',')[1]
        };
      }
      this.loader.load().then(() => {
        this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
          center: this.center,
          zoom: this.zoom,
        });
        this.marker = new google.maps.Marker({
          position: this.center,
          map: this.map,
        });
      });
    });
    this.conteoRegresivo = getCountDownObject(new Date());
    this.conteo$ = interval(1000).subscribe(e => {
      this.setTimeChips();
    })
  }



  setTimeChips(): void {
    this.conteoRegresivo = getCountDownObject(this.eventDate)
  }

  ngOnDestroy(): void {
    this.conteo$.unsubscribe();
    this.unsub = null;
  }

  async ngOnInit(): Promise<void> {
    const currUser  = await this.auth.currentUser;
    this.owner_iden = currUser?.uid;

    this.swiper = new Swiper('.swiper', {
      modules: [Autoplay],
      speed: 4000,
      spaceBetween: 4,
      navigation: true,
      autoplay: {
        delay: 3500,
        disableOnInteraction: true
      },
      pagination: {
        el: '.swiper-pagination-progressbar-fill',
        type: 'progressbar',
      },
      slidesPerView: 1
});

  }

}

function getCountDownObject(fecha: Date): ConteoRegresivo {
  const pad = (n: string, width: number, z?: string) => { z = z || '0'; n = n + ''; return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n; }
  const thousand = 1000;
  const sixty = 60;
  const twentyfour = 24;

  const now = new Date().getTime();
  const t = fecha.valueOf() - now;

  const days = Math.floor(t / (thousand * sixty * sixty * twentyfour));
  const hours = Math.floor((t % (thousand * sixty * sixty * twentyfour)) / (thousand * sixty * sixty));
  const minutes = Math.floor((t % (thousand * sixty * sixty)) / (thousand * sixty));
  const seconds = Math.floor((t % (thousand * sixty)) / thousand);

  const contret = {
    dia: pad(days.toString(), 2),
    hrs: pad(hours.toString(), 2),
    min: pad(minutes.toString(), 2),
    seg: pad(seconds.toString(), 2)
  }
  return contret;
}
