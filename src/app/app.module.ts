import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdSidenavModule, MdDialogModule } from '@angular/material';

import { D3Service } from 'd3-ng2-service';

import { AppComponent } from './app.component';
import { MenuComponent } from './menu.component';
import { EventsService } from './events.service';
import { VizViewComponent } from './viz-view.component';
import { ChartComponent } from './chart/chart.component';

import { AngularFontAwesomeModule } from 'angular-font-awesome/angular-font-awesome'


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
    MdSidenavModule,
    MdDialogModule,
    BrowserAnimationsModule
  ],
  providers: [EventsService, D3Service],
  bootstrap: [AppComponent]
})
export class AppModule { }
