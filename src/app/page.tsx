'use client';

import { useState } from 'react';
import LessonForm from '@/components/LessonForm';
import ResultView from '@/components/ResultView';

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
        <div className="mx-auto max-w-2xl px-4 py-4">
          <h1 className="text-xl font-semibold">Bots Teaching Aid</h1>
          <p className="text-sm text-gray-500">
            Quick lesson plans for Botswana primary school teachers
          </p>
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
