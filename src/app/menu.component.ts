import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EventsService } from './events.service'

@Component({
  selector: 'kypo-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})


export class MenuComponent {

    games = [];
    @Output() selectDataset = new EventEmitter();

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
}
