import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { supabase } from './lib/supabaseClient';

// Log page view exactly once per page load (skip on localhost)
(async () => {
  if (
    !window.location.hostname.includes('localhost') &&
    window.location.hostname !== '127.0.0.1'
  ) {
    await supabase.from('page_views').insert([
      {
        path: window.location.pathname,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        app_name: 'guessing_game',
      },
    ]);
  }
})();

createRoot(document.getElementById('root')!).render(<App />);
