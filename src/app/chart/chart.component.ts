import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { D3Service, D3, Selection } from 'd3-ng2-service'; // <-- import the D3 Service, the type alias for the d3 variable and the Selection interface
import * as d3 from 'd3';
import { HostListener } from '@angular/core';
import * as d3_save_svg from 'd3-save-svg';

var resizeId;

@Component({
    selector: 'app-chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.css']
})




export class ChartComponent implements OnInit {

    @Input() originalDataset;
    @Input() filteredDataset;
    @Input() level;
    @Input() xAxis: boolean;
    @Input() yAxis: boolean;
    @Input() showLines: boolean;
    @Input() useLogicalTime: boolean;

    @Input() gameID;
    @Input() change;

    @Output() selectedPlayerEmitter = new EventEmitter();

    // Add an event listener for window resize
    // Triggers handler only after the resizing is finished (no change in windows size for 800ms).
    @HostListener('window:resize', ['$event'])
    onResize() {
        // this.finishedResizing();
        clearTimeout(resizeId);
        resizeId = setTimeout(() => { this.finishedResizing(); }, 800);
    }

    private d3;

    private svg = null;

    players = [];
    private startTimes = [];

    private xScale;
    private yScale;
    private xAxisfunction;
    private yAxisfunction;
    private gridlinesFunction;


    private SvgInitialized = false;

    private zoomBehXY;
    private zoomBehX;
    private zoomYAxis: boolean = true;

    private previousLogicalTime: boolean;

    private height;
    private width;

    private padding_horizontal = 20;
    private extra_left_padding = 55;
    private padding_vertical = 20;
    private color;

    // experiment
    selectedPlayer = "none";

    constructor() {
        // this.d3 = d3Service.getD3(); // <-- obtain the d3 object from the D3 Service
        this.d3 = d3;
        this.updateHeightAndWidth();
    }

    // experiment
    changePlayer() {
        // console.log("changing player");
        this.selectedPlayerEmitter.emit(this.selectedPlayer);
    }

    ngOnInit() {
        this.gameID = "";
        this.color = this.d3.scale.ordinal()
            // .range(this.d3.schemeCategory10)
            .range(["#AEC7E8", "#FFBB78", "#98DF8A", "#C49C94", "#9EDAE5", "#DBDB8D"])
            .domain(this.d3.range(1, 10).map(x => x + "")); // Color palette generator, give it a number, it gives you a color )
    }

    ngOnChanges() {
        // console.log("chart ngOnChanges");
        if (this.change === "axis") {
            this.changeAxis();
            return;
        }

        if (this.change === "lines") {
            // console.log("Toggling lines", this.showLines);
            if (this.showLines) {
                this.renderLinesForCurrentLevel();
            } else {
                this.refreshLines([]);
            }
            return;
        }

        if (this.change === "level") {
            // console.log("**************** [chart] changing level!");
            if (this.previousLogicalTime != this.useLogicalTime) {
                this.svg.selectAll("circle").remove();
                this.svg.selectAll(".level-line").remove();
            }

            this.renderLinesForCurrentLevel();
            this.refreshEvents(this.filteredDataset);

            this.previousLogicalTime = this.useLogicalTime;
            return;
        }

        if (this.change === "flags") {
            this.refreshEvents(this.filteredDataset);
            return;
        }

        if (this.change === "game") {
            // console.log("********************** Visualizing a new game!");
            this.resetSvg();
            this.resetVariables();
            try {
                this.prepareData();
                this.generateScalesAndAxis();
                this.changeAxis();
                // this.refreshLines(this.filteredDataset);
                // this.refreshEvents(this.filteredDataset);
                this.renderLinesForCurrentLevel(); // renders just lines instead of the entire dataset
            } catch (e) {
                console.log("Visualization failed. Please check the integrity of your data.");
                console.log(e);
            }
            return;
        }

        if (!this.svg) {
            // console.log("Initializing svg");
            this.initSvg();
        }
    }

