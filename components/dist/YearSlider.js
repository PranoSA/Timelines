"use strict";
exports.__esModule = true;
/* eslint-disable @typescript-eslint/no-unused-vars */
var react_1 = require("react");
var YearSlider = function (_a) {
    var initialStartYear = _a.initialStartYear, initialEndYear = _a.initialEndYear, onYearChange = _a.onYearChange;
    var _b = react_1.useState(initialStartYear), sliderStartYear = _b[0], setSliderStartYear = _b[1];
    var _c = react_1.useState(initialEndYear), sliderEndYear = _c[0], setSliderEndYear = _c[1];
    var lastInitialStartYear = react_1.useRef(null);
    var lastInitialEndYear = react_1.useRef(null);
    //only on initial mount, should lastInitialStartYear and lastInitialEndYear be set to initialStartYear and initialEndYear
    react_1.useEffect(function () {
        lastInitialStartYear.current = initialStartYear;
        lastInitialEndYear.current = initialEndYear;
    }, [initialEndYear, initialStartYear]);
    //check when initialStartYear and initialEndYear changes
    //if sliderStartYear was equal to initialStartYear before the change, update sliderStartYear
    //then update lastInitialStartYear and lastInitialEndYear
    react_1.useEffect(function () {
        //just set
        setSliderStartYear(initialStartYear);
        setSliderEndYear(initialEndYear);
    }, [initialStartYear, initialEndYear]);
    var dragging = react_1.useRef(null);
    // print when initialStartYear and initialEndYear changes
    react_1.useEffect(function () {
        console.log('sliderStartYear: ', sliderStartYear);
        console.log('sliderEndYear: ', sliderEndYear);
    }, [sliderStartYear, sliderEndYear]);
    var expandToEntireRange = function () {
        setSliderStartYear(initialStartYear);
        setSliderEndYear(initialEndYear);
        onYearChange(initialStartYear, initialEndYear);
    };
    //print out initialStartYear and initialEndYear
    react_1.useEffect(function () {
        console.log('initialStartYear: ', initialStartYear);
        console.log('initialEndYear: ', initialEndYear);
        console.log('sliderStartYear: ', sliderStartYear);
        console.log('sliderEndYear: ', sliderEndYear);
        console.log('---');
        //if initialStartYear changes in a way that makes the current slider not part of the range,
        //update the slider to be part of the range
        var newSliderStartYear = sliderStartYear;
        var newSliderEndYear = sliderEndYear;
        if (initialStartYear > sliderStartYear) {
            newSliderStartYear = initialStartYear;
        }
        //if initialEndYear changes in a way that makes the current slider not part of the range,
        //update the slider to be part of the range
        if (initialEndYear < sliderEndYear) {
            newSliderEndYear = initialEndYear;
        }
        //check if start year is greater than end year
        if (newSliderStartYear > newSliderEndYear) {
            newSliderStartYear = newSliderEndYear - 1;
        }
        //update the slider
        setSliderStartYear(newSliderStartYear);
        setSliderEndYear(newSliderEndYear);
        //sanity check -> if the start year i
    }, [initialStartYear, initialEndYear, sliderStartYear, sliderEndYear]);
    //const [dragging, setDragging] = useState<'start' | 'end' | null>(null);
    var setDragging = function (type) {
        dragging.current = type;
    };
    //if initialStartYear changes in a way that makes the current slider not part of the range,
    //update the slider to be part of the range
    if (initialStartYear > sliderStartYear) {
        setSliderStartYear(initialStartYear);
    }
    //if initialEndYear changes in a way that makes the current slider not part of the range,
    //update the slider to be part of the range
    if (initialEndYear < sliderEndYear) {
        setSliderEndYear(initialEndYear);
    }
    var handleMouseMove = react_1.useCallback(function (e) {
        if (!dragging)
            return;
        var slider = document.getElementById('year-slider');
        if (!slider)
            return;
        var sliderRect = slider.getBoundingClientRect();
        var newYear = Math.round(initialStartYear +
            ((initialEndYear - initialStartYear) *
                (e.clientX - sliderRect.left)) /
                sliderRect.width);
        if (dragging.current === 'start' && newYear < sliderEndYear) {
            setSliderStartYear(newYear);
            onYearChange(newYear, sliderEndYear);
        }
        else if (dragging.current === 'end' && newYear > sliderStartYear) {
            setSliderEndYear(newYear);
            onYearChange(sliderStartYear, newYear);
        }
    }, [
        initialStartYear,
        initialEndYear,
        sliderEndYear,
        sliderStartYear,
        onYearChange,
    ]);
    var handleMouseUp = react_1.useCallback(function () {
        setDragging(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);
    var handleMouseDown = react_1.useCallback(function (type) {
        setDragging(type);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove, handleMouseUp]);
    return (react_1["default"].createElement("div", { id: "year-slider", className: "relative mb-8 p-4" },
        react_1["default"].createElement("div", { className: "absolute left-0 top-1/2 w-full h-2 bg-gray-300 dark:bg-gray-700 rounded" }),
        react_1["default"].createElement("div", { className: "absolute top-1/2 h-2 bg-blue-200 dark:bg-blue-800 rounded", style: {
                left: ((sliderStartYear - initialStartYear) /
                    (initialEndYear - initialStartYear)) *
                    100 + "%",
                width: ((sliderEndYear - sliderStartYear) /
                    (initialEndYear - initialStartYear)) *
                    100 + "%"
            } }),
        react_1["default"].createElement("div", { className: "events relative w-full" },
            react_1["default"].createElement("div", { className: "absolute top-1/2 h-6 w-6 bg-blue-500 rounded-full cursor-pointer transform -translate-y--1/2", style: {
                    left: ((sliderStartYear - initialStartYear) /
                        (initialEndYear - initialStartYear)) *
                        100 + "%"
                }, onMouseDown: function () { return handleMouseDown('start'); } },
                react_1["default"].createElement("div", { className: "absolute bottom-full mb-2 w-12 text-center text-sm font-semibold text-gray-700 dark:text-gray-300" }, sliderStartYear)),
            react_1["default"].createElement("div", { className: "absolute top-1/2 h-6 w-6 bg-blue-500 rounded-full cursor-pointer transform -translate-y--1/2", style: {
                    left: ((sliderEndYear - initialStartYear) /
                        (initialEndYear - initialStartYear)) *
                        100 + "%"
                }, onMouseDown: function () { return handleMouseDown('end'); } },
                react_1["default"].createElement("div", { className: "absolute bottom-full mb-2 w-12 text-center text-sm font-semibold text-gray-700 dark:text-gray-300" }, sliderEndYear))),
        react_1["default"].createElement("div", { className: "flex justify-between mt-8" },
            react_1["default"].createElement("span", { className: "text-lg font-semibold" }, initialStartYear),
            react_1["default"].createElement("span", { className: "text-lg font-semibold" }, initialEndYear)),
        react_1["default"].createElement("button", { className: "mt-4 bg-blue-500 text-white px-4 py-2 rounded", onClick: expandToEntireRange }, "Expand to full range")));
};
exports["default"] = YearSlider;
