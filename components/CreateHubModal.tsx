import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Modal, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, Hub } from '@/lib/constants';

interface CreateHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hub: Hub) => void;
}

const PRESET_COLORS = [
  { color: COLORS.blue, bgColor: COLORS.blueLight, borderColor: COLORS.blueBorder, glowColor: COLORS.blueGlow },
  { color: COLORS.purple, bgColor: COLORS.purpleLight, borderColor: COLORS.purpleBorder, glowColor: COLORS.purpleGlow },
  { color: COLORS.amber, bgColor: COLORS.amberLight, borderColor: COLORS.amberBorder, glowColor: COLORS.amberGlow },
  { color: COLORS.green, bgColor: COLORS.greenLight, borderColor: COLORS.greenBorder, glowColor: COLORS.greenGlow },
  { color: COLORS.red, bgColor: COLORS.redLight, borderColor: COLORS.redBorder, glowColor: COLORS.redGlow },
];

const PRESET_ICONS = ['list', 'folder', 'briefcase', 'book', 'star', 'hash', 'heart', 'coffee', 'target', 'monitor'];

export default function CreateHubModal({ isOpen, onClose, onSave }: CreateHubModalProps) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [iconName, setIconName] = useState(PRESET_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    
    const newHub: Hub = {
      id: `hub_${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || 'Custom List',
      iconName,
      color: selectedColor.color,
      bgColor: selectedColor.bgColor,
      borderColor: selectedColor.borderColor,
      accentColor: selectedColor.color,
      glowColor: selectedColor.glowColor,
    };
    onSave(newHub);
    
    // Reset
    setTitle('');
    setSubtitle('');
    setIconName(PRESET_ICONS[0]);
    setSelectedColor(PRESET_COLORS[0]);
    onClose();
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Buat List Baru</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={COLORS.textDim} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text style={styles.label}>Nama List</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                placeholder="Cari referensi, Belanja..."
                placeholderTextColor={COLORS.textDim}
                value={title}
                onChangeText={setTitle}
                autoFocus
              />
            </View>

            {/* Subtitle */}
            <Text style={styles.label}>Deskripsi Singkat (Opsional)</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                placeholder="Untuk keperluan skripsi"
                placeholderTextColor={COLORS.textDim}
                value={subtitle}
                onChangeText={setSubtitle}
              />
            </View>

            {/* Icon & Color Preview */}
            <View style={styles.previewBox}>
              <View style={[styles.previewIconWrap, { backgroundColor: selectedColor.bgColor, borderColor: selectedColor.borderColor }]}>
                <Feather name={iconName as any} size={24} color={selectedColor.color} />
              </View>
              <View>
                <Text style={styles.previewTitle}>{title || 'Nama List'}</Text>
                <Text style={styles.previewSubtitle}>{subtitle || 'Custom List'}</Text>
              </View>
            </View>

            {/* Color Picker */}
            <Text style={styles.label}>Warna Tema</Text>
            <View style={styles.pickerRow}>
              {PRESET_COLORS.map((c, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.colorOption, { backgroundColor: c.color }, selectedColor.color === c.color && styles.selectedRing]}
                  onPress={() => setSelectedColor(c)}
                >
                  {selectedColor.color === c.color && <Feather name="check" size={14} color="#fff" />}
                </TouchableOpacity>
              ))}
            </View>

            {/* Icon Picker */}
            <Text style={styles.label}>Pilih Ikon</Text>
            <View style={styles.iconGrid}>
              {PRESET_ICONS.map((icon, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.iconOption, iconName === icon && { backgroundColor: COLORS.bgSurface, borderColor: COLORS.amber }]}
                  onPress={() => setIconName(icon)}
                >
                  <Feather name={icon as any} size={20} color={iconName === icon ? COLORS.amber : COLORS.textDim} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, !title.trim() && { opacity: 0.5 }]} onPress={handleSave} disabled={!title.trim()}>
              <Text style={styles.saveBtnText}>Simpan List</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.8)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  modalContent: {
    width: '100%', maxWidth: 440, maxHeight: '90%',
    backgroundColor: COLORS.bgCard, borderRadius: 24,
    borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 24, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  closeBtn: { padding: 4 },
  form: { padding: 24 },
  label: { color: COLORS.textDim, fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  inputWrap: {
    backgroundColor: COLORS.bgInput, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderLight,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  input: { color: COLORS.white, fontSize: 15 },
  
  previewBox: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    padding: 16, backgroundColor: COLORS.bgInput, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border, marginTop: 16, borderStyle: 'dashed'
  },
  previewIconWrap: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  previewTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  previewSubtitle: { color: COLORS.textMuted, fontSize: 13 },

  pickerRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  colorOption: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  selectedRing: { borderWidth: 2, borderColor: COLORS.white },
  
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  iconOption: {
    width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: COLORS.borderLight,
  },

  footer: {
    flexDirection: 'row', padding: 24, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 12,
  },
  cancelBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: COLORS.bgSurface },
  cancelBtnText: { color: COLORS.white, fontWeight: '600' },
  saveBtn: { flex: 2, paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: COLORS.amber },
  saveBtnText: { color: COLORS.bg, fontWeight: '700' },
});
