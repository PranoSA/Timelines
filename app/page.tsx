/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import Head from 'next/head';
import TimelineManager from '../components/TimelineManager';

import {
  SessionProvider,
  SessionProviderProps,
  signIn,
  signOut,
  useSession,
} from 'next-auth/react';

import { QueryClientProvider } from '@tanstack/react-query';

import queryClient from '@/queries/queryClient';
import { useEffect } from 'react';

const HomeWithSessionProvider = () => {
  const sessionProviderProps: SessionProviderProps = {
    children: <HomeWithQueryClientProvider />,
  };
  return <SessionProvider {...sessionProviderProps} />;
};

const HomeWithQueryClientProvider = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  );
};

function Home() {
  const session = useSession();
  console.log('session', session);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* Option To Sign In */}
      <div className="flex justify-end p-4">
        <SignInButton />
      </div>
      <Head>
        <title>Timeline App</title>
        <meta name="description" content="A timeline management app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="p-8">
        <TimelineManager />
      </main>
    </div>
  );
}

const SignInButton = () => {
  const session = useSession();

  console.log('session', session);

  //on session change, store accessToken in local storage
  useEffect(() => {
    if (session.data?.accessToken) {
      localStorage.setItem('accessToken', session.data.accessToken);
    }
  }, [session]);

  if (session.data?.accessToken) {
    return <button onClick={() => signOut()}>Sign Out</button>;
  }
  return <button onClick={() => signIn()}>Sign In</button>;
};

export default HomeWithSessionProvider;
