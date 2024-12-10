type TimeLine = {
  title: string;
  description: string;
  events: TimeEvent[];
  shown: boolean;
};

/*
type SavedTimelineFetched = {
  id: string;
  title: string;
  description: string;
  user_id: string;
  created_at?: Date;
  updated_at: Date;
  timelines: Timeline[];
};

type SavedTimelineEntered = {
  title: string;
  description: string;
  timelines: Timeline[];
};
*/

//Insertion TimeLine is the same except without "shown"
type InsertionTimeLine = {
  title: string;
  description: string;
  timelines: TimelineAPI[];
};

//Fetched Timeline is same, but with "id" a
type FetchedTimeLine = {
  id: string;
  title: string;
  description: string;
  user_id: string;
  created_at?: Date;
  updated_at?: Date;
  timelines: TimelineAPI[];
};

type PublishedTimelineFetched = {
  id: string;
  title: string;
  description: string;
  publisher: string;
  events: TimeEvent[];
};

type PublishedTimelineEntered = {
  title: string;
  description: string;
  events: TimeEvent[];
};

type TimeEvent = {
  year: number;
  title: string;
  description: string;
};

type ApplicationState = {
  zoomed_in: boolean;
  show_multiple_timelines: boolean;
  current_timeline: TimeLine | null; //this will be used if "show_multiple_timelines" is false and will be what you are currently editing and adding events to
  start_year_zoomed: number;
  end_year_zoomed: number;
  timelines: TimeLine[];
};

type ApplicationStateEditing = {
  zoomed_in: boolean;
  show_multiple_timelines: boolean;
  current_timeline: TimeLine | null;
  start_year_zoomed: number;
  end_year_zoomed: number;
  title: string;
  description: string;
  timelines: TimeLine[];
  user_id: string;
};

type TimelineAPI = {
  //has no "shown" property
  title: string;
  description: string;
  events: TimeEvent[];
};

export type {
  TimeLine,
  TimeEvent,
  ApplicationState,
  FetchedTimeLine,
  InsertionTimeLine,
  TimelineAPI,
  ApplicationStateEditing,
  PublishedTimelineEntered,
  PublishedTimelineFetched,
};
