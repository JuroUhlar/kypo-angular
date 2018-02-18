import { Action } from '@ngrx/store';
import { Game } from '../models/game.model';

export const SELECT_GAME  = '[Menu] Select game';
export const LOAD_GAMES  = '[Menu] Load Games';


export class SelectGame implements Action {
    readonly type = SELECT_GAME;
    constructor(public payload:Game) {}
}

export class LoadGames implements Action {
    readonly type = LOAD_GAMES;
    constructor(public payload:Game[]) {}
}

export type All = SelectGame | LoadGames;

// export type All 
//     = Search 
//     | SearchSuccess;