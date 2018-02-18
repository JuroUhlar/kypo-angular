import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EventsService } from '../services/events.service';
import { Game } from '../models/game.model'


import { Store } from '@ngrx/store';
import * as MenuActions from './menu.actions';
import * as fromRoot from '../reducers';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'kypo-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css'],
    providers: [EventsService]
})


export class MenuComponent {

    games: Observable<Game[]>;
    selectedGame: Observable<Game>;

    constructor(
        private eventsService: EventsService,
        private store: Store<fromRoot.State>
    ) {
        this.selectedGame = store.select(fromRoot.selectSelectedGame);
        this.games = store.select(fromRoot.selectGames);
    }

    ngOnInit() {
        this.eventsService.getGames().subscribe(games => {
            // console.log(games);
            // this.games = games;
            this.store.dispatch(new MenuActions.LoadGames(games));
        });
    }

    onClick(game: Game) {
        // console.log(game);
        this.store.dispatch(new MenuActions.SelectGame(game));
    }
}
