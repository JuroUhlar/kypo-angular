import { TestBed, async } from '@angular/core/testing';
import { MenuComponent } from './menu.component';
import { HttpModule } from '@angular/http';

import { EventsService } from '../services/events.service';

describe('Component: Menu', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MenuComponent],
      imports: [HttpModule],
    }).compileComponents();
  });

  it('should create Menu component', () => {
    let fixture = TestBed.createComponent(MenuComponent);
    let component = fixture.componentInstance;

    expect(component).toBeTruthy();
  });

  it('should have `games` property with initialy empty array', () => {
    let fixture = TestBed.createComponent(MenuComponent);
    let component = fixture.componentInstance;

    expect(component.games).toEqual([]);
  });

  it('should have H2 element with `Datasets` content', () => {
    let fixture = TestBed.createComponent(MenuComponent);
    let compiled = fixture.debugElement.nativeElement;

    expect(compiled.querySelector("h2").textContent).toEqual("Datasets");
  });
});
