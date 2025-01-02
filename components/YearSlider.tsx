/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useCallback, useRef, useEffect } from 'react';

type Props = {
  initialStartYear: number;
  initialEndYear: number;
  onYearChange: (startYear: number, endYear: number) => void;
};

const YearSlider: React.FC<Props> = ({
  initialStartYear,
  initialEndYear,
  onYearChange,
}) => {
  const [sliderStartYear, setSliderStartYear] = useState(initialStartYear);
  const [sliderEndYear, setSliderEndYear] = useState(initialEndYear);

  const lastInitialStartYear = useRef<number | null>(null);
  const lastInitialEndYear = useRef<number | null>(null);

  //only on initial mount, should lastInitialStartYear and lastInitialEndYear be set to initialStartYear and initialEndYear
  useEffect(() => {
    lastInitialStartYear.current = initialStartYear;
    lastInitialEndYear.current = initialEndYear;
  }, [initialEndYear, initialStartYear]);

  //check when initialStartYear and initialEndYear changes
  //if sliderStartYear was equal to initialStartYear before the change, update sliderStartYear
  //then update lastInitialStartYear and lastInitialEndYear
  useEffect(() => {
    //just set
    setSliderStartYear(initialStartYear);
    setSliderEndYear(initialEndYear);
  }, [initialStartYear, initialEndYear]);

  const dragging = useRef<'start' | 'end' | null>(null);

  const expandToEntireRange = () => {
    setSliderStartYear(initialStartYear);
    setSliderEndYear(initialEndYear);
    onYearChange(initialStartYear, initialEndYear);
  };

  //print out initialStartYear and initialEndYear
  useEffect(() => {
    //if initialStartYear changes in a way that makes the current slider not part of the range,
    //update the slider to be part of the range
    let newSliderStartYear = sliderStartYear;
    let newSliderEndYear = sliderEndYear;

    if (initialStartYear > sliderStartYear) {
      newSliderStartYear = initialStartYear;
    }

    //if initialEndYear changes in a way that makes the current slider not part of the range,
    //update the slider to be part of the range
    if (initialEndYear < sliderEndYear) {
      newSliderEndYear = initialEndYear;
    }

    //check if start year is greater than end year
    if (newSliderStartYear > newSliderEndYear) {
      newSliderStartYear = newSliderEndYear - 1;
    }

    //update the slider
    setSliderStartYear(newSliderStartYear);
    setSliderEndYear(newSliderEndYear);

    //sanity check -> if the start year i
  }, [initialStartYear, initialEndYear, sliderStartYear, sliderEndYear]);
  //const [dragging, setDragging] = useState<'start' | 'end' | null>(null);
  const setDragging = (type: 'start' | 'end' | null) => {
    dragging.current = type;
  };

  //if initialStartYear changes in a way that makes the current slider not part of the range,
  //update the slider to be part of the range
  if (initialStartYear > sliderStartYear) {
    setSliderStartYear(initialStartYear);
  }

  //if initialEndYear changes in a way that makes the current slider not part of the range,
  //update the slider to be part of the range
  if (initialEndYear < sliderEndYear) {
    setSliderEndYear(initialEndYear);
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging) return;

      const slider = document.getElementById('year-slider');
      if (!slider) return;

      const sliderRect = slider.getBoundingClientRect();
      const newYear = Math.round(
        initialStartYear +
          ((initialEndYear - initialStartYear) *
            (e.clientX - sliderRect.left)) /
            sliderRect.width
      );

      if (dragging.current === 'start' && newYear < sliderEndYear) {
        setSliderStartYear(newYear);
        onYearChange(newYear, sliderEndYear);
      } else if (dragging.current === 'end' && newYear > sliderStartYear) {
        setSliderEndYear(newYear);
        onYearChange(sliderStartYear, newYear);
      }
    },
    [
      initialStartYear,
      initialEndYear,
      sliderEndYear,
      sliderStartYear,
      onYearChange,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(
    (type: 'start' | 'end') => {
      setDragging(type);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [handleMouseMove, handleMouseUp]
  );

  return (
    <div id="year-slider" className="relative mb-8 p-4">
      <div className="absolute left-0 top-1/2 w-full h-2 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div
        className="absolute top-1/2 h-2 bg-blue-200 dark:bg-blue-800 rounded"
        style={{
          left: `${
            ((sliderStartYear - initialStartYear) /
              (initialEndYear - initialStartYear)) *
            100
          }%`,
          width: `${
            ((sliderEndYear - sliderStartYear) /
              (initialEndYear - initialStartYear)) *
            100
          }%`,
        }}
      ></div>
      <div className="events relative w-full">
        <div
          className="absolute top-1/2 h-6 w-6 bg-blue-500 rounded-full cursor-pointer transform -translate-y--1/2"
          style={{
            left: `${
              ((sliderStartYear - initialStartYear) /
                (initialEndYear - initialStartYear)) *
              100
            }%`,
          }}
          onMouseDown={() => handleMouseDown('start')}
        >
          <div className="absolute bottom-full mb-2 w-12 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
            {sliderStartYear}
          </div>
        </div>
        <div
          className="absolute top-1/2 h-6 w-6 bg-blue-500 rounded-full cursor-pointer transform -translate-y--1/2"
          style={{
            left: `${
              ((sliderEndYear - initialStartYear) /
                (initialEndYear - initialStartYear)) *
              100
            }%`,
          }}
          onMouseDown={() => handleMouseDown('end')}
        >
          <div className="absolute bottom-full mb-2 w-12 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
            {sliderEndYear}
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-8">
        <span className="text-lg font-semibold">{initialStartYear}</span>
        <span className="text-lg font-semibold">{initialEndYear}</span>
      </div>
      <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={expandToEntireRange}
      >
        Expand to full range
      </button>
    </div>
  );
};

export default YearSlider;
