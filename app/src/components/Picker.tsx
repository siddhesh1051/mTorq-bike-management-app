import React, { useState, ReactNode } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ChevronDown, PlusCircle } from 'lucide-react-native';

interface PickerOption {
  label: string;
  value: string;
  isAction?: boolean; // For special action items like "Add New"
}

interface PickerProps {
  label?: string;
  placeholder?: string;
  value: string;
  options: PickerOption[];
  onValueChange: (value: string) => void;
}

export const Picker = ({
  label,
  placeholder,
  value,
  options,
  onValueChange,
}: PickerProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View className="mb-4">
      {label && <Text className="text-zinc-300 mb-2 text-sm">{label}</Text>}
      <TouchableOpacity
        className="h-12 bg-zinc-900/50 border border-white/10 rounded-lg px-4 flex-row justify-between items-center"
        onPress={() => setModalVisible(true)}
      >
        <Text className={selectedOption ? 'text-white' : 'text-zinc-500'}>
          {selectedOption?.label || placeholder || 'Select...'}
        </Text>
        <ChevronDown color="#71717a" size={20} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/80 justify-center items-center"
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View className="w-11/12 max-w-sm bg-zinc-900 rounded-lg border border-white/10 overflow-hidden">
            <ScrollView className="max-h-96">
              {options.map((option) => {
                const isActionItem = option.isAction || option.value.startsWith('__');
                return (
                  <TouchableOpacity
                    key={option.value}
                    className={`p-4 border-b border-white/5 ${
                      value === option.value ? 'bg-zinc-800' : ''
                    } ${isActionItem ? 'bg-teal-500/10 border-t border-teal-500/20' : ''}`}
                    onPress={() => {
                      onValueChange(option.value);
                      setModalVisible(false);
                    }}
                  >
                    <View className={isActionItem ? 'flex-row items-center' : ''}>
                      {isActionItem && (
                        <PlusCircle color="#5eead4" size={18} style={{ marginRight: 8 }} />
                      )}
                      <Text
                        className={`text-base ${
                          isActionItem
                            ? 'text-teal-400 font-semibold'
                            : value === option.value
                            ? 'text-primary font-semibold'
                            : 'text-white'
                        }`}
                      >
                        {isActionItem ? option.label.replace('+ ', '') : option.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
