// components/TaskModal.tsx
// Upgraded Task Modal — Center dialog (desktop) / Bottom sheet (mobile)
// Now includes: Priority selector, Quick Notes field

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
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, HUBS, Task, Priority, PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/constants';

const getToday = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask: Task | null;
  selectedHubId: string | undefined;
  onSaveTask: (data: { title: string; notes: string; category: string; deadline: string; priority: Priority }) => void;
}

export default function TaskModal({
  isOpen, onClose, editingTask, selectedHubId, onSaveTask,
}: TaskModalProps) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (isOpen) {
      setTitle(editingTask?.title || '');
      setNotes(editingTask?.notes || '');
      setCategory(editingTask?.category || selectedHubId || HUBS[0].id);
      
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      const localNow = now.toISOString().slice(0, 16); // format: YYYY-MM-DDTHH:mm
      
      let initialDeadline = editingTask?.deadline || localNow;
      // If it only has date (YYYY-MM-DD), append time so datetime-local accepts it
      if (initialDeadline.length === 10) {
        initialDeadline += 'T12:00';
      }
      setDeadline(initialDeadline);
      
      setPriority((editingTask?.priority as Priority) || 'medium');
    }
  }, [isOpen, editingTask, selectedHubId]);

  const handleSubmit = () => {
    if (!title.trim() || !deadline) return;
    onSaveTask({ title: title.trim(), notes: notes.trim(), category, deadline, priority });
  };

  const canSubmit = title.trim().length > 0 && deadline.length > 0;

  const formContent = (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Task Name */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>NAMA TUGAS *</Text>
        <TextInput
          style={[styles.input, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
          value={title}
          onChangeText={setTitle}
          placeholder="Apa yang ingin kamu selesaikan?"
          placeholderTextColor={COLORS.textDim}
          autoFocus
          multiline={false}
        />
      </View>

      {/* Quick Notes */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>CATATAN CEPAT (opsional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Tambah konteks, link, atau detail..."
          placeholderTextColor={COLORS.textDim}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Priority */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>PRIORITAS</Text>
        <View style={styles.priorityRow}>
          {(['low', 'medium', 'high'] as Priority[]).map((p) => {
            const isSelected = priority === p;
            return (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityButton,
                  {
                    backgroundColor: isSelected ? `${PRIORITY_COLORS[p]}18` : COLORS.bgCard,
                    borderColor: isSelected ? PRIORITY_COLORS[p] : COLORS.border,
                  },
                ]}
                onPress={() => setPriority(p)}
                activeOpacity={0.7}
              >
                <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[p] }]} />
                <Text style={[styles.priorityLabel, { color: isSelected ? PRIORITY_COLORS[p] : COLORS.textMuted }]}>
                  {PRIORITY_LABELS[p]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
                <Feather name={hub.iconName as any} size={16} color={isSelected ? hub.color : COLORS.textDim} />
                <Text style={[styles.categoryText, { color: isSelected ? hub.color : COLORS.textDim }]} numberOfLines={1}>
                  {hub.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Deadline */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>TENGGAT WAKTU *</Text>
        <TouchableOpacity 
          style={styles.dateDisplayBtn} 
          onPress={() => setShowCalendar(!showCalendar)}
          activeOpacity={0.8}
        >
          <Feather name="calendar" size={18} color={COLORS.amber} />
          <Text style={[styles.dateDisplayText, !deadline && { color: COLORS.textDim }]}>
            {deadline ? new Date(deadline).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Pilih tanggal di kalender'}
          </Text>
        </TouchableOpacity>

        {showCalendar && (
          <View style={styles.superCalendar}>
            {/* Calendar Header */}
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarMonth}>
                {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </Text>
              <View style={styles.calendarArrows}>
                <TouchableOpacity style={styles.calendarArrowBtn} onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
                  <Feather name="chevron-left" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.calendarArrowBtn} onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
                  <Feather name="chevron-right" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarDaysRow}>
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, i) => (
                <Text key={i} style={styles.calendarDayHeader}>{d}</Text>
              ))}
            </View>
            {(() => {
              const year = currentMonth.getFullYear();
              const month = currentMonth.getMonth();
              const firstDay = new Date(year, month, 1).getDay();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const days: (number | null)[] = [];
              for (let i = 0; i < firstDay; i++) days.push(null);
              for (let i = 1; i <= daysInMonth; i++) days.push(i);
              
              const weeks: (number | null)[][] = [];
              let currentWeek: (number | null)[] = [];
              days.forEach((day, index) => {
                currentWeek.push(day);
                if ((index + 1) % 7 === 0 || index === days.length - 1) {
                  weeks.push(currentWeek);
                  currentWeek = [];
                }
              });

              return weeks.map((week: (number | null)[], wIndex: number) => (
                <View key={wIndex} style={styles.calendarWeekRow}>
                  {week.map((day: number | null, dIndex: number) => {
                    if (!day) return <View key={dIndex} style={styles.calendarDayCellEmpty} />;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00`;
                    const isSelected = deadline.startsWith(dateStr.slice(0, 10));
                    return (
                      <TouchableOpacity 
                        key={dIndex} 
                        style={[styles.calendarDayCell, isSelected && styles.calendarDaySelected]}
                        onPress={() => { setDeadline(dateStr); }}
                      >
                        <Text style={[styles.calendarDayNumber, isSelected && styles.calendarDayNumberSelected]}>{day}</Text>
                      </TouchableOpacity>
                    );
                  })}
                  {Array.from({length: 7 - week.length}).map((_, i) => <View key={`pad-${i}`} style={styles.calendarDayCellEmpty} />)}
                </View>
              ));
            })()}

            <View style={styles.superDivider} />
            
            {/* Time Picker */}
            <View style={styles.superTimeRow}>
              <View style={styles.superTimeLabel}>
                <Feather name="clock" size={16} color={COLORS.textDim} />
                <Text style={styles.superMenuText}>Waktu</Text>
              </View>
              <View style={styles.superTimeInputs}>
                <TextInput
                  style={[styles.superTimeInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                  value={deadline.includes('T') ? deadline.split('T')[1].split(':')[0] : '12'}
                  onChangeText={(hh) => {
                    let d = deadline || getToday();
                    if(!d.includes('T')) d += 'T12:00';
                    const parts = d.split('T');
                    const [_, m] = parts[1].split(':');
                    setDeadline(`${parts[0]}T${hh.replace(/[^0-9]/g, '')}:${m}`);
                  }}
                  onBlur={() => {
                    if (deadline.includes('T')) {
                      const parts = deadline.split('T');
                      let [h, m] = parts[1].split(':');
                      if (h === '') h = '00';
                      setDeadline(`${parts[0]}T${h.padStart(2, '0')}:${m}`);
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={{color: COLORS.white, fontWeight: 'bold'}}>:</Text>
                <TextInput
                  style={[styles.superTimeInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                  value={deadline.includes('T') ? deadline.split('T')[1].split(':')[1] : '00'}
                  onChangeText={(mm) => {
                    let d = deadline || getToday();
                    if(!d.includes('T')) d += 'T12:00';
                    const parts = d.split('T');
                    const [h, _] = parts[1].split(':');
                    setDeadline(`${parts[0]}T${h}:${mm.replace(/[^0-9]/g, '')}`);
                  }}
                  onBlur={() => {
                    if (deadline.includes('T')) {
                      const parts = deadline.split('T');
                      let [h, m] = parts[1].split(':');
                      if (m === '') m = '00';
                      setDeadline(`${parts[0]}T${h}:${m.padStart(2, '0')}`);
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
            </View>

            <View style={styles.superDivider} />
            
            {/* Bottom Actions */}
            <View style={styles.superBottomRow}>
              <TouchableOpacity style={styles.superBottomBtn} onPress={() => setDeadline('')}>
                <Text style={styles.superBottomBtnText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.superBottomBtn, styles.superBottomBtnPrimary]} onPress={() => setShowCalendar(false)}>
                <Text style={[styles.superBottomBtnText, {color: COLORS.white}]}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitButton, !canSubmit && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
        activeOpacity={0.8}
      >
        <Feather name={editingTask ? 'save' : 'plus-circle'} size={18} color={COLORS.bg} />
        <Text style={styles.submitText}>
          {editingTask ? 'Simpan Perubahan' : 'Buat Tugas'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (isDesktop) {
    // Center dialog for desktop
    return (
      <Modal visible={isOpen} animationType="fade" transparent statusBarTranslucent>
        <View style={styles.desktopOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
          <View style={styles.desktopDialog}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {editingTask ? '✏️ Edit Tugas' : '✨ Tugas Baru'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Feather name="x" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            {formContent}
          </View>
        </View>
      </Modal>
    );
  }

  // Bottom Sheet for mobile
  return (
    <Modal visible={isOpen} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableOpacity style={styles.overlayBg} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handleBar} />
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {editingTask ? '✏️ Edit Tugas' : '✨ Tugas Baru'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          {formContent}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Desktop center dialog
  desktopOverlay: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(2,6,23,0.85)',
  },
  desktopDialog: {
    width: '100%', maxWidth: 520,
    backgroundColor: COLORS.bgCard,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    maxHeight: '90%',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
  },

  // Mobile bottom sheet
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(2,6,23,0.85)' },
  sheet: {
    width: '100%', maxWidth: 480,
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40,
    borderTopWidth: 1, borderColor: COLORS.borderLight,
    maxHeight: '90%',
  },
  handleBar: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.borderLight, alignSelf: 'center', marginBottom: 16,
  },

  // Shared
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: '700' },
  closeButton: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },

  formGroup: { marginBottom: 20 },
  label: {
    color: COLORS.textDim, fontSize: 10, fontWeight: '700',
    letterSpacing: 1.2, marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.bgInput,
    borderWidth: 1, borderColor: COLORS.borderLight,
    borderRadius: 12, padding: 14,
    color: COLORS.white, fontSize: 15,
  },
  notesInput: { minHeight: 80, paddingTop: 14 },
  dateHint: { color: COLORS.textDim, fontSize: 11, marginTop: 6, marginLeft: 2 },

  dateDisplayBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgInput,
    borderWidth: 1, borderColor: COLORS.borderLight, borderRadius: 12, padding: 14,
  },
  dateDisplayText: { flex: 1, color: COLORS.white, fontSize: 15, marginLeft: 10 },

  // Superlist Calendar Styles
  superCalendar: {
    marginTop: 12, backgroundColor: '#1A1D24', borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.borderLight, paddingVertical: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  superMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, gap: 12 },
  superMenuText: { color: COLORS.white, fontSize: 14, fontWeight: '500' },
  superDivider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: 8 },
  
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  calendarMonth: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  calendarArrows: { flexDirection: 'row', gap: 16 },
  calendarArrowBtn: { padding: 4 },
  
  calendarDaysRow: { flexDirection: 'row', paddingHorizontal: 8, marginBottom: 8 },
  calendarDayHeader: { flex: 1, textAlign: 'center', color: COLORS.textDim, fontSize: 12, fontWeight: '600' },
  calendarWeekRow: { flexDirection: 'row', paddingHorizontal: 8, marginBottom: 4 },
  calendarDayCellEmpty: { flex: 1, aspectRatio: 1 },
  calendarDayCell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 100 },
  calendarDaySelected: { backgroundColor: '#F0503D' }, // Superlist Red/Orange
  calendarDayNumber: { color: COLORS.text, fontSize: 13 },
  calendarDayNumberSelected: { color: COLORS.white, fontWeight: '700' },

  superTimeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 4 },
  superTimeLabel: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  superTimeInputs: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  superTimeInput: { backgroundColor: COLORS.bgInput, color: COLORS.white, fontSize: 13, padding: 6, borderRadius: 6, textAlign: 'center', minWidth: 32 },

  superBottomRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 4, gap: 12 },
  superBottomBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 100, backgroundColor: COLORS.bgSurface },
  superBottomBtnPrimary: { backgroundColor: '#F0503D' },
  superBottomBtnText: { color: COLORS.textDim, fontSize: 13, fontWeight: '600' },

  priorityRow: { flexDirection: 'row', gap: 8 },
  priorityButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12,
  },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityLabel: { fontSize: 13, fontWeight: '600' },

  categoryGrid: { flexDirection: 'row', gap: 8 },
  categoryButton: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderRadius: 12, borderWidth: 1, gap: 6,
  },
  categoryText: { fontSize: 10, fontWeight: '600' },

  submitButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.amber, borderRadius: 14,
    paddingVertical: 16, marginTop: 8,
  },
  submitDisabled: { opacity: 0.4 },
  submitText: { color: COLORS.bg, fontWeight: '700', fontSize: 15 },
});
