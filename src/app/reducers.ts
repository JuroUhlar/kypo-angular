import * as  fromMenu from './menu/menu.reducer'; 

export interface State {
    menu: fromMenu.State;
}

export const reducers = {
    menu: fromMenu.reducer
}

export function selectSelectedGame(state: State) {
    return state.menu.selectedGame;
}

export function selectSelectedGameAlias(state: State) {
    return state.menu.selectedGame.alias;
}

export function selectGames(state: State) {
    return state.menu.games;
}

