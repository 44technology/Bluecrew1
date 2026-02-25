import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Plus, Mail, Phone, Building, MapPin, X, Search, Download, Upload, Trash2, Calendar, MessageSquare, Eye, EyeOff, ArrowLeft, User, UserCheck, FileText, Receipt, BarChart3 } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { Client, ClientNote } from '@/types';
import { UserService } from '@/services/userService';
import { usePagePermission } from '@/hooks/usePagePermission';
import { ProposalService } from '@/services/proposalService';
import { InvoiceService } from '@/services/invoiceService';
import { ClientService } from '@/services/clientService';
import HamburgerMenu from '@/components/HamburgerMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Real clients from Firebase

export default function ClientsScreen() {
  const { t } = useLanguage();
  const { userRole, user } = useAuth();
  const { canEdit: canEditClients } = usePagePermission('clients', userRole as 'admin' | 'pm' | 'sales' | 'office' | 'client');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [newNote, setNewNote] = useState({
    note: '',
    contact_date: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  
  // Web-specific features
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [importingClients, setImportingClients] = useState(false);
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');

  // Load clients from Firebase
  const loadClients = async () => {
    try {
      setLoading(true);
      const firebaseClients = await UserService.getUsersByRole('client');
      console.log('Firebase clients loaded:', firebaseClients);
      
      // Convert Firebase users to Client format
      const clientList: Client[] = firebaseClients.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        company: '', // No company field
        address: '', // No address field
        created_at: user.created_at,
      }));
      
      setClients(clientList);
    } catch (error) {
      console.error('Error loading clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const onRefresh = async () => {
    if (Platform.OS !== 'web') {
      const Haptics = (await import('expo-haptics')).default;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setRefreshing(true);
    await loadClients();
  };

  // Mobile-first: always use card view (vertical list) so page scrolls down like mobile app
  useEffect(() => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      setIsMobile(true);
      setViewMode('card');
      return;
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const isMobileWidth = window.innerWidth <= 768;
      const userAgent = window.navigator.userAgent || '';
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(isMobileWidth || isMobileUA);
      setViewMode('card'); // always card = vertical scroll, no horizontal CRM table
      const handleResize = () => {
        if (typeof window !== 'undefined') {
          const mobileWidth = window.innerWidth <= 768;
          const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            window.navigator.userAgent || ''
          );
          setIsMobile(mobileWidth || mobileUA);
        }
      };
      window.addEventListener('resize', handleResize);
      return () => {
        if (typeof window !== 'undefined') window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  // Filter and search functions
  const getFilteredClients = () => {
    if (!searchQuery) return clients;
    const query = searchQuery.toLowerCase();
    return clients.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      (c.phone && c.phone.toLowerCase().includes(query))
    );
  };

  // Batch operations
  const toggleClientSelection = (id: string) => {
    const newSelected = new Set(selectedClients);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedClients(newSelected);
  };

  const selectAll = () => {
    const allIds = new Set(clients.map(c => c.id));
    setSelectedClients(allIds);
  };

  const clearSelection = () => {
    setSelectedClients(new Set());
  };

  const handleBatchDelete = () => {
    if (selectedClients.size === 0) {
      Alert.alert('Error', 'Please select clients to delete');
      return;
    }
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${selectedClients.size} client(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmBatchDelete }
      ]
    );
  };

  const confirmBatchDelete = async () => {
    try {
      for (const id of selectedClients) {
        await UserService.deleteUser(id);
      }
      clearSelection();
      Alert.alert('Success', `${selectedClients.size} client(s) deleted successfully`);
      // Reload clients
      const firebaseClients = await UserService.getUsersByRole('client');
      const clientList: Client[] = firebaseClients.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        company: '',
        address: '',
        created_at: user.created_at,
      }));
      setClients(clientList);
    } catch (error) {
      console.error('Error batch deleting clients:', error);
      Alert.alert('Error', 'Failed to delete clients');
    }
  };

  // Export functions
  const exportToCSV = () => {
    if (Platform.OS !== 'web') return;
    
    const filteredClients = getFilteredClients();
    const headers = ['Name', 'Email', 'Phone', 'Created At'];
    const rows = filteredClients.map(client => [
      client.name,
      client.email,
      client.phone || '',
      client.created_at ? new Date(client.created_at).toLocaleDateString() : '',
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `clients_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse one CSV line (handles quoted commas)
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (inQuotes) {
        current += c;
      } else if (c === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += c;
      }
    }
    result.push(current.trim());
    return result;
  };

  const processImportedRows = async (rows: { name: string; email: string; phone: string }[]) => {
    const currentUserEmail = auth.currentUser?.email;
    let adminPassword: string | null = null;
    try {
      const savedPassword = await AsyncStorage.getItem('saved_password');
      const rememberMe = await AsyncStorage.getItem('remember_me');
      const savedEmail = await AsyncStorage.getItem('saved_email');
      if (rememberMe === 'true' && savedEmail === currentUserEmail && savedPassword) {
        adminPassword = savedPassword;
      }
    } catch (_) {}
    if (!currentUserEmail || !adminPassword) {
      Alert.alert('Import requires login', 'To import clients without being logged out, please log in with "Remember me" checked, then try again.');
      return;
    }
    const generateTempPassword = () => {
      const length = 12;
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
      let password = '';
      for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      return password;
    };
    const { AuthService } = await import('@/services/authService');
    let created = 0;
    const errors: string[] = [];
    for (const row of rows) {
      if (!row.name?.trim() || !row.email?.trim()) {
        errors.push(`Skip: missing name/email (${row.email || row.name || '?'})`);
        continue;
      }
      const existing = clients.find(c => c.email === row.email.trim());
      if (existing) {
        errors.push(`Skip: email already exists (${row.email})`);
        continue;
      }
      const password = generateTempPassword();
      try {
        await AuthService.createUserAsAdmin(
          currentUserEmail,
          adminPassword,
          row.email.trim(),
          password,
          { name: row.name.trim(), role: 'client', phone: row.phone?.trim() || undefined }
        );
        created++;
      } catch (err: any) {
        errors.push(`${row.email}: ${err?.message || 'Failed'}`);
      }
    }
    const firebaseClients = await UserService.getUsersByRole('client');
    const clientList: Client[] = firebaseClients.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      company: '',
      address: '',
      created_at: user.created_at,
    }));
    setClients(clientList);
    if (errors.length > 0) {
      Alert.alert('Import complete', `Created ${created} client(s).\n\nIssues:\n${errors.slice(0, 10).join('\n')}${errors.length > 10 ? `\n... and ${errors.length - 10} more` : ''}`);
    } else {
      Alert.alert('Success', `Imported ${created} client(s) successfully.`);
    }
  };

  const handleImportCSV = async () => {
    if (importingClients) return;
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv,text/csv';
      input.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;
        setImportingClients(true);
        try {
          const text = await file.text();
          const lines = text.split(/\r?\n/).filter(l => l.trim());
          if (lines.length < 2) {
            Alert.alert('Error', 'CSV must have a header row and at least one data row.');
            return;
          }
          const header = parseCSVLine(lines[0]).map(h => h.toLowerCase());
          const nameIdx = header.findIndex(h => h === 'name');
          const emailIdx = header.findIndex(h => h === 'email');
          const phoneIdx = header.findIndex(h => h === 'phone');
          if (nameIdx === -1 || emailIdx === -1) {
            Alert.alert('Error', 'CSV must have "Name" and "Email" columns.');
            return;
          }
          const rows: { name: string; email: string; phone: string }[] = [];
          for (let i = 1; i < lines.length; i++) {
            const cells = parseCSVLine(lines[i]);
            rows.push({
              name: cells[nameIdx] ?? '',
              email: cells[emailIdx] ?? '',
              phone: (phoneIdx >= 0 ? cells[phoneIdx] : '') ?? '',
            });
          }
          await processImportedRows(rows);
        } catch (err: any) {
          Alert.alert('Error', err?.message || 'Failed to import CSV');
        } finally {
          setImportingClients(false);
          target.value = '';
        }
      };
      input.click();
      return;
    }
    setImportingClients(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) {
        setImportingClients(false);
        return;
      }
      const uri = result.assets[0].uri;
      const text = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) {
        Alert.alert('Error', 'CSV must have a header row and at least one data row.');
        return;
      }
      const header = parseCSVLine(lines[0]).map(h => h.toLowerCase());
      const nameIdx = header.findIndex(h => h === 'name');
      const emailIdx = header.findIndex(h => h === 'email');
      const phoneIdx = header.findIndex(h => h === 'phone');
      if (nameIdx === -1 || emailIdx === -1) {
        Alert.alert('Error', 'CSV must have "Name" and "Email" columns.');
        return;
      }
      const rows: { name: string; email: string; phone: string }[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cells = parseCSVLine(lines[i]);
        rows.push({
          name: cells[nameIdx] ?? '',
          email: cells[emailIdx] ?? '',
          phone: (phoneIdx >= 0 ? cells[phoneIdx] : '') ?? '',
        });
      }
      await processImportedRows(rows);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to import CSV');
    } finally {
      setImportingClients(false);
    }
  };

  const generateRandomPassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const doAddClientWithAdminAuth = async (adminEmail: string, adminPassword: string) => {
    const { AuthService } = await import('@/services/authService');
    const email = newClient.email.trim();
    await AuthService.createUserAsAdmin(
      adminEmail,
      adminPassword,
      email,
      generateRandomPassword(),
      { name: newClient.name.trim(), role: 'client', phone: newClient.phone?.trim() || undefined }
    );
    setShowAddModal(false);
    setShowAdminPasswordModal(false);
    setAdminPasswordInput('');
    setFieldErrors({});
    setNewClient({ name: '', email: '', phone: '' });
    await loadClients();
    Alert.alert('Success', 'Client added successfully. They can use "Forgot password" with their email to set a password and log in.');
  };

  const doAddClientAndLogout = async () => {
    const { AuthService } = await import('@/services/authService');
    const email = newClient.email.trim();
    await AuthService.signUp(email, generateRandomPassword(), {
      name: newClient.name.trim(),
      role: 'client',
      phone: newClient.phone?.trim() || undefined,
    });
    setShowAddModal(false);
    setShowAdminPasswordModal(false);
    setAdminPasswordInput('');
    setFieldErrors({});
    setNewClient({ name: '', email: '', phone: '' });
    await signOut(auth);
    Alert.alert(
      'Client created',
      'Client added successfully. They can use "Forgot password" with their email to set a password and log in.\n\nYou have been logged out — please log in again.',
      [{ text: 'OK', onPress: () => router.replace('/login') }]
    );
    router.replace('/login');
  };

  const handleAddClient = async () => {
    const missingFields: string[] = [];
    const errors: { [key: string]: string } = {};
    if (!newClient.name || !newClient.name.trim()) { missingFields.push('Name'); errors.name = 'Name is required'; }
    if (!newClient.email || !newClient.email.trim()) { missingFields.push('Email'); errors.email = 'Email is required'; }
    setFieldErrors(errors);
    if (missingFields.length > 0) return;
    const existingClient = clients.find(c => c.email === newClient.email.trim());
    if (existingClient) {
      Alert.alert('Error', 'A client with this email already exists');
      return;
    }
    const currentUserEmail = auth.currentUser?.email ?? null;
    let storedPassword: string | null = null;
    try {
      const rememberMe = await AsyncStorage.getItem('remember_me');
      const savedEmail = await AsyncStorage.getItem('saved_email');
      if (rememberMe === 'true' && savedEmail === currentUserEmail) {
        storedPassword = await AsyncStorage.getItem('saved_password');
      }
    } catch (_) {}
    if (currentUserEmail && storedPassword) {
      try {
        await doAddClientWithAdminAuth(currentUserEmail, storedPassword);
      } catch (error: any) {
        console.error('Error adding client:', error);
        Alert.alert('Error', error.message || 'Failed to add client');
      }
      return;
    }
    setShowAdminPasswordModal(true);
  };

  const confirmAddClientWithPassword = async () => {
    const currentUserEmail = auth.currentUser?.email;
    if (!currentUserEmail) {
      Alert.alert('Error', 'You are not logged in.');
      return;
    }
    const password = adminPasswordInput.trim();
    if (password) {
      try {
        await doAddClientWithAdminAuth(currentUserEmail, password);
      } catch (error: any) {
        console.error('Error adding client:', error);
        Alert.alert('Error', error.message || 'Failed to add client. Check your password.');
      }
      return;
    }
    try {
      await doAddClientAndLogout();
    } catch (error: any) {
      console.error('Error adding client:', error);
      Alert.alert('Error', error.message || 'Failed to add client');
    }
  };

  const handleDeleteClient = (client: Client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (clientToDelete) {
      try {
        await UserService.deleteUser(clientToDelete.id);
        
        // Reload clients
        const firebaseClients = await UserService.getUsersByRole('client');
        const clientList: Client[] = firebaseClients.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          company: '',
          address: '',
          created_at: user.created_at,
        }));
        setClients(clientList);
        
        setShowDeleteModal(false);
        setClientToDelete(null);
        Alert.alert('Success', 'Client deleted successfully');
      } catch (error) {
        console.error('Error deleting client:', error);
        Alert.alert('Error', 'Failed to delete client');
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setClientToDelete(null);
  };

  const handleAddNote = async () => {
    if (!selectedClient || !newNote.note.trim()) {
      Alert.alert('Error', 'Please enter a note');
      return;
    }

    try {
      const noteData: Omit<ClientNote, 'id'> = {
        note: newNote.note,
        created_at: new Date().toISOString(),
        created_by: user?.id || '',
        created_by_name: user?.name || 'Unknown User',
        contact_date: newNote.contact_date || new Date().toISOString(),
      };

      await ClientService.addNoteToClient(selectedClient.id, noteData);
      
      // Reload client data
      const updatedClient = await ClientService.getClientById(selectedClient.id);
      if (updatedClient) {
        setSelectedClient(updatedClient);
        // Update in clients list
        setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
      }
      
      setShowNoteModal(false);
      setNewNote({ note: '', contact_date: '' });
      setShowDatePicker(false);
      setSelectedDate(new Date());
      Alert.alert('Success', 'Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      Alert.alert('Error', 'Failed to add note');
    }
  };

  // Load full client data when detail modal opens
  useEffect(() => {
    if (showDetailModal && selectedClient) {
      const loadFullClient = async () => {
        const fullClient = await ClientService.getClientById(selectedClient.id);
        if (fullClient) {
          setSelectedClient(fullClient);
        }
      };
      loadFullClient();
    }
  }, [showDetailModal, selectedClient?.id]);

  // Component to calculate and display CRM stats in detail modal
  const ClientDetailStats = ({ client }: { client: Client }) => {
    const [crmStats, setCrmStats] = useState({
      approvedProposals: 0,
      invoices: 0,
      totalRevenue: 0,
    });

    useEffect(() => {
      const loadCrmStats = async () => {
        try {
          // Get proposals for this client
          const proposals = await ProposalService.getProposalsByClientName(client.name);
          const approvedProposals = proposals.filter(p => 
            p.management_approval === 'approved' && p.client_approval === 'approved'
          ).length;

          // Get invoices for this client
          const allInvoices = await InvoiceService.getInvoices();
          const clientInvoices = allInvoices.filter(inv => 
            inv.client_name === client.name || inv.client_id === client.id
          );
          const approvedInvoices = clientInvoices.filter(inv => inv.status === 'approved');
          const totalRevenue = approvedInvoices.reduce((sum, inv) => sum + inv.total_cost, 0);

          setCrmStats({
            approvedProposals,
            invoices: clientInvoices.length,
            totalRevenue,
          });
        } catch (error) {
          console.error('Error loading CRM stats:', error);
        }
      };

      loadCrmStats();
    }, [client.name, client.id]);

    return (
      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>CRM Statistics</Text>
        <View style={styles.crmStatsDetail}>
          <View style={styles.crmStatItemDetail}>
            <Text style={styles.crmStatLabelDetail}>Approved Proposals</Text>
            <Text style={styles.crmStatValueDetail}>{crmStats.approvedProposals}</Text>
          </View>
          <View style={styles.crmStatItemDetail}>
            <Text style={styles.crmStatLabelDetail}>Invoices</Text>
            <Text style={styles.crmStatValueDetail}>{crmStats.invoices}</Text>
          </View>
          <View style={styles.crmStatItemDetail}>
            <Text style={styles.crmStatLabelDetail}>Total Revenue</Text>
            <Text style={styles.crmStatValueDetail}>
              ${crmStats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const ClientCard = ({ client }: { client: Client }) => {
    const [crmStats, setCrmStats] = useState({
      approvedProposals: 0,
      invoices: 0,
      totalRevenue: 0,
    });

    useEffect(() => {
      const loadCrmStats = async () => {
        try {
          // Get proposals for this client
          const proposals = await ProposalService.getProposalsByClientName(client.name);
          const approvedProposals = proposals.filter(p => 
            p.management_approval === 'approved' && p.client_approval === 'approved'
          ).length;

          // Get invoices for this client
          const allInvoices = await InvoiceService.getInvoices();
          const clientInvoices = allInvoices.filter(inv => 
            inv.client_name === client.name || inv.client_id === client.id
          );
          const approvedInvoices = clientInvoices.filter(inv => inv.status === 'approved');
          const totalRevenue = approvedInvoices.reduce((sum, inv) => sum + inv.total_cost, 0);

          setCrmStats({
            approvedProposals,
            invoices: clientInvoices.length,
            totalRevenue,
          });
        } catch (error) {
          console.error('Error loading CRM stats:', error);
        }
      };

      loadCrmStats();
    }, [client.name, client.id]);

    return (
    <View style={styles.clientCard}>
      <View style={styles.clientHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Text>
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{client.name}</Text>
          <Text style={styles.clientEmail}>{client.email}</Text>
        </View>
          <View style={styles.clientActions}>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => {
                router.push(`/clients/${client.id}`);
              }}>
              <Eye size={18} color="#000000" />
            </TouchableOpacity>
        {userRole === 'admin' && (
          <TouchableOpacity
            style={styles.deleteButton}
                onPress={() => {
                  handleDeleteClient(client);
                }}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
          </View>
      </View>
      
      <View style={styles.clientDetails}>
        <View style={styles.contactRow}>
          <Mail size={16} color="#000000" />
          <Text style={styles.contactText}>{client.email}</Text>
        </View>
        {client.phone && (
          <View style={styles.contactRow}>
            <Phone size={16} color="#000000" />
            <Text style={styles.contactText}>{client.phone}</Text>
          </View>
        )}
      </View>

        {/* CRM Stats */}
        <View style={styles.crmStats}>
          <View style={styles.crmStatItem}>
            <Text style={styles.crmStatLabel}>Approved Proposals</Text>
            <Text style={styles.crmStatValue}>{crmStats.approvedProposals}</Text>
          </View>
          <View style={styles.crmStatItem}>
            <Text style={styles.crmStatLabel}>Invoices</Text>
            <Text style={styles.crmStatValue}>{crmStats.invoices}</Text>
          </View>
          <View style={styles.crmStatItem}>
            <Text style={styles.crmStatLabel}>Total Revenue</Text>
            <Text style={styles.crmStatValue}>
              ${crmStats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
    </View>
  );
  };

  const filteredClients = getFilteredClients();

  return (
    <>
      <HamburgerMenu />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/sales')} style={styles.backButton}>
            <ArrowLeft size={24} color="#000000" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Clients</Text>
            <Text style={styles.subtitle}>
              {filteredClients.length} of {clients.length} clients
            </Text>
          </View>
        {Platform.OS === 'web' && !isMobile && (canEditClients || userRole === 'admin') && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.exportButton, styles.createClientButton]}
              onPress={() => { setFieldErrors({}); setShowAddModal(true); }}
            >
              <Plus size={18} color="#ffffff" />
              <Text style={styles.exportButtonText}>Create New Client</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.exportButton, styles.importButton]}
              onPress={handleImportCSV}
              disabled={importingClients}
            >
              <Upload size={18} color="#ffffff" />
              <Text style={styles.exportButtonText}>{importingClients ? 'Importing...' : 'Import CSV'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={exportToCSV}
            >
              <Download size={18} color="#ffffff" />
              <Text style={styles.exportButtonText}>Export CSV</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Web: Search and Batch Operations Toolbar */}
      {Platform.OS === 'web' && (
        <View style={styles.webToolbar}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#000000" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search clients..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#000000"
            />
          </View>
          <View style={styles.toolbarActions}>
            {selectedClients.size > 0 && (
              <>
                <TouchableOpacity
                  style={styles.batchDeleteButton}
                  onPress={handleBatchDelete}
                >
                  <Trash2 size={16} color="#ffffff" />
                  <Text style={styles.batchButtonText}>Delete ({selectedClients.size})</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearSelection}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              </>
            )}
            {selectedClients.size === 0 && (
              <TouchableOpacity
                style={styles.selectAllButton}
                onPress={selectAll}
              >
                <Text style={styles.selectAllButtonText}>Select All</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        showsHorizontalScrollIndicator={false}
        horizontal={false}
        refreshControl={
          Platform.OS !== 'web' ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#000000"
            />
          ) : undefined
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading clients...</Text>
          </View>
        ) : filteredClients.length === 0 ? (
          <View style={styles.emptyState}>
            <Building size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No clients found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'Add your first client to get started'}
            </Text>
          </View>
        ) : Platform.OS === 'web' && viewMode === 'table' ? (
          /* Web Table View */
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <View style={styles.tableCheckbox}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={selectAll}
                >
                  {selectedClients.size > 0 && (
                    <Text style={styles.checkboxCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.tableHeaderText}>Name</Text>
              <Text style={styles.tableHeaderText}>Email</Text>
              <Text style={styles.tableHeaderText}>Phone</Text>
              <Text style={styles.tableHeaderText}>Created At</Text>
              {userRole === 'admin' && (
                <Text style={styles.tableHeaderText}>Actions</Text>
              )}
            </View>
            {filteredClients.map((client) => (
              <View key={client.id} style={styles.tableRow}>
                <View style={styles.tableCheckbox}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      selectedClients.has(client.id) && styles.checkboxSelected
                    ]}
                    onPress={() => toggleClientSelection(client.id)}
                  >
                    {selectedClients.has(client.id) && (
                      <Text style={styles.checkboxCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.tableCell}>{client.name}</Text>
                <Text style={styles.tableCell}>{client.email}</Text>
                <Text style={styles.tableCell}>{client.phone || '-'}</Text>
                <Text style={styles.tableCell}>
                  {client.created_at ? new Date(client.created_at).toLocaleDateString() : '-'}
                </Text>
                  <View style={styles.tableActions}>
                  <TouchableOpacity
                    style={styles.tableActionButton}
                    onPress={() => router.push(`/clients/${client.id}`)}
                  >
                    <Eye size={16} color="#000000" />
                  </TouchableOpacity>
                  {userRole === 'admin' && (
                    <TouchableOpacity
                      style={styles.tableActionButton}
                      onPress={() => handleDeleteClient(client)}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          /* Card view: vertical list, scroll down (mobile-style) */
          <View style={styles.cardListContainer}>
            {filteredClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </View>
        )}
      </ScrollView>

      {userRole === 'admin' && Platform.OS !== 'web' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            setFieldErrors({});
            setShowAddModal(true);
          }}>
          <Plus size={24} color="#000000" />
        </TouchableOpacity>
      )}

      {/* Client Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Client Details</Text>
            <TouchableOpacity onPress={() => {
              setShowDetailModal(false);
              setSelectedClient(null);
            }}>
              <X size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent} 
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {selectedClient && (
              <>
                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <View style={styles.detailAvatar}>
                      <Text style={styles.detailAvatarText}>
                        {selectedClient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailName}>{selectedClient.name}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Mail size={18} color="#000000" />
                    <Text style={styles.detailValue}>{selectedClient.email}</Text>
                  </View>
                  {selectedClient.phone && (
                    <View style={styles.detailRow}>
                      <Phone size={18} color="#000000" />
                      <Text style={styles.detailValue}>{selectedClient.phone}</Text>
                    </View>
                  )}
                  {selectedClient.address && (
                    <View style={styles.detailRow}>
                      <MapPin size={18} color="#000000" />
                      <Text style={styles.detailValue}>{selectedClient.address}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Calendar size={18} color="#000000" />
                    <Text style={styles.detailValue}>
                      Created: {new Date(selectedClient.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                {/* CRM Stats */}
                <ClientDetailStats client={selectedClient} />

                {/* Notes Section */}
                <View style={styles.detailSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Notes & Communications</Text>
                    <TouchableOpacity
                      style={styles.addNoteButton}
                      onPress={() => setShowNoteModal(true)}
                    >
                      <Plus size={18} color="#000000" />
                      <Text style={styles.addNoteButtonText}>Add Note</Text>
                    </TouchableOpacity>
                  </View>
                  {(!selectedClient.notes || selectedClient.notes.length === 0) ? (
                    <Text style={styles.noNotesText}>No notes yet</Text>
                  ) : (
                    selectedClient.notes.map((note, index) => (
                      <View key={note.id || index} style={styles.noteItem}>
                        <View style={styles.noteHeader}>
                          <Text style={styles.noteAuthor}>{note.created_by_name}</Text>
                          <Text style={styles.noteDate}>
                            {note.contact_date 
                              ? new Date(note.contact_date).toLocaleDateString()
                              : new Date(note.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                        <Text style={styles.noteText}>{note.note}</Text>
                      </View>
                    ))
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Add Note Modal */}
      <Modal
        visible={showNoteModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Note</Text>
            <TouchableOpacity onPress={() => {
              setShowNoteModal(false);
              setNewNote({ note: '', contact_date: '' });
              setShowDatePicker(false);
              setSelectedDate(new Date());
            }}>
              <X size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent} 
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Date (Optional)</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.dateInputContainer}>
                  <Calendar size={18} color="#000000" />
                  <Text style={[styles.dateInputText, !newNote.contact_date && styles.dateInputPlaceholder]}>
                    {newNote.contact_date 
                      ? new Date(newNote.contact_date).toLocaleDateString()
                      : 'Select date or leave empty for today'}
                  </Text>
                </View>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (date) {
                      setSelectedDate(date);
                      setNewNote(prev => ({ ...prev, contact_date: date.toISOString() }));
                    }
                  }}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Note *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newNote.note}
                onChangeText={(text) => setNewNote(prev => ({ ...prev, note: text }))}
                placeholder="Enter note (e.g., Called them, they said...)"
                multiline
                numberOfLines={6}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddNote}>
              <Text style={styles.submitButtonText}>Add Note</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Add Client Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Client</Text>
            <TouchableOpacity onPress={() => {
              setShowAddModal(false);
              setFieldErrors({});
            }}>
              <X size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent} 
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={newClient.name}
                onChangeText={(text) => setNewClient(prev => ({ ...prev, name: text }))}
                placeholder="Enter client name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, fieldErrors.email && styles.inputError]}
                value={newClient.email}
                onChangeText={(text) => {
                  setNewClient(prev => ({ ...prev, email: text }));
                  if (fieldErrors.email) {
                    setFieldErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {fieldErrors.email && (
                <Text style={styles.errorText}>{fieldErrors.email}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={newClient.phone}
                onChangeText={(text) => setNewClient(prev => ({ ...prev, phone: text }))}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddClient}>
              <Text style={styles.submitButtonText}>Add Client</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Admin password modal: stay logged in when adding client */}
      <Modal visible={showAdminPasswordModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.deleteModal, { maxWidth: 400 }]}>
            <TouchableOpacity style={styles.closeButton} onPress={() => { setShowAdminPasswordModal(false); setAdminPasswordInput(''); }}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.deleteTitle}>Stay logged in</Text>
            <Text style={[styles.deleteMessage, { marginBottom: 12 }]}>
              Enter your account password to add this client without being logged out. Leave empty and tap "Add anyway" if you prefer to log in again after.
            </Text>
            <TextInput
              style={[styles.input, { marginBottom: 16 }]}
              placeholder="Your password (optional)"
              value={adminPasswordInput}
              onChangeText={setAdminPasswordInput}
              secureTextEntry
              autoCapitalize="none"
            />
            <View style={styles.deleteButtons}>
              <TouchableOpacity style={styles.cancelDeleteButton} onPress={() => { setShowAdminPasswordModal(false); setAdminPasswordInput(''); }}>
                <Text style={styles.cancelDeleteText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmDeleteButton, { flex: 1 }]} onPress={confirmAddClientWithPassword}>
                <Text style={styles.confirmDeleteText}>{adminPasswordInput.trim() ? 'Add & stay logged in' : 'Add anyway'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModal}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={cancelDelete}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            
            <View style={styles.deleteIcon}>
              <Text style={styles.deleteIconText}>⚠</Text>
            </View>
            
            <Text style={styles.deleteTitle}>Are you sure you want to delete?</Text>
            <Text style={styles.deleteMessage}>
              Are you sure you want to delete the client "{clientToDelete?.name}"? This action cannot be undone.
            </Text>
            
            <View style={styles.deleteButtons}>
              <TouchableOpacity 
                style={styles.cancelDeleteButton}
                onPress={cancelDelete}>
                <Text style={styles.cancelDeleteText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmDeleteButton}
                onPress={confirmDelete}>
                <Text style={styles.confirmDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Menu - Sales Navigation */}
      <View style={styles.bottomMenu}>
        <View style={styles.bottomMenuContainer}>
          <TouchableOpacity
            style={[styles.bottomMenuItem, styles.activeMenuItem]}
            onPress={() => router.push('/clients')}
          >
            <UserCheck size={24} color="#059669" />
            <Text style={[styles.bottomMenuText, styles.activeMenuText]}>Clients</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomMenuItem}
            onPress={() => router.push('/leads')}
          >
            <User size={24} color="#3b82f6" />
            <Text style={styles.bottomMenuText}>Leads</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomMenuItem}
            onPress={() => router.push('/proposals')}
          >
            <FileText size={24} color="#f59e0b" />
            <Text style={styles.bottomMenuText}>Proposals</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomMenuItem}
            onPress={() => router.push('/invoices')}
          >
            <Receipt size={24} color="#ef4444" />
            <Text style={styles.bottomMenuText}>Invoices</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomMenuItem}
            onPress={() => router.push('/sales-report')}
          >
            <BarChart3 size={24} color="#8b5cf6" />
            <Text style={styles.bottomMenuText}>Report</Text>
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Blue background like teams
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingRight: 56,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
    width: '100%',
    maxWidth: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
    width: '100%',
    maxWidth: '100%',
  },
  cardListContainer: {
    width: '100%',
    maxWidth: '100%',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#f5f5f5', // Light yellow like teams
    marginTop: 8,
    textAlign: 'center',
  },
  clientCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#ffffff', // Yellow border like teams
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000', // Blue like teams
    marginBottom: 4,
  },
  clientEmail: {
    fontSize: 14,
    color: '#000000',
  },
  clientCompany: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  clientActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewButton: {
    padding: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  clientDetails: {
    gap: 8,
    marginBottom: 12,
  },
  crmStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  crmStatItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  crmStatLabel: {
    fontSize: 12,
    color: '#000000',
    marginBottom: 4,
    textAlign: 'center',
  },
  crmStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  detailAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailAvatarText: {
    color: '#1f2937',
    fontSize: 24,
    fontWeight: '600',
  },
  detailInfo: {
    flex: 1,
  },
  detailName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  detailValue: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  addNoteButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  crmStatsDetail: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  crmStatItemDetail: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    alignItems: 'center',
  },
  crmStatLabelDetail: {
    fontSize: 12,
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  crmStatValueDetail: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  noteItem: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  noteDate: {
    fontSize: 12,
    color: '#000000',
  },
  noteText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  noNotesText: {
    fontSize: 14,
    color: '#000000',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateInputText: {
    fontSize: 16,
    color: '#1f2937',
  },
  dateInputPlaceholder: {
    color: '#000000',
  },
  submitButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: Platform.OS === 'web' ? 20 : 24,
    minHeight: 48,
  },
  submitButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff', // Yellow button like teams
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#f5f5f5', // Light yellow text on blue background
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
  },
  deleteIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#fecaca',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  deleteIconText: {
    fontSize: 24,
    color: '#ef4444',
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  deleteMessage: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  deleteButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelDeleteButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelDeleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmDeleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Web-specific styles
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  createClientButton: {
    backgroundColor: '#059669',
  },
  importButton: {
    backgroundColor: '#3b82f6',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  contentActions: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
  },
  webToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    maxWidth: 400,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    padding: 0,
  },
  toolbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  batchDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  batchButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  selectAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  selectAllButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  clearButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
  },
  // Table styles
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  tableCheckbox: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxSelected: {
    backgroundColor: '#ffffff',
    borderColor: '#000000',
  },
  checkboxCheck: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'center',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
  },
  tableActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 80,
    justifyContent: 'flex-end',
  },
  tableActionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomMenu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomMenuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    flexWrap: 'wrap',
  },
  passwordRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  passwordInput: {
    flex: 1,
  },
  generatePasswordButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  generatePasswordButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomMenuItem: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    minWidth: 50,
    flex: 1,
    maxWidth: 80,
  },
  bottomMenuText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000000',
    marginTop: 2,
    textAlign: 'center',
  },
  activeMenuItem: {
    backgroundColor: '#f3f4f6',
  },
  activeMenuText: {
    color: '#1f2937',
    fontWeight: '700',
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    marginLeft: 4,
  },
});
