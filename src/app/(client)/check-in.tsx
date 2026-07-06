import React, { useMemo, useReducer } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NumericField } from '@/components/ui/NumericField';
import { RatingScale } from '@/components/forms/RatingScale';
import { FATIGUE_MARKERS, WEEKDAYS, type FatigueKey } from '@/lib/constants';
import type { CheckInPayload, FatigueMarkersPayload } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import { useSubmitCheckIn } from '@/hooks/useSubmitCheckIn';

// ---- Draft state (strings + nullables while editing) ----

interface CheckInDraft {
  morningWeights: string[]; // 7 raw inputs, '' = missed day
  macroAdherentDays: number | null; // 0-7
  fatigue: Record<FatigueKey, number | null>;
  notes: string;
}

type CheckInAction =
  | { type: 'SET_WEIGHT'; dayIndex: number; value: string }
  | { type: 'SET_MACRO_DAYS'; value: number }
  | { type: 'SET_FATIGUE'; key: FatigueKey; value: number }
  | { type: 'SET_NOTES'; value: string }
  | { type: 'RESET' };

const initialDraft: CheckInDraft = {
  morningWeights: Array(7).fill(''),
  macroAdherentDays: null,
  fatigue: {
    sleep_quality: null,
    muscle_soreness: null,
    training_motivation: null,
    hunger: null,
    stress: null,
  },
  notes: '',
};

function checkInReducer(state: CheckInDraft, action: CheckInAction): CheckInDraft {
  switch (action.type) {
    case 'SET_WEIGHT': {
      const morningWeights = [...state.morningWeights];
      morningWeights[action.dayIndex] = action.value;
      return { ...state, morningWeights };
    }
    case 'SET_MACRO_DAYS':
      return { ...state, macroAdherentDays: action.value };
    case 'SET_FATIGUE':
      return { ...state, fatigue: { ...state.fatigue, [action.key]: action.value } };
    case 'SET_NOTES':
      return { ...state, notes: action.value };
    case 'RESET':
      return initialDraft;
  }
}

// ---- Validation + payload build (the string -> number boundary) ----

function validate(draft: CheckInDraft): string | null {
  const loggedDays = draft.morningWeights.filter((w) => w !== '').length;
  if (loggedDays < 3) return 'Log at least 3 morning weights for a usable trend.';
  if (draft.macroAdherentDays === null) return 'Select how many days you hit your macros.';
  const missing = FATIGUE_MARKERS.find((m) => draft.fatigue[m.key] === null);
  if (missing) return `Rate "${missing.label}" before submitting.`;
  return null;
}

function mostRecentMonday(today: Date): string {
  const d = new Date(today);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

function buildPayload(draft: CheckInDraft, clientId: string): CheckInPayload {
  return {
    client_id: clientId,
    week_start: mostRecentMonday(new Date()),
    morning_weights_lbs: draft.morningWeights.map((w) =>
      w === '' ? null : Number.parseFloat(w),
    ),
    macro_adherent_days: draft.macroAdherentDays!, // validated non-null above
    fatigue: draft.fatigue as FatigueMarkersPayload, // every key validated non-null
    notes: draft.notes.trim() || null,
  };
}

// ---- Screen ----

export default function CheckInScreen() {
  const { user } = useAuth();
  const [draft, dispatch] = useReducer(checkInReducer, initialDraft);
  const { mutate: submit, isPending } = useSubmitCheckIn();

  const weeklyAverage = useMemo(() => {
    const values = draft.morningWeights
      .filter((w) => w !== '')
      .map((w) => Number.parseFloat(w))
      .filter((n) => Number.isFinite(n));
    if (values.length === 0) return null;
    return values.reduce((sum, n) => sum + n, 0) / values.length;
  }, [draft.morningWeights]);

  const handleSubmit = () => {
    const error = validate(draft);
    if (error) {
      Alert.alert('Incomplete check-in', error);
      return;
    }
    submit(buildPayload(draft, user!.id), {
      onSuccess: () => {
        dispatch({ type: 'RESET' });
        Alert.alert('Check-in submitted', 'Your coach will see it in this week’s report.');
      },
      onError: (err) => {
        Alert.alert('Submission failed', err.message);
      },
    });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-zinc-950"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerClassName="gap-6 p-4 pb-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Morning weights */}
        <View className="gap-3">
          <Text className="text-xl font-bold text-zinc-50">Morning Weight (lbs)</Text>
          <View className="flex-row flex-wrap gap-2">
            {WEEKDAYS.map((day, i) => (
              <View key={day} className="w-[22%] gap-1">
                <Text className="text-center text-xs text-zinc-500">{day}</Text>
                <NumericField
                  compact
                  value={draft.morningWeights[i]}
                  onChangeText={(value) => dispatch({ type: 'SET_WEIGHT', dayIndex: i, value })}
                  placeholder="—"
                />
              </View>
            ))}
          </View>
          {weeklyAverage !== null && (
            <Text className="text-sm text-amber-400">
              Weekly average: {weeklyAverage.toFixed(1)} lbs
            </Text>
          )}
        </View>

        {/* Macro adherence */}
        <View className="gap-2">
          <Text className="text-xl font-bold text-zinc-50">Macro Adherence</Text>
          <Text className="text-sm text-zinc-400">Days on target this week</Text>
          <View className="flex-row gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
              <Pressable
                key={n}
                onPress={() => dispatch({ type: 'SET_MACRO_DAYS', value: n })}
                className={`flex-1 items-center rounded-lg py-2.5 ${
                  draft.macroAdherentDays === n ? 'bg-amber-500' : 'bg-zinc-800'
                }`}
              >
                <Text
                  className={`font-semibold ${
                    draft.macroAdherentDays === n ? 'text-zinc-950' : 'text-zinc-300'
                  }`}
                >
                  {n}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Fatigue markers */}
        <View className="gap-5">
          <Text className="text-xl font-bold text-zinc-50">Recovery & Fatigue</Text>
          {FATIGUE_MARKERS.map((marker) => (
            <RatingScale
              key={marker.key}
              label={marker.label}
              lowHint={marker.low}
              highHint={marker.high}
              value={draft.fatigue[marker.key]}
              onChange={(value) => dispatch({ type: 'SET_FATIGUE', key: marker.key, value })}
            />
          ))}
        </View>

        {/* Notes */}
        <View className="gap-2">
          <Text className="text-xl font-bold text-zinc-50">Notes for Coach</Text>
          <TextInput
            className="min-h-[96px] rounded-xl bg-zinc-800 p-3 text-base text-zinc-50"
            multiline
            textAlignVertical="top"
            value={draft.notes}
            onChangeText={(value) => dispatch({ type: 'SET_NOTES', value })}
            placeholder="Digestion, pumps, sleep disruptions…"
            placeholderTextColor="#52525b"
          />
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={isPending}
          className={`items-center rounded-2xl py-4 ${
            isPending ? 'bg-amber-500/50' : 'bg-amber-500 active:bg-amber-600'
          }`}
        >
          <Text className="text-lg font-bold text-zinc-950">
            {isPending ? 'Submitting…' : 'Submit Check-In'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
