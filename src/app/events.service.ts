import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class EventsService {
  constructor(private http: Http) {}

  // private baseURL = "http://localhost:5000";
  // private baseURL = "http://kypo2-uhlar.rhcloud.com";
  private baseURL = "https://kypo.herokuapp.com";
  


  getGames() {
     return this.http.get(this.baseURL+'/games')
      .map(response => {
        return response.json();
      });
  }

  getGamesOfPlayer(playerID) {
    return this.http.get(this.baseURL+'/games/'+playerID)
      .map(response => {
        return response.json();    
      });
  }

  getEvents(gameId) {
       return this.http.get(this.baseURL+'/events?game_instance_ID='+gameId)
      .map(response => {
        return response.json();
      });

  }

}
