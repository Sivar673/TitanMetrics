import React, { memo, useCallback, useReducer, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { NumericField } from '@/components/ui/NumericField';
import { SPLIT_DAY_LABEL, SPLIT_TEMPLATES } from '@/lib/constants';
import type { SplitDay, WorkoutSessionPayload } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import { useLogWorkout } from '@/hooks/useLogWorkout';

// ---- Draft state ----

interface DraftSet {
  id: string;
  weight: string;
  reps: string;
  rpe: string;
  isWorkingSet: boolean;
}

interface DraftExercise {
  id: string;
  name: string;
  sets: DraftSet[];
}

type LoggerAction =
  | { type: 'LOAD_TEMPLATE'; day: SplitDay }
  | { type: 'ADD_SET'; exerciseId: string }
  | { type: 'UPDATE_SET'; exerciseId: string; setId: string; patch: Partial<Omit<DraftSet, 'id'>> }
  | { type: 'REMOVE_SET'; exerciseId: string; setId: string };

let idCounter = 0;
const nextId = () => `d_${++idCounter}`;

const emptySet = (): DraftSet => ({
  id: nextId(),
  weight: '',
  reps: '',
  rpe: '',
  isWorkingSet: true,
});

function loadTemplate(day: SplitDay): DraftExercise[] {
  return SPLIT_TEMPLATES[day].map((name) => ({
    id: nextId(),
    name,
    sets: [emptySet()],
  }));
}

function loggerReducer(state: DraftExercise[], action: LoggerAction): DraftExercise[] {
  switch (action.type) {
    case 'LOAD_TEMPLATE':
      return loadTemplate(action.day);

    case 'ADD_SET':
      return state.map((ex) => {
        if (ex.id !== action.exerciseId) return ex;
        const last = ex.sets[ex.sets.length - 1];
        // Clone previous load/reps — straight sets are the common case
        const cloned: DraftSet = last ? { ...last, id: nextId(), rpe: '' } : emptySet();
        return { ...ex, sets: [...ex.sets, cloned] };
      });

    case 'UPDATE_SET':
      return state.map((ex) =>
        ex.id !== action.exerciseId
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s) => (s.id === action.setId ? { ...s, ...action.patch } : s)),
            },
      );

    case 'REMOVE_SET':
      return state.map((ex) =>
        ex.id !== action.exerciseId
          ? ex
          : { ...ex, sets: ex.sets.filter((s) => s.id !== action.setId) },
      );
  }
}

// ---- Payload build: drop incomplete rows, parse the rest ----

function buildPayload(
  exercises: DraftExercise[],
  day: SplitDay,
  clientId: string,
): WorkoutSessionPayload {
  return {
    client_id: clientId,
    performed_at: new Date().toISOString(),
    split_day: day,
    session_notes: null,
    exercises: exercises
      .map((ex, exIndex) => ({
        name: ex.name,
        order: exIndex + 1,
        sets: ex.sets
          .filter((s) => s.weight !== '' && s.reps !== '')
          .map((s, setIndex) => ({
            set_number: setIndex + 1,
            weight_lbs: Number.parseFloat(s.weight),
            reps: Number.parseInt(s.reps, 10),
            rpe: s.rpe === '' ? null : Number.parseFloat(s.rpe),
            is_working_set: s.isWorkingSet,
          })),
      }))
      .filter((ex) => ex.sets.length > 0),
  };
}

// ---- Memoized set row: only the edited row re-renders ----

interface SetRowProps {
  exerciseId: string;
  set: DraftSet;
  index: number;
  dispatch: React.Dispatch<LoggerAction>;
}

