import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, BorderRadius, FontSize, FontWeight } from '@/constants/Theme';
import { getThemeColors } from '@/constants/Theme';
import CreateJobAlertModal from '@/components/CreateJobAlertModal';

interface JobAlertRow {
  id: string;
  alert_name: string;
  frequency: 'instant' | 'daily' | 'weekly';
  is_active: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  job_id: string;
  is_read: boolean;
  created_at: string;
}

export default function JobAlertsScreen() {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const [alerts, setAlerts] = useState<JobAlertRow[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Batch loading - 2 queries në 1 parallel request
  const loadAll = useCallback(async (uid = userId) => {
    if (!uid) return;
    try {
      const [alertsRes, notifsRes] = await Promise.all([
        supabase
          .from('job_alerts')
          .select('id, alert_name, frequency, is_active')
          .eq('user_id', uid)
          .order('created_at', { ascending: false }),
        supabase
          .from('job_notifications')
          .select('*')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      if (alertsRes.error) throw alertsRes.error;
      if (notifsRes.error) throw notifsRes.error;

      setAlerts(alertsRes.data || []);
      setNotifications(notifsRes.data || []);
    } catch (err: any) {
      console.error('Error loading data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const userData = await getCurrentUser();
      if (!userData?.user || !isMounted) return;
      setUserId(userData.user.id);
      loadAll(userData.user.id);
    })();

    return () => { isMounted = false; };
  }, []);

  // useMemo për unread count optimizim
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.is_read).length, 
    [notifications]
  );

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return;
    
    // Optimistic update
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, is_read: true } : n
    ));

    try {
      const { error } = await supabase
        .from('job_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking notification as read', err);
      // Reload në rast gabimi
      loadAll();
    }
  }, [userId, loadAll]);

  const toggleActive = useCallback(async (alertId: string, current: boolean) => {
    if (!userId) return;
    
    // Optimistic update me rollback
    const previousAlerts = alerts;
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_active: !current } : a));

    try {
      const { error } = await supabase
        .from('job_alerts')
        .update({ is_active: !current })
        .eq('id', alertId)
        .eq('user_id', userId);
      if (error) throw error;
    } catch (err) {
      // Rollback në rast gabimi
      setAlerts(previousAlerts);
      Alert.alert('Error', 'Nuk u përditësua statusi i alertit');
    }
  }, [userId, alerts]);

  const deleteAlert = useCallback(async (alertId: string) => {
    if (!userId) return;
    Alert.alert('Konfirmo', 'Fshij këtë alert?', [
      { text: 'Anulo', style: 'cancel' },
      {
        text: 'Fshij', style: 'destructive', onPress: async () => {
          // Optimistic delete
          const previousAlerts = alerts;
          setAlerts(prev => prev.filter(a => a.id !== alertId));

          try {
            const { error } = await supabase
              .from('job_alerts')
              .delete()
              .eq('id', alertId)
              .eq('user_id', userId);
            if (error) throw error;
          } catch (err) {
            // Rollback
            setAlerts(previousAlerts);
            Alert.alert('Error', 'Nuk u fshi alerti');
          }
        }
      }
    ]);
  }, [userId, alerts]);

  const handleSave = useCallback(async (alert: any) => {
    if (!userId) return;
    try {
      const payload = { ...alert, user_id: userId };
      const { data, error } = await supabase
        .from('job_alerts')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      setAlerts(prev => [data, ...prev]);
      setModalVisible(false);
    } catch (err) {
      Alert.alert('Error', 'Nuk u krijua alerti');
    }
  }, [userId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAll();
  }, [loadAll]);

  const renderItem = ({ item }: { item: JobAlertRow }) => (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.alert_name}</Text>
        <Switch value={item.is_active} onValueChange={() => toggleActive(item.id, item.is_active)} />
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.badge}>
          <Ionicons name="notifications" size={14} color={Colors.primary[500]} />
          <Text style={styles.badgeText}>{item.frequency}</Text>
        </View>
        <TouchableOpacity onPress={() => deleteAlert(item.id)}>
          <Ionicons name="trash" size={18} color={Colors.neutral?.[500] || '#6B7280'} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
        !item.is_read && styles.unreadNotification
      ]}
      onPress={() => {
        markAsRead(item.id);
        // Navigate to job details
        import('expo-router').then(({ router }) => {
          router.push(`/job-details/${item.job_id}` as any);
        });
      }}
    >
      <View style={styles.notificationHeader}>
        <Ionicons 
          name={item.is_read ? "notifications-outline" : "notifications"} 
          size={20} 
          color={item.is_read ? Colors.neutral?.[400] : Colors.primary[500]} 
        />
        <Text style={[styles.notificationTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        {!item.is_read && <View style={styles.unreadDot} />}
      </View>
      <Text style={[styles.notificationMessage, { color: colors.textSecondary }]} numberOfLines={2}>
        {item.message}
      </Text>
      <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
        {new Date(item.created_at).toLocaleDateString('sq-AL', { 
          day: 'numeric', 
          month: 'short', 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={alerts.length === 0 ? styles.emptyContainer : styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[500]} />
        }
        ListHeaderComponent={
          notifications.length > 0 ? (
            <View style={styles.notificationsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                🔔 Njoftime të Reja ({unreadCount})
              </Text>
              {notifications.map((notification) => (
                <View key={notification.id}>{renderNotification({ item: notification })}</View>
              ))}
              <View style={styles.divider} />
              <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>
                ⚙️ Job Alerts
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off" size={36} color={Colors.neutral?.[400] || '#9CA3AF'} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Asnjë alert</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Krijo alert për të marrë njoftime</Text>
            </View>
          )
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors.primary[500], shadowColor: Colors.primary[500] }]}
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Krijo Job Alert"
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <CreateJobAlertModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    flex: 1,
    marginRight: 8,
  },
  cardFooter: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    color: Colors.primary[600],
    fontWeight: FontWeight.medium,
    textTransform: 'capitalize',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  notificationsSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: 12,
  },
  notificationCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 12,
    marginBottom: 8,
  },
  unreadNotification: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary[500],
  },
  notificationMessage: {
    fontSize: FontSize.sm,
    marginBottom: 6,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: FontSize.xs,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
});
