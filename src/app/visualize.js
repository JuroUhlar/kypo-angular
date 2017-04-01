

var useLogicalTime = false;
var originalDataset = []
var filteredDataset = []

var players = [];
var startTimes = [];


// *************************************************************
// VARIABLES FOR WINDOWS SIZES, BORDERS AND SUCH SVG STUFF 

var xScale;
var yScale;

var width = window.innerWidth - 40; // Dynamically set width to make sure diagram always fits on page
var height = window.innerHeight - 120; // Dynamically set height
var padding_horizontal = 20;
var extra_left_padding = 55;
var padding_vertical = 20;

var color = d3.scaleOrdinal(d3.schemeCategory20).domain(d3.range(1,21)); // Color palette generator, give it a number, it gives you a color 


// ****************************************************************
// CREATE SVG
var svg = d3.select('#chart')
            .append("svg")
            .attr("height", height)
            .attr("width", width);

svg.append("g").attr("id", "lines")
svg.append("g").attr("id", "circles")


//**************************************************
// FUNCTIOONs TO HELP WITH TIMES PARSING AND CONVERSIONS, nasty stuff

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

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}


// **********************************************************************
// PAGE LOAD RESET 
// On page the load, all the event visual elements are drawn, so make all boxes CHECKED to make sure they are in sync with the visuals
window.onload = resetGUI;

function resetGUI() {
    d3.selectAll(".event-toggle").property("checked", true);
    d3.select(".lines-toggle").property("checked", true);
    d3.selectAll(".axis-toggle").property("checked", true);
}

function resetOnNewDocumentLoad() {
    useLogicalTime = false;
    originalDataset = []
    filteredDataset = []
    players = [];
    startTimes = [];

    svg.selectAll("*").remove();
    svg.append("g").attr("id", "lines")
    svg.append("g").attr("id", "circles")
}


//***********************************************************
// FILTERING LEVELS

function onLevelSelectChange() {
	selectValue = d3.select('#selectLevelDropDown').property('value');
    
    if(selectValue.indexOf("shift") != -1) {
        useLogicalTime = true;
    } else {
        useLogicalTime = false;
    }
    svg.selectAll("circle").remove();
    svg.selectAll(".level-line").remove();
	selectLevel(selectValue.split(",")[0]);
}

function selectLevel(value) {
    var level = value;
    filteredDataset = filterInLevel(level);
    d3.select(".lines-toggle").property("checked", true);
    refreshLines(filteredDataset); // have to refresh lines BEFORE possiblyfiltering away level-ending events
    filteredDataset = filterAwayThroughEventCheckboxes(filteredDataset);
    refreshEvents(filteredDataset);
    
  
}

function filterAwayThroughEventCheckboxes(dataset) {
    //expects complete dataset of one level, or all levels
    var toggles = document.getElementsByClassName("event-toggle");
    for(var i = 0; i<toggles.length; i++){
        // console.log(toggles[i].value);
        // console.log(toggles[i].zchecked);
        if(toggles[i].checked === false) {
            dataset = dataset.filter(function(d){ 
                return d.event.toLowerCase().indexOf(toggles[i].value) === -1;
            });
        }
    }
    return dataset;
}

function filterInLevel(level) {
    if (level === "all") {
        return originalDataset;
    } else {
        return originalDataset.filter(function (d) {
            return d.level == level;
        });
    }    
}


//**********************************************************
// FILTERING LINES in/out
// on lines-toggle change
d3.select(".lines-toggle").on("change", function () {
        if(this.checked) {
            refreshLines(filterInLevel(d3.select('#selectLevelDropDown').property('value').split(",")[0]));
        } else {
            refreshLines([]);
        }
});


// *******************************************************
// FILTERING TYPES OF EVENTS
// on filter change
d3.selectAll(".event-toggle").on("change", changeEventFilter);

function changeEventFilter () {
    var type = this.value; // Get value of checkbox to find out which checkbox was clicked
    // console.log(type);
    // console.log(this.checked);

    if (this.checked) { // adding data points 
        // get value of level selector (cleared of shift flag with split()) and only display events from selected level
        var newEvents = filterInLevel(d3.select('#selectLevelDropDown').property('value').split(",")[0]);
        newEvents = newEvents.filter(function(d){
           return d.event.toLowerCase().indexOf(type) != -1;
        });
        filteredDataset = filteredDataset.concat(newEvents);
    } else {
        filteredDataset = filteredDataset.filter(function(d){ 
            return d.event.toLowerCase().indexOf(type) === -1;
        });
    }
    refreshEvents(filteredDataset);  
}

