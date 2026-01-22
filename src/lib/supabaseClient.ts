import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
);

export const sendScore = async (playerScore: number): Promise<void> => {
  console.log('sending score: ', playerScore);
  const { error } = await supabase.from('scores').insert({
    created_at: new Date().toISOString().slice(0, 10),
    score: playerScore,
  });

  if (error) {
    console.error('Error sending score:', error);
  }
};

export const fetchTodayScores = async (): Promise<number[]> => {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('scores')
    .select('score')
    .eq('created_at', today);

  if (error) {
    console.error('Error fetching scores:', error);
    return [];
  }

  return data?.map((row) => row.score) ?? [];
};
