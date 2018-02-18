import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule, MatDialogModule } from '@angular/material';

import { D3Service } from 'd3-ng2-service';

import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { EventsService } from './services/events.service';
import { VizViewComponent } from './viz-view//viz-view.component';
import { ChartComponent } from './chart/chart.component';

import { AngularFontAwesomeModule } from 'angular-font-awesome/angular-font-awesome';

import { StoreModule } from '@ngrx/store';
import { reducers } from './reducers';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';


@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    VizViewComponent,
    ChartComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AngularFontAwesomeModule,
    MatSidenavModule,
    MatDialogModule,
    BrowserAnimationsModule,
    StoreModule.forRoot({ menu: reducers.menu } ),
    StoreDevtoolsModule.instrument({
      maxAge: 10 //  Retains last 10 states
    })
  ],
  providers: [EventsService, D3Service],
  bootstrap: [AppComponent]
})
export class AppModule { }