function showAllEvents(){
    d3.selectAll(".event-toggle").property("checked", true);
    filteredDataset = filterInLevel(d3.select('#selectLevelDropDown').property('value').split(",")[0]);
    refreshEvents(filteredDataset);
}

function hideAllEvents(){
    d3.selectAll(".event-toggle").property("checked", false);
    filteredDataset = [];
    refreshEvents(filteredDataset);
}

// for toggling axis, based on their html ID
function toggleThis(id) {
    var thing = document.getElementById(id);
    if (thing.style.display != "none") {
        thing.style.display = "none";
    } else {
        thing.style.display = "block";
    }
}


//*********************************************************
//********************************************************
// MAIN RENDERING FLOW


function prepareData() {
    // initialize start time to -1 so you can check if start time has already been recorded
    for(var i=0; i<50; i++) { startTimes[i] = -1;}
    // Construct and array of all players, to later identify them with indexes
    originalDataset.forEach(function (d) {
        if(players.indexOf(d.ID) === -1){
            players.push(d.ID); 
        }
    });
    // Construct an array of start times per player, to later use to calculate game time for each event
    originalDataset.forEach(function (d){
        if(d.event === "Game started"){
            // startTimes[players.indexOf(d.ID)] = getSeconds(d.timestamp); 
            if (startTimes[players.indexOf(d.ID)] === -1) {
                startTimes[players.indexOf(d.ID)] = getSeconds(d.timestamp);
            } else {
                startTimes[players.indexOf(d.ID)] =
                 // Math.min(getSeconds(d.timestamp), startTimes[players.indexOf(d.ID)]);  // if there are two or more game-starts, use the earliest one
                 86000;  // if there are two or more game start for a player, set game start to end of day and do not visualize this player data
                 console.log("Unexpected data: Player " + players.indexOf(d.ID) + " started the game more than once. His data will not be visualized.");
            }
            
        }
    });
    // Give each event object a new property - timestamp relative to the start of their game 
    // This proporty is used to calculate their X position in the diagram
    originalDataset.forEach(function (d) {
        d.game_seconds = getSeconds(d.timestamp) - startTimes[players.indexOf(d.ID)];
        // console.log(d.game_seconds);
    });
}



function generateScalesAndAxis() {
    //*********** SCALES **********************
    xScale = d3.scaleLinear()
                             .domain([0, d3.max(originalDataset, function(d) { return d.game_seconds; })]) // X domain boundury defined by the latest event
                             .range([padding_horizontal + extra_left_padding, width - padding_horizontal]); // set by dimensions of SVG - padding

    yScale = d3.scaleLinear() // accept players index in array
                             .domain([0, players.length])    // Y domain boundaty defined by number of players
                             .range([padding_vertical, height - padding_vertical]); // set by dimensions of SVG - padding

    //************AXIS ******************************
    var xAxis = d3.axisBottom()
            .scale(xScale)
            .tickValues(d3.range(0,xScale.domain()[1],900)) // Make ticks every 15 minutes (900 seconds), from 0 to latest event - upper bound of xScale domain
            .tickFormat(d3.format("d")); //remove "," from format to make it easier to convert to HH:MM:SS  
   
    //Generate X axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, " + (height - padding_vertical) + ")")
        .attr("id", "xAxis")
        .call(xAxis);

        
    // Reformat X axis TICKS to show time in readable format    
    var ticks = document.getElementsByClassName("tick");
    for(var i = 0; i<ticks.length; i++) {
       ticks[i].childNodes[1].textContent = ticks[i].childNodes[1].textContent.toHHMMSS().slice(0,5)+"h";
    }

    // Generate Y Axis 
    var playerLabels = svg.append("g")
                    .attr("class", "axis")
                    .attr("id", "yAxis");
                    // .attr("style", "display: none");

    players.forEach(function (d,i) {
        playerLabels.append("text")
            .text(function () {
                return "#" + i + " " + "[" + d + "]";

            })
        .attr("y", function () {
            return yScale(i) + 4;
        })
        .attr("x", "0")
        .attr("class", "player-label");
    });

}

