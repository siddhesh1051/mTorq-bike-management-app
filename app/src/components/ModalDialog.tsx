import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { X } from 'lucide-react-native';

interface ModalDialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const ModalDialog = ({
  visible,
  onClose,
  title,
  description,
  children,
  footer,
}: ModalDialogProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 bg-black/80 justify-center items-center p-4">
          <View className="w-full max-w-lg bg-zinc-950/90 rounded-lg border border-white/10 overflow-hidden max-h-[85%]">
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-white/10">
              <View className="flex-1">
                <Text className="text-white text-xl font-semibold">{title}</Text>
                {description && (
                  <Text className="text-zinc-400 text-sm mt-1">{description}</Text>
                )}
              </View>
              <TouchableOpacity onPress={onClose} className="ml-4">
                <X color="#ccfbf1" size={24} />
              </TouchableOpacity>
            </View>
            
            {/* Scrollable Content */}
            <ScrollView 
              className="flex-shrink"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="p-4 pb-2">{children}</View>
            </ScrollView>
            
            {/* Fixed Footer */}
            {footer && (
              <View className="p-4 pt-2 border-t border-white/10 bg-zinc-950/90">
                {footer}
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
