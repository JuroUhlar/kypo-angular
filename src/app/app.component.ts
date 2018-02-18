import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Game } from './models/game.model'
import { Store } from '@ngrx/store';
import * as fromRoot from './reducers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Kypo CTF visualisation';

  selectedGame : Observable<Game>;

  // sidebar variable
  _opened: boolean = false;

  constructor(private store : Store<fromRoot.State>) {
    this.selectedGame = store.select(fromRoot.selectSelectedGame);

    this.selectedGame.subscribe((value) => console.log(value));
  }

  

  _toggleSidebar() {
    this._opened = !this._opened;
  }

  _closeSidebar() {
    this._opened = false;
  }
}
