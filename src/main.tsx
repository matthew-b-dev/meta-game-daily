import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { supabase } from './lib/supabaseClient';

// Log page view exactly once per page load
(async () => {
  await supabase.from('page_views').insert([
    {
      path: window.location.pathname,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      app_name: 'guessing_game',
    },
  ]);
})();

createRoot(document.getElementById('root')!).render(<App />);
