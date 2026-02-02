import { MAX_CLUES } from './utils';

interface SkipButtonProps {
  onClick: () => void;
  currentClue: number;
}

export const SkipButton: React.FC<SkipButtonProps> = ({
  onClick,
  currentClue,
}) => {
  const buttonText = currentClue >= MAX_CLUES ? 'Give Up' : 'Skip';
  const isGiveUp = currentClue >= MAX_CLUES;

  return (
    <button
      onClick={onClick}
      className={`${
        isGiveUp
          ? 'bg-red-700 hover:bg-red-600'
          : 'bg-zinc-700 hover:bg-zinc-600'
      } text-white px-6 py-2 rounded transition-colors`}
    >
      {buttonText}
    </button>
  );
};
