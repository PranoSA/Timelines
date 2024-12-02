'use client';

import Head from 'next/head';
import TimelineManager from '../components/TimelineManager';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
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
