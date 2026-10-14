import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors } from '@/theme/brand';

type Props = { data: number[]; height?: number };

/** Minimal area chart. Mint when the period is up, coral when down. */
export function PriceChart({ data, height = 200 }: Props) {
  const [width, setWidth] = useState(0);

  if (data.length < 2) return <View style={{ height }} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pad = 8;
  const x = (i: number) => (i / (data.length - 1)) * width;
  const y = (v: number) => pad + (1 - (v - min) / span) * (height - pad * 2);

  const line = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;
  const up = data[data.length - 1] >= data[0];
  const stroke = up ? colors.mint : colors.coral;

  return (
    <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={stroke} stopOpacity={0.25} />
              <Stop offset="1" stopColor={stroke} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={area} fill="url(#fill)" />
          <Path d={line} stroke={stroke} strokeWidth={2} fill="none" strokeLinejoin="round" />
        </Svg>
      )}
    </View>
  );
}
