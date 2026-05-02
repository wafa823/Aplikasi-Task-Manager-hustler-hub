import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, HUBS, Task } from '@/lib/constants';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask: Task | null;
  selectedHubId: string | undefined;
  onSaveTask: (data: { title: string; category: string; deadline: string }) => void;
}

export default function TaskModal({
  isOpen,
  onClose,
  editingTask,
  selectedHubId,
  onSaveTask,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(editingTask?.title || '');
      setCategory(editingTask?.category || selectedHubId || HUBS[0].id);
      setDeadline(
        editingTask?.deadline || new Date().toISOString().split('T')[0]
      );
    }
  }, [isOpen, editingTask, selectedHubId]);

  const handleSubmit = () => {
    if (!title.trim() || !deadline) return;
    onSaveTask({ title, category, deadline });
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.overlayBg} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {editingTask ? 'Edit Tugas' : 'Tambah Tugas'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Task Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>NAMA TUGAS</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Mengerjakan laporan..."
                placeholderTextColor={COLORS.textDim}
                autoFocus
              />
            </View>

            {/* Category */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>HUB (KATEGORI)</Text>
              <View style={styles.categoryGrid}>
                {HUBS.map((hub) => {
                  const isSelected = category === hub.id;
                  return (
                    <TouchableOpacity
                      key={hub.id}
                      style={[
                        styles.categoryButton,
                        {
                          backgroundColor: isSelected ? hub.bgColor : COLORS.bgInput,
                          borderColor: isSelected ? hub.color : COLORS.border,
                        },
                      ]}
                      onPress={() => setCategory(hub.id)}
                      activeOpacity={0.7}
                    >
                      <Feather
                        name={hub.iconName as any}
                        size={18}
                        color={isSelected ? hub.color : COLORS.textDim}
                      />
                      <Text
                        style={[
                          styles.categoryText,
                          { color: isSelected ? hub.color : COLORS.textDim },
                        ]}
                        numberOfLines={1}
                      >
                        {hub.id}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Deadline */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>TENGGAT WAKTU</Text>
              <TextInput
                style={styles.input}
                value={deadline}
                onChangeText={setDeadline}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.textDim}
                keyboardType="default"
              />
              <Text style={styles.dateHint}>
                Format: YYYY-MM-DD (contoh: 2026-05-15)
              </Text>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!title.trim() || !deadline) && styles.submitDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!title.trim() || !deadline}
              activeOpacity={0.8}
            >
              <Text style={styles.submitText}>
                {editingTask ? 'Simpan Perubahan' : 'Buat Tugas'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,6,23,0.8)',
  },
  sheet: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: COLORS.borderLight,
    maxHeight: '85%',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.borderLight,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    padding: 14,
    color: COLORS.white,
    fontSize: 15,
  },
  dateHint: {
    color: COLORS.textDim,
    fontSize: 11,
    marginTop: 6,
    marginLeft: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: COLORS.bg,
    fontWeight: '700',
    fontSize: 15,
  },
});
