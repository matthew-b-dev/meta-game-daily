import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
);

export const sendScore = async (playerScore: number): Promise<void> => {
  const { error } = await supabase.from('scores').insert({
    created_at: new Date().toISOString().slice(0, 10),
    score: playerScore,
  });

  if (error) {
    console.error('Error sending score:', error);
  }
};
