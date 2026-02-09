import React from 'react';

const ShuffleFooter: React.FC = () => {
  return (
    <footer className='mt-12 text-xs text-gray-400 text-right space-y-1 pb-4'>
      <div>
        Inspired by the terrific{' '}
        <a
          href='https://playdisorderly.com/'
          target='_blank'
          rel='noopener noreferrer'
          className='text-yellow-500 hover:text-yellow-400 underline'
        >
          playdisorderly.com
        </a>
      </div>
      <div>
        Created by{' '}
        <a
          href='https://github.com/matthew-b-dev'
          target='_blank'
          rel='noopener noreferrer'
          className='text-yellow-500 hover:text-yellow-400 underline'
        >
          matthew-b-dev
        </a>
      </div>
      <div>
        Screenshots sourced from{' '}
        <a
          href='https://www.igdb.com/'
          target='_blank'
          rel='noopener noreferrer'
          className='text-yellow-500 hover:text-yellow-400 underline'
        >
          IGDB
        </a>
      </div>
    </footer>
  );
};

export default ShuffleFooter;
