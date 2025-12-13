import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'outline' | 'danger';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Button = ({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...props
}: ButtonProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary rounded-full h-12 justify-center items-center';
      case 'outline':
        return 'border border-white/10 rounded-full h-12 justify-center items-center';
      case 'danger':
        return 'bg-red-500/20 border border-red-500/30 rounded-full h-12 justify-center items-center';
      default:
        return 'bg-primary rounded-full h-12 justify-center items-center';
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
        return 'text-primary-foreground font-semibold text-base';
      case 'outline':
        return 'text-zinc-300 font-semibold text-base';
      case 'danger':
        return 'text-red-400 font-semibold text-base';
      default:
        return 'text-primary-foreground font-semibold text-base';
    }
  };

  return (
    <TouchableOpacity
      className={getVariantStyles()}
      disabled={disabled || loading}
      style={[{ opacity: disabled || loading ? 0.5 : 1 }, style]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#115e59' : '#ccfbf1'} />
      ) : (
        <Text className={getTextStyles()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
