import { TestBed, async } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule, MatDialogModule } from '@angular/material';

import { AngularFontAwesomeModule } from 'angular-font-awesome/angular-font-awesome';

import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { VizViewComponent } from './viz-view/viz-view.component';
import { ChartComponent } from './chart/chart.component';

// services
import { D3Service } from 'd3-ng2-service';
import { EventsService } from './services/events.service';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        MenuComponent,
        VizViewComponent,
        ChartComponent
      ],
      imports: [
        FormsModule,
        HttpModule,
        AngularFontAwesomeModule,
        MatSidenavModule,
        MatDialogModule,
        BrowserAnimationsModule
      ],
      providers: [
        EventsService,
        D3Service
      ]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it(`should have as title 'Kypo CTF visualisation'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('Kypo CTF visualisation');
  }));

  // it('should render title in a h1 tag', async(() => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  //   const compiled = fixture.debugElement.nativeElement;
  //   expect(compiled.querySelector('h1').textContent).toContain('app works!');
  // }));
});
