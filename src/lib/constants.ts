import type { SplitDay } from '@/types/api';
import type { TrainingPhase } from '@/types/models';

export const FATIGUE_MARKERS = [
  { key: 'sleep_quality', label: 'Sleep Quality', low: 'Poor', high: 'Great' },
  { key: 'muscle_soreness', label: 'Muscle Soreness', low: 'Fresh', high: 'Wrecked' },
  { key: 'training_motivation', label: 'Motivation', low: 'Dreading it', high: 'Fired up' },
  { key: 'hunger', label: 'Hunger', low: 'None', high: 'Constant' },
  { key: 'stress', label: 'Life Stress', low: 'Calm', high: 'Maxed' },
] as const;

export type FatigueKey = (typeof FATIGUE_MARKERS)[number]['key'];

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export const PHASE_LABEL: Record<TrainingPhase, string> = {
  prep: 'Prep',
  off_season: 'Off-Season',
  peak_week: 'Peak Week',
  recovery: 'Recovery',
};

export const SPLIT_DAY_LABEL: Record<SplitDay, string> = {
  chest_back: 'Day 1 · Chest & Back',
  shoulders_arms: 'Day 2 · Shoulders & Arms',
  legs: 'Day 3 · Legs',
  chest_back_2: 'Day 4 · Chest & Back',
  shoulders_arms_2: 'Day 5 · Shoulders & Arms',
  legs_2: 'Day 6 · Legs',
};

// Default templates — the logger pre-populates from these so a client
// starts a session with zero taps of setup.
export const SPLIT_TEMPLATES: Record<SplitDay, string[]> = {
  chest_back: [
    'Bench Press',
    'Incline Dumbbell Press',
    'Weighted Pull-Up',
    'Barbell Row',
    'Cable Fly',
    'Straight-Arm Pulldown',
  ],
  shoulders_arms: [
    'Seated Overhead Press',
    'Dumbbell Lateral Raise',
    'Incline Dumbbell Curl',
    'Seated Overhead Skull Crusher',
    'Hammer Curl',
    'Cable Pushdown',
  ],
  legs: [
    'Back Squat',
    'Romanian Deadlift',
    'Leg Press',
    'Leg Curl',
    'Leg Extension',
    'Standing Calf Raise',
  ],
  chest_back_2: [
    'Incline Barbell Press',
    'Flat Dumbbell Press',
    'Lat Pulldown',
    'Chest-Supported Row',
    'Dip',
    'Face Pull',
  ],
  shoulders_arms_2: [
    'Dumbbell Shoulder Press',
    'Cable Lateral Raise',
    'Barbell Curl',
    'Close-Grip Bench Press',
    'Preacher Curl',
    'Overhead Cable Extension',
  ],
  legs_2: [
    'Front Squat',
    'Hip Thrust',
    'Bulgarian Split Squat',
    'Seated Leg Curl',
    'Seated Calf Raise',
    'Cable Crunch',
  ],
};
