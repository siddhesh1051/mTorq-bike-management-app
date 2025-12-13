import React, { ReactNode } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Card = ({ children, style }: CardProps) => {
  return (
    <View
      className="bg-zinc-950/70 rounded-lg border border-white/10 overflow-hidden"
      style={style}
    >
      {children}
    </View>
  );
};

export const CardHeader = ({ children, style }: CardProps) => {
  return (
    <View className="p-4 border-b border-white/5" style={style}>
      {children}
    </View>
  );
};

export const CardContent = ({ children, style }: CardProps) => {
  return (
    <View className="p-4" style={style}>
      {children}
    </View>
  );
};
