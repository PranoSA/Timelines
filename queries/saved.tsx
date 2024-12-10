/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 *
 *
 * This Can Get Saved Timelines
 * Delete a Saved Timeline
 * Edit a Saved Timeline
 * Or create a new timeline
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import queryClient from './queryClient';

import { TimeLine, FetchedTimeLine, InsertionTimeLine } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getTokens = () => {
  //local Storage .accessToken
  const accessToken = localStorage.getItem('accessToken');

  return accessToken;
};

async function getSavedTimelines() {
  const response = await fetch(`${API_URL}/timelines/saved`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokens()}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error getting saved timelines');
  }

  const saved_timelines = (await response.json()) as FetchedTimeLine[];

  //defensive programming here -> check all the timelines to make sure they have the correct structure
  saved_timelines.forEach((timeline) => {
    if (!timeline.timelines) {
      throw new Error('Saved timeline does not have timelines');
    }
    if (!timeline.title) {
      throw new Error('Saved timeline does not have a title');
    }
    if (!timeline.description) {
      throw new Error('Saved timeline does not have a description');
    }

    //check each event
    timeline.timelines.forEach((timeline) => {
      if (!timeline.title) {
        throw new Error('Event does not have a title');
      }
      if (!timeline.description && !(timeline.description === '')) {
        throw new Error('Event does not have a description');
      }
      //check for each TimeEvent, the year, title, and description
      timeline.events.forEach((event) => {
        if (!event.year) {
          throw new Error('Event does not have a year');
        }
        if (!event.title) {
          throw new Error('Event does not have a title');
        }
        if (!event.description && !(event.description === '')) {
          throw new Error('Event does not have a description');
        }
      });
    });
  });
  return saved_timelines;

  //return response.json();
}

//next is the useQuery for the saved timelines
export const useSavedTimelines = (): UseQueryResult<
  FetchedTimeLine[],
  Error
> => {
  return useQuery({
    queryKey: ['timeline', 'saved'],
    queryFn: getSavedTimelines,
  });
};

//edit time line takes in TimeLineFetched

const editTimeLine = async (timeline: FetchedTimeLine) => {
  const response = await fetch(`${API_URL}/timelines/saved/${timeline.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokens()}`,
    },
    body: JSON.stringify(timeline),
  });

  if (!response.ok) {
    throw new Error('Error editing timeline');
  }

  return response.json();
};

//use Mutation
export const useEditTimelineMutation = () => {
  return useMutation({
    mutationFn: editTimeLine,
    onSuccess: () => {},
  });
};

//create mutation
const saveTimelines = async (timeline: InsertionTimeLine) => {
  const response = await fetch(`${API_URL}/timelines/saved`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokens()}`,
    },
    body: JSON.stringify(timeline),
  });

  if (!response.ok) {
    throw new Error('Error saving timeline');
  }

  const saved_timeline = (await response.json()) as TimeLine;

  return saved_timeline;
};

//now the mutation
export const useSaveTimelineMutation = () => {
  return useMutation({
    mutationFn: saveTimelines,
    onSuccess: () => {
      // queryClient.invalidateQueries('timeline');
    },
  });
};

//get saved by id
const getSavedTimelineById = async (id: string) => {
  const response = await fetch(`${API_URL}/timelines/saved/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokens()}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error getting saved timeline');
  }

  const saved_timeline = (await response.json()) as FetchedTimeLine[];

  return saved_timeline[0];
};

//useQuery
export const useSavedTimelineById = (id: string) => {
  return useQuery({
    queryKey: ['timeline', 'saved', id],
    queryFn: () => getSavedTimelineById(id),
  });
};
