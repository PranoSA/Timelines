import React, { useState, useRef, useEffect } from 'react';
import { FaPen } from 'react-icons/fa';
import { TimeEvent } from '@/types';

type Props = {
  event: TimeEvent | null;
  editEvent: (updatedEvent: TimeEvent) => void;
};

const EventDetails: React.FC<Props> = ({ event, editEvent }) => {
  if (!event) return null;

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md relative">
      <div className="flex items-center mb-4">
        <>
          <h2 className="text-xl font-bold">{event.year}</h2>
        </>
      </div>

      <div className="flex items-center mb-4">
        <>
          <h2 className="text-xl font-bold">{event.title}</h2>
        </>
      </div>

      <div className="flex items-center mb-4">
        <>
          <p className="text-gray-700 dark:text-gray-300 ">
            {event.description || 'No description available.'}
          </p>
        </>
      </div>
    </div>
  );
};

export default EventDetails;
