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
    levels = [1,2,3,4,5,6];
    selectedLevel : string = "all";
    change="big";
    useLogicalTime : boolean = false;

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

    changeLevel() {
        console.log("\n [vizview] changing level!");
        console.log(this.selectedLevel); 
        this.change="level";

        let level = this.selectedLevel[0];
        this.filteredDataset = [];
        this.filteredDataset = this.filterInLevel(level);
        this.showLines = true;
        this.applyFlagFilters();
        if(this.selectedLevel.indexOf("shift") != -1) {
            this.useLogicalTime = true;
        } else {
            this.useLogicalTime = false;
        }
    }

    changeFilter() {
        console.log("Changing filter!");
        console.log(JSON.stringify(this.flags, null, 2));

        this.change = "flags";
        // this.filteredDataset = this.originalDataset;
        this.applyFlagFilters();
    }

    private showAllEvents() {
        this.change = "flags";
        this.filteredDataset = this.filterInLevel(this.selectedLevel[0]);
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

    private filterInLevel(level) {
        if (level === "a") {
            return this.originalDataset;
        } else {
            return this.originalDataset.filter(function (d) {
                return d.level == level;
            });
        }    
    }

    private applyFlagFilters() {
        Object.keys(this.flags).forEach( (flag => {
            if(this.flags[flag].show === false) {
                this.filteredDataset = this.filteredDataset.filter(negate(this.flags[flag].comparator));
            }
        }));
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
