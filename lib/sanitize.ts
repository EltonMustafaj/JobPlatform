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

/**
 * Normalize external URLs to ensure they have a valid scheme (https://).
 * This prevents "schema net does not exist" errors when opening links in React Native.
 * 
 * @param input - The URL string to normalize (can be null/undefined/empty)
 * @returns A normalized URL with https:// scheme, or null if input is invalid
 * 
 * @example
 * normalizeUrl('example.com') // returns 'https://example.com'
 * normalizeUrl('http://example.com') // returns 'http://example.com'
 * normalizeUrl('https://example.com') // returns 'https://example.com'
 * normalizeUrl('') // returns null
 */
export function normalizeUrl(input?: string | null): string | null {
  if (!input) return null;
  
  const trimmed = input.trim();
  if (!trimmed) return null;
  
  // Check if the URL already has a valid scheme (http://, https://, ftp://, etc.)
  // Regex explanation: starts with letter, followed by letters/digits/+/-/., then ://
  const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//i.test(trimmed);
  
  // If no scheme, add https://
  return hasScheme ? trimmed : `https://${trimmed}`;
}
