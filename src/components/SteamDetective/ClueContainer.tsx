import type { ReactElement } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClueTitle } from './ClueTitle';
import { ClueScreenshot } from './ClueScreenshot';
import { ClueDescription } from './ClueDescription';
import { ClueDetails } from './ClueDetails';
import { ClueTags } from './ClueTags';

interface ReviewSummary {
  rating: string;
  count: number;
}

interface ClueContainerProps {
  gameName: string;
  screenshot: string;
  secondaryScreenshot?: string;
  shortDescription: string;
  censoredDescription: ReactElement[];
  allReviewSummary: ReviewSummary;
  releaseDate: string;
  developer: string;
  publisher: string;
  tags: string[];
  blurredTags?: string[];
  blurScreenshotQuarter?: 'top' | 'bottom';
  blurTitleAndAsAmpersand?: boolean;
  overrideCensoredTitle?: string;
  isComplete: boolean;
  showClues: boolean[];
}

export const ClueContainer: React.FC<ClueContainerProps> = ({
  gameName,
  screenshot,
  secondaryScreenshot,
  shortDescription,
  censoredDescription,
  allReviewSummary,
  releaseDate,
  developer,
  publisher,
  tags,
  blurredTags,
  blurScreenshotQuarter,
  blurTitleAndAsAmpersand,
  overrideCensoredTitle,
  isComplete,
  showClues,
}) => {
  const [showClue1, showClue2, showClue3, showClue4, showClue5, showClue6] =
    showClues;
  const [primaryIsMain, setPrimaryIsMain] = useState(true);

  const mainScreenshot = primaryIsMain
    ? screenshot
    : secondaryScreenshot || screenshot;
  const thumbnailScreenshot = primaryIsMain ? secondaryScreenshot : screenshot;

  const handleSwapScreenshots = () => {
    if (showClue5 && secondaryScreenshot) {
      setPrimaryIsMain(!primaryIsMain);
    }
  };

  return (
    <div className=' mx-auto pb-12'>
      <motion.div
        layout
        className='bg-[#17222f] rounded shadow-[0_20px_50px_rgba(0,0,0,1)] overflow-hidden'
      >
        <ClueTitle
          title={gameName}
          show={showClue6}
          isComplete={isComplete}
          blurTitleAndAsAmpersand={blurTitleAndAsAmpersand}
          overrideCensoredTitle={overrideCensoredTitle}
        />
        {/* Screenshots - Clue 4 (primary) and Clue 5 (secondary) */}
        <ClueScreenshot
          screenshot={mainScreenshot}
          secondaryScreenshot={thumbnailScreenshot}
          show={showClue4}
          showSecondary={showClue5 && secondaryScreenshot !== undefined}
          blurScreenshotQuarter={blurScreenshotQuarter}
          onSwapScreenshots={handleSwapScreenshots}
          isComplete={isComplete}
        />
        <ClueDescription
          shortDescription={shortDescription}
          censoredDescription={censoredDescription}
          isComplete={isComplete}
          show={showClue3}
        />
        <ClueDetails
          allReviewSummary={allReviewSummary}
          releaseDate={releaseDate}
          developer={developer}
          publisher={publisher}
          show={showClue2}
          isComplete={isComplete}
        />
        <ClueTags tags={tags} blurredTags={blurredTags} show={showClue1} />
      </motion.div>
    </div>
  );
};
