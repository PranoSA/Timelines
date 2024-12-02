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

  const dragging = useRef<'start' | 'end' | null>(null);

  // print when initialStartYear and initialEndYear changes
  useEffect(() => {
    console.log('sliderStartYear: ', sliderStartYear);
    console.log('sliderEndYear: ', sliderEndYear);
  }, [sliderStartYear, sliderEndYear]);

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
      console.log('handleMouseMove');
      console.log('e.clientX: ', e.clientX);
      console.log('e.clientY: ', e.clientY);
      console.log('dragging: ', dragging);
      if (!dragging) return;

      console.log('dragging: ', dragging);

      const slider = document.getElementById('year-slider');
      if (!slider) return;

      const sliderRect = slider.getBoundingClientRect();
      const newYear = Math.round(
        initialStartYear +
          ((initialEndYear - initialStartYear) *
            (e.clientX - sliderRect.left)) /
            sliderRect.width
      );

      console.log('newYear: ', newYear);

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
    console.log('handleMouseUp');
    setDragging(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(
    (type: 'start' | 'end') => {
      console.log('handleMouseDown');
      console.log('type: ', type);
      setDragging(type);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [handleMouseMove, handleMouseUp]
  );

  const s =
    (sliderStartYear - initialStartYear) / (initialEndYear - initialStartYear);

  console.log('s: ', s);

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
    </div>
  );
};

export default YearSlider;
