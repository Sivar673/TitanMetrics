import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useEvaluatePhysique } from '@/hooks/useEvaluatePhysique';
import { FeedbackList } from '@/components/ai/FeedbackList';
import { EvaluationHistoryView } from '@/components/ai/EvaluationHistoryView';
import { ApiError } from '@/api/client';
import type { PhysiqueEvaluationResponse, PoseImage, PoseName } from '@/types/api';

const POSES: { key: PoseName; label: string; hint: string }[] = [
  { key: 'front', label: 'Front', hint: 'Relaxed front, arms at sides' },
  { key: 'side', label: 'Side', hint: 'Side profile, natural stance' },
  { key: 'back', label: 'Back', hint: 'Back double — show the taper' },
];

type PoseMap = Partial<Record<PoseName, PoseImage>>;

function toPoseImage(asset: ImagePicker.ImagePickerAsset, pose: PoseName): PoseImage {
  return {
    uri: asset.uri,
    mimeType: asset.mimeType ?? 'image/jpeg',
    fileName: asset.fileName ?? `${pose}.jpg`,
  };
}

// ---- Pose capture grid ----

interface PoseSlotProps {
  label: string;
  hint: string;
  image: PoseImage | undefined;
  onPick: () => void;
  onCamera: () => void;
}

function PoseSlot({ label, hint, image, onPick, onCamera }: PoseSlotProps) {
  return (
    <Pressable
      onPress={onPick}
      onLongPress={onCamera}
      className="flex-1 items-center gap-1.5"
    >
      <View
        className={`aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-2xl ${
          image ? 'bg-zinc-800' : 'border border-dashed border-zinc-700 bg-zinc-900'
        }`}
      >
        {image ? (
          <Image source={{ uri: image.uri }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <Ionicons name="add" size={28} color="#71717a" />
        )}
      </View>
      <Text className="text-sm font-semibold text-zinc-200">{label}</Text>
      <Text className="text-center text-[10px] leading-3 text-zinc-500">{hint}</Text>
    </Pressable>
  );
}

// ---- Result rendering ----

function ScoreBadge({ score }: { score: number }) {
  return (
    <View className="items-center gap-1 rounded-2xl bg-zinc-900 p-5">
      <Text className="text-sm uppercase tracking-wide text-zinc-500">Package Score</Text>
      <Text className="text-6xl font-bold text-amber-400">{score}</Text>
      <Text className="text-sm text-zinc-500">out of 10</Text>
    </View>
  );
}

function EvaluationResult({
  result,
  onReset,
}: {
  result: PhysiqueEvaluationResponse;
  onReset: () => void;
}) {
  return (
    <View className="gap-4">
      {!result.is_valid_submission && (
        <View className="gap-1 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
          <Text className="font-semibold text-rose-300">Couldn't judge these photos</Text>
          <Text className="text-sm text-rose-200/80">
            {result.validity_notes ?? 'Retake the three poses and try again.'}
          </Text>
        </View>
      )}

      {result.is_valid_submission && <ScoreBadge score={result.overall_score} />}

      <FeedbackList
        title="Strengths"
        items={result.strengths}
        icon="checkmark-circle"
        iconColor="#34d399"
      />
      <FeedbackList
        title="Weaknesses"
        items={result.weaknesses}
        icon="alert-circle"
        iconColor="#fb7185"
      />
      <FeedbackList
        title="Training Adjustments"
        items={result.training_adjustments}
        icon="barbell"
        iconColor="#f59e0b"
      />

      <Pressable
        onPress={onReset}
        className="items-center rounded-2xl bg-zinc-800 py-4 active:bg-zinc-700"
      >
        <Text className="text-lg font-bold text-zinc-50">New Evaluation</Text>
      </Pressable>
    </View>
  );
}

// ---- Evaluate flow ----

function SubmissionError({ error }: { error: Error }) {
  const isRateLimit = error instanceof ApiError && error.status === 429;
  return (
    <View
      className={`gap-1 rounded-2xl border p-4 ${
        isRateLimit ? 'border-amber-500/30 bg-amber-500/10' : 'border-rose-500/30 bg-rose-500/10'
      }`}
    >
      <Text className={`font-semibold ${isRateLimit ? 'text-amber-300' : 'text-rose-300'}`}>
        {isRateLimit ? 'Daily limit reached' : 'Evaluation failed'}
      </Text>
      <Text className={`text-sm ${isRateLimit ? 'text-amber-200/80' : 'text-rose-200/80'}`}>
        {error.message}
      </Text>
    </View>
  );
}

function EvaluateView() {
  const [images, setImages] = useState<PoseMap>({});
  const { mutate, data, error, isPending, reset } = useEvaluatePhysique();

  const pickImage = async (pose: PoseName, useCamera: boolean) => {
    if (useCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return;
    }
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setImages((prev) => ({ ...prev, [pose]: toPoseImage(result.assets[0], pose) }));
    }
  };

  const allPosesSet = POSES.every(({ key }) => images[key] !== undefined);

  const handleReset = () => {
    reset();
    setImages({});
  };

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-zinc-950 px-8">
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text className="text-lg font-semibold text-zinc-50">Judging your physique…</Text>
        <Text className="text-center text-sm text-zinc-500">
          The AI is scoring structure, muscularity, conditioning, and symmetry
          against Men's Physique criteria. This can take up to a minute.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerClassName="gap-5 p-4 pb-12">
      {data ? (
        <EvaluationResult result={data} onReset={handleReset} />
      ) : (
        <>
          <Text className="text-sm leading-5 text-zinc-400">
            Upload your three mandatory poses and get judged feedback based on
            Men's Physique standards. Tap a slot to choose a photo; long-press
            to use the camera.
          </Text>

          <View className="flex-row gap-3">
            {POSES.map(({ key, label, hint }) => (
              <PoseSlot
                key={key}
                label={label}
                hint={hint}
                image={images[key]}
                onPick={() => pickImage(key, false)}
                onCamera={() => pickImage(key, true)}
              />
            ))}
          </View>

          {error && <SubmissionError error={error} />}

          <Pressable
            onPress={() => allPosesSet && mutate(images as Record<PoseName, PoseImage>)}
            disabled={!allPosesSet}
            className={`items-center rounded-2xl py-4 ${
              allPosesSet ? 'bg-amber-500 active:bg-amber-600' : 'bg-zinc-800'
            }`}
          >
            <Text
              className={`text-lg font-bold ${allPosesSet ? 'text-zinc-950' : 'text-zinc-500'}`}
            >
              {allPosesSet ? 'Get My Evaluation' : 'Add all three poses'}
            </Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

// ---- Screen: Evaluate | History ----

type Mode = 'evaluate' | 'history';

export default function AICoachScreen() {
  const [mode, setMode] = useState<Mode>('evaluate');

  return (
    <View className="flex-1 bg-zinc-950">
      <View className="flex-row gap-2 p-4 pb-2">
        {(['evaluate', 'history'] as Mode[]).map((m) => (
          <Pressable
            key={m}
            onPress={() => setMode(m)}
            className={`flex-1 items-center rounded-xl py-2.5 ${
              mode === m ? 'bg-zinc-800' : 'bg-zinc-900'
            }`}
          >
            <Text
              className={`font-semibold capitalize ${
                mode === m ? 'text-amber-400' : 'text-zinc-500'
              }`}
            >
              {m}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode === 'evaluate' ? <EvaluateView /> : <EvaluationHistoryView />}
    </View>
  );
}
