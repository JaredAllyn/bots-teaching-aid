// Maximum number of lesson plan generations allowed per day, across all users.
// This is the main cost safeguard since there is no login/API key per user.
export const MAX_DAILY_REQUESTS = 100;

// Maximum characters allowed in any free-text field.
export const MAX_TEXT_LENGTH = 2000;

// Reference image upload limits.
export const MAX_IMAGES = 2;
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'] as const;

export const CLAUDE_MODEL = 'claude-sonnet-4-6';
export const CLAUDE_MAX_TOKENS = 4096;
