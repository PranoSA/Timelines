/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ApplicationState,
  TimeLine,
  TimeEvent,
  InsertionTimeLine,
} from '../types';
import TimelineComponent from './Timeline';
import EventDetails from './EventDetails';
import YearSlider from './YearSlider';
import { FaPen, FaPlus, FaTimes, FaSearch } from 'react-icons/fa';
import { cursorTo } from 'readline';
import { useSaveTimelineMutation } from '../queries/saved';

import { useSearchPublishedTimelines } from '@/queries/publish';

//dorn arro wfrom Fa
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';

const TimelineManager: React.FC = () => {
  //drop down to upload / download timelines
  const [showFilePanel, setShowFilePanel] = useState(false);

  const [state, setState] = useState<ApplicationState>({
    zoomed_in: false,
    show_multiple_timelines: true, // Start in multiple timeline mode
    current_timeline: null,
    start_year_zoomed: 0,
    end_year_zoomed: 0,
    timelines: [],
  });

  const [submittedTimelineName, setSubmittedTimelineName] = useState('');
  const [submittedTimelineDescription, setSubmittedTimelineDescription] =
    useState('');

  const [openSearchModal, setOpenSearchModal] = useState(false);

  const [showSubmitTimelineModal, setShowSubmitTimelineModal] = useState(false);

  const saveTimeline = useSaveTimelineMutation();

  const submitTimeline = async () => {
    //make a InsertionTimeLine
    const insertionTimeline: InsertionTimeLine = {
      title: submittedTimelineName,
      description: submittedTimelineDescription,
      timelines: state.timelines,
    };

    console.log('insertionTimeline: ', insertionTimeline);

    //make a new timeline
    const submit = await saveTimeline.mutateAsync(insertionTimeline);

    return submit;
  };

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

  //if this is not set -> then the startYear and endYear will correspond to the
  // maxEventYear and minEventYear
  const [filterYears, setFilterYears] = useState<boolean>(false);

  const [editingTimeline, setEditingTimeline] = useState<TimeLine | null>(null);
  const [editedTimelineTitle, setEditedTimelineTitle] = useState<string>('');
  const [editedTimelineDescription, setEditedTimelineDescription] =
    useState<string>('');
  const editTitleRef = React.useRef<HTMLInputElement>(null);
  const editDescriptionRef = React.useRef<HTMLTextAreaElement>(null);

  const titleEventInputRef = useRef<HTMLInputElement>(null);
  const descriptionEventInputRef = useRef<HTMLTextAreaElement>(null);
  const yearEventInputRef = useRef<HTMLInputElement>(null);

  const deleteTimeline = (timeline: TimeLine) => {
    setState((prevState) => ({
      ...prevState,
      timelines: prevState.timelines.filter((t) => t !== timeline),
    }));
  };

  //modal that blackens out the background and calls submitTimeline
  const submitTimelineModal = () => {
    return (
      <div
        className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50"
        onClick={() => setShowSubmitTimelineModal(false)}
      >
        <div
          className="bg-white w-1/2 h-1/2"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <h1>Submit Timeline</h1>
          <input
            type="text"
            value={submittedTimelineName}
            onChange={(e) => setSubmittedTimelineName(e.target.value)}
          />
          <textarea
            value={submittedTimelineDescription}
            onChange={(e) => setSubmittedTimelineDescription(e.target.value)}
          ></textarea>
          <button onClick={submitTimeline}>Submit</button>
        </div>
      </div>
    );
  };

  // This is for the range for the slider to set
  // it should be a subset of the range of all events
  // for the purposes of not having to zoom out too much
  // so if the first event is 1777 and the last event is 2000
  // the slider should be able to go from 1777 to 2000
  const [sliderStartYear, setSliderStartYear] = useState<number>(500);
  const [sliderEndYear, setSliderEndYear] = useState<number>(2000);

  const [showSearchModal, setShowSearchModal] = useState(false);

  //set the year to maxEventYear and minEventYear if the filterYears is set to false
  useEffect(() => {
    if (!filterYears) {
      setStartYear(sliderStartYear);
      setEndYear(sliderEndYear);
    }
  }, [filterYears, sliderEndYear, sliderStartYear]);

  //get the current year
  const todaysYear = new Date().getFullYear();

  const addTimelineWithTimeline = (timeline: TimeLine) => {
    setState((prevState) => ({
      ...prevState,
      timelines: [...prevState.timelines, timeline],
    }));
  };

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

    //close the add timeline form
    setAddingTimeline(false);
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
    //change it so you are only saving the timelines

    //change the name of the save file to be the timeline names separated by a "+"
    const saveFileName = state.timelines
      .map((timeline) => timeline.title)
      .join('+');

    const data = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(state, null, 2)
    )}`;

    const a = document.createElement('a');
    a.href = data;
    a.download = `${saveFileName}.json`;
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

      //this is the timelines, not the whole state
      const new_state = {
        ...state,
        timelines: json.timelines,
      };

      setState(new_state);
    };
    fileReader.readAsText(file);
    //set to multiple timelines
    setState((prevState) => ({
      ...prevState,
      show_multiple_timelines: true,
      current_timeline: null,
    }));
  };

  //load state add will add the timelines to the current timelines
  const loadStateAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      if (!e.target) return;
      const result = e.target.result;
      if (typeof result !== 'string') return;
      const json = JSON.parse(result);

      //this is the timelines, not the whole state

      //check if a timeline with the same title already exists
      //and then show the user a message that the timeline already exists
      //and exit
      const timeline_titles = state.timelines.map((timeline) => timeline.title);

      const new_timelines = json.timelines.filter(
        (timeline: TimeLine) => !timeline_titles.includes(timeline.title)
      );

      if (new_timelines.length === 0) {
        alert('All timelines already exist');
        return;
      }

      const new_state = {
        ...state,
        timelines: [...state.timelines, ...json.timelines],
      };

      setState(new_state);
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
      {showSubmitTimelineModal && (
        <SubmitTimelineModal
          timelines={state.timelines}
          setShowSubmitTimelineModal={setShowSubmitTimelineModal}
        />
      )}
      {showFilePanel ? (
        <div className="flex flex-col items-center space-y-4 w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="flex justify-between items-center w-full mb-4">
            <h1 className="text-xl font-bold text-center w-full">
              Manage Timelines
            </h1>
            <FaArrowUp
              size={20}
              onClick={() => setShowFilePanel(false)}
              className="cursor-pointer dark:text-white"
            />
          </div>
          <div className="flex flex-row items-center space-y-4 w-full">
            <div className="flex flex-col items-center w-1/3">
              <label
                htmlFor="load-timeline"
                className="text-black dark:text-white pr-3 cursor-pointer mb-2"
              >
                Add Timelines:
              </label>
              <input
                id="load-timeline"
                type="file"
                onChange={loadStateAdd}
                className="hidden"
              />
              <label
                htmlFor="load-timeline"
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                Choose File
              </label>
            </div>
            <div className="flex flex-col items-center w-1/3">
              <label
                htmlFor="save-state"
                className="text-black dark:text-white pr-3 cursor-pointer"
              >
                Save State:
              </label>
              <button
                onClick={saveState}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save State File
              </button>
            </div>
            <div className="flex flex-col items-center w-1/3">
              <div className="flex flex-row items-center w-full">
                <label
                  htmlFor="load-state"
                  className="text-black dark:text-white pr-3 cursor-pointer mb-2"
                >
                  Load State:
                </label>
                <input
                  id="load-state"
                  type="file"
                  onChange={loadState}
                  className="hidden"
                />
                <label
                  htmlFor="load-state"
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-600"
                >
                  Choose File
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <h1 className="text-xl font-bold text-center mb-2">
            Manage Timelines
          </h1>
          <p className="text-center mb-4">
            Open the panel to access options for uploading or downloading
            timeline states.
          </p>
          <FaArrowDown
            size={20}
            onClick={() => setShowFilePanel(true)}
            className="cursor-pointer dark:text-white"
          />
        </div>
      )}
      <div className="flex m-4 flex-col space-y-4 w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"></div>
      <div className="w-full items-center flex justify-around">
        <div className="w-1/2 items-center">
          <button
            onClick={() => {
              setShowSubmitTimelineModal(true);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save Timeline
          </button>
        </div>
        <div className="w-1/2 items-center">
          {/* Search Modal */}
          {!showSearchModal ? (
            <div className="flex w-full flex-row justify-center items-center p-2">
              <button
                onClick={() => setShowSearchModal(true)}
                className="p-2 bg-blue-500 text-white rounded flex-col justify-center items-center"
                title="Search Published Timelines By Title and Description"
              >
                <div className="flex flex-row justify-center items-center">
                  Search Timelines
                  <FaSearch
                    className="cursor-pointer ml-2 dark:text-white"
                    size={20}
                  />
                </div>
              </button>
            </div>
          ) : null}
          <div className="w-full flex flex-row flex-wrap justify-center">
            <SearchModal
              open_modal={showSearchModal}
              close_modal={() => setShowSearchModal(false)}
              add_timeline={addTimelineWithTimeline}
            />
          </div>
        </div>
      </div>

      {
        //filter slider if filterYears is set to true
        filterYears ? (
          <div className="flex flex-col items-center w-full">
            <div
              onClick={() => {
                setFilterYears(false);
              }}
            >
              <button className="p-2 bg-blue-500 text-white rounded">
                Stop Filtering Years{' '}
              </button>
              <FaArrowUp
                size={20}
                className="cursor-pointer ml-2 dark:text-white"
              />
            </div>
            <h1 className="w-full text-center"> Filter Slider </h1>
            <div className="w-full">
              <YearSlider
                initialStartYear={sliderStartYear}
                initialEndYear={sliderEndYear}
                onYearChange={handleSliderYearChange}
              />
            </div>
          </div>
        ) : (
          <>
            <div
              onClick={() => setFilterYears(true)}
              className="flex flex-row items-center w-full justify-center mb-4"
            >
              <button className="p-2 bg-blue-500 text-white rounded">
                Filter Years
              </button>
              <FaArrowDown
                className="cursor-pointer ml-2 dark:text-white"
                size={20}
              />
            </div>
          </>
        )
      }

      {state.show_multiple_timelines ? (
        <div className="w-full flex flex-col items-center">
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
            <div className="w-full flex flex-col">
              <div className="flex flex-row justify-around w-full">
                <div className="flex flex-row">
                  <h1 className="text-md font-bold mb-4">
                    Exit Timeline / Go Back To All{' '}
                  </h1>
                  <FaTimes
                    onClick={() =>
                      setState((prevState) => ({
                        ...prevState,
                        show_multiple_timelines: true,
                        current_timeline: null,
                      }))
                    }
                    className="cursor-pointer ml-2 dark:text-white"
                    size={20}
                  />
                </div>
                <div className="flex flex-row">
                  <h1 className="text-center text-2xl font-bold mb-4">
                    {state.current_timeline ? state.current_timeline.title : ''}
                  </h1>
                  {/* Put the edit functionality here instead */}
                  <FaPen
                    onClick={() => {
                      setEditingTimeline(state.current_timeline);
                      setEditedTimelineTitle(
                        state.current_timeline
                          ? state.current_timeline.title
                          : ''
                      );
                      setEditedTimelineDescription(
                        state.current_timeline
                          ? state.current_timeline.description
                          : ''
                      );
                    }}
                    className="cursor-pointer ml-2 dark:text-white"
                    size={20}
                    title="Alter Timeline Title and Description"
                  />
                </div>
                {/*Write the Add Event Button Here instead*/}
                <div className="mb-4 dark:text-black flex flex-row rounded bg-green-500">
                  <button
                    title="Add Event To Timeline"
                    onClick={() => setAddingEvent(true)}
                    className="p-2 text-black rounded font-bold text-2xl "
                  >
                    Add Event
                  </button>
                  <FaPlus
                    className="cursor-pointer ml-2 dark:text-white"
                    size={20}
                    onClick={() => setAddingEvent(true)}
                    title="Add Event To Timeline"
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                {
                  //description
                  state.current_timeline
                    ? state.current_timeline.description
                    : ''
                }
              </div>
            </div>
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
          ></div>

          {state.current_timeline && (
            <div className="w-full">
              {addingEvent ? (
                <div className="mb-8 w-full dark:text-black flex flex-col items-center space-y-4">
                  <div className="flex flex-row">
                    <h2 className="text-md font-bold mb-2">Adding New Event</h2>
                    <FaTimes
                      onClick={() => setAddingEvent(false)}
                      className="cursor-pointer ml-2 dark:text-white"
                      size={30}
                      title="Quit Adding Event"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Event Title"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="p-2 border rounded w-64"
                    ref={titleEventInputRef}
                    //add listener when focused -> "enter" focuses the description
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        descriptionEventInputRef.current?.focus();
                      }
                    }}
                  />
                  <textarea
                    //type="text"
                    placeholder="Event Description"
                    value={newEventDescription}
                    onChange={(e) => setNewEventDescription(e.target.value)}
                    className="p-2 border rounded w-64"
                    ref={descriptionEventInputRef}
                    //add listener when focused -> "enter" focuses the year
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        yearEventInputRef.current?.focus();
                      }
                    }}
                  >
                    {' '}
                  </textarea>
                  <input
                    type="number"
                    placeholder="Event Year"
                    value={newEventYear}
                    onChange={(e) => setNewEventYear(Number(e.target.value))}
                    className="p-2 border rounded w-64"
                    ref={yearEventInputRef}
                    //add listener -> event "enter" adds the event
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addEventToTimeline(
                          state.timelines.indexOf(state.current_timeline!)
                        );
                      }
                    }}
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
                <div className="mb-4 dark:text-black"></div>
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

//submit timeline modal takes in the Timlelines
//and submits them as InsertionTimeLines
//with a name and description
const SubmitTimelineModal: React.FC<{
  timelines: TimeLine[];
  setShowSubmitTimelineModal: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ timelines, setShowSubmitTimelineModal }) => {
  const [submittedTimelineName, setSubmittedTimelineName] = useState('');
  const [submittedTimelineDescription, setSubmittedTimelineDescription] =
    useState('');

  const saveTimeline = useSaveTimelineMutation();

  const submitTimeline = async () => {
    //convert timelines to TimelineAPI
    const timelines_for_api = timelines.map((timeline) => ({
      title: timeline.title,
      description: timeline.description,
      events: timeline.events,
    }));

    //make a InsertionTimeLine
    const insertionTimeline: InsertionTimeLine = {
      title: submittedTimelineName,
      description: submittedTimelineDescription,
      timelines: timelines_for_api,
    };

    console.log('insertionTimeline: ', insertionTimeline);

    //make a new timeline
    const submit = await saveTimeline.mutateAsync(insertionTimeline);

    return submit;
  };

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-40"
      onClick={() => setShowSubmitTimelineModal(false)}
    >
      <div
        className="bg-white dark:bg-gray-800 w-full max-w-lg p-6 rounded-lg shadow-lg z-50"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h1 className="text-2xl font-bold mb-4">Submit Timeline</h1>
        <input
          type="text"
          value={submittedTimelineName}
          onChange={(e) => setSubmittedTimelineName(e.target.value)}
          placeholder="Timeline Name"
          className="w-full p-2 mb-4 border rounded"
        />
        <textarea
          value={submittedTimelineDescription}
          onChange={(e) => setSubmittedTimelineDescription(e.target.value)}
          placeholder="Timeline Description"
          className="w-full p-2 mb-4 border rounded h-32 resize-none"
        ></textarea>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setShowSubmitTimelineModal(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={submitTimeline}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

type SearchModalProps = {
  add_timeline: (timeline: TimeLine) => void;
  close_modal: () => void;
  open_modal: boolean;
};

const SearchModal: React.FC<SearchModalProps> = ({
  add_timeline,
  close_modal,
  open_modal,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] =
    useState<string>(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const {
    data: timelines,
    isLoading,
    isError,
    error,
  } = useSearchPublishedTimelines(debouncedSearchTerm);

  if (!open_modal) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={close_modal}
    >
      <div
        className="bg-white dark:bg-gray-800 w-full max-w-lg p-6 rounded-lg shadow-lg z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-2xl font-bold mb-4">Search Timelines</h1>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for timelines"
          className="p-2 border rounded w-full mb-4"
        />
        {isLoading && <p>Loading...</p>}
        {isError && <p>Error: {error.message}</p>}
        <ul>
          {timelines?.map((timeline) => (
            <li
              key={timeline.id}
              onClick={() =>
                add_timeline({
                  title: timeline.title,
                  description: timeline.description,
                  events: timeline.events,
                  shown: true,
                })
              }
              className="cursor-pointer p-2 border-b hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {timeline.title}
              <p>{timeline.description}</p>
              {/* Number of Events Here */}
              <p> Number of Events: {timeline.events.length} </p>
            </li>
          ))}
        </ul>
        <button
          onClick={close_modal}
          className="mt-4 p-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};
