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
  isComplete: boolean;
  showClue1: boolean;
  showClue2: boolean;
  showClue3: boolean;
  showClue4: boolean;
  showClue5: boolean;
  showClue6: boolean;
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
  isComplete,
  showClue1,
  showClue2,
  showClue3,
  showClue4,
  showClue5,
  showClue6,
}) => {
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
      <motion.div layout className='bg-[#1b2838] rounded overflow-hidden'>
        <ClueTitle title={gameName} show={showClue6} isComplete={isComplete} />
        {/* Screenshots - Clue 4 (primary) and Clue 5 (secondary) */}
        <ClueScreenshot
          screenshot={mainScreenshot}
          secondaryScreenshot={thumbnailScreenshot}
          show={showClue4}
          showSecondary={showClue5 && secondaryScreenshot !== undefined}
          onSwapScreenshots={handleSwapScreenshots}
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
        />
        <ClueTags tags={tags} show={showClue1} />
      </motion.div>
    </div>
  );
};
