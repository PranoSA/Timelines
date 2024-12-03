/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useMemo, useState, useCallback } from 'react';
import { TimeLine, TimeEvent } from '../types';
import { FaCheckCircle, FaRegCircle, FaTrash } from 'react-icons/fa';
import EventDetails from './EventDetails';

type Props = {
  timelines: TimeLine[];
  onSelectEvent: (event: TimeEvent) => void;
  showMultipleTimelines: boolean;
  onSelectTimeline?: (timeline: TimeLine) => void;
  startYear?: number | '';
  endYear?: number | '';
  onYearRangeChange?: (startYear: number, endYear: number) => void;
  onDeleteTimeline: (timeline: TimeLine) => void;
  onEditTimeline: (timeline: TimeLine) => void;
};

const colors = [
  'bg-green-500',
  'bg-blue-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-gray-500',
];

const text_colors = [
  'text-green-500',
  'text-blue-500',
  'text-yellow-500',
  'text-purple-500',
  'text-orange-500',
  'text-gray-500',
];

const TimelineComponent: React.FC<Props> = ({
  timelines,
  onSelectEvent,
  showMultipleTimelines,
  onSelectTimeline,
  startYear,
  endYear,
  onYearRangeChange,
  onDeleteTimeline,
  onEditTimeline,
}) => {
  const allEvents = showMultipleTimelines
    ? timelines.flatMap((timeline, timelineIndex) =>
        timeline.events.map((event) => ({ ...event, timelineIndex }))
      )
    : timelines[0].events.map((event) => ({ ...event, timelineIndex: 0 }));

  //by
  const [selectedEvent, setSelectedEvent] = useState<TimeEvent | null>(null);

  const selectEvent = useCallback(
    (event: TimeEvent) => {
      setSelectedEvent(event);
      onSelectEvent(event);
    },
    [onSelectEvent]
  );

  const start_year = useMemo(
    //if start year exists, return the max of the min of all events year and start year
    // if start year does not exist, return the min of all events year
    //its not startYear, its the min startYear of all events
    () =>
      startYear
        ? Math.max(Math.min(...allEvents.map((event) => event.year)), startYear)
        : Math.min(...allEvents.map((event) => event.year)),
    [allEvents, startYear]
  );
  const end_year = useMemo(
    //if end year exists, return the min of the max of all events year and end year
    // if end year does not exist, return the max of all events year
    //its not endYear, its the max endYear of all events
    () =>
      endYear
        ? Math.min(Math.max(...allEvents.map((event) => event.year)), endYear)
        : Math.max(...allEvents.map((event) => event.year)),
    [allEvents, endYear]
  );

  const [filtered_timelines, setFilteredTimelines] =
    useState<TimeLine[]>(timelines);

  const toggleFilterTimeline = (timeline: TimeLine) => {
    //if filtered_timelines includes this timeline, remove it
    //else add it
    if (filtered_timelines.includes(timeline)) {
      setFilteredTimelines(
        filtered_timelines.filter(
          (filtered_timeline) => filtered_timeline !== timeline
        )
      );
    } else {
      setFilteredTimelines([...filtered_timelines, timeline]);
    }
  };

  const all_filtered_events = useMemo(
    () =>
      showMultipleTimelines
        ? filtered_timelines.flatMap((timeline, timelineIndex) =>
            timeline.events.map((event) => ({ ...event, timelineIndex }))
          )
        : timelines[0].events.map((event) => ({ ...event, timelineIndex: 0 })),
    [filtered_timelines, showMultipleTimelines, timelines]
  );

  const editEvent = (updatedEvent: TimeEvent) => {
    //find the timeline that the event belongs to
    /* const timeline = timelines.find((timeline) =>
      timeline.events.includes(updatedEvent)
    );*/
    if (!selectedEvent) return;

    //get the timeline of the currently selected event
    const timeline = timelines.find((timeline) =>
      timeline.events.find((event) => {
        return (
          event.year === selectedEvent.year &&
          event.title === selectedEvent.title &&
          event.description === selectedEvent.description
        );
      })
    );

    console.log('selectedEvent: ', selectedEvent);

    console.log('timeline: ', timeline);

    if (!timeline) return;

    //find the index of the event
    const eventIndex = timeline.events.findIndex(
      (event) =>
        event.year === selectedEvent.year &&
        event.title === selectedEvent.title &&
        event.description === selectedEvent.description
    );

    console.log('updatedEvent: ', updatedEvent);

    console.log('eventIndex: ', eventIndex);

    //edit the event
    timeline.events[eventIndex] = updatedEvent;

    console.log('timeline.events[eventIndex]: ', timeline.events[eventIndex]);

    //edit the timeline
    onEditTimeline(timeline);

    //now edit selectedEvent
    setSelectedEvent(updatedEvent);
  };

  const getTimelineIndexOnEvent = (event: TimeEvent) => {
    return timelines.findIndex((timeline) => {
      //has event that has the same year, title, and description
      return timeline.events.find((timelineEvent) => {
        return (
          timelineEvent.year === event.year &&
          timelineEvent.title === event.title &&
          timelineEvent.description === event.description
        );
      });
    });
  };

  const [editingTimeline, setEditingTimeline] = useState<TimeLine | null>(null);
  const [editedTimelineTitle, setEditedTimelineTitle] = useState<string>('');
  const [editedTimelineDescription, setEditedTimelineDescription] =
    useState<string>('');
  const editTitleRef = React.useRef<HTMLInputElement>(null);
  const editDescriptionRef = React.useRef<HTMLTextAreaElement>(null);

  //console.log('start_year: ', start_year);
  //console.log('Slider Start Year Prop: ', startYear);
  //console.log('end_year: ', end_year);
  //console.log('Slider End Year Prop: ', endYear);

  //filter out events that are not within the range of the slider
  const allEventsInRange = useMemo(
    () =>
      all_filtered_events
        .filter((event) => event.year >= start_year && event.year <= end_year)
        .sort((a, b) => a.year - b.year),
    [all_filtered_events, start_year, end_year]
  );

  //console.log('allEventsInRange: ', allEventsInRange);

  //every time timelines changes, change filtered_timelines to include all timelines that weren't filtered out
  //this is to ensure that when timelines change, the new timelines are included
  //in the filtered timelines
  useMemo(() => {
    setFilteredTimelines(timelines);
  }, [timelines]);

  type TimelineRanges = {
    events: {
      year: number;
      title: string;
      description: string;
      timelineIndex: number;
    }[];
    start_year: number;
    end_year: number;
  };

  //split timelines if there is more than one event per 100px of width
  const timeline_ranges = useMemo(() => {
    const width_ofscreen =
      typeof window !== 'undefined' ? window.innerWidth : 0;

    const max_events = Math.floor(width_ofscreen / 150);

    //now split the "events" into ranges
    const ranges = [];

    let current_range: {
      year: number;
      title: string;
      description: string;
      timelineIndex: number;
    }[] = [];

    let current_range_start = start_year;

    let current_range_end = start_year;

    for (let i = 0; i < allEventsInRange.length; i++) {
      //collect events until there are max_events in the range
      current_range.push(allEventsInRange[i]);

      //edit timelineIndex based on the timeline of the event
      current_range[current_range.length - 1].timelineIndex =
        allEventsInRange[i].timelineIndex;

      //update the end year of the range
      current_range_end = allEventsInRange[i].year;

      //if there are max_events in the range or this is the last event
      //add the range to the ranges array
      if (
        current_range.length === max_events ||
        i === allEventsInRange.length - 1
      ) {
        ranges.push({
          events: current_range,
          start_year: current_range_start,
          end_year: current_range_end,
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

  const heightOfEvent = useMemo(() => {
    //for this -> we will try to make it so that years don't interfere

    //here is the functionality -> go back 5 spaces for an empty "slot"

    /*
      Go back 50px for an empty slot

    */
    //stores the last year seen at a level
    const last_seen_at_level: { [key: number]: number } = {};

    //determine how many slots would make up "50px"

    const allowed_distance_between_slots = ((end_year - start_year) / 100) * 10;
    //15% of the total range of years

    const levels_for_each_index_of_allEventsInRange = allEventsInRange.map(
      (event, eventIndex) => {
        let current_level_search = 0;

        //here is how to search ->
        //1 -> -1 -> 2 -> -2 -> 3 -> -3 -> 4 -> -4 -> 5 -> -5
        //or 0->-1->1->-2->2->-3->3->-4->4->-5->5

        //now search -> if key does not exist -> its fine
        //if last seen at level exists -> check if the distance is greater than allowed_distance_between_slots
        //then fill in the slot
        while (
          last_seen_at_level[current_level_search] &&
          last_seen_at_level[current_level_search] +
            allowed_distance_between_slots >
            event.year
        ) {
          //current_level_search++;
          //zig-zag current_level_search
          if (current_level_search < 0) {
            current_level_search = Math.abs(current_level_search);
          } else {
            current_level_search = -current_level_search - 1;
          }
          //current_level_search++;
        }
        //now place the event at the current level
        last_seen_at_level[current_level_search] = event.year;

        return current_level_search;
      }
    );

    //find the max level
    return levels_for_each_index_of_allEventsInRange;
  }, [allEventsInRange, start_year, end_year]);

  //console.log('heightOfEvent: ', heightOfEvent);

  const height_offset =
    Math.max(...heightOfEvent.map((n) => Math.abs(n))) * 50 + 100;

  const heightFromHeightOffset = (height_level: number) => {
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

  return (
    <div className="timeline-container w-full">
      <div className="mb-20">
        <h2 className="text-2xl font-bold dark:text-white">
          {showMultipleTimelines ? 'Timelines' : timelines[0].title}
        </h2>
        <div className="flex flex-row flex-wrap space-y-2 mt-4">
          {timelines.map((timeline, index) => (
            <div
              key={index}
              className={`cursor-pointer p-4 rounded border 
                  w-full
                  md:w-1/2
                  lg:w-1/3
                  xl:w-1/4
                ${timeline.shown ? 'border-blue-500' : 'border-gray-300'}`}
            >
              <div className="flex items-center space-x-2">
                {
                  //if filtered_timelines includes this timeline, show check circle, else show reg circle
                  filtered_timelines.includes(timeline) ? (
                    <FaCheckCircle
                      className="text-green-500"
                      onClick={() => toggleFilterTimeline(timeline)}
                    />
                  ) : (
                    <FaRegCircle
                      className="text-gray-500"
                      onClick={() => toggleFilterTimeline(timeline)}
                    />
                  )
                }
                <span
                  className={`${text_colors[index % text_colors.length]} ${
                    !showMultipleTimelines && timeline.shown
                      ? 'font-bold'
                      : 'font-normal'
                  }`}
                  onClick={() => onSelectTimeline && onSelectTimeline(timeline)}
                >
                  {timeline.title}
                </span>
                <FaTrash
                  className="text-red-500"
                  size={30}
                  onClick={() => onDeleteTimeline(timeline)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative mb-4">
        <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-300 dark:bg-gray-700"></div>
        <div className="events relative w-full"></div>
      </div>
      {/* Padding on top */}
      {timeline_ranges.map((timeline_range, index) => {
        const end_year = timeline_range.end_year;
        const start_year = timeline_range.start_year;

        return (
          <div key={index}>
            <>
              <div
                className="dark:border-gray-700"
                style={{
                  height: `${
                    //largest negative in heightOfEvent * 60
                    Math.max(...heightOfEvent.map((n) => Math.abs(n))) * 60 +
                    100
                  }px`,
                }}
              ></div>
              <div className="relative">
                <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-300 dark:bg-gray-700"></div>
                <div className="events relative w-full">
                  {timeline_range.events.map((event, eventIndex) => {
                    const leftPosition =
                      ((event.year - start_year) / (end_year - start_year)) *
                      100;

                    const isAbove = heightOfEvent[eventIndex] < 0;
                    // const verticalOffset = Math.floor(eventIndex / 2) * 30; // Adjust the offset as needed

                    const verticalOffset = heightFromHeightOffset(
                      heightOfEvent[eventIndex]
                    );
                    //Math.abs(heightOfEvent[eventIndex]) * 50;

                    //here is how to get verticalOffset ->
                    //there should be high variance for similar leftPosition

                    return (
                      <div
                        key={eventIndex}
                        className="event absolute cursor-pointer"
                        onClick={() => selectEvent(event)}
                        style={{
                          left: `${leftPosition}%`,
                        }}
                      >
                        <div
                          className={`absolute ${
                            isAbove ? 'bottom-full mb-2' : 'top-full mt-2'
                          } left-1/2 transform -translate-x-1/2`}
                          style={{
                            [isAbove ? 'bottom' : 'top']: `${verticalOffset}px`,
                          }}
                        >
                          <span
                            className={`event-year block text-center ${
                              colors[
                                getTimelineIndexOnEvent(event) % colors.length
                              ]
                            } text-white rounded px-2 py-1`}
                          >
                            {event.year}
                          </span>
                          <span className="event-title block text-center mt-1">
                            {event.title}
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 ${
                            colors[
                              getTimelineIndexOnEvent(event) % colors.length
                            ]
                          } rounded-full border-2 border-white dark:border-gray-900`}
                        ></div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div
                className=""
                style={{
                  height: `${height_offset + 50}px `,
                }}
              >
                {' '}
              </div>
              {/* If event that belongs to this timeline is within the range of the slider, show it */}

              {selectedEvent &&
                timeline_range.events.find(
                  (event) => event.year === selectedEvent.year
                ) && (
                  <>
                    <div
                      style={{
                        padding: '25px',
                      }}
                    >
                      <EventDetails
                        event={selectedEvent}
                        editEvent={editEvent}
                      />
                    </div>
                  </>
                )}
            </>
          </div>
        );
      })}
    </div>
  );
};

export default TimelineComponent;
