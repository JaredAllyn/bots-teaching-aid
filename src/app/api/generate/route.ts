import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  MAX_TEXT_LENGTH,
  MAX_IMAGES,
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
  CLAUDE_MODEL,
  CLAUDE_MAX_TOKENS,
  MIN_LENGTH_MINUTES,
  MAX_LENGTH_MINUTES,
} from '@/lib/constants';
import { isDailyLimitReached, recordRequest } from '@/lib/rateLimiter';
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompt';
import type { GenerateRequestBody } from '@/types';

export const runtime = 'nodejs';

type ImageContentBlock = {
  type: 'image';
  source: { type: 'base64'; media_type: 'image/jpeg' | 'image/png'; data: string };
};
type TextContentBlock = { type: 'text'; text: string };

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  if (isDailyLimitReached()) {
    return jsonError(
      "We've reached today's limit for generating lesson plans — please try again tomorrow.",
      429
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return jsonError(
      'The server is not configured correctly (missing API key). Please contact the site administrator.',
      500
    );
  }

  let body: GenerateRequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonError('We could not read your request. Please try again.', 400);
  }

  const {
    planType,
    subject,
    otherSubject,
    standard,
    lengthMinutes,
    topic,
    resources,
    referenceText,
    images,
  } = body;

  if (!planType || (planType !== 'Full lesson plan' && planType !== 'Single activity')) {
    return jsonError('Please choose a valid plan type.', 400);
  }
  if (
    lengthMinutes === undefined ||
    lengthMinutes === null ||
    !Number.isInteger(lengthMinutes) ||
    lengthMinutes < MIN_LENGTH_MINUTES ||
    lengthMinutes > MAX_LENGTH_MINUTES
  ) {
    return jsonError(
      `Length must be a whole number between ${MIN_LENGTH_MINUTES} and ${MAX_LENGTH_MINUTES} minutes.`,
      400
    );
  }
  if (!subject || !subject.trim()) {
    return jsonError('Please choose a subject.', 400);
  }
  if (subject === 'Other' && (!otherSubject || !otherSubject.trim())) {
    return jsonError('Please tell us the subject name.', 400);
  }
  if (!standard || !standard.trim()) {
    return jsonError('Please choose a standard/grade.', 400);
  }
  if (!topic || !topic.trim()) {
    return jsonError('Please enter a topic.', 400);
  }
  if (!resources || !resources.trim()) {
    return jsonError('Please list the resources you have available.', 400);
  }

  const textFieldsToCheck: [string, string | undefined][] = [
    ['Topic', topic],
    ['Resources', resources],
    ['Subject', otherSubject],
    ['Reference text', referenceText],
  ];
  for (const [label, value] of textFieldsToCheck) {
    if (value && value.length > MAX_TEXT_LENGTH) {
      return jsonError(
        `${label} is too long. Please keep it under ${MAX_TEXT_LENGTH} characters.`,
        400
      );
    }
  }

  if (images && images.length > 0) {
    if (images.length > MAX_IMAGES) {
      return jsonError(`Please upload at most ${MAX_IMAGES} image(s).`, 400);
    }
    for (const img of images) {
      if (!img.base64 || !img.mediaType) {
        return jsonError(
          'One of the uploaded images is invalid. Please try uploading it again.',
          400
        );
      }
      if (!ALLOWED_IMAGE_TYPES.includes(img.mediaType as (typeof ALLOWED_IMAGE_TYPES)[number])) {
        return jsonError('Images must be JPG or PNG files.', 400);
      }
      const approxBytes = (img.base64.length * 3) / 4;
      if (approxBytes > MAX_IMAGE_SIZE_BYTES) {
        return jsonError('Each image must be smaller than 5MB.', 400);
      }
    }
  }

  const userPromptText = buildUserPrompt(body);

  const content: (ImageContentBlock | TextContentBlock)[] = [];
  if (images && images.length > 0) {
    for (const img of images) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: img.mediaType === 'image/png' ? 'image/png' : 'image/jpeg',
          data: img.base64,
        },
      });
    }
  }
  content.push({ type: 'text', text: userPromptText });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: CLAUDE_MAX_TOKENS,
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content }],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    const result = textBlock && 'text' in textBlock ? textBlock.text : '';

    if (!result) {
      return jsonError('We could not generate a lesson plan this time. Please try again.', 502);
    }

    recordRequest();

    return NextResponse.json({ result });
  } catch (err: unknown) {
    console.error('Anthropic API error:', err);
    const status = (err as { status?: number })?.status;
    if (status === 429) {
      return jsonError(
        'Our lesson plan generator is busy right now. Please wait a moment and try again.',
        429
      );
    }
    if (status === 401) {
      return jsonError(
        'The server is not configured correctly (invalid API key). Please contact the site administrator.',
        500
      );
    }
    return jsonError(
      'Something went wrong while generating your lesson plan. Please try again.',
      502
    );
  }
}