const SetRow = memo(function SetRow({ exerciseId, set, index, dispatch }: SetRowProps) {
  const update = (patch: Partial<Omit<DraftSet, 'id'>>) =>
    dispatch({ type: 'UPDATE_SET', exerciseId, setId: set.id, patch });

  return (
    <View className="flex-row items-center gap-2">
      <Pressable
        onPress={() => update({ isWorkingSet: !set.isWorkingSet })}
        onLongPress={() => dispatch({ type: 'REMOVE_SET', exerciseId, setId: set.id })}
        className={`w-10 items-center rounded-lg py-2 ${
          set.isWorkingSet ? 'bg-amber-500/20' : 'bg-zinc-800'
        }`}
      >
        <Text className={set.isWorkingSet ? 'font-bold text-amber-400' : 'text-zinc-500'}>
          {set.isWorkingSet ? index + 1 : 'W'}
        </Text>
      </Pressable>
      <View className="flex-1">
        <NumericField
          compact
          value={set.weight}
          placeholder="lbs"
          onChangeText={(weight) => update({ weight })}
        />
      </View>
      <View className="flex-1">
        <NumericField
          compact
          allowDecimal={false}
          value={set.reps}
          placeholder="reps"
          onChangeText={(reps) => update({ reps })}
        />
      </View>
      <View className="flex-1">
        <NumericField
          compact
          value={set.rpe}
          placeholder="RPE"
          maxLength={3}
          onChangeText={(rpe) => update({ rpe })}
        />
      </View>
    </View>
  );
});

// ---- Screen ----

export default function LogWorkoutScreen() {
  const { user } = useAuth();
  const [day, setDay] = useState<SplitDay | null>(null);
  const [exercises, dispatch] = useReducer(loggerReducer, []);
  const { mutate: saveWorkout, isPending } = useLogWorkout();

  const startSession = useCallback((selected: SplitDay) => {
    setDay(selected);
    dispatch({ type: 'LOAD_TEMPLATE', day: selected });
  }, []);

  const handleFinish = () => {
    if (!day) return;
    const payload = buildPayload(exercises, day, user!.id);
    if (payload.exercises.length === 0) {
      Alert.alert('Empty session', 'Log at least one completed set.');
      return;
    }
    saveWorkout(payload, {
      onSuccess: () => {
        setDay(null); // back to the day picker for a fresh session
        Alert.alert('Session saved', 'Nice work — progression charts updated.');
      },
      onError: (err) => {
        // Draft state is untouched on failure, so nothing is lost mid-gym
        Alert.alert('Save failed', err.message);
      },
    });
  };

  // Day picker — shown until a session starts
  if (!day) {
    return (
      <ScrollView className="flex-1 bg-zinc-950" contentContainerClassName="gap-3 p-4">
        <Text className="text-2xl font-bold text-zinc-50">Today's Session</Text>
        {(Object.keys(SPLIT_DAY_LABEL) as SplitDay[]).map((d) => (
          <Pressable
            key={d}
            onPress={() => startSession(d)}
            className="rounded-2xl bg-zinc-900 p-4 active:bg-zinc-800"
          >
            <Text className="text-lg font-semibold text-zinc-50">{SPLIT_DAY_LABEL[d]}</Text>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-zinc-950"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerClassName="gap-5 p-4 pb-12"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-xl font-bold text-amber-400">{SPLIT_DAY_LABEL[day]}</Text>

        {exercises.map((ex) => (
          <View key={ex.id} className="gap-2 rounded-2xl bg-zinc-900 p-3">
            <Text className="text-lg font-semibold text-zinc-50">{ex.name}</Text>
            <View className="flex-row gap-2 pl-12">
              <Text className="flex-1 text-center text-xs text-zinc-500">WEIGHT</Text>
              <Text className="flex-1 text-center text-xs text-zinc-500">REPS</Text>
              <Text className="flex-1 text-center text-xs text-zinc-500">RPE</Text>
            </View>
            <View className="gap-2">
              {ex.sets.map((set, i) => (
                <SetRow key={set.id} exerciseId={ex.id} set={set} index={i} dispatch={dispatch} />
              ))}
            </View>
            <Pressable
              onPress={() => dispatch({ type: 'ADD_SET', exerciseId: ex.id })}
              className="items-center rounded-lg border border-dashed border-zinc-700 py-2"
            >
              <Text className="text-sm font-medium text-zinc-400">+ Add Set</Text>
            </Pressable>
          </View>
        ))}

        <Pressable
          onPress={handleFinish}
          disabled={isPending}
          className={`items-center rounded-2xl py-4 ${
            isPending ? 'bg-amber-500/50' : 'bg-amber-500 active:bg-amber-600'
          }`}
        >
          <Text className="text-lg font-bold text-zinc-950">
            {isPending ? 'Saving…' : 'Finish Session'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
