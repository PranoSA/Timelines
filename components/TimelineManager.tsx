/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ApplicationState, TimeLine, TimeEvent } from '../types';
import TimelineComponent from './Timeline';
import EventDetails from './EventDetails';
import YearSlider from './YearSlider';
import { FaPen, FaTimes } from 'react-icons/fa';
import { cursorTo } from 'readline';

const TimelineManager: React.FC = () => {
  const [state, setState] = useState<ApplicationState>({
    zoomed_in: false,
    show_multiple_timelines: true, // Start in multiple timeline mode
    current_timeline: null,
    start_year_zoomed: 0,
    end_year_zoomed: 0,
    timelines: [],
  });

  //const add timeline
  const [addingTimeline, setAddingTimeline] = useState(false);
  const [addingEvent, setAddingEvent] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<TimeEvent | null>(null);

  //Form State FOr Adding a Timeline
  const [newTimelineTitle, setNewTimelineTitle] = useState('');
  const [newTimelineDescription, setNewTimelineDescription] = useState('');

  //Form State For Adding an Event
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventYear, setNewEventYear] = useState<number | ''>('');

  // This is year range set by the slider ->
  // if it is not set - then by default the Timeline component
  // will use the first event year as the start year and the last event year as the end year
  // on its own scale
  const [startYear, setStartYear] = useState<number | ''>('');
  const [endYear, setEndYear] = useState<number | ''>('');

  const [editingTimeline, setEditingTimeline] = useState<TimeLine | null>(null);
  const [editedTimelineTitle, setEditedTimelineTitle] = useState<string>('');
  const [editedTimelineDescription, setEditedTimelineDescription] =
    useState<string>('');
  const editTitleRef = React.useRef<HTMLInputElement>(null);
  const editDescriptionRef = React.useRef<HTMLTextAreaElement>(null);

  const deleteTimeline = (timeline: TimeLine) => {
    setState((prevState) => ({
      ...prevState,
      timelines: prevState.timelines.filter((t) => t !== timeline),
    }));
  };

  // This is for the range for the slider to set
  // it should be a subset of the range of all events
  // for the purposes of not having to zoom out too much
  // so if the first event is 1777 and the last event is 2000
  // the slider should be able to go from 1777 to 2000
  const [sliderStartYear, setSliderStartYear] = useState<number>(500);
  const [sliderEndYear, setSliderEndYear] = useState<number>(2000);

  //get the current year
  const todaysYear = new Date().getFullYear();

  const onEditTimelineNew = (timeline: TimeLine) => {
    //same thing -> except you use the current timeline
    const index = state.timelines.findIndex(
      (t) =>
        t.description === state.current_timeline?.description &&
        t.title === state.current_timeline?.title
    );

    console.log('current timeline: ', state.current_timeline);

    console.log('current timelines ', state.timelines);

    console.log('index of timeline: ', index);

    if (index === -1) return;

    console.log('timeline to update: ', timeline);

    const newTimelines = [...state.timelines];

    newTimelines[index] = timeline;

    console.log('new timelines after update: ', newTimelines);

    setState((prevState) => ({
      ...prevState,
      timelines: newTimelines,
    }));
  };

  const onEditTimeline = (timeline: TimeLine) => {
    console.log('editing timeline', timeline);

    //find the index of the timeline
    const index = state.timelines.indexOf(timeline);

    console.log('index of timeline: ', index);

    //if the index is not found, return
    if (index === -1) return;

    //update the timeline
    const newTimelines = [...state.timelines];

    console.log('new timelines: ', newTimelines);

    console.log('timeline to update: ', timeline);

    newTimelines[index] = timeline;

    console.log('new timelines after update: ', newTimelines);

    setState((prevState) => ({
      ...prevState,
      timelines: newTimelines,
    }));
  };

  //use memo for the purpose of setting the slider range
  const maxSliderEndYear = useMemo(() => {
    //if there are no  events in the timelines, set the max year to the current year
    if (state.timelines.length === 0) return todaysYear;
    //now check every timeline and see if there are any events
    //if there are no events, set the max year to the current
    //year
    if (state.timelines.every((timeline) => timeline.events.length === 0)) {
      return todaysYear;
    }

    //filter out timelines that have at least one event
    const filteredTimelines = state.timelines.filter(
      (timeline) => timeline.events.length > 0
    );

    const all_events = filteredTimelines.reduce(
      (acc, timeline) => [...acc, ...timeline.events],
      [] as TimeEvent[]
    );

    const max_year = Math.max(...all_events.map((event) => event.year));

    console.log('sliderEndYearDriven: ', max_year);
    return max_year;
  }, [state.timelines, todaysYear]);

  //use memo for the purpose of setting the slider range
  const maxSliderStartYear = useMemo(() => {
    //if there are no  events in the timelines, set the min year to current year - 1
    if (state.timelines.length === 0) return todaysYear - 1;

    //now check every timeline and see if there are any events
    //if there are no events, set the min year to the current
    //year - 1
    if (state.timelines.every((timeline) => timeline.events.length === 0)) {
      return todaysYear - 1;
    }

    const filteredTimelines = state.timelines.filter(
      (timeline) => timeline.events.length > 0
    );

    const all_events = filteredTimelines.reduce(
      (acc, timeline) => [...acc, ...timeline.events],
      [] as TimeEvent[]
    );

    const min_year = Math.min(...all_events.map((event) => event.year));

    //return min of all events
    const new_min_year = filteredTimelines.reduce((min, timeline) => {
      const minEventYear = Math.min(
        ...timeline.events.map((event) => event.year)
      );
      return minEventYear;
    }, todaysYear - 1);

    console.log('sliderStartYearDriven: ', min_year);
    return min_year;
  }, [state.timelines, todaysYear]);

  useEffect(() => {
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

  const selectTimeline = (timeline: TimeLine) => {
    setState((prevState) => ({
      ...prevState,
      show_multiple_timelines: false,
      current_timeline: timeline,
    }));
  };

  const addTimeline = () => {
    const newTimeline: TimeLine = {
      title: newTimelineTitle,
      description: newTimelineDescription,
      events: [],
      shown: true,
    };
    setState((prevState) => ({
      ...prevState,
      timelines: [...prevState.timelines, newTimeline],
    }));
    setNewTimelineTitle('');
    setNewTimelineDescription('');
  };

  const addEventToTimeline = (timelineIndex: number) => {
    if (newEventYear === '') return;
    const newEvent: TimeEvent = {
      title: newEventTitle,
      description: newEventDescription,
      year: newEventYear,
    };
    const newTimelines = [...state.timelines];
    newTimelines[timelineIndex].events.push(newEvent);
    setState((prevState) => ({
      ...prevState,
      timelines: newTimelines,
    }));
    setNewEventTitle('');
    setNewEventDescription('');
    setNewEventYear('');
  };

  const handleYearRangeChange = (startYear: number, endYear: number) => {
    setStartYear(startYear);
    setEndYear(endYear);
  };

  const resetView = () => {
    setStartYear('');
    setEndYear('');
  };

  //change to multiple timelines when timelines change -> but not the events inside the timelines
  const last_length_of_timeslines = useRef<number>(0);

  //check if the length of the timelines has changed
  useEffect(() => {
    if (last_length_of_timeslines.current !== state.timelines.length) {
      last_length_of_timeslines.current = state.timelines.length;
      setState((prevState) => ({
        ...prevState,
        show_multiple_timelines: true,
        current_timeline: null,
      }));
    }
    last_length_of_timeslines.current = state.timelines.length;
  }, [state.timelines]);

  const handleSliderYearChange = (startYear: number, endYear: number) => {
    console.log('slider year change', startYear, endYear);
    //setSliderStartYear(startYear);
    //setSliderEndYear(endYear);
    setEndYear(endYear);
    setStartYear(startYear);
  };

  //save the current state to a json file and download it
  const saveState = () => {
    const data = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(state)
    )}`;
    const a = document.createElement('a');
    a.href = data;
    a.download = 'timeline.json';
    a.click();
  };

  //load a json file and set the state to the json file
  const loadState = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      if (!e.target) return;
      const result = e.target.result;
      if (typeof result !== 'string') return;
      const json = JSON.parse(result);
      setState(json);
    };
    fileReader.readAsText(file);
    //set to multiple timelines
    setState((prevState) => ({
      ...prevState,
      show_multiple_timelines: true,
      current_timeline: null,
    }));
  };

  return (
    <div className="p-4 flex flex-row flex-wrap">
      {/* Optoin to both download and upload a saved state*/}
      <div className="flex space-x-4 w-full justify-around p-4">
        <button
          onClick={saveState}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Save State
        </button>
        <div className="relative">
          <label
            htmlFor="load-state"
            className="text-black pr-3 rounded cursor-pointer dark:text-white"
          >
            Load State :
          </label>
          <input id="load-state" type="file" onChange={loadState} />
        </div>
      </div>

      <h1 className="w-full text-center"> Filter Slider </h1>
      <div className="w-full">
        <YearSlider
          initialStartYear={sliderStartYear}
          initialEndYear={sliderEndYear}
          onYearChange={handleSliderYearChange}
        />
      </div>

      {state.show_multiple_timelines ? (
        <div className="w-full flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4">
            Showing Multiple Timelines
          </h1>
          {addingTimeline ? (
            <div className="mb-4 dark:text-black flex flex-col items-center space-y-4">
              <FaTimes
                onClick={() => setAddingTimeline(false)}
                className="cursor-pointer ml-2 dark:text-white"
                size={30}
              />
              <input
                type="text"
                placeholder="Timeline Title"
                value={newTimelineTitle}
                onChange={(e) => setNewTimelineTitle(e.target.value)}
                className="p-2 border rounded w-64"
              />
              <textarea
                placeholder="Timeline Description"
                value={newTimelineDescription}
                onChange={(e) => setNewTimelineDescription(e.target.value)}
                className="p-2 border rounded w-64 h-32 resize-none"
              ></textarea>
              <button
                onClick={addTimeline}
                className="p-2 bg-green-500 text-white rounded w-64"
              >
                Add Timeline
              </button>
            </div>
          ) : (
            <div className="mb-4 dark:text-black">
              <button
                onClick={() => setAddingTimeline(true)}
                className="p-2 bg-green-500 text-white rounded"
              >
                Add Timeline
              </button>
            </div>
          )}
          <TimelineComponent
            timelines={state.timelines}
            onSelectEvent={setSelectedEvent}
            showMultipleTimelines={state.show_multiple_timelines}
            onSelectTimeline={selectTimeline}
            startYear={startYear}
            endYear={endYear}
            onYearRangeChange={handleYearRangeChange}
            onDeleteTimeline={deleteTimeline}
            onEditTimeline={onEditTimeline}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          {!editingTimeline ? (
            <>
              {state.current_timeline ? state.current_timeline.title : ''}
              <div className="flex space-x-4">
                {
                  //description
                  state.current_timeline
                    ? state.current_timeline.description
                    : ''
                }
              </div>
              <FaPen
                onClick={() => {
                  setEditingTimeline(state.current_timeline);
                  setEditedTimelineTitle(
                    state.current_timeline ? state.current_timeline.title : ''
                  );
                  setEditedTimelineDescription(
                    state.current_timeline
                      ? state.current_timeline.description
                      : ''
                  );
                }}
                className="cursor-pointer ml-2 dark:text-white"
                size={20}
              />
            </>
          ) : (
            <div className="w-full flex flex-col p-3">
              {/* Form for editing timeline */}
              <input
                ref={editTitleRef}
                type="text"
                value={editedTimelineTitle}
                onChange={(e) => setEditedTimelineTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditingTimeline(null);
                    onEditTimelineNew({
                      ...state.current_timeline!,
                      title: editedTimelineTitle,
                    });
                  }
                }}
                className="p-2 border rounded w-full border-black"
              />
              <textarea
                ref={editDescriptionRef}
                value={editedTimelineDescription}
                onChange={(e) => setEditedTimelineDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditingTimeline(null);
                    onEditTimelineNew({
                      ...state.current_timeline!,
                      description: editedTimelineDescription,
                    });
                  }
                }}
                className="p-2 border rounded w-full" //resize-none
              ></textarea>
              <FaTimes
                onClick={() => setEditingTimeline(null)}
                className="cursor-pointer ml-2 dark:text-white"
                size={20}
              />
            </div>
          )}

          {/* go bvack to multiple timelines */}
          <div
            className="flex space-x-4"
            onClick={() =>
              setState((prevState) => ({
                ...prevState,
                show_multiple_timelines: true,
                current_timeline: null,
              }))
            }
          >
            <button
              onClick={() =>
                setState((prevState) => ({
                  ...prevState,
                  show_multiple_timelines: true,
                  current_timeline: null,
                }))
              }
              className="m-3 text-white font-bold hover:border-b-2 border-white"
            >
              Back to Multiple Timelines
            </button>
            <FaTimes
              onClick={() =>
                setState((prevState) => ({
                  ...prevState,
                  show_multiple_timelines: true,
                  current_timeline: null,
                }))
              }
              className="cursor-pointer ml-2 dark:text-white"
              size={30}
            />
          </div>

          {state.current_timeline && (
            <div className="w-full">
              {addingEvent ? (
                <div className="mb-8 w-full dark:text-black flex flex-col items-center space-y-4">
                  <h2 className="text-xl font-bold mb-4">Add New Event</h2>
                  <FaTimes
                    onClick={() => setAddingEvent(false)}
                    className="cursor-pointer ml-2 dark:text-white"
                    size={30}
                  />
                  <input
                    type="text"
                    placeholder="Event Title"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="p-2 border rounded w-64"
                  />
                  <textarea
                    //type="text"
                    placeholder="Event Description"
                    value={newEventDescription}
                    onChange={(e) => setNewEventDescription(e.target.value)}
                    className="p-2 border rounded w-64"
                  >
                    {' '}
                  </textarea>
                  <input
                    type="number"
                    placeholder="Event Year"
                    value={newEventYear}
                    onChange={(e) => setNewEventYear(Number(e.target.value))}
                    className="p-2 border rounded w-64"
                  />
                  <button
                    onClick={() =>
                      addEventToTimeline(
                        state.timelines.indexOf(state.current_timeline!)
                      )
                    }
                    className="p-2 bg-green-500 text-white rounded w-64"
                  >
                    Add Event
                  </button>
                </div>
              ) : (
                <div className="mb-4 dark:text-black">
                  <button
                    onClick={() => setAddingEvent(true)}
                    className="p-2 bg-green-500 text-white rounded"
                  >
                    Add Event
                  </button>
                </div>
              )}
              <TimelineComponent
                timelines={[state.current_timeline]}
                onSelectEvent={setSelectedEvent}
                showMultipleTimelines={state.show_multiple_timelines}
                startYear={startYear}
                endYear={endYear}
                onYearRangeChange={handleYearRangeChange}
                onDeleteTimeline={deleteTimeline}
                onEditTimeline={onEditTimeline}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimelineManager;
