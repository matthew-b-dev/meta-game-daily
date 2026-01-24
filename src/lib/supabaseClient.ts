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

  const mockScores = [540, 520, 480, 200];

  // Couldn't retrieve scores so use mocked ones
  if (error) {
    console.error('Error fetching scores:', error);
    throw error;
  }

  const scores = data?.map((row) => row.score) ?? [];

  // If we successfully fetched but have 0 scores, seed the database
  if (scores.length === 0) {
    // Send each mock score to Supabase
    for (const mockScore of mockScores) {
      await sendScore(mockScore);
    }

    return mockScores;
  }

  return scores;
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
