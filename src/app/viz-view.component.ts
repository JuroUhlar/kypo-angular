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
    level = "a";
    xAxis : boolean = true;
    yAxis : boolean = true; 
    showLines : boolean = true;
    levels = [];
    selectedLevel : string = "all";
    change="big";
    useLogicalTime : boolean = false;

    @Output() selectedPlayerEmitter = new EventEmitter(); 


   


    flags = {
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
        console.log("**************** [vizview] changing level!");
        if(this.selectedLevel.indexOf("shift") != -1) {
            this.useLogicalTime = true;
        } else {
            this.useLogicalTime = false;
        }
        // console.log(this.selectedLevel); 
        this.change="level";
        this.level = this.selectedLevel[0];
        this.showLines = true;
      
        this.applyLevelFilter();
        this.applyFlagFilters();
     
        console.log("[Viz-view] - use logical time: ", this.useLogicalTime);
    }

    changeFilter() {
        console.log("Changing filter!");
        console.log(JSON.stringify(this.flags, null, 2));
        this.change = "flags";
        this.applyLevelFilter();
        this.applyFlagFilters();
    }



    showAllEvents() {
        this.change = "flags";
        this.applyLevelFilter();
        Object.keys(this.flags).forEach(flag => {this.flags[flag].show = true; }); 
    }

    hideAllEvents() {
        this.change = "flags";
        this.filteredDataset = [];
        Object.keys(this.flags).forEach(flag => {this.flags[flag].show = false; }); 
    }

    toggleAxis() {
        this.change = "axis";
        console.log(this.xAxis, this.yAxis);
    }

    toggleLines() {
        this.change = "lines";
        console.log(this.showLines);
    }

    private applyLevelFilter() {
        if (this.level === "a") {
            this.filteredDataset = this.originalDataset;
        } else {
            this.filteredDataset = this.originalDataset.filter(d => {
                return d.level == this.level;
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
            if(this.gameId != '' && this.gameId != undefined && this.gameId != "none") {
                console.log(this.gameId);
                this.change = "game";
            }
            this.resetUI();

            this.originalDataset = events.map(function(event) { return event; });
            // this.filteredDataset = events.map(function(event) { return event; });
            this.filteredDataset = [];
            this.initLevelArray();
        });
    }

    private resetUI() {
        this.showLines = true;
        this.xAxis = true;
        this.yAxis = true;
        this.level = "a";
        this.selectedLevel="all";
        this.useLogicalTime = false;
        Object.keys(this.flags).forEach( (flag => {
            this.flags[flag].show = false; 
        }));

    }

    private initLevelArray() {
        var maxLevel = 0;
        this.originalDataset.forEach(event => {
            if (event.level > maxLevel) {
                maxLevel = event.level;
            } 
        });
        this.levels = [];
        for(var i = 1; i<=maxLevel; i++ ){
            this.levels[i-1] = i; 
        }
    }


    onSelectPlayer(player) {
        this.selectedPlayerEmitter.emit(player);
  }
}
