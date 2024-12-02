"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var react_1 = require("react");
var fa_1 = require("react-icons/fa");
var EventDetails_1 = require("./EventDetails");
var colors = [
    'bg-green-500',
    'bg-blue-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-gray-500',
];
var text_colors = [
    'text-green-500',
    'text-blue-500',
    'text-yellow-500',
    'text-purple-500',
    'text-orange-500',
    'text-gray-500',
];
var TimelineComponent = function (_a) {
    var timelines = _a.timelines, onSelectEvent = _a.onSelectEvent, showMultipleTimelines = _a.showMultipleTimelines, onSelectTimeline = _a.onSelectTimeline, startYear = _a.startYear, endYear = _a.endYear, onYearRangeChange = _a.onYearRangeChange, onDeleteTimeline = _a.onDeleteTimeline;
    var allEvents = showMultipleTimelines
        ? timelines.flatMap(function (timeline, timelineIndex) {
            return timeline.events.map(function (event) { return (__assign(__assign({}, event), { timelineIndex: timelineIndex })); });
        })
        : timelines[0].events.map(function (event) { return (__assign(__assign({}, event), { timelineIndex: 0 })); });
    //by
    var _b = react_1.useState(null), selectedEvent = _b[0], setSelectedEvent = _b[1];
    var selectEvent = react_1.useCallback(function (event) {
        setSelectedEvent(event);
        onSelectEvent(event);
    }, [onSelectEvent]);
    var start_year = react_1.useMemo(
    //if start year exists, return the max of the min of all events year and start year
    // if start year does not exist, return the min of all events year
    //its not startYear, its the min startYear of all events
    function () {
        return startYear
            ? Math.max(Math.min.apply(Math, allEvents.map(function (event) { return event.year; })), startYear)
            : Math.min.apply(Math, allEvents.map(function (event) { return event.year; }));
    }, [allEvents, startYear]);
    var end_year = react_1.useMemo(
    //if end year exists, return the min of the max of all events year and end year
    // if end year does not exist, return the max of all events year
    //its not endYear, its the max endYear of all events
    function () {
        return endYear
            ? Math.min(Math.max.apply(Math, allEvents.map(function (event) { return event.year; })), endYear)
            : Math.max.apply(Math, allEvents.map(function (event) { return event.year; }));
    }, [allEvents, endYear]);
    var _c = react_1.useState(timelines), filtered_timelines = _c[0], setFilteredTimelines = _c[1];
    var toggleFilterTimeline = function (timeline) {
        //if filtered_timelines includes this timeline, remove it
        //else add it
        if (filtered_timelines.includes(timeline)) {
            setFilteredTimelines(filtered_timelines.filter(function (filtered_timeline) { return filtered_timeline !== timeline; }));
        }
        else {
            setFilteredTimelines(__spreadArrays(filtered_timelines, [timeline]));
        }
    };
    var all_filtered_events = react_1.useMemo(function () {
        return showMultipleTimelines
            ? filtered_timelines.flatMap(function (timeline, timelineIndex) {
                return timeline.events.map(function (event) { return (__assign(__assign({}, event), { timelineIndex: timelineIndex })); });
            })
            : timelines[0].events.map(function (event) { return (__assign(__assign({}, event), { timelineIndex: 0 })); });
    }, [filtered_timelines, showMultipleTimelines, timelines]);
    //console.log('start_year: ', start_year);
    //console.log('Slider Start Year Prop: ', startYear);
    //console.log('end_year: ', end_year);
    //console.log('Slider End Year Prop: ', endYear);
    //filter out events that are not within the range of the slider
    var allEventsInRange = react_1.useMemo(function () {
        return all_filtered_events
            .filter(function (event) { return event.year >= start_year && event.year <= end_year; })
            .sort(function (a, b) { return a.year - b.year; });
    }, [all_filtered_events, start_year, end_year]);
    //console.log('allEventsInRange: ', allEventsInRange);
    //every time timelines changes, change filtered_timelines to include all timelines that weren't filtered out
    //this is to ensure that when timelines change, the new timelines are included
    //in the filtered timelines
    react_1.useMemo(function () {
        setFilteredTimelines(timelines);
    }, [timelines]);
    //split timelines if there is more than one event per 100px of width
    var timeline_ranges = react_1.useMemo(function () {
        var width_ofscreen = window.innerWidth;
        var max_events = Math.floor(width_ofscreen / 150);
        //now split the "events" into ranges
        var ranges = [];
        var current_range = [];
        var current_range_start = start_year;
        var current_range_end = start_year;
        for (var i = 0; i < allEventsInRange.length; i++) {
            //collect events until there are max_events in the range
            current_range.push(allEventsInRange[i]);
            //edit timelineIndex based on the timeline of the event
            current_range[current_range.length - 1].timelineIndex =
                allEventsInRange[i].timelineIndex;
            //update the end year of the range
            current_range_end = allEventsInRange[i].year;
            //if there are max_events in the range or this is the last event
            //add the range to the ranges array
            if (current_range.length === max_events ||
                i === allEventsInRange.length - 1) {
                ranges.push({
                    events: current_range,
                    start_year: current_range_start,
                    end_year: current_range_end
                });
                //reset the range
                current_range = [];
                current_range_start = current_range_end;
                //if this is the last event, update the end year of the range
                if (i === allEventsInRange.length - 1) {
                    current_range_end = allEventsInRange[i].year;
                }
            }
        }
        return ranges;
    }, [allEventsInRange, start_year]);
    var heightOfEvent = react_1.useMemo(function () {
        //for this -> we will try to make it so that years don't interfere
        //here is the functionality -> go back 5 spaces for an empty "slot"
        /*
          Go back 50px for an empty slot
    
        */
        //stores the last year seen at a level
        var last_seen_at_level = {};
        //determine how many slots would make up "50px"
        var allowed_distance_between_slots = ((end_year - start_year) / 100) * 10;
        //15% of the total range of years
        var levels_for_each_index_of_allEventsInRange = allEventsInRange.map(function (event, eventIndex) {
            var current_level_search = 0;
            //here is how to search ->
            //1 -> -1 -> 2 -> -2 -> 3 -> -3 -> 4 -> -4 -> 5 -> -5
            //now search -> if key does not exist -> its fine
            //if last seen at level exists -> check if the distance is greater than allowed_distance_between_slots
            //then fill in the slot
            while (last_seen_at_level[current_level_search] &&
                last_seen_at_level[current_level_search] +
                    allowed_distance_between_slots >
                    event.year) {
                //current_level_search++;
                //zig-zag current_level_search
                if (current_level_search <= 0) {
                    current_level_search = Math.abs(current_level_search) + 1;
                }
                else {
                    current_level_search = -current_level_search;
                }
                //current_level_search++;
            }
            //now place the event at the current level
            last_seen_at_level[current_level_search] = event.year;
            return current_level_search;
        });
        //find the max level
        return levels_for_each_index_of_allEventsInRange;
    }, [allEventsInRange, start_year, end_year]);
    //console.log('heightOfEvent: ', heightOfEvent);
    var height_offset = Math.max.apply(Math, heightOfEvent.map(function (n) { return Math.abs(n); })) * 50 + 100;
    var heightFromHeightOffset = function (height_level) {
        /**
         * FOr +, should be 0, 60, 120, 180, 240, 300, etc.
         *
         * For -, should be -30, -90, -150, -210, -270, -330, etc.
         */
        if (height_level === 0) {
            return 0;
        }
        if (height_level > 0) {
            return height_level * 60;
        }
        return 0 - height_level * 60 - 30;
    };
    return (react_1["default"].createElement("div", { className: "timeline-container w-full" },
        react_1["default"].createElement("div", { className: "mb-20" },
            react_1["default"].createElement("h2", { className: "text-2xl font-bold dark:text-white" }, showMultipleTimelines ? 'Timelines' : timelines[0].title),
            react_1["default"].createElement("div", { className: "flex flex-row flex-wrap space-y-2 mt-4" }, timelines.map(function (timeline, index) { return (react_1["default"].createElement("div", { key: index, className: "cursor-pointer p-4 rounded border \n                  w-full\n                  md:w-1/2\n                  lg:w-1/3\n                  xl:w-1/4\n                " + (timeline.shown ? 'border-blue-500' : 'border-gray-300') },
                react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                    //if filtered_timelines includes this timeline, show check circle, else show reg circle
                    filtered_timelines.includes(timeline) ? (react_1["default"].createElement(fa_1.FaCheckCircle, { className: "text-green-500", onClick: function () { return toggleFilterTimeline(timeline); } })) : (react_1["default"].createElement(fa_1.FaRegCircle, { className: "text-gray-500", onClick: function () { return toggleFilterTimeline(timeline); } })),
                    react_1["default"].createElement("span", { className: text_colors[index % text_colors.length] + " " + (!showMultipleTimelines && timeline.shown
                            ? 'font-bold'
                            : 'font-normal'), onClick: function () { return onSelectTimeline && onSelectTimeline(timeline); } }, timeline.title),
                    react_1["default"].createElement(fa_1.FaTrash, { className: "text-red-500", size: 30, onClick: function () { return onDeleteTimeline(timeline); } })))); }))),
        react_1["default"].createElement("div", { className: "relative mb-4" },
            react_1["default"].createElement("div", { className: "absolute left-0 top-1/2 w-full h-1 bg-gray-300 dark:bg-gray-700" }),
            react_1["default"].createElement("div", { className: "events relative w-full" })),
        timeline_ranges.map(function (timeline_range, index) {
            var end_year = timeline_range.end_year;
            var start_year = timeline_range.start_year;
            return (react_1["default"].createElement("div", { key: index },
                react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement("div", { className: "dark:border-gray-700", style: {
                            height: 
                            //largest negative in heightOfEvent * 60
                            Math.max.apply(Math, heightOfEvent.map(function (n) { return Math.abs(n); })) * 60 +
                                100 + "px"
                        } }),
                    react_1["default"].createElement("div", { className: "relative" },
                        react_1["default"].createElement("div", { className: "absolute left-0 top-1/2 w-full h-1 bg-gray-300 dark:bg-gray-700" }),
                        react_1["default"].createElement("div", { className: "events relative w-full" }, timeline_range.events.map(function (event, eventIndex) {
                            var _a;
                            var leftPosition = ((event.year - start_year) / (end_year - start_year)) *
                                100;
                            var isAbove = heightOfEvent[eventIndex] < 0;
                            // const verticalOffset = Math.floor(eventIndex / 2) * 30; // Adjust the offset as needed
                            var verticalOffset = heightFromHeightOffset(heightOfEvent[eventIndex]);
                            //Math.abs(heightOfEvent[eventIndex]) * 50;
                            //here is how to get verticalOffset ->
                            //there should be high variance for similar leftPosition
                            return (react_1["default"].createElement("div", { key: eventIndex, className: "event absolute cursor-pointer", onClick: function () { return selectEvent(event); }, style: {
                                    left: leftPosition + "%"
                                } },
                                react_1["default"].createElement("div", { className: "absolute " + (isAbove ? 'bottom-full mb-2' : 'top-full mt-2') + " left-1/2 transform -translate-x-1/2", style: (_a = {},
                                        _a[isAbove ? 'bottom' : 'top'] = verticalOffset + "px",
                                        _a) },
                                    react_1["default"].createElement("span", { className: "event-year block text-center " + colors[event.timelineIndex % colors.length] + " text-white rounded px-2 py-1" }, event.year),
                                    react_1["default"].createElement("span", { className: "event-title block text-center mt-1" }, event.title)),
                                react_1["default"].createElement("div", { className: "w-4 h-4 " + colors[event.timelineIndex % colors.length] + " rounded-full border-2 border-white dark:border-gray-900" })));
                        }))),
                    react_1["default"].createElement("div", { className: "", style: {
                            height: height_offset + 50 + "px "
                        } }, ' '),
                    react_1["default"].createElement("div", { className: "h-[75px]", style: {
                            height: '150px'
                        } }, selectedEvent &&
                        timeline_range.events.find(function (event) { return event.year === selectedEvent.year; }) && react_1["default"].createElement(EventDetails_1["default"], { event: selectedEvent })))));
        })));
};
exports["default"] = TimelineComponent;
