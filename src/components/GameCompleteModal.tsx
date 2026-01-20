import React, { useState } from 'react';
import { ShareIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface GameCompleteModalProps {
  isOpen: boolean;
  score: number;
  guessesLeft: number;
  onClose: () => void;
  onCopyToShare: () => void;
  onResetPuzzle: () => void;
}

const GameCompleteModal: React.FC<GameCompleteModalProps> = ({
  isOpen,
  score,
  guessesLeft,
  onClose,
  onCopyToShare,
  onResetPuzzle,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 rounded-lg p-8 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-center mb-6">Game Complete!</h2>
        <div className="space-y-4 mb-6">
          <div className="text-lg">
            <span className="font-semibold">Final Score:</span> {score}
          </div>
          <div className="text-lg">
            <span className="font-semibold">Guesses Used:</span>{' '}
            {10 - guessesLeft}/10
          </div>
        </div>
        <div className="space-y-3">
          <button
            className="w-full px-4 py-2 rounded bg-green-700 hover:bg-green-600 text-white text-sm font-semibold flex items-center justify-center gap-2"
            onClick={onCopyToShare}
          >
            Copy to Share
            <ShareIcon className="w-5 h-5" />
          </button>
          <button
            className="w-full px-4 py-2 rounded bg-blue-700 hover:bg-blue-600 text-white text-sm font-semibold"
            onClick={() => {
              setShowConfirmReset(false);
              onClose();
            }}
          >
            Close
          </button>
          <div className="flex justify-center mt-4">
            {!showConfirmReset ? (
              <button
                className="mt-4 text-red-500 hover:text-red-400 text-sm underline cursor-pointer focus:outline-none !border-transparent flex items-center gap-1"
                onClick={() => setShowConfirmReset(true)}
              >
                <ArrowPathIcon className="w-4 h-4 -scale-x-100" />
                Reset today's puzzle
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2 mt-4">
                <span className="text-sm text-gray-300">
                  Are you sure you want to reset today's puzzle?
                </span>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-1.5 rounded bg-red-700 hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1"
                    onClick={() => {
                      setShowConfirmReset(false);
                      onResetPuzzle();
                      onClose();
                    }}
                  >
                    <ArrowPathIcon className="w-4 h-4 -scale-x-100" />
                    Confirm Reset
                  </button>
                  <button
                    className="px-4 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold"
                    onClick={() => setShowConfirmReset(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCompleteModal;
