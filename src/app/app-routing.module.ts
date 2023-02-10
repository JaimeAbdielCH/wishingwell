import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { EventosComponent } from './eventos/eventos.component';
import { RegalosComponent } from './regalos/regalos.component';


import { EditarEventoComponent } from './editar-evento/editar-evento.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { HomeComponent } from './home/home.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { EventDetailComponent } from './event-detail/event-detail.component';

import { AuthGuard } from '@angular/fire/auth-guard'

//##angular material
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule, MAT_CHIPS_DEFAULT_OPTIONS} from '@angular/material/chips';
import {MatDialogModule} from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule} from '@angular/material/progress-bar';
import { MatListModule} from '@angular/material/list';
import {MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {MatMenuModule} from '@angular/material/menu';
import {MatTabsModule} from '@angular/material/tabs';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

const routes: Routes = [ { path: '', component: HomeComponent, pathMatch: 'full', canActivate: [AuthGuard] },
{path: 'user-info', component: UserInfoComponent, pathMatch: 'full', canActivate: [AuthGuard]},
{ path: 'eventos', component: EventosComponent, pathMatch: 'full', canActivate: [AuthGuard] },
{ path: 'evento/:id', component: EditarEventoComponent, canActivate: [AuthGuard] },
{ path: 'evento-detail/:id', component: EventDetailComponent, canActivate: [AuthGuard] },
{ path: 'regalos', component: RegalosComponent, canActivate: [AuthGuard] },
{ path: '**', component: PageNotFoundComponent }];

@NgModule({
  declarations:[
    HomeComponent,
    EventosComponent,
    RegalosComponent,
    EditarEventoComponent,
    PageNotFoundComponent,
    UserInfoComponent,
    EventDetailComponent
  ],
  imports: [
    RouterModule.forRoot(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatMenuModule,
    MatTabsModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatDialogModule,
    MatToolbarModule,
    MatProgressBarModule,
    MatListModule,
  ],
  exports: [RouterModule],
  providers: [MatDatepickerModule]})
export class AppRoutingModule { }

