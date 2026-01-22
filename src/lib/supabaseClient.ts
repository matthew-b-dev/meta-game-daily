import { createClient } from '@supabase/supabase-js';
import { getUtcDateString } from '../utils';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
);

export const sendScore = async (playerScore: number): Promise<void> => {
  console.log('sending score: ', playerScore);
  const { error } = await supabase.from('scores').insert({
    created_at: getUtcDateString(),
    score: playerScore,
  });

  if (error) {
    console.error('Error sending score:', error);
  }
};

export const fetchTodayScores = async (): Promise<number[]> => {
  const today = getUtcDateString();

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

export const sendFeedback = async (
  feedbackType: 'up' | 'down',
): Promise<void> => {
  const { error } = await supabase.from('feedback').insert({
    created_at: getUtcDateString(),
    feedback: feedbackType,
  });

  if (error) {
    console.error('Error sending feedback:', error);
  }
};
