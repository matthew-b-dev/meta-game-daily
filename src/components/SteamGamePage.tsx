import React from 'react';
import type { SteamGamePageProps } from '../types';

// Helper function to get review color class based on rating
const getReviewColorClass = (rating: string): string => {
  switch (rating) {
    case 'Overwhelmingly Positive':
    case 'Very Positive':
      return 'text-[#66c0f4]';
    case 'Positive':
    case 'Mostly Positive':
      return 'text-[#66c0f4]';
    case 'Mixed':
      return 'text-[#a1a1a1]';
    case 'Negative':
    case 'Mostly Negative':
      return 'text-[#a94442]';
    case 'Overwhelmingly Negative':
    case 'Very Negative':
      return 'text-[#a94442]';
    default:
      return 'text-[#8f98a0]';
  }
};

// Helper to decode HTML entities
const decodeHtmlEntities = (text: string): string => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

export const SteamGamePage: React.FC<SteamGamePageProps> = ({ game }) => {
  return (
    <div className=' min-h-screen text-[#c7d5e0]'>
      <div className='relative'>
        {/* Main content */}
        <div className='relative max-w-[970px] mx-auto px-4 pt-8'>
          {/* Breadcrumbs */}
          <div className='mb-4'>
            <div className='bg-[rgba(0,0,0,0.2)] inline-block px-4 py-2 text-sm'>
              <a href='#' className='text-[#c7d5e0] hover:text-white'>
                All Games
              </a>
              <span className='mx-2 text-[#8f98a0]'>&gt;</span>
              <a href='#' className='text-[#c7d5e0] hover:text-white'>
                {game.tags[0]} Games
              </a>
              <span className='mx-2 text-[#8f98a0]'>&gt;</span>
              <span className='text-white'>{game.name}</span>
            </div>
          </div>

          {/* App Header */}
          <div className='flex items-center gap-4 mb-6'>
            <h1 className='text-4xl font-normal text-white'>{game.name}</h1>
          </div>

          {/* Main content area */}
          <div className='flex gap-4 pb-12'>
            {/* Left column - Media */}
            {/* Clue 4, screenshot: should push in from the left on desktop.
            On mobile, there will not be a 2 column view, just one column. So this should just push down from the top like the other clues. */}
            <div className='flex-1'>
              <div className='bg-[#000] relative group'>
                <img
                  src={game.primaryScreenshot}
                  alt='The primary screenshot for the game'
                  className='w-full'
                />
              </div>
            </div>

            {/* Right column - Clues 1 through 3 */}
            <div className='w-[370px] flex-shrink-0'>
              {/* Header image - do not use this in the game, ignore. 
              <div className='mb-4'>
                <img
                  src={`https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${game.appId}/header.jpg?t=1745363004`}
                  alt='The "cover" for the game'
                  className='w-full rounded-sm'
                />
              </div>
              */}

              {/* Description snippet - clue 3*/}
              <div
                id='clue3 '
                className='text-sm mb-4 text-gray-200 leading-relaxed'
              >
                {decodeHtmlEntities(game.shortDescription)}
              </div>

              {/* Reviews - clue 2: just combine clue2-part1, clue2-part2, clue2-part3, clue2-part4 */}
              <div id='clue2-part1' className='mb-4 space-y-2'>
                <div className='flex items-start gap-2'>
                  <div className='text-gray-400 text-xs uppercase min-w-[120px] pt-1'>
                    All Reviews:
                  </div>
                  <div className='flex-1 flex gap-1'>
                    <div
                      className={`text-sm ${getReviewColorClass(game.allReviewSummary.rating)}`}
                    >
                      {game.allReviewSummary.rating}
                    </div>
                    <div className='text-[#8f98a0] text-sm'>
                      ({game.allReviewSummary.count.toLocaleString()})
                    </div>
                  </div>
                </div>
              </div>

              {/* Release Date - included in clue 2 */}
              <div id='clue2-part2' className='flex items-start gap-2 mb-3'>
                <div className='text-gray-400 text-xs uppercase min-w-[120px] pt-[3px]'>
                  Release Date:
                </div>
                <div className='text-[#c7d5e0] text-sm'>{game.releaseDate}</div>
              </div>

              {/* Developer - included in clue 2 */}
              <div id='clue2-part3' className='flex items-start gap-2'>
                <div className='text-gray-400 text-xs uppercase min-w-[120px]  pt-[3px]'>
                  Developer:
                </div>
                <div className='text-sm'>
                  <span className='text-[#66c0f4]'>{game.developer}</span>
                </div>
              </div>

              {/* Publisher - included in clue 2 */}
              <div id='clue2-part4' className='flex items-start gap-2 mb-6'>
                <div className='text-gray-400 text-xs uppercase min-w-[120px]  pt-[3px]'>
                  Publisher:
                </div>
                <div className='text-sm'>
                  <span className='text-[#66c0f4]'>{game.publisher}</span>
                </div>
              </div>

              {/* userTags - clue 1 */}
              {game.userTags.length > 0 && (
                <div id='clue1' className='pt-4'>
                  <div className='text-gray-400 text-sm mb-2'>
                    Popular user-defined tags for this product:
                  </div>
                  <div className='flex flex-wrap gap-[2px]'>
                    {game.userTags.slice(0, 10).map((tag, index) => (
                      <span
                        key={index}
                        className='bg-[rgba(103,193,245,0.2)] text-[#67c1f5] px-2 py-[2px] text-xs rounded-sm'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SteamGamePage;
