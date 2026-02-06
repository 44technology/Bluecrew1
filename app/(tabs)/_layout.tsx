import React, { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { Building2, Users, UserCheck, User, FileText, Clock, CheckCircle, UserCog, Database, Receipt, Briefcase, Shield, DollarSign, TrendingUp, Package, CreditCard } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import TopNavigationBar from '@/components/TopNavigationBar';
import { PermissionService } from '@/services/permissionService';

export default function TabLayout() {
  const { userRole } = useAuth();
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);
  const [isWebDesktop, setIsWebDesktop] = useState(false);
  const [pageAccess, setPageAccess] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Check if device is mobile (native or mobile web)
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      setIsMobile(true);
      setIsWebDesktop(false);
      return;
    }
    
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Check screen width
      const isMobileWidth = window.innerWidth <= 768;
      
      // Check user agent for mobile devices
      const userAgent = window.navigator.userAgent || '';
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      const mobile = isMobileWidth || isMobileUA;
      setIsMobile(mobile);
      setIsWebDesktop(!mobile);
      
      // Listen for resize events
      const handleResize = () => {
        if (typeof window !== 'undefined') {
          const mobileWidth = window.innerWidth <= 768;
          const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            window.navigator.userAgent || ''
          );
          const mobile = mobileWidth || mobileUA;
          setIsMobile(mobile);
          setIsWebDesktop(!mobile);
        }
      };
      
      window.addEventListener('resize', handleResize);
      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('resize', handleResize);
        }
      };
    }
  }, []);

  // Load permissions from Firebase
  useEffect(() => {
    const loadPageAccess = async () => {
      if (!userRole) return;
      
      const pages = [
        'projects', 'team', 'hr', 'payroll', 'commission', 'leads', 'clients', 
        'sales-report', 'time-clock', 'project-approval', 'proposals', 'invoices', 
        'tracking', 'expenses', 'reports', 'permissions', 'settings'
      ];
      
      const access: Record<string, boolean> = {};
      for (const page of pages) {
        const hasAccess = await PermissionService.hasPageAccess(page, userRole as any);
        access[page] = hasAccess;
      }
      
      setPageAccess(access);
    };
    
    loadPageAccess();
  }, [userRole]);
  
  return (
    <View style={{ flex: 1 }}>
      {isWebDesktop && <TopNavigationBar />}
      <View style={isWebDesktop ? { flex: 1, paddingTop: 65 } : { flex: 1 }}>
        <Tabs
        screenOptions={{
          headerShown: false,
          // Hide tab bar on mobile (use hamburger menu instead) and desktop web (use TopNavigationBar)
          // Only show on non-mobile web
          tabBarStyle: (isMobile || isWebDesktop) ? { 
            display: 'none',
            height: 0,
            overflow: 'hidden',
          } : {
            backgroundColor: '#ffffff',
            borderTopColor: '#17171720',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            paddingHorizontal: 0,
            zIndex: 999,
            elevation: 8,
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarActiveTintColor: '#000000',
          tabBarInactiveTintColor: '#000000',
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
          tabBarItemStyle: {
            paddingVertical: 4,
            minHeight: 50,
          },
        }}>
      {/* 1) Projects - Admin, PM, Sales can view (Client cannot see Projects menu) */}
      <Tabs.Screen
        name="projects"
        options={{
          title: t('projects'),
          tabBarIcon: ({ size, color }) => (
            <Building2 size={size} color={color} />
          ),
          href: pageAccess['projects'] !== false ? ((userRole === 'admin' || userRole === 'pm' || userRole === 'sales') ? undefined : null) : null,
          // Hide tab bar when opened from hamburger menu (mobile only)
          tabBarStyle: isMobile ? { display: 'none' } : (isWebDesktop ? { display: 'none' } : undefined),
        }}
      />
      {/* 2) Team */}
      <Tabs.Screen
        name="team"
        options={{
          title: t('employees'),
          tabBarIcon: ({ size, color }) => (
            <Users size={size} color={color} />
          ),
          href: pageAccess['team'] !== false ? (userRole === 'client' ? null : undefined) : null,
          tabBarStyle: isMobile ? { display: 'none' } : (isWebDesktop ? { display: 'none' } : undefined),
        }}
      />
      {/* 3) HR (admin) */}
      <Tabs.Screen
        name="hr"
        options={{
          title: t('hr'),
          tabBarIcon: ({ size, color }) => (
            <UserCog size={size} color={color} />
          ),
          href: userRole === 'admin' ? undefined : null,
          tabBarStyle: isMobile ? { display: 'none' } : (isWebDesktop ? { display: 'none' } : undefined),
        }}
      />
      {/* 3.1) Payroll (admin) */}
      <Tabs.Screen
        name="payroll"
        options={{
          title: t('payroll'),
          tabBarIcon: ({ size, color }) => (
            <DollarSign size={size} color={color} />
          ),
          href: userRole === 'admin' ? undefined : null,
          tabBarStyle: isMobile ? { display: 'none' } : (isWebDesktop ? { display: 'none' } : undefined),
        }}
      />
      {/* 3.2) Commission (admin) */}
      <Tabs.Screen
        name="commission"
        options={{
          title: t('commission'),
          tabBarIcon: ({ size, color }) => (
            <TrendingUp size={size} color={color} />
          ),
          href: userRole === 'admin' ? undefined : null,
          tabBarStyle: isMobile ? { display: 'none' } : (isWebDesktop ? { display: 'none' } : undefined),
        }}
      />
      {/* 4) Leads (admin & sales) */}
      <Tabs.Screen
        name="leads"
        options={{
          title: t('leads'),
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
          href: (userRole === 'admin' || userRole === 'sales') ? undefined : null,
          tabBarStyle: isMobile ? { display: 'none' } : (isWebDesktop ? { display: 'none' } : undefined),
        }}
      />
      {/* 5) Clients (admin) */}
      <Tabs.Screen
        name="clients"
        options={{
          title: t('clients'),
          tabBarIcon: ({ size, color }) => (
            <UserCheck size={size} color={color} />
          ),
          href: userRole === 'admin' ? undefined : null,
          tabBarStyle: isMobile ? { display: 'none' } : (isWebDesktop ? { display: 'none' } : undefined),
        }}
      />
      {/* 6) Sales (admin, sales only - client sees Proposals and Invoices directly) */}
      <Tabs.Screen
        name="sales"
        options={{
          title: t('sales'),
          tabBarIcon: ({ size, color }) => (
            <Briefcase size={size} color={color} />
          ),
          href: (userRole === 'admin' || (userRole === 'sales' && pageAccess['sales-report'] !== false)) ? undefined : null,
          tabBarStyle: isMobile ? { display: 'none' } : (isWebDesktop ? { display: 'none' } : undefined),
        }}
      />
      {/* 7) Time Clock */}
      <Tabs.Screen
        name="time-clock"
        options={{
          title: t('timeClock'),
          tabBarIcon: ({ size, color }) => (
            <Clock size={size} color={color} />
          ),
          href: (userRole === 'client' || pageAccess['time-clock'] === false) ? null : undefined,
          tabBarStyle: isMobile ? { display: 'none' } : (isWebDesktop ? { display: 'none' } : undefined),
        }}
      />
      {/* 8) Approval (admin only) */}
      <Tabs.Screen
        name="project-approval"
        options={{
          title: t('approval'),
          tabBarIcon: ({ size, color }) => (
            <CheckCircle size={size} color={color} />
          ),
          href: userRole === 'admin' ? 'project-approval' : null, // Sadece admin görebilir
          tabBarStyle: isMobile ? { display: 'none' } : (isWebDesktop ? { display: 'none' } : undefined),
        }}
      />
      {/* 7) Proposals - Client sees as "Sales" */}
      <Tabs.Screen
        name="proposals"
        options={{
          title: userRole === 'client' ? t('sales') : t('proposals'),
          tabBarIcon: ({ size, color }) => (
            userRole === 'client' ? <Briefcase size={size} color={color} /> : <FileText size={size} color={color} />
          ),
          href: pageAccess['proposals'] !== false ? ((userRole === 'admin' || userRole === 'sales' || userRole === 'client') ? undefined : null) : null,
          tabBarStyle: isMobile ? { display: 'none' } : (isWebDesktop ? { display: 'none' } : undefined),
        }}
      />
      {/* 8) Invoices - Admin, Sales, and Client can view */}
      <Tabs.Screen
        name="invoices"
        options={{
          title: t('invoices'),
          tabBarIcon: ({ size, color }) => (
            <Receipt size={size} color={color} />
          ),
          href: pageAccess['invoices'] !== false ? ((userRole === 'admin' || userRole === 'sales' || userRole === 'client') ? undefined : null) : null,
          tabBarStyle: isMobile ? { display: 'none' } : (isWebDesktop ? { display: 'none' } : undefined),
        }}
      />
      {/* 8.1) Tracking (admin, pm) - moved up for visibility */}
      <Tabs.Screen
        name="tracking"
        options={{
          title: t('tracking'),
          tabBarIcon: ({ size, color }) => (
            <Package size={size} color={color} />
          ),
          href: (userRole === 'admin' || userRole === 'pm') ? undefined : null,
          tabBarStyle: isMobile ? { display: 'none' } : (isWebDesktop ? { display: 'none' } : undefined),
        }}
      />
      {/* 8) Expenses (admin) */}
      <Tabs.Screen
        name="expenses"
        options={{
          title: t('expenses'),
          tabBarIcon: ({ size, color }) => (
            <CreditCard size={size} color={color} />
          ),
          href: (userRole === 'admin') ? undefined : null,
          tabBarStyle: isMobile ? { display: 'none' } : (isWebDesktop ? { display: 'none' } : undefined),
        }}
      />
      {/* 9) Reports (admin only, not client) */}
      <Tabs.Screen
        name="reports"
        options={{
          title: t('reports'),
          tabBarIcon: ({ size, color }) => (
            <FileText size={size} color={color} />
          ),
          href: (userRole === 'admin') ? undefined : null,
          tabBarStyle: isMobile ? { display: 'none' } : (isWebDesktop ? { display: 'none' } : undefined),
        }}
      />
      {/* 10) Permissions (admin only) */}
      <Tabs.Screen
        name="permissions"
        options={{
          title: t('permissions'),
          tabBarIcon: ({ size, color }) => (
            <Shield size={size} color={color} />
          ),
          href: userRole === 'admin' ? undefined : null,
          tabBarStyle: isMobile ? { display: 'none' } : (isWebDesktop ? { display: 'none' } : undefined),
        }}
      />
      {/* Company Settings - Admin / company users */}
      <Tabs.Screen
        name="company-settings"
        options={{
          title: t('company'),
          tabBarIcon: ({ size, color }) => (
            <Building2 size={size} color={color} />
          ),
          href: undefined,
          tabBarStyle: isMobile ? { display: 'none' } : (isWebDesktop ? { display: 'none' } : undefined),
        }}
      />
      {/* 10) Settings - All users can access */}
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
          href: undefined, // Tüm kullanıcılar settings'e erişebilir
          tabBarStyle: isMobile ? { display: 'none' } : (isWebDesktop ? { display: 'none' } : undefined),
        }}
      />
      {/* 9) Test Firebase - Hidden from tab bar */}
      <Tabs.Screen
        name="test-firebase"
        options={{
          title: t('testFirebase'),
          tabBarIcon: ({ size, color }) => (
            <Database size={size} color={color} />
          ),
          href: null, // Hide from tab bar - development only
        }}
      />
      {/* Hidden tabs - not shown in tab bar */}
      <Tabs.Screen
        name="notifications"
        options={{
          href: null, // Hide from tab bar
          tabBarStyle: { display: 'none' }, // Always hide tab bar
        }}
      />
      <Tabs.Screen
        name="sales-report"
        options={{
          href: null, // Hide from tab bar
          tabBarStyle: { display: 'none' }, // Always hide tab bar
        }}
      />
      <Tabs.Screen
        name="employee"
        options={{
          href: null, // Hide from tab bar
          tabBarStyle: { display: 'none' }, // Always hide tab bar
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="completed-projects"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="change-order"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="material-request"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="project"
        options={{
          href: null, // Hide from tab bar (nested routes)
          // Disable web navigation display
          title: '',
        }}
      />
    </Tabs>
      </View>
    </View>
  );
}