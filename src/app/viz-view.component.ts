import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventsService } from './events.service'

import * as negate from 'lodash.negate';

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
    xAxis : boolean = true;
    yAxis : boolean = true; 
    showLines : boolean = true;
    change="big";

    private flags = {
        gameStarts: {
            show: true,
            comparator: function (event) {
                return event.event === "Game started";
            }
        },
        gameFinishes: {
            show: true,
            comparator: function (event) {
                return event.event === "Game finished";
            }
        },
        correctFlags: {
            show: true,
            comparator: function (event) {
                return event.event === "Correct flag submited";
            }
        },
        hints: {
            show: true,
            comparator: function (event) {
                return event.event.indexOf("Hint") != -1 ;
            }
        },
        wrongFlags: {
            show: true,
            comparator: function (event) {
                return event.event.indexOf("Wrong flag submited") != -1 ;
            }
        },
        levelSkips: {
            show: true,
            comparator: function (event) {
                return event.event === "Level cowardly skipped" ;
            }
        },
        prematureExits: {
            show: true,
            comparator: function (event) {
                return event.event === "Game exited prematurely" ;
            }
        },
        helpLevelEvents: {
            show: true,
            comparator: function (event) {
                return event.event.toLowerCase().indexOf("help level") != -1;
            }
        }
    };

    constructor(private eventsService:EventsService) {}

    ngOnInit() {

    }

    changeFilter() {
        console.log("Changing filter!");
        console.log(JSON.stringify(this.flags, null, 2));

        this.change = "flags";
        this.filteredDataset = this.originalDataset;

        Object.keys(this.flags).forEach( (flag => {
            if(this.flags[flag].show === false) {
                this.filteredDataset = this.filteredDataset.filter(negate(this.flags[flag].comparator));
            }
        }));
    }

    private showAllEvents() {
        this.change = "flags";
        this.filteredDataset = this.originalDataset;
        Object.keys(this.flags).forEach(flag => {this.flags[flag].show = true; }); 
    }

    private hideAllEvents() {
        this.change = "flags";
        this.filteredDataset = [];
        Object.keys(this.flags).forEach(flag => {this.flags[flag].show = false; }); 
    }

    private toggleAxis() {
        this.change = "axis";
        console.log(this.xAxis, this.yAxis);
    }

    private toggleLines() {
        this.change = "lines";
        console.log(this.showLines);
    }


    ngOnChanges() {
        //every time gameID changes, get events from service and update this.events
        //everything dependand on new data must be inside the subscribe method

        this.eventsService.getEvents(this.gameId).subscribe(events => {
            // console.log(events);
            this.change="big";
            this.events = events;
            this.resetUI();
            this.originalDataset = this.events.map(function(event) { return event; });
            this.filteredDataset = this.events.map(function(event) { return event; });
        });
    }

    private resetUI() {
        this.showLines = true;
        this.xAxis = true;
        this.yAxis = true;
        Object.keys(this.flags).forEach( (flag => {
            this.flags[flag].show = true; 
        }));

    }
}
