type TimeLine = {
  title: string;
  description: string;
  events: TimeEvent[];
  shown: boolean;
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

export type { TimeLine, TimeEvent, ApplicationState };
