import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

export interface AccordionItem {
  id: string;
  header: React.ReactNode;
  content: React.ReactNode;
  headerClassName?: string;
  hoverHeaderClassName?: string;
  isLast?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
}

export const Accordion: React.FC<AccordionProps> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className='w-full rounded-lg shadow-lg overflow-hidden'>
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={item.id}
            className={`${!item.isLast && !isOpen ? 'border-b border-zinc-700' : ''} ${item.headerClassName || 'bg-zinc-800'}`}
          >
            {/* The accordion header button to expand/collapse - includes the basic game info */}
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className={`w-full border border-transparent hover:border-transparent sm:hover:border-gray-500 p-2 flex items-center gap-2 hover:${item.hoverHeaderClassName} text-left transition-all`}
            >
              <div className='p-1 rounded bg-gray-700'>
                {isOpen ? (
                  <MinusIcon className='w-5 h-5' />
                ) : (
                  <PlusIcon className='w-5 h-5' />
                )}
              </div>
              <div className='flex-1'>{item.header}</div>
            </button>

            {/* The accordion body that displays more details */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className='bg-zinc-950 p-4 text-left relative overflow-visible'>
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