    private renderLinesForCurrentLevel() {
        if (this.level === "a") {
            var linesDataset = this.originalDataset;
        } else {
            var linesDataset = this.originalDataset.filter(event => { return event.level == this.level });
        }
        this.refreshLines(linesDataset);
    }

    private updateHeightAndWidth() {
        this.width = window.innerWidth * 0.79; // Dynamically set width to make sure diagram always fits on page
        this.height = window.innerHeight - 200; // Dynamically set height
    }

    private initSvg() {
        // console.log("InitSVG");
        let d3 = this.d3;
        this.svg = d3.select('#chart')
            .append("svg")
            .attr("height", this.height)
            .attr("width", this.width);
        this.svg.append("g").attr("id", "grid")
        this.svg.append("g").attr("id", "lines")
        this.svg.append("g").attr("id", "circles")
    }

    private resetSvg() {
        this.d3.select("body").selectAll(".tooltip").remove();
        this.svg.selectAll("*").remove();
        this.svg.append("g").attr("id", "grid")
        this.svg.append("g").attr("id", "lines");
        this.svg.append("g").attr("id", "circles");
    }

    private resetVariables() {
        // console.log("resetVariables()");
        this.useLogicalTime = false;
        this.previousLogicalTime = false;
        this.players = [];
        this.startTimes = [];
    }

    private changeAxis() {
        // console.log("Changing axis", this.xAxis, this.yAxis);
        let d3 = this.d3;
        d3.select("#xAxis").attr("display", this.xAxis ? "block" : "none");
        d3.select("#yAxis").style("display", this.yAxis ? "block" : "none");
        // Show grid when x axis is shown 
        d3.select("#grid").attr("display", this.xAxis ? "block" : "none");
    }


    // React to window being resized
    private finishedResizing() {
        // console.log(`The windows has just been resized!`);
        this.updateHeightAndWidth();

        this.resetSvg();
        this.svg.attr("height", this.height)
            .attr("width", this.width);
        // this.initSvg();
        this.generateScalesAndAxis();
        this.renderLinesForCurrentLevel();
        this.refreshEvents(this.filteredDataset);
    }

