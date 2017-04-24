import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Kypo vizualization main component';
  selectedGame = 'none';
  selectedPlayer = 'none';

  onSelectDataset(game) {
    if(game != '' && game != 'none' && game != null) {
          // console.log("Parent component received " + game);
          this.selectedGame = game;
    }
  }

  onSelectPlayer(player){
    this.selectedPlayer = player;
    console.log("[App compomennt] Selected player is ", this.selectedPlayer );
  }
}
