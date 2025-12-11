import React, { useEffect, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, router } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { getCurrentUser } from '@/lib/auth';
import { supabase, UserRole } from '@/lib/supabase';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUserRole();
  }, []);

  useEffect(() => {
    if (userRole === 'job_seeker') {
      loadUnreadNotifications();
      
      // Set up real-time subscription for notifications
      // Note: If you get pg_net errors, this can be disabled temporarily
      const channel = supabase
        .channel('notifications')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'job_notifications' 
          }, 
          () => {
            loadUnreadNotifications();
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIPTION_ERROR') {
            console.error('Realtime subscription error - notifications will use polling instead');
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userRole]);

  const loadUserRole = async () => {
    try {
      const userData = await getCurrentUser();
      if (userData?.profile) {
        setUserRole(userData.profile.role as UserRole);
      } else {
        router.replace('/(auth)/login');
      }
    } catch (error) {
      // Auth session missing is expected when not logged in
      router.replace('/(auth)/login');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadNotifications = async () => {
    try {
      const userData = await getCurrentUser();
      if (!userData?.user) return;

      const { count, error } = await supabase
        .from('job_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.user.id)
        .eq('is_read', false);

      if (!error) {
        setUnreadCount(count || 0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (userRole === 'employer') {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#0ea5e9',
          headerShown: true,
        }}>
        <Tabs.Screen
          name="my-jobs"
          options={{
            title: 'Të gjitha Punët',
            tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
          }}
        />
        <Tabs.Screen
          name="posted-jobs"
          options={{
            title: 'Punët e Mia',
            tabBarIcon: ({ color }) => <TabBarIcon name="briefcase" color={color} />,
          }}
        />
        <Tabs.Screen
          name="post-job"
          options={{
            title: 'Posto Punë',
            tabBarIcon: ({ color }) => <TabBarIcon name="plus-circle" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profili',
            tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          }}
        />
        {/* Hide unused screens */}
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="two" options={{ href: null }} />
        <Tabs.Screen name="feed" options={{ href: null }} />
        <Tabs.Screen name="my-applications" options={{ href: null }} />
        <Tabs.Screen name="job-alerts" options={{ href: null }} />
      </Tabs>
    );
  }

  // Job Seeker tabs
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0ea5e9',
        headerShown: true,
      }}>
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Punë',
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-applications"
        options={{
          title: 'Aplikimet',
          tabBarIcon: ({ color }) => <TabBarIcon name="file-text" color={color} />,
        }}
      />
      <Tabs.Screen
        name="job-alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <TabBarIcon name="bell" color={color} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profili',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
      {/* Hide unused screens */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="two" options={{ href: null }} />
      <Tabs.Screen name="my-jobs" options={{ href: null }} />
      <Tabs.Screen name="post-job" options={{ href: null }} />
      <Tabs.Screen name="posted-jobs" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
