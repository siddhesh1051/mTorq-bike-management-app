import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';

interface ModalDialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export const ModalDialog = ({
  visible,
  onClose,
  title,
  description,
  children,
}: ModalDialogProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/80 justify-center items-center p-4">
        <View className="w-full max-w-lg bg-zinc-950/90 rounded-lg border border-white/10 overflow-hidden">
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
          <ScrollView className="max-h-96">
            <View className="p-4">{children}</View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
