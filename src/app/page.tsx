'use client';

import { useState } from 'react';
import LessonForm from '@/components/LessonForm';
import ResultView from '@/components/ResultView';
import { ChalkboardIcon, AppleIcon, CrayonsIcon } from '@/components/SchoolIcons';

interface GeneratedResult {
  markdown: string;
  subject: string;
  topic: string;
}

export default function Home() {
  const [result, setResult] = useState<GeneratedResult | null>(null);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200">
        <div className="mx-auto max-w-2xl px-4 pt-6 text-center">
          <div className="mb-1 flex items-center justify-center gap-5">
            <ChalkboardIcon className="h-8 w-8" />
            <AppleIcon className="h-9 w-9" />
            <CrayonsIcon className="h-8 w-8" />
          </div>
          <h1 className="font-hand text-4xl leading-tight text-gray-900 sm:text-5xl">
            Bots Teaching Aid
          </h1>
          <p className="text-sm text-gray-500">
            Quick lesson plans for Botswana primary school teachers
          </p>
        </div>
        <div className="mt-3 w-full text-accent" aria-hidden="true">
          <svg viewBox="0 0 1440 24" preserveAspectRatio="none" className="h-4 w-full">
            <path
              d="M0,12 C120,0 240,24 360,12 C480,0 600,24 720,12 C840,0 960,24 1080,12 C1200,0 1320,24 1440,12"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {result ? (
          <ResultView
            markdown={result.markdown}
            subject={result.subject}
            topic={result.topic}
            onStartOver={() => setResult(null)}
          />
        ) : (
          <LessonForm
            onGenerated={(markdown, subject, topic) => setResult({ markdown, subject, topic })}
          />
        )}
      </div>
    </main>
  );
}
