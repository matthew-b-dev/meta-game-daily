import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { getPuzzleDate } from '../utils';

interface NotificationItem {
  dateText: string;
  body: React.ReactNode;
}

const notifications: NotificationItem[] = [
  {
    dateText: 'Jan 29',
    body: (
      <>
        <b>Bonus points</b> are awarded for unused guesses. Guess all 5 games in
        5 guesses without hints to earn a perfect score of 1100.
      </>
    ),
  },
];

const DailyNotification: React.FC = () => {
  const currentDateText = getPuzzleDate().replace(/, \d{4}$/, '');
  const currentNotification = notifications.find(
    (n) => n.dateText === currentDateText,
  );

  if (!currentNotification) return null;

  return (
    <div className='text-gray-400 text-sm flex justify-center gap-1 mb-7'>
      <div className=' px-2 py-1 rounded border border-zinc-600 border-1 flex items-center'>
        <div className='flex text-center shrink-0 items-center mr-2 pr-2 border-r border-zinc-600 h-full'>
          <InformationCircleIcon className='w-7 h-7 mr-1' />
          {currentNotification.dateText.replace(' ', '. ')}:
        </div>
        <div className='pl-2'>{currentNotification.body}</div>
      </div>
    </div>
  );
};

export default DailyNotification;
