/*

TimelineContext really only has an id field,
of type string
*/

import React from 'react';

type TimelineContextType = {
  id: string;
};

const TimelineContextData: TimelineContextType = {
  id: '1',
};

const TimelineContext = React.createContext(TimelineContextData);

export default TimelineContext;
