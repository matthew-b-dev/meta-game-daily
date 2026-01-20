import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ShareIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { trackPuzzleFeedback } from '../analytics';

interface GameCompleteModalProps {
  isOpen: boolean;
  score: number;
  guessesLeft: number;
  puzzleDate: string;
  onClose: () => void;
  onCopyToShare: () => void;
  onResetPuzzle: () => void;
}

const GameCompleteModal: React.FC<GameCompleteModalProps> = ({
  isOpen,
  score,
  guessesLeft,
  puzzleDate,
  onClose,
  onCopyToShare,
  onResetPuzzle,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  // Reset feedback when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Prevent a cascading render loop
      setTimeout(() => {
        setShowConfirmReset(false);
        setFeedback(null);
      }, 0);
    }
  }, [isOpen]);

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    trackPuzzleFeedback({ feedback: type, puzzleDate });
    toast.success('Feedback sent.', { duration: 2000 });
  };

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
        <div className="flex justify-between mb-6 text-sm">
          <div>
            <span className="font-semibold">Final Score:</span> {score}
          </div>
          <div>
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
          <div className="border-t border-gray-700 pt-4">
            <p className="text-center text-sm text-gray-400 mb-3">
              Provide <b>*anonymous*</b> feedback for today's puzzle
            </p>
            {feedback === null ? (
              <div className="flex gap-2 justify-center">
                <button
                  className="px-4 py-2 rounded text-sm font-semibold transition-colors bg-gray-700 hover:bg-gray-600 text-white"
                  onClick={() => handleFeedback('up')}
                >
                  Great 👍
                </button>
                <button
                  className="px-4 py-2 rounded text-sm font-semibold transition-colors bg-gray-700 hover:bg-gray-600 text-white"
                  onClick={() => handleFeedback('down')}
                >
                  Could be better 🤷
                </button>
              </div>
            ) : (
              <p className="text-center text-sm text-green-400 font-semibold">
                I really appreciate your feedback!
              </p>
            )}
          </div>
          <div className="border-t border-gray-700 pt-3 mt-3" />
          <div className="flex justify-center mb-4">
            {!showConfirmReset ? (
              <button
                className="mb-4 text-red-500 hover:text-red-400 text-sm underline cursor-pointer focus:outline-none !border-transparent flex items-center gap-1"
                onClick={() => setShowConfirmReset(true)}
              >
                <ArrowPathIcon className="w-4 h-4 -scale-x-100" />
                Reset today's puzzle
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2 mb-4">
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
          <button
            className="w-full px-4 py-2 rounded bg-blue-700 hover:bg-blue-600 text-white text-sm font-semibold"
            onClick={() => {
              setShowConfirmReset(false);
              onClose();
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCompleteModal;