    private prepareData() {
        // initialize start time to -1 so you can check if start time has already been recorded
        for (var i = 0; i < 50; i++) { this.startTimes[i] = -1; }
        // Construct and array of all players, to later identify them with indexes
        this.originalDataset.forEach(d => {
            if (this.players.indexOf(d.ID) === -1) {
                this.players.push(d.ID);
            }
        });
        // Construct an array of start times per player, to later use to calculate game time for each event
        this.originalDataset.forEach(d => {
            if (d.event === "Game started") {
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
        this.originalDataset.forEach(d => {
            d.game_seconds = getSeconds(d.timestamp) - this.startTimes[this.players.indexOf(d.ID)];
            // console.log(d.game_seconds);
        });
    }

    private generateScalesAndAxis() {
        let d3 = this.d3;
        //*********** SCALES **********************
        // Find the time of latest event
        var latestEventTime = 0;
        this.originalDataset.forEach((d) => {
            if (d.game_seconds > latestEventTime) {
                latestEventTime = d.game_seconds;
            }
        });

        this.xScale = d3.scale.linear()
            .domain([0, latestEventTime]) // X domain boundury defined by the latest event
            .range([this.padding_horizontal + this.extra_left_padding, this.width - this.padding_horizontal]); // set by dimensions of SVG - padding                                    

        this.yScale = d3.scale.linear() // accept players index in array
            .domain([0, this.players.length])    // Y domain boundaty defined by number of players
            .range([this.padding_vertical, this.height - this.padding_vertical]);
        // .nice(); 

        //************AXIS ******************************
        this.xAxisfunction = d3.svg.axis()
            .orient("bottom")
            .scale(this.xScale)
            .ticks(5)
            // .tickValues(d3.range(0, xScale.domain()[1], 900)) // Make ticks every 15 minutes (900 seconds), from 0 to latest event - upper bound of xScale domain
            .tickFormat(d3.format("d")); //remove "," from format to make it easier to convert to HH:MM:SS  


        //Generate X axis
        var xAxisGroup = this.svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0, " + (this.height - this.padding_vertical) + ")")
            .attr("id", "xAxis")


        // Dummy rectangle to prevent overlapping of data with X axis
        xAxisGroup
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", 40)
            .attr("width", this.width)
            .attr("style", "fill:white");;

        // Generate X axis
        xAxisGroup.call(this.xAxisfunction);

        // Reformat X axis TICKS to show time in readable format    
        var ticks = document.getElementsByClassName("tick");
        for (var i = 0; i < ticks.length; i++) {
            ticks[i].childNodes[1].textContent = toHHMMSS(ticks[i].childNodes[1].textContent).slice(0, 5) + "h";
        }

        // generate a vertical grid
        this.gridlinesFunction = d3.svg.axis()
            .orient("bottom")
            .scale(this.xScale)
            .tickFormat(d3.format(""))
            // .tickValues(d3.range(900, this.xScale.domain()[1], 900)) // Make ticks every 15 minutes (900 seconds), from 0 to latest event - upper bound of xScale domain
            .ticks(5)
            .tickSize(this.height - this.padding_vertical);

        this.svg.select("#grid")
            .call(this.gridlinesFunction);

        // Generate Y Axis 
        var yAxisGroup = this.svg.append("g")
            .attr("class", "axis")
            .attr("id", "yAxis");

        // Dummy rectangle to prevent overlapping of data with Y axis
        yAxisGroup.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", this.height)
            .attr("width", 60)
            .attr("style", "fill:white; stroke-width: 1");

        this.players.forEach((d, i) => {
            yAxisGroup.append("text")
                .text(() => {
                    return "#" + i + " " + "[" + d + "]";
                })
                .attr("y", () => {
                    return this.yScale(i) + 4;
                })
                .attr("x", "0")
                .attr("class", "player-label")
                .attr("style", "cursor: pointer")
                .on("click", () => {
                    this.selectedPlayer = d;
                    this.changePlayer();
                });
        });

        this.zoomBehXY = d3.behavior.zoom()
            .x(this.xScale)
            .y(this.yScale)
            .scaleExtent([0.5, 8])
            .on("zoom", () => {
                this.zoom();
            });

        this.zoomBehX = d3.behavior.zoom()
            .x(this.xScale)
            .scaleExtent([0.5, 8])
            .on("zoom", () => {
                this.zoom();
            });

        if (this.zoomYAxis) {
            this.svg.call(this.zoomBehXY);
        } else {
            this.svg.call(this.zoomBehX);
        }
    }


    public toggleZoomYAxis() {
        // console.log("Toggle zoom Y axis");
        if (this.zoomYAxis) {
            this.svg.call(this.zoomBehX);
        } else {
            this.svg.call(this.zoomBehXY);
        }
    }

    private isEndOfLevelEvent(d) {
        // if(!d) return true;
        return d.event === "Correct flag submited" || d.event === "Game finished" ||
            d.event === "Level cowardly skipped" || d.event === "Game exited prematurely";
    }

    private refreshLines(dataset) {
        // assemble last events of unfinished levels
        var lastEventsOfUnfinishedLevels = [];
        this.players.forEach((playerID) => {
            var lastEventTime = 0;
            var lastEvent;
            //get last event of each player
            dataset.filter((event) => { return event.ID === playerID }).forEach((event) => {
                if (event.game_seconds > lastEventTime) {
                    lastEventTime = event.game_seconds;
                    lastEvent = event;
                }
            })
            if (lastEvent && !this.isEndOfLevelEvent(lastEvent)) {
                lastEvent.unfinishedLevel = true;
                lastEventsOfUnfinishedLevels.push(lastEvent);
            }
        });

        // console.log(lastEventsOfUnfinishedLevels);

        // console.log("Refreshing lines!");
        //***********************************************
        // LINES CERRESPONDING TO DURATION OF EACH LEVEL 
        var lines = this.svg.select("#lines").selectAll(".level-line")
            .data(dataset.filter(d => { // get only events that mean end of level
                return this.isEndOfLevelEvent(d);
            }).concat(lastEventsOfUnfinishedLevels), (d) => {
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
                if (this.useLogicalTime) {
                    return this.xScale(strTimeToSeconds(d.logical_time));
                } else {
                    return this.xScale(d.game_seconds);
                }
            })
            .attr("x1", (d, i) => { // X coodinate of first point set by game time of previous end-of-level event
                var currentLevel = d.level;
                var currentPlayer = d.ID;
                var levelStart = this.originalDataset.filter((d) => { // This craziness figures out what that event is (where this level starts)
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
                if (this.useLogicalTime) {
                    return this.xScale(0);
                } else {
                    return this.xScale(levelStart.game_seconds);
                }
            })
            .attr("stroke-width", "0")
            .attr("class", "level-line")
            .attr("stroke", (d) => {
                return this.color(d.level); // colour based on level
            })
            .transition()
            .duration(500)
            .attr("stroke-width", (d) => {
                if (d.unfinishedLevel) {
                    return "3";
                } else {
                    return "5";
                }
            })
            .attr("stroke-linecap", "round")
            .attr("stroke-dasharray", (d) => {
                if (d.unfinishedLevel) {
                    return "10";
                } else {
                    return "0";
                }
            })
            .delay((d, i) => {
                return i * 5;
            });

        lines.exit().transition()
            .duration(300)
            .attr("stroke-width", "0")
            .remove();

    }

    private refreshEvents(dataset) {

        // console.log("Refreshing events!");

        //***********************************************    
        // CIRCLES CORRESPONDING TO ALL GAME EVENTS

        // Define the div for the tooltip
        var tooltipDiv = d3.select("body").select(".tooltip");

        if (tooltipDiv.empty()) {
            tooltipDiv = this.d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);
        }

        var circles = this.svg.select("#circles").selectAll("circle")
            .data(dataset, (d) => { return d.ID + d.game_seconds + d.event; });

        var enteringCircles = circles.enter()
            .append("circle");

        enteringCircles.attr("cx", (d) => {
            if (this.useLogicalTime) {
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
                if (d.event.indexOf("Wrong flag submited") != -1 ||
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
                } else if (d.event.indexOf("Hint") != -1) {
                    return "hint";
                } else if (d.event.indexOf("Wrong flag submited") != -1) {
                    return "wrong-flag";
                } else if (d.event.indexOf("Help level") != -1 || d.event.indexOf("help level") != -1) {
                    return "help-level";
                } else return "";
            })
            .classed("event-circle", true)
            .attr("stroke-width", "1")
            .attr("stroke", "grey")
            // Add event handlers for custom tooltip behavior
            .on("mouseover", (d) => {
                tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltipDiv.html("Event: " + d.event + "<br/>" +
                    "Player " + this.players.indexOf(d.ID) + " (" + d.ID + ")" + "<br/>" +
                    "Level: " + d.level + "<br/>" +
                    "Level time: " + d.logical_time + "<br/>" +
                    "Game time: " + toHHMMSS(d.game_seconds))
                    .style("left", (this.d3.event.pageX - 120) + "px")
                    .style("top", (this.d3.event.pageY - 90) + "px");
            })
            .on("mouseout", (d) => {
                tooltipDiv.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Append title using the native title attribute and native browser behavior

        // .append("title")
        // .text((d) => {
        // // .attr("title", (d) => {
        //     return  "Event: " + d.event + "\n" +
        //             "Player " + this.players.indexOf(d.ID) + " (" + d.ID + ") \n" + 
        //             "Level: " + d.level + "\n" +
        //             "Level time: " + d.logical_time + "\n" + 
        //             "Game time: " + toHHMMSS(d.game_seconds);  
        // });

        enteringCircles.attr("r", "0")
            .transition()
            .duration(300)
            .attr("r", (d) => {
                if (d.event === "Correct flag submited" ||
                    d.event === "Game finished" ||
                    d.event === "Game exited prematurely") {
                    return 8;
                } else {
                    return 6;
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

    // Saves the current event selection as a SVG file
    saveSVG() {
        console.log("Saving as svg...");
        var config = {
            filename: 'customFileName',
        }
        d3_save_svg.save(this.svg.node(), config);
        this.resetZoom();
    }

    zoom() {
        // console.log("zooming!");
        var zoomYaxis = true;
        var circlesToZoom = this.svg.selectAll(".event-circle")
            .attr("cx", (d) => {
                if (this.useLogicalTime) {
                    return this.xScale(strTimeToSeconds(d.logical_time));
                } else {
                    return this.xScale(d.game_seconds);
                }
            });

        if (zoomYaxis) {
            circlesToZoom.attr("cy", (d) => {
                return this.yScale(this.players.indexOf(d.ID));
            });
        }
        var linesToZoom = this.svg.selectAll(".level-line")
            .attr("x2", (d) => { // X coordinate set by game time
                if (this.useLogicalTime) {
                    return this.xScale(strTimeToSeconds(d.logical_time));
                } else {
                    return this.xScale(d.game_seconds);
                }
            })
            .attr("x1", (d, i) => { // X coodinate of first point set by game time of previous end-of-level event
                var currentLevel = d.level;
                var currentPlayer = d.ID;
                var levelStart = this.originalDataset.filter((d) => { // This craziness figures out what that event is (where this level starts)
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
                if (this.useLogicalTime) {
                    return this.xScale(0);
                } else {
                    return this.xScale(levelStart.game_seconds);
                }
            });

        if (zoomYaxis) {
            linesToZoom
                .attr("y1", (d) => { // Y coordinate set according to player index
                    return this.yScale(this.players.indexOf(d.ID));
                })
                .attr("y2", (d) => { // Y coordinate set according to player index, again
                    return this.yScale(this.players.indexOf(d.ID));
                });
        }

        // Redraw Y axis
        if (zoomYaxis) {
            d3.selectAll(".player-label").attr("y", (d, i) => { return this.yScale(i) + 4; });
        }
        // Redraw X axis
        this.svg.select("#xAxis").call(this.xAxisfunction);

        this.svg.select("#grid")
            .call(this.gridlinesFunction);


        // Reformat X axis TICKS to show time in readable format    
        var ticks = document.getElementsByClassName("tick");
        for (var i = 0; i < ticks.length; i++) {
            ticks[i].childNodes[1].textContent = toHHMMSS(ticks[i].childNodes[1].textContent).slice(0, 5) + "h";
        }

    }

    public resetZoom() {
        this.resetSvg();
        // this.resetVariables();
        // this.prepareData();
        this.generateScalesAndAxis();
        this.changeAxis();
        this.renderLinesForCurrentLevel(); // renders just lines instead of the entire dataset
        this.refreshEvents(this.filteredDataset);
    }


}


function strDateToTime(snippet) {
    var time = snippet.slice(11, 19);
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

function toHHMMSS(snippet) {
    var sec_num = parseInt(snippet, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    var hh = hours.toString();
    var mm = minutes.toString();
    var ss = seconds.toString();

    if (hh.length < 2) { hh = '0' + hh; }
    if (mm.length < 2) { mm = '0' + mm; }
    if (ss.length < 2) { ss = '0' + ss; }

    return hh + ':' + mm + ':' + ss;
}

function foo() {
    alert(this.innerHTML);
}