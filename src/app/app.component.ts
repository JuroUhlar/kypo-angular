import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Kypo game run visualisation tool';
  selectedGame = 'none';
  selectedPlayer = 'none';

  // sidebar variable
  _opened: boolean = false;

  onSelectDataset(game) {
    if(game != '' && game != 'none' && game != null) {
          // console.log("Parent component received " + game);
          this.selectedGame = game;
    }
    // closes sidebar
    // this._closeSidebar();
  }

  onSelectPlayer(player){
    this.selectedPlayer = player;
    this._opened = true;
    console.log("[App compomennt] Selected player is ", this.selectedPlayer );
  }

  _toggleSidebar() {
    this._opened = !this._opened;
  }

  _closeSidebar() {
    this._opened = false;
  }
}




