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
exports.__esModule = true;
var react_1 = require("react");
var fa_1 = require("react-icons/fa");
var EventDetails = function (_a) {
    var event = _a.event, editEvent = _a.editEvent;
    var _b = react_1.useState(false), editingEvent = _b[0], setEditingEvent = _b[1];
    var _c = react_1.useState(null), editedField = _c[0], setEditedField = _c[1];
    var _d = react_1.useState((event === null || event === void 0 ? void 0 : event.title) || ''), editedEventTitle = _d[0], setEditedEventTitle = _d[1];
    var _e = react_1.useState((event === null || event === void 0 ? void 0 : event.description) || ''), editedEventDescription = _e[0], setEditedEventDescription = _e[1];
    var _f = react_1.useState((event === null || event === void 0 ? void 0 : event.year) || 0), editedEventYear = _f[0], setEditedEventYear = _f[1];
    var inputTitleRef = react_1.useRef(null);
    var inputDescriptionRef = react_1.useRef(null);
    var inputYearRef = react_1.useRef(null);
    //if editedEvent changes, remove focus from all inputs
    //and set all the fields to "" and set not editing to true and year to 0
    react_1.useEffect(function () {
        if (!editingEvent) {
            setEditedEventTitle((event === null || event === void 0 ? void 0 : event.title) || '');
            setEditedEventDescription((event === null || event === void 0 ? void 0 : event.description) || '');
            setEditedEventYear((event === null || event === void 0 ? void 0 : event.year) || 0);
        }
    }, [editingEvent, event === null || event === void 0 ? void 0 : event.description, event === null || event === void 0 ? void 0 : event.title, event === null || event === void 0 ? void 0 : event.year]);
    react_1.useEffect(function () {
        var _a, _b, _c;
        if (editingEvent && editedField) {
            if (editedField === 'title') {
                (_a = inputTitleRef.current) === null || _a === void 0 ? void 0 : _a.focus();
            }
            else if (editedField === 'description') {
                (_b = inputDescriptionRef.current) === null || _b === void 0 ? void 0 : _b.focus();
            }
            else if (editedField === 'year') {
                (_c = inputYearRef.current) === null || _c === void 0 ? void 0 : _c.focus();
            }
        }
    }, [editingEvent, editedField]);
    var handleKeyDown = function (e) {
        if (e.key === 'Enter') {
            saveEvent();
        }
    };
    var saveEvent = function () {
        if (!event)
            return;
        var updatedEvent = __assign(__assign({}, event), { title: editedEventTitle, description: editedEventDescription, year: editedEventYear });
        console.log(updatedEvent);
        editEvent(updatedEvent);
        setEditingEvent(false);
        setEditedField(null);
    };
    if (!event)
        return null;
    return (react_1["default"].createElement("div", { className: "p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md relative" },
        editingEvent && editedField === 'year' ? (react_1["default"].createElement("input", { ref: inputYearRef, type: "number", value: editedEventYear, onChange: function (e) { return setEditedEventYear(Number(e.target.value)); }, onKeyDown: handleKeyDown, className: "p-2 border rounded w-full mb-2" })) : (react_1["default"].createElement("h2", { className: "text-xl font-bold" },
            event.year,
            react_1["default"].createElement(fa_1.FaPen, { className: "ml-2 cursor-pointer", onClick: function () {
                    setEditingEvent(true);
                    setEditedField('year');
                }, size: 20 }))),
        editingEvent && editedField === 'title' ? (react_1["default"].createElement("input", { ref: inputTitleRef, type: "text", value: editedEventTitle, onChange: function (e) { return setEditedEventTitle(e.target.value); }, onKeyDown: handleKeyDown, className: "p-2 border rounded w-full mb-2" })) : (react_1["default"].createElement("h2", { className: "text-xl font-bold" },
            event.title,
            react_1["default"].createElement(fa_1.FaPen, { className: "ml-2 cursor-pointer", onClick: function () {
                    setEditingEvent(true);
                    setEditedField('title');
                }, size: 20 }))),
        editingEvent && editedField === 'description' ? (react_1["default"].createElement("textarea", { ref: inputDescriptionRef, value: editedEventDescription, onChange: function (e) { return setEditedEventDescription(e.target.value); }, onKeyDown: handleKeyDown, className: "p-2 border rounded w-full mb-2" })) : (react_1["default"].createElement("p", { className: "text-gray-700 dark:text-gray-300" },
            event.description,
            react_1["default"].createElement(fa_1.FaPen, { className: "ml-2 cursor-pointer", onClick: function () {
                    setEditingEvent(true);
                    setEditedField('description');
                }, size: 20 })))));
};
exports["default"] = EventDetails;
