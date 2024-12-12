import YearSlider from '@/components//YearSlider';

import { useState } from 'react';

type YearFilterComponentProps = {
  //function to handle the change of the slider
  handleSliderYearChange: (startYear: number, endYear: number) => void;
  //state to set the start year of the slider
  sliderStartYear: number;
  //state to set the end year of the slider
  sliderEndYear: number;
  //state to set the filterYears
};

const YearFilterComponent: React.FC<YearFilterComponentProps> = ({
  handleSliderYearChange,

  sliderStartYear,
  sliderEndYear,
}) => {
  const [filterYears, setFilterYears] = useState(false);
  return (
    <>
      {
        //filter slider if filterYears is set to true
        filterYears ? (
          <div className="flex flex-col items-center w-full">
            <div
              onClick={() => {
                setFilterYears(false);
              }}
            >
              <button className="p-2 bg-blue-500 text-white rounded mt-8 mb-2">
                Stop Filtering Years{' '}
              </button>
            </div>
            <h1 className="w-full text-center"> Filter Slider </h1>
            <div className="w-full">
              <YearSlider
                initialStartYear={sliderStartYear}
                initialEndYear={sliderEndYear}
                onYearChange={handleSliderYearChange}
              />
            </div>
          </div>
        ) : (
          <>
            <div
              onClick={() => setFilterYears(true)}
              className="flex flex-row items-center w-full justify-center m-8"
            >
              <button className="p-2 bg-blue-500 text-white rounded">
                Filter Years
              </button>
            </div>
          </>
        )
      }
    </>
  );
};

export default YearFilterComponent;
