import { useState } from 'react';

import { TimeLine, InsertionTimeLine } from '@/types';

import { useSaveTimelineMutation } from '@/queries/saved';

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

    //make a new timeline
    const submit = await saveTimeline.mutateAsync(insertionTimeline);

    return submit;
  };

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-40"
      onClick={() => setShowSubmitTimelineModal(false)}
    >
      <div
        className="bg-white dark:bg-gray-800 w-full max-w-lg p-6 rounded-lg shadow-lg z-50"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h1 className="text-2xl font-bold mb-4">Submit Timeline</h1>
        <input
          type="text"
          value={submittedTimelineName}
          onChange={(e) => setSubmittedTimelineName(e.target.value)}
          placeholder="Timeline Name"
          className="w-full p-2 mb-4 border rounded"
        />
        <textarea
          value={submittedTimelineDescription}
          onChange={(e) => setSubmittedTimelineDescription(e.target.value)}
          placeholder="Timeline Description"
          className="w-full p-2 mb-4 border rounded h-32 resize-none"
        ></textarea>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setShowSubmitTimelineModal(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={submitTimeline}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitTimelineModal;
