// components/Sidebar.tsx
// Desktop-only sidebar navigation component

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, HUBS, Hub, Task, UserProfile } from '@/lib/constants';
import CreateHubModal from '@/components/CreateHubModal';

type ScreenName = 'auth' | 'onboarding' | 'dashboard' | 'hub' | 'profile';

interface SidebarProps {
  currentScreen: ScreenName;
  selectedHub: Hub | null;
  profile: UserProfile | null;
  tasks: Task[];
  onNavigate: (screen: ScreenName) => void;
  onSelectHub: (hub: Hub) => void;
  onLogout: () => void;
  onAddTask: () => void;
  allHubs: Hub[];
  onCreateHub: (hub: Hub) => void;
  userEmail?: string;
}

export default function Sidebar({
  currentScreen,
  selectedHub,
  profile,
  tasks,
  onNavigate,
  onSelectHub,
  onLogout,
  onAddTask,
  allHubs,
  onCreateHub,
  userEmail,
}: SidebarProps) {
  const [isHubModalOpen, setIsHubModalOpen] = React.useState(false);
  const pendingTasks = tasks.filter((t) => !t.isCompleted).length;

  const workspaces = React.useMemo(() => allHubs.filter(h => h.type !== 'checklist'), [allHubs]);
  const checklists = React.useMemo(() => allHubs.filter(h => h.type === 'checklist'), [allHubs]);

  return (
    <View style={styles.sidebar}>
      {/* Glow top accent */}
      <View style={styles.topGlow} />

      {/* Logo */}
      <View style={styles.logoSection}>
        <LinearGradient
          colors={[COLORS.amber, COLORS.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoBox}
        >
          <Feather name="briefcase" size={18} color={COLORS.white} />
        </LinearGradient>
        <View>
          <Text style={styles.logoTitle}>Hustler's Hub</Text>
          <Text style={styles.logoSub}>v2.0 · Smart Planner</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
        {/* Main Navigation */}
        <Text style={styles.navSectionLabel}>NAVIGASI</Text>

        <TouchableOpacity
          style={[
            styles.navItem,
            currentScreen === 'dashboard' && styles.navItemActive,
          ]}
          onPress={() => onNavigate('dashboard')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.navIconWrap,
              currentScreen === 'dashboard' && { backgroundColor: COLORS.amberGlow },
            ]}
          >
            <Feather
              name="grid"
              size={16}
              color={currentScreen === 'dashboard' ? COLORS.amber : COLORS.textDim}
            />
          </View>
          <Text
            style={[
              styles.navLabel,
              currentScreen === 'dashboard' && styles.navLabelActive,
            ]}
          >
            Dashboard
          </Text>
          {pendingTasks > 0 && (
            <View style={styles.navBadge}>
              <Text style={styles.navBadgeText}>{pendingTasks}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Hub Section */}
        <Text style={[styles.navSectionLabel, { marginTop: 20 }]}>WORKSPACES</Text>

        {workspaces.map((hub) => {
          const isActive = currentScreen === 'hub' && selectedHub?.id === hub.id;
          const hubTaskCount = tasks.filter(
            (t) => t.category === hub.id && !t.isCompleted
          ).length;

          return (
            <TouchableOpacity
              key={hub.id}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => onSelectHub(hub)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.navIconWrap,
                  isActive && { backgroundColor: hub.glowColor },
                ]}
              >
                <Feather
                  name={hub.iconName as any}
                  size={16}
                  color={isActive ? hub.color : COLORS.textDim}
                />
              </View>
              <View style={styles.navTextWrap}>
                <Text
                  style={[
                    styles.navLabel,
                    isActive && { color: hub.color },
                  ]}
                  numberOfLines={1}
                >
                  {hub.title}
                </Text>
                <Text style={styles.navSubLabel} numberOfLines={1}>
                  {hub.subtitle}
                </Text>
              </View>
              {hubTaskCount > 0 && (
                <View style={[styles.navBadge, { backgroundColor: hub.bgColor, borderColor: hub.borderColor }]}>
                  <Text style={[styles.navBadgeText, { color: hub.color }]}>
                    {hubTaskCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Checklist Section */}
        {checklists.length > 0 && (
          <>
            <Text style={[styles.navSectionLabel, { marginTop: 20 }]}>CHECKLIST</Text>
            {checklists.map((hub) => {
              const isActive = currentScreen === 'hub' && selectedHub?.id === hub.id;
              const hubTaskCount = tasks.filter(
                (t) => t.category === hub.id && !t.isCompleted
              ).length;

              return (
                <TouchableOpacity
                  key={hub.id}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => onSelectHub(hub)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.navIconWrap,
                      isActive && { backgroundColor: hub.glowColor },
                    ]}
                  >
                    <Feather
                      name={hub.iconName as any}
                      size={16}
                      color={isActive ? hub.color : COLORS.textDim}
                    />
                  </View>
                  <View style={styles.navTextWrap}>
                    <Text
                      style={[
                        styles.navLabel,
                        isActive && { color: hub.color },
                      ]}
                      numberOfLines={1}
                    >
                      {hub.title}
                    </Text>
                    <Text style={styles.navSubLabel} numberOfLines={1}>
                      {hub.subtitle}
                    </Text>
                  </View>
                  {hubTaskCount > 0 && (
                    <View style={[styles.navBadge, { backgroundColor: hub.bgColor, borderColor: hub.borderColor }]}>
                      <Text style={[styles.navBadgeText, { color: hub.color }]}>
                        {hubTaskCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* Quick Add Task */}
        <TouchableOpacity
          style={styles.quickAddButton}
          onPress={onAddTask}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={14} color={COLORS.amber} />
          <Text style={styles.quickAddText}>Tambah Tugas Cepat</Text>
        </TouchableOpacity>

        {/* Quick Add List */}
        <TouchableOpacity
          style={[styles.quickAddButton, { marginTop: 8, borderColor: COLORS.border, backgroundColor: 'transparent' }]}
          onPress={() => setIsHubModalOpen(true)}
          activeOpacity={0.8}
        >
          <Feather name="folder-plus" size={14} color={COLORS.textDim} />
          <Text style={[styles.quickAddText, { color: COLORS.textMuted }]}>Buat List Baru</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.divider} />

      {/* Bottom: Profile & Logout */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[
            styles.navItem,
            currentScreen === 'profile' && styles.navItemActive,
          ]}
          onPress={() => onNavigate('profile')}
          activeOpacity={0.7}
        >
          <View style={styles.avatarWrap}>
            <LinearGradient
              colors={[COLORS.purple, COLORS.blue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {(profile?.name?.[0] || 'H').toUpperCase()}
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.navTextWrap}>
            <Text style={styles.navLabel} numberOfLines={1}>
              {profile?.name || 'Hustler'}
            </Text>
            <Text style={styles.navSubLabel} numberOfLines={1}>
              {userEmail || 'Mode Tamu'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={onLogout}
          activeOpacity={0.7}
        >
          <Feather name="log-out" size={15} color={COLORS.textDim} />
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
      </View>

      <CreateHubModal
        isOpen={isHubModalOpen}
        onClose={() => setIsHubModalOpen(false)}
        onSave={(hub) => {
          onCreateHub(hub);
          setIsHubModalOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    height: '100%',
    backgroundColor: COLORS.bgSidebar,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  topGlow: {
    position: 'absolute',
    top: -60,
    left: -30,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.purpleGlow,
    opacity: 0.4,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  logoSub: {
    color: COLORS.textDim,
    fontSize: 10,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  navScroll: {
    flex: 1,
    marginVertical: 8,
  },
  navSectionLabel: {
    color: COLORS.textDim,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 2,
  },
  navItemActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
  },
  navIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  navTextWrap: {
    flex: 1,
  },
  navLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  navLabelActive: {
    color: COLORS.amber,
    fontWeight: '600',
  },
  navSubLabel: {
    color: COLORS.textDim,
    fontSize: 10,
    marginTop: 1,
  },
  navBadge: {
    backgroundColor: COLORS.amberLight,
    borderWidth: 1,
    borderColor: COLORS.amberBorder,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  navBadgeText: {
    color: COLORS.amber,
    fontSize: 10,
    fontWeight: '700',
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.amberBorder,
    borderStyle: 'dashed',
  },
  quickAddText: {
    color: COLORS.amber,
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSection: {
    paddingTop: 8,
    gap: 4,
  },
  avatarWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    overflow: 'hidden',
  },
  avatar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  logoutText: {
    color: COLORS.textDim,
    fontSize: 13,
  },
});
