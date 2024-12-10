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
    <div>
      <h1>Home</h1>
      {savedTimelines?.map((timeline: FetchedTimeLine) => {
        return (
          <div key={timeline.id}>
            <Link href={`/open/${timeline.id}`}>
              <h2>{timeline.title}</h2>
            </Link>
            <p>{timeline.description}</p>
          </div>
        );
      })}
    </div>
  );
};

export default HomeWithSessionProvider;
