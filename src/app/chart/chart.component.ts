import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

   @Input() originalDataset; 
   @Input() filteredDataset;
   @Input() gameID;

    private svg = null;
    private useLogicalTime = false;

    private players = [];
    private startTimes = [];

    private xScale;
    private yScale;

    private SvgInitialized = false;

    private width = 700;
    private height = window.innerHeight - 120; // Dynamically set height
    private padding_horizontal = 20;
    private extra_left_padding = 55;
    private padding_vertical = 20;
    private color = d3.scaleOrdinal(d3.schemeCategory20).domain(d3.range(1,21)); // Color palette generator, give it a number, it gives you a color 

  constructor() { }

  ngOnInit() {
        this.gameID = "";
  }

  ngOnChanges() {

            // console.log(events);

            //first time -> initialize svg
            //every next change of data -> visualize new data
            // console.log("Ng on changes!");
            // console.log(this.gameID);
            // console.log(this.filteredDataset);
            // console.log(this.originalDataset);

            if(this.svg && this.gameID != '' && this.gameID != undefined) {
                console.log("visualizing...");
                // this.visualize();
                this.resetSvg();
                this.resetVariables();
                try{
                  this.prepareData();
                  this.generateScalesAndAxis();
                  this.refreshLines(this.filteredDataset);
                  this.refreshEvents(this.filteredDataset);
                } catch (e) {
                  console.log("Visualization failed. Please check the integrity of your data.");
                }
            } else {
                if(!this.svg) {
                  console.log("Initializing svg");
                  this.initSvg();
                }         
            }
    }

    private initSvg() {
        this.svg = d3.select('#chart')
            .append("svg")
            .attr("height", this.height)
            .attr("width", this.width);

            this.svg.append("g").attr("id", "lines")
            this.svg.append("g").attr("id", "circles")
    }

    private resetSvg() {
            this.svg.selectAll("*").remove();
            this.svg.append("g").attr("id", "lines");
            this.svg.append("g").attr("id", "circles");
    }

    private resetVariables() {
            this.useLogicalTime = false;
            // this.originalDataset = []
            // this.filteredDataset = []
            this.players = [];
            this.startTimes = [];
    }

    private prepareData() {
        // initialize start time to -1 so you can check if start time has already been recorded
        for(var i=0; i<50; i++) { this.startTimes[i] = -1;}
        // Construct and array of all players, to later identify them with indexes
        this.originalDataset.forEach( d => {  
            if(this.players.indexOf(d.ID) === -1){
                this.players.push(d.ID); 
            }
        });
        // Construct an array of start times per player, to later use to calculate game time for each event
        this.originalDataset.forEach( d => {
            if(d.event === "Game started"){
                // startTimes[players.indexOf(d.ID)] = getSeconds(d.timestamp); 
                if (this.startTimes[this.players.indexOf(d.ID)] === -1) {
                    this.startTimes[this.players.indexOf(d.ID)] = getSeconds(d.timestamp);
                } else {
                    this.startTimes[this.players.indexOf(d.ID)] =
                    // Math.min(getSeconds(d.timestamp), startTimes[players.indexOf(d.ID)]);  // if there are two or more game-starts, use the earliest one
                    86000;  // if there are two or more game start for a player, set game start to end of day and do not visualize this player data
                    console.log("Unexpected data: Player " + this.players.indexOf(d.ID) + " started the game more than once. His data will not be visualized.");
                }
            }
        });
        // Give each event object a new property - timestamp relative to the start of their game 
        // This proporty is used to calculate their X position in the diagram
        this.originalDataset.forEach( d =>  {
            d.game_seconds = getSeconds(d.timestamp) - this.startTimes[this.players.indexOf(d.ID)];
            // console.log(d.game_seconds);
        });
    }

    private generateScalesAndAxis() {
        //*********** SCALES **********************
        this.xScale = d3.scaleLinear()
                                .domain([0, d3.max(this.originalDataset, function(d) { return d.game_seconds; })]) // X domain boundury defined by the latest event
                                .range([this.padding_horizontal + this.extra_left_padding, this.width - this.padding_horizontal]); // set by dimensions of SVG - padding

        this.yScale = d3.scaleLinear() // accept players index in array
                                .domain([0, this.players.length])    // Y domain boundaty defined by number of players
                                .range([this.padding_vertical, this.height - this.padding_vertical]); // set by dimensions of SVG - padding

        //************AXIS ******************************
        var xAxis = d3.axisBottom()
                .scale(this.xScale)
                .tickValues(d3.range(0,this.xScale.domain()[1],900)) // Make ticks every 15 minutes (900 seconds), from 0 to latest event - upper bound of xScale domain
                .tickFormat(d3.format("d")); //remove "," from format to make it easier to convert to HH:MM:SS  
    
        //Generate X axis
        this.svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0, " + (this.height - this.padding_vertical) + ")")
            .attr("id", "xAxis")
            .call(xAxis);

            
        // Reformat X axis TICKS to show time in readable format    
        var ticks = document.getElementsByClassName("tick");
        for(var i = 0; i<ticks.length; i++) {
        ticks[i].childNodes[1].textContent = toHHMMSS(ticks[i].childNodes[1].textContent).slice(0,5)+"h";
        }

        // Generate Y Axis 
        var playerLabels = this.svg.append("g")
                        .attr("class", "axis")
                        .attr("id", "yAxis");
                        // .attr("style", "display: none");

        this.players.forEach((d,i) => {
            playerLabels.append("text")
                .text(function () {
                    return "#" + i + " " + "[" + d + "]";

                })
            .attr("y", () => {
                return this.yScale(i) + 4;
            })
            .attr("x", "0")
            .attr("class", "player-label");
        });
    }

    
    private refreshLines(dataset) {
    //***********************************************
            // LINES CERRESPONDING TO DURATION OF EACH LEVEL 
            var lines = this.svg.select("#lines").selectAll(".level-line")
                .data(dataset.filter( d => { // get only events that mean end of level
                   return d.event === "Correct flag submited" || d.event === "Game finished" || 
                          d.event === "Level cowardly skipped" || d.event === "Game exited prematurely"; 
                }),  (d) => {
                    return d.ID + d.game_seconds + d.event;
                });

                    
            lines.enter()
                .append("line")
                .attr("y1", (d) => { // Y coordinate set according to player index
                    return this.yScale(this.players.indexOf(d.ID));
                })
                .attr("y2", (d) => { // Y coordinate set according to player index, again
                    return this.yScale(this.players.indexOf(d.ID));
                })
                .attr("x2", (d) => { // X coordinate set by game time
                    if(this.useLogicalTime) {
                            return this.xScale(strTimeToSeconds(d.logical_time));
                        } else {
                            return this.xScale(d.game_seconds);
                        } 
                })
                .attr("x1", (d,i) => { // X coodinate of first point set by game time of previous end-of-level event
                    var currentLevel = d.level;
                    var currentPlayer = d.ID;
                    var levelStart = this.originalDataset.filter(function (d) { // This craziness figures out what that event is (where this level starts)
                        return (d.ID === currentPlayer) &&
                               (
                                    (+d.level === +currentLevel - 1 &&
                                            (d.event === "Correct flag submited" ||
                                             d.event === "Level cowardly skipped"))
                                    || 
                                    (currentLevel === "1" && d.event === "Game started")
                                );
                    })[0];
                    // console.log(levelStart);
                    // return xScale(levelStart.game_seconds);
                    if(this.useLogicalTime) {
                            return this.xScale(0);
                        } else {
                            return this.xScale(levelStart.game_seconds);
                        } 
                })
                .attr("stroke-width", "0")
                .attr("class", "level-line")
                .attr("stroke",  (d) => {
                    return this.color(d.level); // colour based on level
                })
                .transition()
                .duration(500)
                .attr("stroke-width", "3")
                .delay( (d,i) => {
                    return i * 5;
                });

                lines.exit().transition()
                            .duration(300)
                            .attr("stroke-width", "0")
                            .remove();

    }

    private refreshEvents(dataset) {

    // console.log("Refresh started!");
     
            //************************************************    
            // CIRCLES CORRESPONDING TO ALL GAME EVENTS

                var circles =  this.svg.selectAll("circle")
                                  .data(dataset, (d) => { return d.ID + d.game_seconds +d.event;});

                var enteringCircles = circles.enter()
                                             .append("circle");

                enteringCircles.attr("cx", (d) => {
                        if(this.useLogicalTime) {
                            return this.xScale(strTimeToSeconds(d.logical_time));
                        } else {
                            return this.xScale(d.game_seconds);
                        }           
                    })
                    .attr("cy", (d) => {
                        // return Math.random() * height;
                        return this.yScale(this.players.indexOf(d.ID));
                    })
                    .attr("fill", (d) => {
                        if(d.event.indexOf("Wrong flag submited") != -1 ||
                            d.event == "Game exited prematurely") {
                            return "red";
                        } else if (d.event === "Level cowardly skipped") {
                            return "black";
                        } else {
                            return this.color(d.level);
                        }                           
                        // return (d.event.indexOf("Wrong flag submited") != -1) ? "red" : color(d.level);
                        // return color(d.level);    
                    })
                    .attr("class", (d) => {
                        if (d.event === "Game exited prematurely") {
                            return "premature-exit";
                        } else if (d.event === "Level cowardly skipped") {
                            return "level-skip";
                        } else if (d.event === "Correct flag submited") {
                            return "correct-flag";
                        } else if (d.event === "Game finished") {
                            return "game-finished";
                        } else if (d.event === "Game started") {
                            return "game-started";
                        } else if (d.event.indexOf("Hint") != -1 ) {
                            return "hint";
                        } else if (d.event.indexOf("Wrong flag submited") != -1 ) {
                            return "wrong-flag";
                        }  else if (d.event.indexOf("Help level") != -1 || d.event.indexOf("help level") != -1) {
                            return "help-level";
                        }  else return ""; 
                    })
                    .attr("stroke-width", "1")
                    .attr("stroke", "grey")
                    // .attr("opacity", "0.5")
                    .append("title")
                    .text((d) => {
                        return  "Event: " + d.event + "\n" +
                                "Player " + this.players.indexOf(d.ID) + " (" + d.ID + ") \n" + 
                                "Level: " + d.level + "\n" +
                                "Level time: " + d.logical_time + "\n" + 
                                "Game time: " + toHHMMSS(d.game_seconds);  
                    });

                    enteringCircles.attr("r", "0")
                            .transition()
                            .duration(300)
                            .attr("r", (d) => {
                                if (d.event === "Correct flag submited" || 
                                    d.event === "Game finished" ||
                                    d.event === "Game exited prematurely") {
                                    return 7; 
                                } else {
                                    return 5;
                                }
                            });
                            // .delay(function (d,i) {
                            //     return i;
                            // });

                    circles.exit().transition()
                                    .duration(300)
                                    .attr("r", "0")
                                    .remove();

                    // console.log("Refresh finished");

    }   
}


function strDateToTime(snippet){
    var time = snippet.slice(11,19);
    return time;
}

function strTimeToSeconds(snippet) {
    var parsedTime = snippet.match(/[0-9][0-9]/g);
    if (parsedTime.length === 3) {
        return (+parsedTime[0] * 3600) + (+parsedTime[1] * 60) + (+parsedTime[2]);
    } else if (parsedTime.length === 2) {
        return (+parsedTime[0] * 3600) + (+parsedTime[1] * 60);
    } else if (parsedTime.length === 1) {
        return (+snippet[0] * 3600) + (+parsedTime[0] * 60);
    } else {
        console.log("unexpected date time format!");
        return 0;
    }
    
}

function getSeconds(snippet) {
    return strTimeToSeconds(strDateToTime(snippet));
}

function toHHMMSS (snippet) {
    var sec_num = parseInt(snippet, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    var hh = hours.toString();
    var mm = minutes.toString();
    var ss = seconds.toString();

    if(hh.length < 2) {hh = '0' + hh; }
    if(mm.length < 2) {mm = '0' + mm; }
    if(ss.length < 2) {ss = '0' + ss; }

    return hh+':'+mm+':'+ss;
}
