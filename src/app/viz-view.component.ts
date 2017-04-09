import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventsService } from './events.service'

import * as d3 from 'd3';

@Component({
  selector: 'viz-view',
  templateUrl: './viz-view.component.html',
  styleUrls: ['./viz-view.component.css']
})


export class VizViewComponent {

    @Input() gameId;
    events;
    originalDataset;
    filteredDataset;
    change="big";

    private flags = {
        showGameStarts: true,
        showGameFinishes: true,
        showCorrectFlags: true,
        showHints: true,
        showWrongFlags: true,
        showLevelSkips: true,
        showPrematureExits: true,
        showHelpLevelEvents: true
    };

    constructor(private eventsService:EventsService) {}

    ngOnInit() {

    }

    changeFilter() {
        console.log("Changing filter!");
        console.log(JSON.stringify(this.flags, null, 2));

        // MOCK DEMO IMPLEMENTATION
        if(this.flags.showWrongFlags === false) {
            this.change = "small";
            this.filteredDataset = this.originalDataset.filter(x => x.event.toLowerCase().indexOf("wrong flag") === -1);
        } else {
            this.change = "small";
            this.filteredDataset = this.originalDataset;
        }
    }


    ngOnChanges() {
        //every time gameID changes, get events from service and update this.events
        //everything dependand on new data must be inside the subscribe method

        this.eventsService.getEvents(this.gameId).subscribe(events => {
            // console.log(events);
            this.change="big";
            this.events = events;
            this.originalDataset = this.events.map(function(event) { return event; });
            this.filteredDataset = this.events.map(function(event) { return event; });
        });
    }
}

