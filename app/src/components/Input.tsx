import React from "react";
import { TextInput, TextInputProps, View, Text } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, style, ...props }: InputProps) => {
  return (
    <View className="mb-4">
      {label && <Text className="text-zinc-300 mb-2 text-sm">{label}</Text>}
      <TextInput
        className="h-12 bg-zinc-900/50 border border-white/10 rounded-lg px-4 text-white focus:outline-none focus:border-[#115e59]"
        placeholderTextColor="#71717a"
        style={style}
        {...props}
      />
      {error && <Text className="text-red-400 text-xs mt-1">{error}</Text>}
    </View>
  );
};
