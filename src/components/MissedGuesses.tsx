import React from 'react';

interface MissedGuessesProps {
  missedGuesses: string[];
}

const MissedGuesses: React.FC<MissedGuessesProps> = ({ missedGuesses }) => {
  if (missedGuesses.length === 0) return null;
  return (
    <div className="mt-4">
      <div className="mb-1 text-red-400 font-semibold text-sm">
        Incorrect guesses
      </div>
      <div className="flex flex-wrap gap-2">
        {missedGuesses.map((miss, i) => (
          <span
            key={miss + i}
            className="flex items-center text-red-500 bg-red-900/30 rounded px-2 py-1 text-sm"
          >
            <span className="mr-1 font-bold">❌</span> {miss}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MissedGuesses;
