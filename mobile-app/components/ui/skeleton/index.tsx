import React, { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';

interface SkeletonProps {
  className?: string;
  variant?: 'rounded' | 'sharp' | 'circular';
}

export const Skeleton = ({
  className,
  variant = 'rounded',
  ...props
}: SkeletonProps & React.ComponentPropsWithoutRef<typeof View>) => {
  const [pulseAnim] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const getVariantClass = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'sharp':
        return 'rounded-none';
      case 'rounded':
      default:
        return 'rounded-xl';
    }
  };

  return (
    <Animated.View
      style={{ opacity: pulseAnim }}
      className={`bg-background-200 ${getVariantClass()} ${className || ''}`}
      {...props}
    />
  );
};

interface SkeletonTextProps {
  className?: string;
  lines?: number;
}

export const SkeletonText = ({
  className,
  lines = 3,
  ...props
}: SkeletonTextProps & React.ComponentPropsWithoutRef<typeof View>) => {
  return (
    <View className={`gap-2 ${className || ''}`} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" variant="rounded" />
      ))}
    </View>
  );
};
