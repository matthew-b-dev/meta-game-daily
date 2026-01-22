import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { trackPuzzleFeedback } from '../analytics';

interface FeedbackButtonsProps {
  puzzleDate: string;
  userPercentile: number | null;
  isOpen: boolean;
}

const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({
  puzzleDate,
  userPercentile,
  isOpen,
}) => {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  // Reset feedback when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFeedback(null);
      }, 0);
    }
  }, [isOpen]);

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    trackPuzzleFeedback({ feedback: type, puzzleDate });
    toast.success('Feedback sent.', { duration: 2000 });
  };

  return (
    <div className='border-t border-gray-700 pt-4'>
      <p className='text-center text-xs text-gray-400'>
        Provide <b>*anonymous*</b> feedback for today's puzzle.
      </p>
      <p className='text-center text-xs text-gray-400 mb-3'>
        AdBlock will block this. There are no ads though!
      </p>
      {feedback === null ? (
        userPercentile === 0 ? (
          <div className='flex justify-center'>
            <button
              className='px-4 py-2 rounded text-sm font-semibold transition-colors bg-gray-700 hover:bg-gray-600 text-white'
              onClick={() => handleFeedback('up')}
            >
              I got the worst score today 🤷
            </button>
          </div>
        ) : (
          <div className='flex gap-2 justify-center'>
            <button
              className='px-4 py-2 rounded text-sm font-semibold transition-colors bg-gray-700 hover:bg-gray-600 text-white'
              onClick={() => handleFeedback('up')}
            >
              Great 👍
            </button>
            <button
              className='px-4 py-2 rounded text-sm font-semibold transition-colors bg-gray-700 hover:bg-gray-600 text-white'
              onClick={() => handleFeedback('down')}
            >
              Could be better 🤷
            </button>
          </div>
        )
      ) : (
        <p className='text-center text-sm text-green-400 font-semibold'>
          I really appreciate your feedback!
        </p>
      )}
    </div>
  );
};

export default FeedbackButtons;
