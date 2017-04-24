import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { D3Service } from 'd3-ng2-service';

import { AppComponent } from './app.component';
import { MenuComponent } from './menu.component';
import { EventsService } from './events.service';
import { VizViewComponent } from './viz-view.component';
import { ChartComponent } from './chart/chart.component';

import { SidebarModule } from 'ng-sidebar';


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
    SidebarModule.forRoot()
  ],
  providers: [EventsService, D3Service],
  bootstrap: [AppComponent]
})
export class AppModule { }
