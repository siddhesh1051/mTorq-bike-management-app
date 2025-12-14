import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/80 justify-center items-center p-4">
        <View className="w-full max-w-sm bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden">
          {/* Icon Header */}
          <View className="items-center pt-6 pb-4">
            <View className="bg-amber-500/20 p-3 rounded-full">
              <AlertTriangle size={32} color="#f59e0b" />
            </View>
          </View>

          {/* Content */}
          <View className="px-6 pb-6">
            <Text className="text-white text-xl font-bold text-center mb-2">
              {title}
            </Text>
            <Text className="text-zinc-400 text-base text-center leading-6">
              {message}
            </Text>
          </View>

          {/* Actions */}
          <View className="flex-row border-t border-white/10">
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 py-4 items-center border-r border-white/10"
              activeOpacity={0.7}
            >
              <Text className="text-zinc-400 font-semibold text-base">
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              className="flex-1 py-4 items-center"
              activeOpacity={0.7}
            >
              <Text
                className={`font-bold text-base ${
                  confirmVariant === "danger" ? "text-red-500" : "text-cyan-400"
                }`}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};


