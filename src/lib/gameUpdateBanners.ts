import type { ReactNode } from 'react';

export interface GameUpdateConfig {
  id: string; // Unique identifier for the banner
  startDate: string; // Format: "YYYY-MM-DD"
  endDate: string; // Format: "YYYY-MM-DD"
  displayDate: string; // Display format: "Feb 13, 2026"
  content: ReactNode | ((onDismiss: () => void) => ReactNode); // The React component/content to render
}

const DISMISSED_BANNERS_KEY = 'meta-game-dismissed-banners';

/**
 * Get list of dismissed banner IDs from localStorage
 */
export const getDismissedBanners = (): string[] => {
  try {
    const saved = localStorage.getItem(DISMISSED_BANNERS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load dismissed banners:', error);
    return [];
  }
};

/**
 * Mark a banner as dismissed
 */
export const dismissBanner = (bannerId: string): void => {
  try {
    const dismissed = getDismissedBanners();
    if (!dismissed.includes(bannerId)) {
      dismissed.push(bannerId);
      localStorage.setItem(DISMISSED_BANNERS_KEY, JSON.stringify(dismissed));
    }
  } catch (error) {
    console.error('Failed to dismiss banner:', error);
  }
};

/**
 * Check if a banner should be displayed based on puzzle date and dismissal status
 */
export const shouldShowBanner = (
  config: GameUpdateConfig,
  puzzleDate: string,
): boolean => {
  // Check if banner is dismissed
  const dismissed = getDismissedBanners();
  if (dismissed.includes(config.id)) {
    return false;
  }

  // Check if puzzle date is within the banner's date range
  return puzzleDate >= config.startDate && puzzleDate <= config.endDate;
};

/**
 * Get the active banner config for the current puzzle date
 */
export const getActiveBanner = (
  banners: GameUpdateConfig[],
  puzzleDate: string,
): GameUpdateConfig | null => {
  for (const banner of banners) {
    if (shouldShowBanner(banner, puzzleDate)) {
      return banner;
    }
  }
  return null;
};
