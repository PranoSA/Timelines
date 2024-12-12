import { FaArrowDown, FaArrowUp } from 'react-icons/fa';

import React, { useState } from 'react';

type FileManagerComponentProps = {
  loadState: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  loadStateAdd: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  saveState: () => void;
};

const FileManageComponent: React.FC<FileManagerComponentProps> = ({
  loadState,
  loadStateAdd,
  saveState,
}) => {
  const [showFilePanel, setShowFilePanel] = useState(false);

  return (
    <>
      {showFilePanel ? (
        <div className="flex flex-col items-center space-y-4 w-full p-4 bg-white dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center w-full mb-4">
            <h1 className="text-xl font-bold text-center w-full">
              Manage Timelines
            </h1>
            <FaArrowUp
              size={20}
              onClick={() => setShowFilePanel(false)}
              className="cursor-pointer dark:text-white"
            />
          </div>
          <div className="flex flex-row items-center space-y-4 w-full">
            <div className="flex flex-col items-center w-1/3">
              <label
                htmlFor="load-timeline"
                className="text-black dark:text-white pr-3 cursor-pointer mb-2"
              >
                Add Timelines:
              </label>
              <input
                id="load-timeline"
                type="file"
                onChange={loadStateAdd}
                className="hidden"
              />
              <label
                htmlFor="load-timeline"
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                Choose File
              </label>
            </div>
            <div className="flex flex-col items-center w-1/3">
              <label
                htmlFor="save-state"
                className="text-black dark:text-white pr-3 cursor-pointer"
              >
                Save State:
              </label>
              <button
                onClick={saveState}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save State File
              </button>
            </div>
            <div className="flex flex-col items-center w-1/3">
              <div className="flex flex-row items-center w-full">
                <label
                  htmlFor="load-state"
                  className="text-black dark:text-white pr-3 cursor-pointer mb-2"
                >
                  Load State:
                </label>
                <input
                  id="load-state"
                  type="file"
                  onChange={loadState}
                  className="hidden"
                />
                <label
                  htmlFor="load-state"
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-600"
                >
                  Choose File
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <h1 className="text-xl font-bold text-center mb-2">
            Manage Timelines
          </h1>
          <p className="text-center mb-4">
            Open the panel to access options for uploading or downloading
            timeline states.
          </p>
          <FaArrowDown
            size={20}
            onClick={() => setShowFilePanel(true)}
            className="cursor-pointer dark:text-white"
          />
        </div>
      )}
    </>
  );
};

export default FileManageComponent;
