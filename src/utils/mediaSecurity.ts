/**
 * Media Security Utilities for Major Club
 * 
 * Provides secure generic blurred silhouette placeholders for private / PPV / locked content.
 * Guarantees that unauthenticated or non-patron DOM elements do NOT leak the original mediaUrl
 * when inspected via browser DevTools ("Inspect Element" / "Öğeyi Denetle").
 */

export const SECURE_LOCKED_BLUR_PLACEHOLDER = 
  "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <defs>
    <radialGradient id="ambience" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#3d3121" stop-opacity="0.8"/>
      <stop offset="35%" stop-color="#181920" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#08080a" stop-opacity="1"/>
    </radialGradient>
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="40" result="blur"/>
    </filter>
    <filter id="deepBlur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="70" result="blur"/>
    </filter>
  </defs>
  <!-- Dark backdrop -->
  <rect width="100%" height="100%" fill="#08080a"/>
  <rect width="100%" height="100%" fill="url(#ambience)"/>
  
  <!-- Silhouette head & shoulder contour (abstract blurred patron form) -->
  <circle cx="400" cy="330" r="140" fill="#e5c590" fill-opacity="0.16" filter="url(#deepBlur)"/>
  <circle cx="400" cy="320" r="110" fill="#0d0e12" fill-opacity="0.9" filter="url(#softGlow)"/>
  
  <ellipse cx="400" cy="620" rx="270" ry="200" fill="#e5c590" fill-opacity="0.14" filter="url(#deepBlur)"/>
  <ellipse cx="400" cy="640" rx="230" ry="170" fill="#0c0d11" fill-opacity="0.9" filter="url(#softGlow)"/>
  
  <!-- Subtle lighting rim -->
  <path d="M 280,320 Q 400,210 520,320 Q 560,500 620,800 L 180,800 Z" fill="#e5c590" fill-opacity="0.08" filter="url(#deepBlur)"/>
</svg>
`);

/**
 * Returns the secure placeholder if the item is locked, otherwise the true media URL.
 * Prevents inspection via DevTools from discovering the actual asset before payment or subscription.
 */
export function getSafeMediaPreview(
  mediaUrl: string | undefined,
  isLocked: boolean
): string {
  if (isLocked) {
    return SECURE_LOCKED_BLUR_PLACEHOLDER;
  }
  return mediaUrl || '';
}
