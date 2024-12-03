import React, { useState, useRef, useEffect } from 'react';
import { FaPen } from 'react-icons/fa';
import { TimeEvent } from '../types';

type Props = {
  event: TimeEvent | null;
  editEvent: (updatedEvent: TimeEvent) => void;
};

const EventDetails: React.FC<Props> = ({ event, editEvent }) => {
  const [editingEvent, setEditingEvent] = useState<boolean>(false);
  const [editedField, setEditedField] = useState<
    'title' | 'description' | 'year' | null
  >(null);

  const [editedEventTitle, setEditedEventTitle] = useState<string>(
    event?.title || ''
  );
  const [editedEventDescription, setEditedEventDescription] = useState<string>(
    event?.description || ''
  );
  const [editedEventYear, setEditedEventYear] = useState<number>(
    event?.year || 0
  );

  const inputTitleRef = useRef<HTMLInputElement>(null);
  const inputDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const inputYearRef = useRef<HTMLInputElement>(null);

  //if editedEvent changes, remove focus from all inputs
  //and set all the fields to "" and set not editing to true and year to 0
  useEffect(() => {
    if (!editingEvent) {
      setEditedEventTitle(event?.title || '');
      setEditedEventDescription(event?.description || '');
      setEditedEventYear(event?.year || 0);
    }
  }, [editingEvent, event?.description, event?.title, event?.year]);

  useEffect(() => {
    if (editingEvent && editedField) {
      if (editedField === 'title') {
        inputTitleRef.current?.focus();
      } else if (editedField === 'description') {
        inputDescriptionRef.current?.focus();
      } else if (editedField === 'year') {
        inputYearRef.current?.focus();
      }
    }
  }, [editingEvent, editedField]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEvent();
    }
  };

  const saveEvent = () => {
    if (!event) return;

    const updatedEvent = {
      ...event,
      title: editedEventTitle,
      description: editedEventDescription,
      year: editedEventYear,
    };

    console.log(updatedEvent);

    editEvent(updatedEvent);
    setEditingEvent(false);
    setEditedField(null);
  };

  if (!event) return null;

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md relative">
      <div className="flex items-center mb-4">
        {editingEvent && editedField === 'year' ? (
          <input
            ref={inputYearRef}
            type="number"
            value={editedEventYear}
            onChange={(e) => setEditedEventYear(Number(e.target.value))}
            onKeyDown={handleKeyDown}
            className="p-2 border rounded w-full"
          />
        ) : (
          <>
            <FaPen
              className="mr-2 cursor-pointer"
              onClick={() => {
                setEditingEvent(true);
                setEditedField('year');
              }}
              size={20}
            />
            <h2 className="text-xl font-bold">{event.year}</h2>
          </>
        )}
      </div>

      <div className="flex items-center mb-4">
        {editingEvent && editedField === 'title' ? (
          <input
            ref={inputTitleRef}
            type="text"
            value={editedEventTitle}
            onChange={(e) => setEditedEventTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="p-2 border rounded w-full"
          />
        ) : (
          <>
            <FaPen
              className="mr-2 cursor-pointer"
              onClick={() => {
                setEditingEvent(true);
                setEditedField('title');
              }}
              size={20}
            />
            <h2 className="text-xl font-bold">{event.title}</h2>
          </>
        )}
      </div>

      <div className="flex items-center mb-4">
        {editingEvent && editedField === 'description' ? (
          <textarea
            ref={inputDescriptionRef}
            value={editedEventDescription}
            onChange={(e) => setEditedEventDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            className="p-2 border rounded w-full h-32 resize-none"
          />
        ) : (
          <>
            <FaPen
              className="mr-2 cursor-pointer"
              onClick={() => {
                setEditingEvent(true);
                setEditedField('description');
              }}
              size={20}
            />
            <p className="text-gray-700 dark:text-gray-300 ">
              {event.description || 'No description available.'}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
