import Spreadsheet from 'react-spreadsheet';

import { TimeEvent } from '@/types';

import { FaTrash } from 'react-icons/fa';

import {
  ReactGrid,
  Column,
  Row,
  CellChange,
  CellLocation,
  TextCell,
  NumberCell,
} from '@silevis/reactgrid';
import '@silevis/reactgrid/styles.css';

import React from 'react';

type SpreadSheetComponentProps = {
  currentEvents: TimeEvent[];
  setCurrentEvents: React.Dispatch<React.SetStateAction<TimeEvent[]>>;
};

const SpreadsheetComponent: React.FC<SpreadSheetComponentProps> = ({
  currentEvents,
  setCurrentEvents,
}) => {
  return (
    <div className="relative flex w-full flex-row flex-wrap">
      {/* 4/5 for the spreadsheet */}
      <SpreadSheetComponent
        currentEvents={currentEvents}
        setCurrentEvents={setCurrentEvents}
      />

      {/* 1/5 for deletion */}
      <div className="w-1/5 mt-4">
        {currentEvents.map((_, rowIndex) => (
          <div
            key={rowIndex}
            className=" cursor-pointer"
            style={{
              marginTop: `10px`,
            }} // Adjust the position based on row height
            onClick={() => {
              //delete the event index
              const newEvents = currentEvents.filter(
                (_, index) => index !== rowIndex
              );

              setCurrentEvents(newEvents);
            }}
          >
            <FaTrash className="text-red-500" />
          </div>
        ))}
      </div>
    </div>
  );
};

type SpreadSheetProps = {
  currentEvents: TimeEvent[];
  setCurrentEvents: React.Dispatch<React.SetStateAction<TimeEvent[]>>;
};

const SpreadSheetComponent: React.FC<SpreadSheetProps> = ({
  currentEvents,
  setCurrentEvents,
}) => {
  const columns: Column[] = [
    { columnId: 'title', width: 200 },
    { columnId: 'description', width: 600 },
    { columnId: 'year', width: 100 },
  ];

  const headerRow: Row = {
    rowId: 'header',
    cells: [
      { type: 'header', text: 'Title' },
      { type: 'header', text: 'Description' },
      { type: 'header', text: 'Year' },
    ],
  };

  const getRows = (events: TimeEvent[]): Row[] => [
    headerRow,
    ...events.map<Row>((event, idx) => ({
      rowId: idx,
      cells: [
        { type: 'text', text: event.title },
        { type: 'text', text: event.description },
        { type: 'text', text: event.year.toString() },
      ],
    })),
  ];

  const applyChangesToEvents = (
    changes: CellChange<TextCell>[],
    prevEvents: TimeEvent[]
  ): TimeEvent[] => {
    changes.forEach((change) => {
      const eventIndex = change.rowId as number;
      const fieldName = change.columnId;
      const newValue = change.newCell.text;

      if (fieldName === 'title') {
        prevEvents[eventIndex].title = newValue;
      } else if (fieldName === 'description') {
        prevEvents[eventIndex].description = newValue;
      } else if (fieldName === 'year') {
        prevEvents[eventIndex].year = parseInt(newValue, 10);
      }
    });
    return [...prevEvents];
  };
  /*
      const handleChanges = (changes: CellChange<TextCell>[]) => { 
      setPeople((prevPeople) => applyChangesToPeople(changes, prevPeople)); 
    }; 
    */
  const handleChanges = (changes: CellChange[]) => {
    const textCellChanges = changes.filter(
      (change): change is CellChange<TextCell> => change.type === 'text'
    );
    setCurrentEvents((prevEvents) =>
      applyChangesToEvents(textCellChanges, prevEvents)
    );
  };

  const rows = getRows(currentEvents);

  //how do I reflect changes in the spreadsheet?
  return (
    <div className="flex flex-row overflow-auto w-4/5">
      <ReactGrid
        rows={rows}
        columns={columns}
        onCellsChanged={handleChanges}
        //allow deleting rows
        enableRowSelection
      />
    </div>
  );
};

export default SpreadsheetComponent;
