import React, { useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

export interface ScorePoint {
  label: string; // short x label, e.g. "5/11"
  value: number; // 1-10
}

interface ScoreLineChartProps {
  title: string;
  data: ScorePoint[]; // chronological order (oldest first)
  height?: number;
}

const Y_MIN = 1;
const Y_MAX = 10;
const PAD_LEFT = 26; // room for y-axis labels
const PAD_RIGHT = 10;
const PAD_TOP = 10;
const PAD_BOTTOM = 22; // room for x labels

// Line chart on a fixed 1-10 judging scale, drawn with react-native-svg
// primitives — no charting library needed for one series.
export function ScoreLineChart({ title, data, height = 180 }: ScoreLineChartProps) {
  const [width, setWidth] = useState(0);

  if (data.length === 0) return null;

  const plotW = width - PAD_LEFT - PAD_RIGHT;
  const plotH = height - PAD_TOP - PAD_BOTTOM;
  const x = (i: number) =>
    PAD_LEFT + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
  const y = (value: number) =>
    PAD_TOP + plotH - ((value - Y_MIN) / (Y_MAX - Y_MIN)) * plotH;

  const first = data[0].value;
  const last = data[data.length - 1].value;
  const delta = last - first;

  // Thin x labels when crowded: always show first and last
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));

  return (
    <View
      className="gap-2 rounded-2xl bg-zinc-900 p-4"
      onLayout={(e) => setWidth(e.nativeEvent.layout.width - 32)} // minus p-4
    >
      <View className="flex-row items-baseline justify-between">
        <Text className="text-base font-semibold text-zinc-50">{title}</Text>
        {data.length > 1 && (
          <Text
            className={`text-sm font-medium ${
              delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {delta >= 0 ? '+' : ''}
            {delta.toFixed(1)} since first
          </Text>
        )}
      </View>

      {width > 0 && (
        <Svg width={width} height={height}>
          {/* Gridlines + y labels at 2,4,6,8,10 */}
          {[2, 4, 6, 8, 10].map((tick) => (
            <React.Fragment key={tick}>
              <Line
                x1={PAD_LEFT}
                y1={y(tick)}
                x2={width - PAD_RIGHT}
                y2={y(tick)}
                stroke="#27272a"
                strokeWidth={1}
              />
              <SvgText
                x={PAD_LEFT - 8}
                y={y(tick) + 3}
                fontSize={9}
                fill="#71717a"
                textAnchor="end"
              >
                {tick}
              </SvgText>
            </React.Fragment>
          ))}

          {data.length > 1 && (
            <Polyline
              points={data.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {data.map((p, i) => (
            <Circle
              key={`${p.label}-${i}`}
              cx={x(i)}
              cy={y(p.value)}
              r={i === data.length - 1 ? 4.5 : 3}
              fill={i === data.length - 1 ? '#f59e0b' : '#a1a1aa'}
            />
          ))}

          {data.map((p, i) =>
            i % labelEvery === 0 || i === data.length - 1 ? (
              <SvgText
                key={`label-${p.label}-${i}`}
                x={x(i)}
                y={height - 6}
                fontSize={9}
                fill="#71717a"
                textAnchor="middle"
              >
                {p.label}
              </SvgText>
            ) : null,
          )}
        </Svg>
      )}
    </View>
  );
}
