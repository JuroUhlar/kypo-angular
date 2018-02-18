import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import { Game } from '../models/game.model'
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

@Injectable()
export class EventsService {
  constructor(private http: Http) { }

  // private baseURL = "http://localhost:5000";
  // private baseURL = "http://kypo2-uhlar.rhcloud.com";
  private baseURL = "https://kypo.herokuapp.com";
  

  private games: Game[] = [
    {
      id: 1,
      name: 'Example',
      alias: 'example',
    },
    {
      id: 2,
      name: 'Task 1',
      alias: 'task1'
    },
    {
      id: 3,
      name: 'Task 2',
      alias: 'task2'
    },
    {
      id: 4,
      name: 'Task 3',
      alias: 'task3'
    }
  ];

  getGames(): Observable<Game[]> {
    return Observable.create((observer: Observer<Game[]>) => {
      setTimeout(() => {
        observer.next(this.games);
        observer.complete();
      }, 200);
    });
  }

  // Deprecated feature
  // getGamesOfPlayer(playerID) {
  //   return this.http.get(this.baseURL+'/games/'+playerID)
  //     .map(response => {
  //       return response.json();    
  //     });
  // }

  getEvents(gameId: string) {
    return this.http.get(this.baseURL + '/events?game_instance_ID=' + gameId)
      .map(response => {
        return response.json();
      });
  }

}