function refreshLines(dataset) {
    //***********************************************
            // LINES CERRESPONDING TO DURATION OF EACH LEVEL 
            var lines = svg.select("#lines").selectAll(".level-line")
                .data(dataset.filter(function (d) { // get only events that mean end of level
                   return d.event === "Correct flag submited" || d.event === "Game finished" || 
                          d.event === "Level cowardly skipped" || d.event === "Game exited prematurely"; 
                }), function (d) {
                    return d.ID + d.game_seconds + d.event;
                });

                    
            lines.enter()
                .append("line")
                .attr("y1", function (d) { // Y coordinate set according to player index
                    return yScale(players.indexOf(d.ID));
                })
                .attr("y2", function (d) { // Y coordinate set according to player index, again
                    return yScale(players.indexOf(d.ID));
                })
                .attr("x2", function (d) { // X coordinate set by game time
                    if(useLogicalTime) {
                            return xScale(strTimeToSeconds(d.logical_time));
                        } else {
                            return xScale(d.game_seconds);
                        } 
                })
                .attr("x1", function (d,i) { // X coodinate of first point set by game time of previous end-of-level event
                    var currentLevel = d.level;
                    var currentPlayer = d.ID;
                    var levelStart = originalDataset.filter(function (d) { // This craziness figures out what that event is (where this level starts)
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
                    if(useLogicalTime) {
                            return xScale(0);
                        } else {
                            return xScale(levelStart.game_seconds);
                        } 
                })
                .attr("stroke-width", "0")
                .attr("class", "level-line")
                .attr("stroke", function (d){
                    return color(d.level); // colour based on level
                })
                .transition()
                .duration(500)
                .attr("stroke-width", "3")
                .delay(function (d,i) {
                    return i * 5;
                });

                lines.exit().transition()
                            .duration(300)
                            .attr("stroke-width", "0")
                            .remove();

}

function refreshEvents(dataset) {

    // console.log("Refresh started!");
     
            //************************************************    
            // CIRCLES CORRESPONDING TO ALL GAME EVENTS

                var circles =  svg.selectAll("circle")
                                  .data(dataset, function (d) { return d.ID + d.game_seconds +d.event;});

                var enteringCircles = circles.enter()
                                             .append("circle");

                enteringCircles.attr("cx", function (d) {
                        if(useLogicalTime) {
                            return xScale(strTimeToSeconds(d.logical_time));
                        } else {
                            return xScale(d.game_seconds);
                        }           
                    })
                    .attr("cy", function (d) {
                        // return Math.random() * height;
                        return yScale(players.indexOf(d.ID));
                    })
                    .attr("fill", function  (d){
                        if(d.event.indexOf("Wrong flag submited") != -1 ||
                            d.event == "Game exited prematurely") {
                            return "red";
                        } else if (d.event === "Level cowardly skipped") {
                            return "black";
                        } else {
                            return color(d.level);
                        }                           
                        // return (d.event.indexOf("Wrong flag submited") != -1) ? "red" : color(d.level);
                        // return color(d.level);    
                    })
                    .attr("class", function (d){
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
                    .text(function (d) {
                        return  "Event: " + d.event + "\n" +
                                "Player " + players.indexOf(d.ID) + " (" + d.ID + ") \n" + 
                                "Level: " + d.level + "\n" +
                                "Level time: " + d.logical_time + "\n" + 
                                "Game time: " + (d.game_seconds+"").toHHMMSS();  
                    });

                    enteringCircles.attr("r", "0")
                            .transition()
                            .duration(300)
                            .attr("r", function (d) {
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

//**********************************************
// Function for programmatically generate dropdown menu for selecting levels
// (The accommodate variable number of levels for each dataset)
function generateLevelDropdownMenu(dataset) {
    
    var numberOfLevels = 0;
    dataset.forEach(function (d) { // get the number of highest level ( = n of levels)
        if(d.level > numberOfLevels) {
            numberOfLevels = d.level;
        }
    });

    //remove previously generated dropdown menu
    d3.select("#selectLevelDropDown").remove();

    d3.select("#UIrow2") //In the apprioarate div, create a select tag
        .append("select")
        .attr("id", "selectLevelDropDown")
        .on("change", onLevelSelectChange);

    var selectTag = d3.select("#selectLevelDropDown");

    selectTag.append("option")  // add option for all levels
                 .text("Show all levels")
                 .attr("value", "all");
 
    for(var i = 0; i<numberOfLevels; i++) { //for each level add 2 options (in game and logical time)
        selectTag.append("option")
                 .text("Show level " + (i+1))
                 .attr("value", i+1);

        selectTag.append("option")
                 .text("Show level " + (i+1) + " - logical time")
                 .attr("value", (i+1) + ", shift");              
    }   

    selectTag.value = "all";
    return numberOfLevels;
}