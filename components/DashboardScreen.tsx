import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Svg, Path } from 'react-native-svg';
import { COLORS, HUBS, Hub, Task, UserProfile } from '@/lib/constants';

interface DashboardScreenProps {
  profile: UserProfile | null;
  tasks: Task[];
  stats: { completed: number; pending: number; total: number };
  onSelectHub: (hub: Hub) => void;
}

export default function DashboardScreen({ profile, tasks, stats, onSelectHub }: DashboardScreenProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Halo, {profile?.name || 'Hustler'} 👋</Text>
        <Text style={styles.headerSubtitle}>Pilih fokusmu hari ini.</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Hub Cards */}
        {HUBS.map((hub) => {
          const activeTasks = tasks.filter(
            (t) => t.category === hub.id && !t.isCompleted
          ).length;

          return (
            <TouchableOpacity
              key={hub.id}
              style={[
                styles.hubCard,
                { backgroundColor: hub.bgColor, borderColor: hub.borderColor },
              ]}
              onPress={() => onSelectHub(hub)}
              activeOpacity={0.7}
            >
              <View style={styles.hubCardLeft}>
                <View style={[styles.hubIconBox, { backgroundColor: 'rgba(2,6,23,0.5)' }]}>
                  <Feather
                    name={hub.iconName as any}
                    size={24}
                    color={hub.color}
                  />
                </View>
                <View>
                  <Text style={styles.hubTitle}>{hub.title}</Text>
                  <Text style={styles.hubSubtitle}>{activeTasks} Tugas Aktif</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.textDim} />
            </TouchableOpacity>
          );
        })}

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View>
            <Text style={styles.progressLabel}>Total Progress</Text>
            <View style={styles.progressNumbers}>
              <Text style={styles.progressCount}>{stats.completed}</Text>
              <Text style={styles.progressTotal}>/ {stats.total} Selesai</Text>
            </View>
          </View>

          <View style={styles.progressCircle}>
            <Svg width={48} height={48} viewBox="0 0 36 36" style={{ transform: [{ rotate: '-90deg' }] }}>
              {/* Background circle */}
              <Path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={COLORS.border}
                strokeWidth={3}
              />
              {/* Progress circle */}
              <Path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={COLORS.amber}
                strokeWidth={3}
                strokeDasharray={`${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}, 100`}
                strokeLinecap="round"
              />
            </Svg>
            <View style={styles.progressIconOverlay}>
              <Feather name="check-circle" size={16} color={COLORS.textMuted} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: COLORS.bgCard,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greeting: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 24,
    paddingBottom: 100,
    gap: 16,
  },
  hubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  hubCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  hubIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '600',
  },
  hubSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  progressCard: {
    marginTop: 16,
    padding: 20,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  progressNumbers: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    marginTop: 4,
  },
  progressCount: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '700',
  },
  progressTotal: {
    color: COLORS.textDim,
    fontSize: 14,
    marginBottom: 2,
  },
  progressCircle: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressIconOverlay: {
    position: 'absolute',
  },
});
