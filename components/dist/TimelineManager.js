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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var react_1 = require("react");
var Timeline_1 = require("./Timeline");
var YearSlider_1 = require("./YearSlider");
var fa_1 = require("react-icons/fa");
var TimelineManager = function () {
    var _a = react_1.useState({
        zoomed_in: false,
        show_multiple_timelines: true,
        current_timeline: null,
        start_year_zoomed: 0,
        end_year_zoomed: 0,
        timelines: []
    }), state = _a[0], setState = _a[1];
    //const add timeline
    var _b = react_1.useState(false), addingTimeline = _b[0], setAddingTimeline = _b[1];
    var _c = react_1.useState(false), addingEvent = _c[0], setAddingEvent = _c[1];
    var _d = react_1.useState(null), selectedEvent = _d[0], setSelectedEvent = _d[1];
    //Form State FOr Adding a Timeline
    var _e = react_1.useState(''), newTimelineTitle = _e[0], setNewTimelineTitle = _e[1];
    var _f = react_1.useState(''), newTimelineDescription = _f[0], setNewTimelineDescription = _f[1];
    //Form State For Adding an Event
    var _g = react_1.useState(''), newEventTitle = _g[0], setNewEventTitle = _g[1];
    var _h = react_1.useState(''), newEventDescription = _h[0], setNewEventDescription = _h[1];
    var _j = react_1.useState(''), newEventYear = _j[0], setNewEventYear = _j[1];
    // This is year range set by the slider ->
    // if it is not set - then by default the Timeline component
    // will use the first event year as the start year and the last event year as the end year
    // on its own scale
    var _k = react_1.useState(''), startYear = _k[0], setStartYear = _k[1];
    var _l = react_1.useState(''), endYear = _l[0], setEndYear = _l[1];
    var deleteTimeline = function (timeline) {
        setState(function (prevState) { return (__assign(__assign({}, prevState), { timelines: prevState.timelines.filter(function (t) { return t !== timeline; }) })); });
    };
    // This is for the range for the slider to set
    // it should be a subset of the range of all events
    // for the purposes of not having to zoom out too much
    // so if the first event is 1777 and the last event is 2000
    // the slider should be able to go from 1777 to 2000
    var _m = react_1.useState(500), sliderStartYear = _m[0], setSliderStartYear = _m[1];
    var _o = react_1.useState(2000), sliderEndYear = _o[0], setSliderEndYear = _o[1];
    //get the current year
    var todaysYear = new Date().getFullYear();
    var onEditTimeline = function (timeline) {
        console.log('editing timeline', timeline);
        //find the index of the timeline
        var index = state.timelines.indexOf(timeline);
        console.log('index of timeline: ', index);
        //if the index is not found, return
        if (index === -1)
            return;
        //update the timeline
        var newTimelines = __spreadArrays(state.timelines);
        console.log('new timelines: ', newTimelines);
        console.log('timeline to update: ', timeline);
        newTimelines[index] = timeline;
        console.log('new timelines after update: ', newTimelines);
        setState(function (prevState) { return (__assign(__assign({}, prevState), { timelines: newTimelines })); });
    };
    //use memo for the purpose of setting the slider range
    var maxSliderEndYear = react_1.useMemo(function () {
        //if there are no  events in the timelines, set the max year to the current year
        if (state.timelines.length === 0)
            return todaysYear;
        //now check every timeline and see if there are any events
        //if there are no events, set the max year to the current
        //year
        if (state.timelines.every(function (timeline) { return timeline.events.length === 0; })) {
            return todaysYear;
        }
        //filter out timelines that have at least one event
        var filteredTimelines = state.timelines.filter(function (timeline) { return timeline.events.length > 0; });
        var all_events = filteredTimelines.reduce(function (acc, timeline) { return __spreadArrays(acc, timeline.events); }, []);
        var max_year = Math.max.apply(Math, all_events.map(function (event) { return event.year; }));
        console.log('sliderEndYearDriven: ', max_year);
        return max_year;
    }, [state.timelines, todaysYear]);
    //use memo for the purpose of setting the slider range
    var maxSliderStartYear = react_1.useMemo(function () {
        //if there are no  events in the timelines, set the min year to current year - 1
        if (state.timelines.length === 0)
            return todaysYear - 1;
        //now check every timeline and see if there are any events
        //if there are no events, set the min year to the current
        //year - 1
        if (state.timelines.every(function (timeline) { return timeline.events.length === 0; })) {
            return todaysYear - 1;
        }
        var filteredTimelines = state.timelines.filter(function (timeline) { return timeline.events.length > 0; });
        var all_events = filteredTimelines.reduce(function (acc, timeline) { return __spreadArrays(acc, timeline.events); }, []);
        var min_year = Math.min.apply(Math, all_events.map(function (event) { return event.year; }));
        //return min of all events
        var new_min_year = filteredTimelines.reduce(function (min, timeline) {
            var minEventYear = Math.min.apply(Math, timeline.events.map(function (event) { return event.year; }));
            return minEventYear;
        }, todaysYear - 1);
        console.log('sliderStartYearDriven: ', min_year);
        return min_year;
    }, [state.timelines, todaysYear]);
    react_1.useEffect(function () {
        if (maxSliderEndYear !== sliderEndYear) {
            setSliderEndYear(maxSliderEndYear);
        }
        if (maxSliderStartYear !== sliderStartYear) {
            setSliderStartYear(maxSliderStartYear);
        }
        //if the current start year is greater than the max start year
        //set the start year to the max start year
    }, [
        endYear,
        maxSliderEndYear,
        maxSliderStartYear,
        sliderEndYear,
        sliderStartYear,
        startYear,
    ]);
    var selectTimeline = function (timeline) {
        setState(function (prevState) { return (__assign(__assign({}, prevState), { show_multiple_timelines: false, current_timeline: timeline })); });
    };
    var addTimeline = function () {
        var newTimeline = {
            title: newTimelineTitle,
            description: newTimelineDescription,
            events: [],
            shown: true
        };
        setState(function (prevState) { return (__assign(__assign({}, prevState), { timelines: __spreadArrays(prevState.timelines, [newTimeline]) })); });
        setNewTimelineTitle('');
        setNewTimelineDescription('');
    };
    var addEventToTimeline = function (timelineIndex) {
        if (newEventYear === '')
            return;
        var newEvent = {
            title: newEventTitle,
            description: newEventDescription,
            year: newEventYear
        };
        var newTimelines = __spreadArrays(state.timelines);
        newTimelines[timelineIndex].events.push(newEvent);
        setState(function (prevState) { return (__assign(__assign({}, prevState), { timelines: newTimelines })); });
        setNewEventTitle('');
        setNewEventDescription('');
        setNewEventYear('');
    };
    var handleYearRangeChange = function (startYear, endYear) {
        setStartYear(startYear);
        setEndYear(endYear);
    };
    var resetView = function () {
        setStartYear('');
        setEndYear('');
    };
    //change to multiple timelines when timelines change -> but not the events inside the timelines
    var last_length_of_timeslines = react_1.useRef(0);
    //check if the length of the timelines has changed
    react_1.useEffect(function () {
        if (last_length_of_timeslines.current !== state.timelines.length) {
            last_length_of_timeslines.current = state.timelines.length;
            setState(function (prevState) { return (__assign(__assign({}, prevState), { show_multiple_timelines: true, current_timeline: null })); });
        }
        last_length_of_timeslines.current = state.timelines.length;
    }, [state.timelines]);
    var handleSliderYearChange = function (startYear, endYear) {
        console.log('slider year change', startYear, endYear);
        //setSliderStartYear(startYear);
        //setSliderEndYear(endYear);
        setEndYear(endYear);
        setStartYear(startYear);
    };
    //save the current state to a json file and download it
    var saveState = function () {
        var data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
        var a = document.createElement('a');
        a.href = data;
        a.download = 'timeline.json';
        a.click();
    };
    //load a json file and set the state to the json file
    var loadState = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var file, fileReader;
        var _a;
        return __generator(this, function (_b) {
            file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
            if (!file)
                return [2 /*return*/];
            fileReader = new FileReader();
            fileReader.onload = function (e) {
                if (!e.target)
                    return;
                var result = e.target.result;
                if (typeof result !== 'string')
                    return;
                var json = JSON.parse(result);
                setState(json);
            };
            fileReader.readAsText(file);
            //set to multiple timelines
            setState(function (prevState) { return (__assign(__assign({}, prevState), { show_multiple_timelines: true, current_timeline: null })); });
            return [2 /*return*/];
        });
    }); };
    return (react_1["default"].createElement("div", { className: "p-4 flex flex-row flex-wrap" },
        react_1["default"].createElement("div", { className: "flex space-x-4 w-full justify-around p-4" },
            react_1["default"].createElement("button", { onClick: saveState, className: "p-2 bg-blue-500 text-white rounded" }, "Save State"),
            react_1["default"].createElement("div", { className: "relative" },
                react_1["default"].createElement("label", { htmlFor: "load-state", className: "text-black pr-3 rounded cursor-pointer dark:text-white" }, "Load State :"),
                react_1["default"].createElement("input", { id: "load-state", type: "file", onChange: loadState }))),
        react_1["default"].createElement("h1", { className: "w-full text-center" }, " Filter Slider "),
        react_1["default"].createElement("div", { className: "w-full" },
            react_1["default"].createElement(YearSlider_1["default"], { initialStartYear: sliderStartYear, initialEndYear: sliderEndYear, onYearChange: handleSliderYearChange })),
        state.show_multiple_timelines ? (react_1["default"].createElement("div", { className: "w-full flex flex-col items-center" },
            react_1["default"].createElement("h1", { className: "text-2xl font-bold mb-4" }, "Showing Multiple Timelines"),
            addingTimeline ? (react_1["default"].createElement("div", { className: "mb-4 dark:text-black flex flex-col items-center space-y-4" },
                react_1["default"].createElement(fa_1.FaTimes, { onClick: function () { return setAddingTimeline(false); }, className: "cursor-pointer ml-2 dark:text-white", size: 30 }),
                react_1["default"].createElement("input", { type: "text", placeholder: "Timeline Title", value: newTimelineTitle, onChange: function (e) { return setNewTimelineTitle(e.target.value); }, className: "p-2 border rounded w-64" }),
                react_1["default"].createElement("textarea", { placeholder: "Timeline Description", value: newTimelineDescription, onChange: function (e) { return setNewTimelineDescription(e.target.value); }, className: "p-2 border rounded w-64 h-32 resize-none" }),
                react_1["default"].createElement("button", { onClick: addTimeline, className: "p-2 bg-green-500 text-white rounded w-64" }, "Add Timeline"))) : (react_1["default"].createElement("div", { className: "mb-4 dark:text-black" },
                react_1["default"].createElement("button", { onClick: function () { return setAddingTimeline(true); }, className: "p-2 bg-green-500 text-white rounded" }, "Add Timeline"))),
            react_1["default"].createElement(Timeline_1["default"], { timelines: state.timelines, onSelectEvent: setSelectedEvent, showMultipleTimelines: state.show_multiple_timelines, onSelectTimeline: selectTimeline, startYear: startYear, endYear: endYear, onYearRangeChange: handleYearRangeChange, onDeleteTimeline: deleteTimeline, onEditTimeline: onEditTimeline }))) : (react_1["default"].createElement("div", { className: "flex flex-col items-center w-full" },
            react_1["default"].createElement("h1", { className: "text-2xl font-bold" }, state.current_timeline ? state.current_timeline.title : ''),
            react_1["default"].createElement("div", { className: "flex space-x-4", onClick: function () {
                    return setState(function (prevState) { return (__assign(__assign({}, prevState), { show_multiple_timelines: true, current_timeline: null })); });
                } },
                react_1["default"].createElement("button", { onClick: function () {
                        return setState(function (prevState) { return (__assign(__assign({}, prevState), { show_multiple_timelines: true, current_timeline: null })); });
                    }, className: "m-3 text-white font-bold hover:border-b-2 border-white" }, "Back to Multiple Timelines"),
                react_1["default"].createElement(fa_1.FaTimes, { onClick: function () {
                        return setState(function (prevState) { return (__assign(__assign({}, prevState), { show_multiple_timelines: true, current_timeline: null })); });
                    }, className: "cursor-pointer ml-2 dark:text-white", size: 30 })),
            state.current_timeline && (react_1["default"].createElement("div", { className: "w-full" },
                addingEvent ? (react_1["default"].createElement("div", { className: "mb-8 w-full dark:text-black flex flex-col items-center space-y-4" },
                    react_1["default"].createElement("h2", { className: "text-xl font-bold mb-4" }, "Add New Event"),
                    react_1["default"].createElement(fa_1.FaTimes, { onClick: function () { return setAddingEvent(false); }, className: "cursor-pointer ml-2 dark:text-white", size: 30 }),
                    react_1["default"].createElement("input", { type: "text", placeholder: "Event Title", value: newEventTitle, onChange: function (e) { return setNewEventTitle(e.target.value); }, className: "p-2 border rounded w-64" }),
                    react_1["default"].createElement("textarea", { 
                        //type="text"
                        placeholder: "Event Description", value: newEventDescription, onChange: function (e) { return setNewEventDescription(e.target.value); }, className: "p-2 border rounded w-64" }, ' '),
                    react_1["default"].createElement("input", { type: "number", placeholder: "Event Year", value: newEventYear, onChange: function (e) { return setNewEventYear(Number(e.target.value)); }, className: "p-2 border rounded w-64" }),
                    react_1["default"].createElement("button", { onClick: function () {
                            return addEventToTimeline(state.timelines.indexOf(state.current_timeline));
                        }, className: "p-2 bg-green-500 text-white rounded w-64" }, "Add Event"))) : (react_1["default"].createElement("div", { className: "mb-4 dark:text-black" },
                    react_1["default"].createElement("button", { onClick: function () { return setAddingEvent(true); }, className: "p-2 bg-green-500 text-white rounded" }, "Add Event"))),
                react_1["default"].createElement(Timeline_1["default"], { timelines: [state.current_timeline], onSelectEvent: setSelectedEvent, showMultipleTimelines: state.show_multiple_timelines, startYear: startYear, endYear: endYear, onYearRangeChange: handleYearRangeChange, onDeleteTimeline: deleteTimeline, onEditTimeline: onEditTimeline })))))));
};
exports["default"] = TimelineManager;
