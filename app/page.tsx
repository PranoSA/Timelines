/**
 *
 * WIll Show you a list of your saved timelines and allow you to open them
 *
 * /open/[id] will allow you to open a specific timeline
 *
 */
'use client';

import { useSavedTimelines } from '@/queries/saved';

import { FetchedTimeLine } from '@/types';

import queryClient from '@/queries/queryClient';

import { QueryClientProvider } from '@tanstack/react-query';

import { FaPlus } from 'react-icons/fa';

import {
  SessionProvider,
  SessionProviderProps,
  signIn,
  signOut,
  useSession,
} from 'next-auth/react';
import React, { useEffect } from 'react';

import Link from 'next/link';

const HomeWIthQueryClientProvider: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  );
};

const HomeWithSessionProvider = () => {
  const sessionProviderProps: SessionProviderProps = {
    children: <HomeWIthQueryClientProvider />,
    //retry every 5 seconds
  };
  return <SessionProvider {...sessionProviderProps} />;
};

const Home: React.FC = () => {
  const { data: session, status } = useSession();

  const {
    data: savedTimelines,
    isLoading,
    isError,
    error,
  } = useSavedTimelines();

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

  if (!session) {
    //return a signing button or return to "Home" option
    return (
      <div className="w-full h-full flex justify-center items-center">
        <div className="w-1/2 justify-center items-center flex flex-col">
          <button onClick={() => signIn()}>Sign In</button>
        </div>
        <div className="w-1/2 justify-center items-center flex flex-col">
          <Link href="/">
            <button>Home</button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-center mb-8">
        <Link href="/new">
          <button className="flex flex-wrap px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Add Timeline
            <FaPlus className="ml-2" />
          </button>
        </Link>
      </div>
      <h1 className="text-4xl font-bold mb-8 text-center">Home</h1>
      {savedTimelines && savedTimelines.length > 0 ? (
        savedTimelines.map((timeline: FetchedTimeLine) => (
          <div
            key={timeline.id}
            className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm"
          >
            <Link href={`/open/${timeline.id}`}>
              <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                {timeline.title}
              </h2>
            </Link>
            <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">
              {timeline.description}
            </p>
          </div>
        ))
      ) : (
        <p className="text-center text-lg text-gray-700 dark:text-gray-300">
          No Timelines
        </p>
      )}
    </div>
  );
};

export default HomeWithSessionProvider;
