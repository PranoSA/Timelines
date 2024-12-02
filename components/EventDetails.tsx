import React from 'react';
import { TimeEvent } from '../types';

type Props = {
  event: TimeEvent | null;
};

const EventDetails: React.FC<Props> = ({ event }) => {
  if (!event) return null;

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold">{event.title}</h2>
      <p className="text-gray-700 dark:text-gray-300">{event.description}</p>
    </div>
  );
};

export default EventDetails;
