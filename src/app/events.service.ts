import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class EventsService {
  constructor(private http: Http) {}

  getGames() {
    //   return ["IT WORKS!", "dataset2", "all-events", "st-polten", "test-data"];
     return this.http.get('http://localhost:5000/games')
      .map(response => {
        return response.json();
        // console.log(response);
      });
  }

  getEvents(gameId) {
       return this.http.get('http://localhost:5000/events?game_instance_ID='+gameId)
      .map(response => {
        return response.json();
      });

  }

}
