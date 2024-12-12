/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useContext,
} from 'react';
import React from 'react';

import {
  ApplicationState,
  TimeLine,
  TimeEvent,
  InsertionTimeLine,
  FetchedTimeLine,
  ApplicationStateEditing,
  PublishedTimelineEntered,
} from '@/types';
import TimelineComponent from './Timeline';
import EventDetails from './EventDetails';
import YearSlider from './YearSlider';
import { FaPen, FaPlus, FaTimes } from 'react-icons/fa';
import { cursorTo } from 'readline';
import { useSaveTimelineMutation } from '@/queries/saved';
import TimelineContext from '@/TimelineContext';
import { useEditTimelineMutation } from '@/queries/saved';

//publish
import { usePublishTimelineMutation } from '@/queries/publish';
import { useSearchPublishedTimelines } from '../../queries/publish';

import { FaTrash } from 'react-icons/fa';

//magnifying glass
import { FaSearch } from 'react-icons/fa';

import Spreadsheet from 'react-spreadsheet';

//takes in initial timeline now
type TimelineManagerProps = {
  initialTimeline: FetchedTimeLine;
};

const TimelineManager: React.FC<TimelineManagerProps> = ({
  initialTimeline,
}) => {
  const [state, setState] = useState<ApplicationStateEditing>({
    zoomed_in: false,
    show_multiple_timelines: true, // Start in multiple timeline mode
    current_timeline: null,
    start_year_zoomed: 0,
    end_year_zoomed: 0,
    timelines: initialTimeline.timelines.map((timeline) => ({
      //add the shown property
      ...timeline,
      shown: true,
    })),
    title: initialTimeline.title,
    description: initialTimeline.description,
    user_id: initialTimeline.user_id,
  });

  const { id } = useContext(TimelineContext);

  const [submittedTimelineName, setSubmittedTimelineName] = useState('');
  const [submittedTimelineDescription, setSubmittedTimelineDescription] =
    useState('');

  const [showSubmitTimelineModal, setShowSubmitTimelineModal] = useState(false);

  const saveTimeline = useSaveTimelineMutation();

  const editTimeline = useEditTimelineMutation();

  const [showSearchModal, setShowSearchModal] = useState(false);

  const submitTimeline = async () => {
    //make a InsertionTimeLine
    const insertionTimeline: FetchedTimeLine = {
      id: id,
      user_id: state.user_id,
      title: state.title,
      description: state.description,
      timelines: state.timelines,
    };

    console.log('insertionTimeline: ', insertionTimeline);

    //make a new timeline
    const submit = await editTimeline.mutateAsync(insertionTimeline);

    return submit;
  };

  const publishTimelineMutation = usePublishTimelineMutation();

  const publishTimeline = async (timeline: TimeLine) => {
    const timeline_to_publish: PublishedTimelineEntered = {
      title: timeline.title,
      description: timeline.description,
      events: timeline.events,
    };

    const published = await publishTimelineMutation.mutateAsync(
      timeline_to_publish
    );

    return published;
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

  //everytime the editing timeline changes -> set current events
  const [currentEvents, setCurrentEvents] = useState<TimeEvent[]>([]);

  useEffect(() => {
    if (editingTimeline) {
      console.log('editing timeline: ', editingTimeline);
      setCurrentEvents(editingTimeline.events);
    }
  }, [editingTimeline]);

  //every time state.current_timeline changes -> set current events
  useEffect(() => {
    if (state.current_timeline) {
      setCurrentEvents(state.current_timeline.events);
    }
  }, [state.current_timeline]);

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

  //set the year to maxEventYear and minEventYear if the filterYears is set to false
  useEffect(() => {
    if (!filterYears) {
      setStartYear(sliderStartYear);
      setEndYear(sliderEndYear);
    }
  }, [filterYears, sliderEndYear, sliderStartYear]);

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

  const addTimelineWithTimeline = (timeline: TimeLine) => {
    setState((prevState) => ({
      ...prevState,
      timelines: [...prevState.timelines, timeline],
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
    <div className="p-4 flex flex-row flex-wrap ">
      {/* Modal for searching published timelines */}
      {!showSearchModal ? (
        <div className="flex w-full flex-row justify-center items-center">
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

      {/* Optoin to both download and upload a saved state*/}
      {showSubmitTimelineModal && submitTimelineModal()}
      <div className="flex space-x-4 w-full justify-around p-4">
        <button
          onClick={saveState}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Save State File
        </button>
        {/* This one will be for adding timelines -> not just the state*/}
        <div className="relative">
          <label
            htmlFor="load-timeline"
            className="text-black pr-3 rounded cursor-pointer dark:text-white"
          >
            Add Timelines:
          </label>
          <input id="load-timeline" type="file" onChange={loadStateAdd} />
          <button
            onClick={() => {
              // setShowSubmitTimelineModal(true);
              submitTimeline();
            }}
            className="p-2 bg-green-500 text-white rounded"
          >
            Save Timeline
          </button>
        </div>
        {/* Save the current timeline */}
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
                <FaTimes
                  className="cursor-pointer ml-2 dark:text-white"
                  size={20}
                />
              </button>
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
            </div>
          </>
        )
      }

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
              <div className="relative flex w-full flex-row flex-wrap">
                {/* 4/5 for the spreadsheet */}
                <div className="flex flex-row overflow-auto w-4/5">
                  <Spreadsheet
                    className="w-full"
                    data={[
                      ...(currentEvents.map((event) => [
                        { value: event.title },
                        {
                          value:
                            event.description.length > 70
                              ? `${event.description.substring(0, 70)}...`
                              : event.description,
                        },
                        { value: event.year },
                      ]) || []),
                      //empty row
                    ]}
                    //set row names
                    columnLabels={['Title', 'Description', 'Year']}
                    //add ability to delete rows

                    //on commit -> change current events
                    onChange={(data) => {
                      console.log('data: ', data);
                      const newEvents = data.map((row) => ({
                        title: (row[0]?.value as string) ?? '',
                        description: (row[1]?.value as string) ?? '',
                        year: (row[2]?.value as number) || 0,
                      }));

                      //if any difference -> set the current events
                      //if no difference -> do nothing

                      //check if newEvents is the same as currentEvents
                      //if same - return
                      if (
                        newEvents.length === currentEvents.length &&
                        newEvents.every((event, index) => {
                          const currentEvent = currentEvents[index];
                          return (
                            event.title === currentEvent.title &&
                            event.description === currentEvent.description &&
                            event.year === currentEvent.year
                          );
                        })
                      ) {
                        return;
                      }

                      console.log('newEvents: ', newEvents);
                      setCurrentEvents(newEvents);
                    }}
                  />
                </div>

                {/* 1/5 for deletion */}
                <div className="w-1/5 mt-8">
                  {currentEvents.map((_, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="mt-4 mr-2 cursor-pointer"
                      style={{ top: `${rowIndex * 32}px` }} // Adjust the position based on row height
                      onClick={() => {
                        //delete the event index
                        const newEvents = currentEvents.filter(
                          (_, index) => index !== rowIndex
                        );

                        setCurrentEvents(newEvents);
                      }}
                    >
                      <FaTrash className="text-red-500" />
                    </div>
                  ))}
                </div>
              </div>

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
              <h1> Events </h1>

              {/* BUtton To Save Events to current timeline and then save the timeline*/}
              <button
                onClick={() => {
                  //set the current events to the current timeline
                  //check that year is a valid number if parsed to a number
                  const is_valid_year = currentEvents.every(
                    (event) => !isNaN(event.year)
                  );

                  if (!is_valid_year) {
                    alert('Year must be a number');
                    return;
                  }

                  onEditTimelineNew({
                    ...state.current_timeline!,
                    events: currentEvents,
                  });

                  //close the add event form
                  setAddingEvent(false);
                }}
                className="p-2 bg-green-500 text-white rounded"
              >
                Save Events
              </button>
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
              : (<div className="mb-4 dark:text-black"></div>)
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
    <div className="modal">
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
            className="cursor-pointer p-2 border-b hover:bg-gray-200"
          >
            {timeline.title}
          </li>
        ))}
      </ul>
      <button
        onClick={close_modal}
        className="mt-4 p-2 bg-red-500 text-white rounded"
      >
        Close
      </button>
    </div>
  );
};
