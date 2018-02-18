import * as MenuActions from './menu.actions';
import { Game } from '../models/game.model';

export interface State {
    selectedGame: Game;
    games: Game[]
}

const initialState: State = {
    // selectedGame:  {
    //     id: 1,
    //     name: 'Example',
    //     alias: 'example',
    //   },
    selectedGame: null,
    games: []
}

export function reducer(state = initialState, action: MenuActions.All): State {
    switch (action.type) {
        case MenuActions.SELECT_GAME: {
            return {
                ...state,
                selectedGame: action.payload
            };
        }

        case MenuActions.LOAD_GAMES: {
            return {
                ...state,
                games: action.payload
            };
        }

        default: {
            return state;
        }
    }
}