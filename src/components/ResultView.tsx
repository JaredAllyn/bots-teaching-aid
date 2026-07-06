'use client';

import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ResultViewProps {
  markdown: string;
  subject: string;
  topic: string;
  onStartOver: () => void;
}

function safeFileNamePart(value: string): string {
  return value.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'plan';
}

export default function ResultView({ markdown, subject, topic, onStartOver }: ResultViewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  async function handleDownload() {
    if (!contentRef.current) return;
    setDownloading(true);
    setDownloadError('');
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);

      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(
        `BotsTeachingAid_${safeFileNamePart(subject)}_${safeFileNamePart(topic)}.pdf`
      );
    } catch {
      setDownloadError('We could not create the PDF. You can still read the plan below.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onStartOver}
          className="order-2 text-sm text-blue-500 underline underline-offset-2 hover:text-blue-600 sm:order-1"
        >
          ← Start Over / Create Another
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="order-1 rounded-md bg-blue-500 px-5 py-2.5 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 sm:order-2"
        >
          {downloading ? 'Preparing PDF…' : 'Download as PDF'}
        </button>
      </div>

      {downloadError && <p className="text-sm text-red-600">{downloadError}</p>}

      <div
        ref={contentRef}
        className="prose prose-slate max-w-none rounded-md border border-gray-200 bg-white p-5 prose-headings:font-semibold prose-h1:text-xl prose-h2:text-lg prose-a:text-blue-500 sm:p-8"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}
