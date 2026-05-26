// components/ProfileScreen.tsx
// Upgraded Profile Screen with stats, achievements, and responsive layout

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, HUBS, UserProfile } from '@/lib/constants';

interface ProfileScreenProps {
  profile: UserProfile | null;
  userId: string | undefined;
  userEmail: string;
  stats: { completed: number; pending: number; total: number };
  onLogout: () => void;
  onResetProfile: () => void;
}

function AchievementBadge({ icon, label, unlocked }: { icon: string; label: string; unlocked: boolean }) {
  return (
    <View style={[styles.badge, !unlocked && styles.badgeLocked]}>
      <View style={[styles.badgeIcon, { backgroundColor: unlocked ? COLORS.amberLight : COLORS.border }]}>
        <Feather name={icon as any} size={18} color={unlocked ? COLORS.amber : COLORS.textDim} />
      </View>
      <Text style={[styles.badgeLabel, !unlocked && { color: COLORS.textDim }]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

export default function ProfileScreen({
  profile, userId, userEmail, stats, onLogout, onResetProfile,
}: ProfileScreenProps) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 1024;

  const progressPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const initials = profile?.name ? profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : 'HH';

  const achievements = [
    { icon: 'star', label: 'First Task', unlocked: stats.total >= 1 },
    { icon: 'zap', label: 'Hustler', unlocked: stats.completed >= 5 },
    { icon: 'award', label: 'On Fire', unlocked: stats.completed >= 10 },
    { icon: 'shield', label: 'Consistent', unlocked: progressPct >= 50 },
    { icon: 'trending-up', label: 'Grinder', unlocked: stats.total >= 20 },
    { icon: 'check-circle', label: 'Perfectionist', unlocked: progressPct === 100 && stats.total > 0 },
  ];

  const contentInner = (
    <>
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <LinearGradient
          colors={[COLORS.purple, COLORS.blue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarCircle}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </LinearGradient>
        <Text style={styles.profileName} numberOfLines={2} adjustsFontSizeToFit>{profile?.name || 'Hustler'}</Text>
        <Text style={styles.profileId}>
          {userEmail || 'Mode Tamu'}
        </Text>
        <View style={styles.memberBadge}>
          <Feather name="zap" size={12} color={COLORS.amber} />
          <Text style={styles.memberBadgeText}>Hustler Member</Text>
        </View>
      </View>

      {/* Stats */}
      <Text style={styles.sectionTitle}>Statistik Kamu</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderColor: COLORS.greenBorder }]}>
          <LinearGradient colors={[COLORS.greenLight, 'transparent']} style={StyleSheet.absoluteFill} />
          <Text style={[styles.statNumber, { color: COLORS.green }]}>{stats.completed}</Text>
          <Text style={styles.statLabel}>DISELESAIKAN</Text>
        </View>
        <View style={[styles.statCard, { borderColor: COLORS.amberBorder }]}>
          <LinearGradient colors={[COLORS.amberLight, 'transparent']} style={StyleSheet.absoluteFill} />
          <Text style={[styles.statNumber, { color: COLORS.amber }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>SEDANG BERJALAN</Text>
        </View>
        <View style={[styles.statCard, { borderColor: COLORS.blueBorder }]}>
          <LinearGradient colors={[COLORS.blueLight, 'transparent']} style={StyleSheet.absoluteFill} />
          <Text style={[styles.statNumber, { color: COLORS.blue }]}>{progressPct}%</Text>
          <Text style={styles.statLabel}>COMPLETION RATE</Text>
        </View>
      </View>

      {/* Hub Breakdown */}
      <Text style={styles.sectionTitle}>Per Workspace</Text>
      <View style={styles.hubBreakdown}>
        {HUBS.map((hub) => (
          <View key={hub.id} style={[styles.hubBreakdownItem, { borderColor: hub.borderColor }]}>
            <View style={[styles.hubBreakdownIcon, { backgroundColor: hub.glowColor }]}>
              <Feather name={hub.iconName as any} size={16} color={hub.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.hubBreakdownTitle}>{hub.title}</Text>
              <Text style={styles.hubBreakdownSub}>{hub.subtitle}</Text>
            </View>
            <Text style={[styles.hubBreakdownCount, { color: hub.color }]}>
              {/* We'd need tasks here, but keeping it simpler */}–
            </Text>
          </View>
        ))}
      </View>

      {/* Achievements */}
      <Text style={styles.sectionTitle}>Achievements 🏆</Text>
      <View style={styles.badgeGrid}>
        {achievements.map((a) => (
          <AchievementBadge key={a.label} icon={a.icon} label={a.label} unlocked={a.unlocked} />
        ))}
      </View>

      {/* Actions */}
      <Text style={styles.sectionTitle}>Pengaturan</Text>
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionCard} onPress={onResetProfile} activeOpacity={0.7}>
          <View style={[styles.actionIcon, { backgroundColor: COLORS.blueLight }]}>
            <Feather name="refresh-cw" size={16} color={COLORS.blue} />
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Ulangi Onboarding</Text>
            <Text style={styles.actionSubtitle}>Reset nama dan preferensi awal</Text>
          </View>
          <Feather name="chevron-right" size={16} color={COLORS.textDim} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.7}>
          <Feather name="log-out" size={18} color={COLORS.red} />
          <Text style={styles.logoutText}>Keluar Akun</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <View style={isDesktop ? styles.desktopHeader : styles.header}>
        <Text style={styles.headerTitle}>Profil & Settings</Text>
      </View>
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentInner,
          isDesktop && styles.desktopContentInner,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isDesktop ? (
          <View style={styles.desktopCenterWrap}>
            {contentInner}
          </View>
        ) : contentInner}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    paddingTop: 56, paddingBottom: 20, paddingHorizontal: 24,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  desktopHeader: {
    paddingVertical: 24, paddingHorizontal: 32,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { color: COLORS.white, fontSize: 24, fontWeight: '700' },

  content: { flex: 1 },
  contentInner: { padding: 24, paddingBottom: 120 },
  desktopContentInner: { padding: 32, paddingBottom: 60 },
  desktopCenterWrap: { maxWidth: 680, width: '100%', alignSelf: 'center' },

  // Avatar
  avatarSection: { alignItems: 'center', paddingVertical: 24, marginBottom: 8 },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  avatarText: { color: COLORS.white, fontSize: 32, fontWeight: '800' },
  profileName: { color: COLORS.white, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  profileId: { color: COLORS.textDim, fontSize: 12, marginBottom: 12 },
  memberBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.amberLight, borderRadius: 20, borderWidth: 1,
    borderColor: COLORS.amberBorder, paddingHorizontal: 12, paddingVertical: 5,
  },
  memberBadgeText: { color: COLORS.amber, fontSize: 11, fontWeight: '700' },

  sectionTitle: {
    color: COLORS.white, fontSize: 16, fontWeight: '700',
    marginBottom: 12, marginTop: 20,
  },

  // Stats
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statCard: {
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 16,
    borderWidth: 1, padding: 16, alignItems: 'center', overflow: 'hidden',
  },
  statNumber: { fontSize: 26, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: COLORS.textDim, fontSize: 9, fontWeight: '700', letterSpacing: 0.8, textAlign: 'center' },

  // Hub Breakdown
  hubBreakdown: { gap: 8, marginBottom: 8 },
  hubBreakdownItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.bgCard, borderRadius: 12,
    borderWidth: 1, padding: 14,
  },
  hubBreakdownIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  hubBreakdownTitle: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  hubBreakdownSub: { color: COLORS.textDim, fontSize: 11, marginTop: 2 },
  hubBreakdownCount: { fontSize: 16, fontWeight: '700' },

  // Achievements
  badgeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8,
  },
  badge: { alignItems: 'center', width: '30%' },
  badgeLocked: { opacity: 0.4 },
  badgeIcon: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  badgeLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600', textAlign: 'center' },

  // Actions
  actionsSection: { gap: 10, marginBottom: 8 },
  actionCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, backgroundColor: COLORS.bgCard,
    borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, gap: 12,
  },
  actionIcon: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  actionText: { flex: 1 },
  actionTitle: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  actionSubtitle: { color: COLORS.textDim, fontSize: 12, marginTop: 2 },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, backgroundColor: COLORS.redLight, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.redBorder, gap: 8,
  },
  logoutText: { color: COLORS.red, fontSize: 15, fontWeight: '700' },
});
