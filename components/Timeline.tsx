/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useMemo, useState, useCallback } from 'react';
import { TimeLine, TimeEvent } from '../types';
import { FaCheckCircle, FaRegCircle } from 'react-icons/fa';

type Props = {
  timelines: TimeLine[];
  onSelectEvent: (event: TimeEvent) => void;
  showMultipleTimelines: boolean;
  onSelectTimeline?: (timeline: TimeLine) => void;
  startYear?: number | '';
  endYear?: number | '';
  onYearRangeChange?: (startYear: number, endYear: number) => void;
};

const colors = [
  'bg-green-500',
  'bg-blue-500',
  'bg-yellow-500',
  'bg-purple-500',
];

const text_colors = [
  'text-green-500',
  'text-blue-500',
  'text-yellow-500',
  'text-purple-500',
];

const TimelineComponent: React.FC<Props> = ({
  timelines,
  onSelectEvent,
  showMultipleTimelines,
  onSelectTimeline,
  startYear,
  endYear,
  onYearRangeChange,
}) => {
  const allEvents = showMultipleTimelines
    ? timelines.flatMap((timeline, timelineIndex) =>
        timeline.events.map((event) => ({ ...event, timelineIndex }))
      )
    : timelines[0].events.map((event) => ({ ...event, timelineIndex: 0 }));

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
        : filtered_timelines[0].events.map((event) => ({
            ...event,
            timelineIndex: 0,
          })),
    [filtered_timelines, showMultipleTimelines]
  );

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
          if (current_level_search <= 0) {
            current_level_search = Math.abs(current_level_search) + 1;
          } else {
            current_level_search = -current_level_search;
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
        <div className="flex flex-col space-y-2 mt-4">
          {timelines.map((timeline, index) => (
            <div
              key={index}
              className={`cursor-pointer p-4 rounded border ${
                timeline.shown ? 'border-blue-500' : 'border-gray-300'
              }`}
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
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative mb-4">
        <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-300 dark:bg-gray-700"></div>
        <div className="events relative w-full"></div>
      </div>
      <div className="relative mt-[150px]">
        <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-300 dark:bg-gray-700"></div>
        <div className="events relative w-full">
          {allEventsInRange.map((event, eventIndex) => {
            const leftPosition =
              ((event.year - start_year) / (end_year - start_year)) * 100;

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
                onClick={() => onSelectEvent(event)}
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
                      colors[event.timelineIndex % colors.length]
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
                    colors[event.timelineIndex % colors.length]
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
          height: `${height_offset}px`,
        }}
      >
        {' '}
      </div>
    </div>
  );
};

export default TimelineComponent;
