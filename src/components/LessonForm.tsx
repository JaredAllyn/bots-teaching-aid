'use client';

import { useRef, useState } from 'react';
import { MAX_TEXT_LENGTH, MAX_IMAGES, MAX_IMAGE_SIZE_MB } from '@/lib/constants';
import { PLAN_TYPE_OPTIONS, SUBJECT_OPTIONS, STANDARD_OPTIONS } from '@/types';
import type { ReferenceImage } from '@/types';

interface LessonFormProps {
  onGenerated: (markdown: string, subject: string, topic: string) => void;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200';

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export default function LessonForm({ onGenerated }: LessonFormProps) {
  const [planType, setPlanType] = useState<string>(PLAN_TYPE_OPTIONS[0]);
  const [subject, setSubject] = useState('');
  const [otherSubject, setOtherSubject] = useState('');
  const [standard, setStandard] = useState('');
  const [topic, setTopic] = useState('');
  const [resources, setResources] = useState('');
  const [referenceText, setReferenceText] = useState('');
  const [images, setImages] = useState<ReferenceImage[]>([]);
  const [imageError, setImageError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setImageError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > MAX_IMAGES) {
      setImageError(`Please select at most ${MAX_IMAGES} image(s).`);
      e.target.value = '';
      return;
    }

    try {
      const newImages: ReferenceImage[] = [];
      for (const file of Array.from(files)) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          setImageError('Only JPG and PNG images are allowed.');
          e.target.value = '';
          return;
        }
        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
          setImageError(`Each image must be smaller than ${MAX_IMAGE_SIZE_MB}MB.`);
          e.target.value = '';
          return;
        }
        const base64 = await readFileAsBase64(file);
        newImages.push({ base64, mediaType: file.type, name: file.name });
      }
      setImages(newImages);
    } catch {
      setImageError('We could not read that image. Please try a different file.');
    }
  }

  function removeImages() {
    setImages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function validate(): string | null {
    if (!planType) return 'Please choose a plan type.';
    if (!subject) return 'Please choose a subject.';
    if (subject === 'Other' && !otherSubject.trim()) return 'Please tell us the subject name.';
    if (!standard) return 'Please choose a standard/grade.';
    if (!topic.trim()) return 'Please enter a topic.';
    if (topic.length > MAX_TEXT_LENGTH) return `Topic is too long (max ${MAX_TEXT_LENGTH} characters).`;
    if (!resources.trim()) return 'Please list the resources you have available.';
    if (resources.length > MAX_TEXT_LENGTH)
      return `Resources is too long (max ${MAX_TEXT_LENGTH} characters).`;
    if (referenceText.length > MAX_TEXT_LENGTH)
      return `Reference text is too long (max ${MAX_TEXT_LENGTH} characters).`;
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType,
          subject,
          otherSubject: subject === 'Other' ? otherSubject : undefined,
          standard,
          topic,
          resources,
          referenceText,
          images,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      const subjectLabel = subject === 'Other' ? otherSubject : subject;
      onGenerated(data.result, subjectLabel, topic);
    } catch {
      setError('We could not reach the server. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12">
      <div>
        <label className={labelClass} htmlFor="planType">
          Plan type
        </label>
        <select
          id="planType"
          className={inputClass}
          value={planType}
          onChange={(e) => setPlanType(e.target.value)}
          required
        >
          {PLAN_TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="subject">
          Subject
        </label>
        <select
          id="subject"
          className={inputClass}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        >
          <option value="" disabled>
            Select a subject…
          </option>
          {SUBJECT_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {subject === 'Other' && (
          <input
            type="text"
            className={`${inputClass} mt-2`}
            placeholder="Enter the subject name"
            value={otherSubject}
            onChange={(e) => setOtherSubject(e.target.value)}
            maxLength={MAX_TEXT_LENGTH}
            required
          />
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="standard">
          Standard / Grade
        </label>
        <select
          id="standard"
          className={inputClass}
          value={standard}
          onChange={(e) => setStandard(e.target.value)}
          required
        >
          <option value="" disabled>
            Select a standard…
          </option>
          {STANDARD_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="topic">
          Topic
        </label>
        <input
          id="topic"
          type="text"
          className={inputClass}
          placeholder="e.g. Photosynthesis, Counting in Setswana"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          maxLength={MAX_TEXT_LENGTH}
          required
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="resources">
          Resources available
        </label>
        <textarea
          id="resources"
          className={`${inputClass} min-h-[100px]`}
          placeholder="e.g. chalkboard, no textbooks, 40 students, some bottle caps"
          value={resources}
          onChange={(e) => setResources(e.target.value)}
          maxLength={MAX_TEXT_LENGTH}
          required
        />
        <p className="mt-1 text-xs text-gray-400">
          {resources.length}/{MAX_TEXT_LENGTH}
        </p>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Reference material <span className="text-gray-400 font-normal">(optional)</span>
        </p>

        <div className="mb-4">
          <label className={labelClass} htmlFor="referenceText">
            Paste reference text or notes
          </label>
          <textarea
            id="referenceText"
            className={`${inputClass} min-h-[80px]`}
            placeholder="Paste a syllabus excerpt, notes, or anything else you'd like Claude to use"
            value={referenceText}
            onChange={(e) => setReferenceText(e.target.value)}
            maxLength={MAX_TEXT_LENGTH}
          />
          <p className="mt-1 text-xs text-gray-400">
            {referenceText.length}/{MAX_TEXT_LENGTH}
          </p>
        </div>

        <div>
          <label className={labelClass} htmlFor="referenceImage">
            Upload a reference image (JPG or PNG, up to {MAX_IMAGES})
          </label>
          <input
            id="referenceImage"
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-600 hover:file:bg-blue-100"
          />
          {imageError && <p className="mt-1 text-sm text-red-600">{imageError}</p>}
          {images.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="text-xs text-gray-500">
                {images.map((img) => img.name).join(', ')}
              </p>
              <button
                type="button"
                onClick={removeImages}
                className="text-xs text-blue-500 underline underline-offset-2 hover:text-blue-600"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto rounded-md bg-blue-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Generating…' : 'Generate lesson plan'}
      </button>
    </form>
  );
}
