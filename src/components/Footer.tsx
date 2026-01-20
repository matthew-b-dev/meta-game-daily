import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-8 text-xs text-gray-400 text-right space-y-1 pb-4">
      <div>
        Inspired by the terrific{' '}
        <a
          href="https://boxofficega.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-yellow-500 hover:text-yellow-400 underline"
        >
          boxofficega.me
        </a>
      </div>
      <div>
        Created by{' '}
        <a
          href="https://github.com/matthew-b-dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-yellow-500 hover:text-yellow-400 underline"
        >
          matthew-b-dev
        </a>
      </div>
      <div>
        Details and screenshots sourced from{' '}
        <a
          href="https://www.igdb.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-yellow-500 hover:text-yellow-400 underline"
        >
          IGDB
        </a>
      </div>
      <div>
        Critic scores sourced from{' '}
        <a
          href="https://opencritic.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-yellow-500 hover:text-yellow-400 underline"
        >
          OpenCritic
        </a>
      </div>
    </footer>
  );
};

export default Footer;
