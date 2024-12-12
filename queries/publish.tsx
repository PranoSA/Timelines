import { useMutation, useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import queryClient from './queryClient';

import {
  TimeLine,
  FetchedTimeLine,
  InsertionTimeLine,
  PublishedTimelineEntered,
  PublishedTimelineFetched,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getTokens = () => {
  //local Storage .accessToken
  const accessToken = localStorage.getItem('accessToken');

  return accessToken;
};

//publish (POST REQUEST) a timeline, ENTERED
async function publishTimeline(timeline: PublishedTimelineEntered) {
  const response = await fetch(`${API_URL}/timelines/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokens()}`,
    },
    body: JSON.stringify(timeline),
  });

  if (!response.ok) {
    throw new Error('Error publishing timeline');
  }

  return response.json();
}

//mutation
const usePublishTimelineMutation = () => {
  return useMutation<unknown, Error, PublishedTimelineEntered>({
    mutationFn: publishTimeline,
    onSuccess: () => {
      //queryClient.invalidateQueries('timelines');
    },
  });
};

//search for publish timelines -> uses a "term" query parameter
async function searchPublishedTimelines(term: string) {
  if (term === '') {
    return [];
  }

  const response = await fetch(`${API_URL}/search?term=${term}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokens()}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error searching published timelines');
  }

  return response.json();
}
//query
export const useSearchPublishedTimelines = (
  term: string
): UseQueryResult<PublishedTimelineFetched[], Error> => {
  return useQuery({
    queryKey: ['timelines', 'published', term],
    queryFn: () => searchPublishedTimelines(term),
  });
};

//get a single published timeline
export { usePublishTimelineMutation };
