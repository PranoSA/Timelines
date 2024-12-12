import { useState, useEffect } from 'react';

import { useSearchPublishedTimelines } from '@/queries/publish';

import { TimeLine } from '@/types';

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
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={close_modal}
    >
      <div
        className="bg-white dark:bg-gray-800 w-full max-w-lg p-6 rounded-lg shadow-lg z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-2xl font-bold mb-4">Search Timelines</h1>
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
              className="cursor-pointer p-2 border-b hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {timeline.title}
              <p>{timeline.description}</p>
              {/* Number of Events Here */}
              <p> Number of Events: {timeline.events.length} </p>
            </li>
          ))}
        </ul>
        <button
          onClick={close_modal}
          className="mt-4 p-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SearchModal;
