import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EventsService } from './events.service'

@Component({
  selector: 'kypo-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})


export class MenuComponent {

    games = [];
    gamesOfSelectedPlayer = [];
    @Output() selectDataset = new EventEmitter();
    @Input() selectedPlayer;

    constructor(private eventsService:EventsService) {}

    ngOnInit() {
        this.eventsService.getGames().subscribe(games => {
            // console.log(games);
            this.games = games;
        });
    }

    onClick(game) {
        // console.log(game);
        this.selectDataset.emit(game);
    }

    ngOnChanges() {
        this.eventsService.getGamesOfPlayer(this.selectedPlayer).subscribe(games => {
            console.log(games);
            this.gamesOfSelectedPlayer = games;
        });
    }
}
