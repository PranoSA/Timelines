/*
Here We Need another TimelineView component but 
you can not edit any of the timelines -
however, you can copy it to your saved timelines
*/
/**
 *
 * This will be an open timeline
 * That is initialized by fetching the timeline from the server
 * with the path parameter ID
 *
 * It will have a different save function - it will instead "edit" the timeline
 *
 */

'use client';
import { useEffect, useState } from 'react';

import TimelineContext from '@/TimelineContext';
import { useContext } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import queryClient from '@/queries/queryClient';
import { useSavedTimelines, useSavedTimelineById } from '@/queries/saved';
import TimelineManager from '@/components/shared_timeline/TimelineManager';

//SessionProvider
import {
  SessionProvider,
  SessionProviderProps,
  signIn,
  signOut,
  useSession,
} from 'next-auth/react';

type TripProviderProps = {
  children: React.ReactNode;
  id: string;
};

const SavedTimelineProvider = ({ children, id }: TripProviderProps) => {
  return (
    <TimelineContext.Provider
      value={{
        id,
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
};

const PageWithProvider: React.FC<{ params: { id: string } }> = ({
  params: { id },
}) => {
  return (
    <SavedTimelineProvider id={id}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <Page />
        </SessionProvider>
      </QueryClientProvider>
    </SavedTimelineProvider>
  );
};

const Page = () => {
  const { id } = useContext(TimelineContext);

  const { data: session, status } = useSession();

  const {
    data: savedTimeline,
    isLoading,
    isError,
    error,
  } = useSavedTimelineById(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    console.log('session', session);
    //set local storage bearer token
    if (typeof window !== 'undefined' && session) {
      localStorage.setItem('accessToken', session?.accessToken as string);
      //set date_redeemed -> store unix timestamp
      const now_time = Date.now();
      const unix_time = Math.floor(now_time / 1000);

      localStorage.setItem('date_redeemed', unix_time.toString());
    }
  }, [session]);

  if (!session?.accessToken) {
    return (
      <div>
        <button onClick={() => signIn()}>Sign In</button>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  if (!savedTimeline) {
    return <div>Timeline not found</div>;
  }

  return (
    <div className="flex flex-row flex-wrap w-full m-4 mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md justify-center items-center">
      <h1 className="text-3xl font-bold mb-4 w-full justify-center items-center text-center">
        Timeline Details
      </h1>
      <div className="mb-6 w-full">
        <p className="text-2xl text-gray-700 dark:text-gray-300 text-center">
          {savedTimeline?.title}
        </p>
      </div>
      <div className="mb-6 w-full">
        <p className="text-lg text-gray-700 dark:text-gray-300 text-center">
          {savedTimeline?.description}
        </p>
      </div>
      <TimelineManager initialTimeline={savedTimeline} />
    </div>
  );
};

export default PageWithProvider;
