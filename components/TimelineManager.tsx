/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo, useEffect, useRef, useContext } from 'react';
import {
  ApplicationState,
  TimeLine,
  TimeEvent,
  InsertionTimeLine,
  FetchedTimeLine,
  ApplicationStateEditing,
} from '../types';
import TimelineComponent from './Timeline';
import YearSlider from './YearSlider';

import TimelineContext from '@/TimelineContext';

import { FaPen, FaPlus, FaTimes, FaSearch } from 'react-icons/fa';

import {
  useEditTimelineMutation,
  useSaveTimelineMutation,
} from '../queries/saved';

import YearFilterComponent from '@/components/YearFilter';
import SearchModal from '@/components/SearchModal';
import SubmitTimelineModal from '@/components/SubmitTimelineModal';
import SpreadSheetComponent from '@/components/SpreadSheetComponent';
import FileManageComponent from './FileManage';

//dorn arro wfrom Fa
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { init } from 'next/dist/compiled/webpack/webpack';

type TimelineManagerProps = {
  //saved
  //initial timeline only applies if saved
  initialTimeline: null | FetchedTimeLine;
  //if initial Timeline is null -> then its a new timeline
  //if its not null -> then its a saved timeline, which means there is
  //initial state, there is publishability, and there is a timeline id
  editable?: boolean;
};

const TimelineManager: React.FC<TimelineManagerProps> = ({
  initialTimeline,
  editable = true,
}) => {
  //everytime the editing timeline changes -> set current events
  const [currentEvents, setCurrentEvents] = useState<TimeEvent[]>([]);
  const { id } = useContext(TimelineContext);

  const [state, setState] = useState<ApplicationStateEditing>({
    zoomed_in: false,
    show_multiple_timelines: true, // Start in multiple timeline mode
    current_timeline: null,
    start_year_zoomed: 0,
    end_year_zoomed: 0,
    timelines:
      initialTimeline?.timelines.map((timeline) => ({
        //add the shown property
        ...timeline,
        shown: true,
      })) || [],
    title: initialTimeline?.title || '',
    description: initialTimeline?.description || '',
    user_id: initialTimeline?.user_id || '',
  });

  const [showSubmitTimelineModal, setShowSubmitTimelineModal] = useState(false);

  const editTimeline = useEditTimelineMutation();

  const submitTimeline = async () => {
    //make a InsertionTimeLine
    const insertionTimeline: FetchedTimeLine = {
      id: id,
      user_id: state.user_id || '',
      title: state.title || '',
      description: state.description || '',
      timelines: state.timelines,
    };
    //make a new timeline
    const submit = await editTimeline.mutateAsync(insertionTimeline);

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

  useEffect(() => {
    if (editingTimeline) {
      setCurrentEvents(editingTimeline.events);
    }
  }, [editingTimeline]);

  //every time state.current_timeline changes -> set current events
  useEffect(() => {
    if (state.current_timeline) {
      setCurrentEvents(state.current_timeline.events);
    }
  }, [state.current_timeline]);

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

    if (index === -1) return;

    const newTimelines = [...state.timelines];

    newTimelines[index] = timeline;

    setState((prevState) => ({
      ...prevState,
      timelines: newTimelines,
    }));
  };

  const onEditTimeline = (timeline: TimeLine) => {
    //find the index of the timeline
    const index = state.timelines.indexOf(timeline);

    //if the index is not found, return
    if (index === -1) return;

    //update the timeline
    const newTimelines = [...state.timelines];

    newTimelines[index] = timeline;

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
      <FileManageComponent
        loadState={loadState}
        loadStateAdd={loadStateAdd}
        saveState={saveState}
      />
      <div className="flex m-4 flex-col space-y-4 w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"></div>
      <div className="w-full items-center flex justify-around">
        <div className="w-1/3 items-center">
          <button
            onClick={() => {
              if (!editable) return;

              //if the timeline is new (initialTimeline is null), then setShowSubmitTimelineModal(true);
              //else submit the timeline
              if (initialTimeline === null) {
                setShowSubmitTimelineModal(true);
              } else {
                submitTimeline();
              }
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {initialTimeline ? 'Edit' : 'Save'} Timeline To User Profile
          </button>
        </div>
        <div className="flex w-1/3 items-center justify-center">
          {
            //if multipleTimelines then
            state.show_multiple_timelines && (
              <button
                onClick={() => setAddingTimeline(true)}
                className="p-2 bg-green-500 text-white rounded"
              >
                Add Timeline
              </button>
            )
          }
        </div>
        <div className="w-1/3 items-center">
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

      <YearFilterComponent
        handleSliderYearChange={handleSliderYearChange}
        sliderStartYear={sliderStartYear}
        sliderEndYear={sliderEndYear}
      />

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
            <div className="mb-4 dark:text-black"></div>
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
            publishable={initialTimeline ? true : false}
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
              {/* Insert Spreadsheets Here  from react-spreadsheet*/}
              <SpreadSheetComponent
                currentEvents={currentEvents}
                setCurrentEvents={setCurrentEvents}
              />

              {/* Button To Add Event */}
              <FaPlus
                onClick={() => {
                  //add empty eve
                  setCurrentEvents((prevEvents) => [
                    ...prevEvents,
                    {
                      title: '',
                      description: '',
                      year: 0,
                    },
                  ]);
                }}
                className="cursor-pointer ml-2 dark:text-white"
                size={20}
                title="Add Event To Timeline"
              />
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
                publishable={initialTimeline ? true : false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimelineManager;
