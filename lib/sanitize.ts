import { Platform } from 'react-native';

// Sanitize user-provided HTML content when running on web to mitigate XSS.
export function sanitize(input: string) {
  if (!input) return '';
  if (Platform.OS !== 'web') return input;

  // Lazy-require to avoid bundling on native
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const DOMPurify = require('dompurify');
  return DOMPurify.sanitize(input);
}
