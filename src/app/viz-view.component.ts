import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EventsService } from './events.service'

@Component({
  selector: 'viz-view',
  templateUrl: './viz-view.component.html',
  styleUrls: ['./viz-view.component.css']
})


export class VizViewComponent {

    @Input() gameId;
    events;

    constructor(private eventsService:EventsService) {}

    ngOnInit() {
        this.gameId = "";
        this.events = [];
    }


    ngOnChanges() {
        this.eventsService.getEvents(this.gameId).subscribe(events => {
            console.log(events);
            this.events = events;
        });
        console.log(this.events);
    }


}
