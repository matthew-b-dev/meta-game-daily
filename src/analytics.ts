// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (
      command: 'event',
      eventName: string,
      eventParams?: Record<string, string | number>,
    ) => void;
  }
}

export interface PuzzleFeedbackParams {
  feedback: 'perfect' | 'too_easy' | 'too_hard';
  puzzleDate: string;
}

// Google analytics event for a "thumbs-up" or "thumbs-down" to rate today's game
export function trackPuzzleFeedback({
  feedback,
  puzzleDate,
}: PuzzleFeedbackParams): void {
  if (!window.gtag) {
    console.log('[Analytics] gtag not available, skipping');
    return;
  }

  console.log('[Analytics] Sending to gtag...');
  window.gtag('event', 'daily_puzzle_feedback', {
    feedback, // "up" | "down"
    puzzle_date: puzzleDate,
  });
  console.log('[Analytics] Sent to gtag');
}

export {}; // Ensure this file is treated as a module
