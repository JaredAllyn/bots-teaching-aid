export const PLAN_TYPE_OPTIONS = ['Full lesson plan', 'Single activity'] as const;
export type PlanType = (typeof PLAN_TYPE_OPTIONS)[number];

export const SUBJECT_OPTIONS = [
  'Agriculture',
  'CAPA',
  'English',
  'History',
  'Mathematics',
  'Other',
] as const;
export type Subject = (typeof SUBJECT_OPTIONS)[number];

export const STANDARD_OPTIONS = [
  'Standard 1',
  'Standard 2',
  'Standard 3',
  'Standard 4',
  'Standard 5',
  'Standard 6',
  'Standard 7',
] as const;

export interface ReferenceImage {
  base64: string;
  mediaType: string;
  name: string;
}

export interface GenerateRequestBody {
  planType: string;
  subject: string;
  otherSubject?: string;
  standard: string;
  topic: string;
  resources: string;
  referenceText?: string;
  images?: ReferenceImage[];
}
