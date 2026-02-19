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
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Plus, Calendar, Clock, MapPin, CheckCircle, X, Search, User } from 'lucide-react-native';
import BackButton from '@/components/BackButton';
import HamburgerMenu from '@/components/HamburgerMenu';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PMSchedule, Project } from '@/types';
import { ProjectService } from '@/services/projectService';
import { UserService } from '@/services/userService';
import { ScheduleService } from '@/services/scheduleService';

export default function ProjectScheduleScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useLanguage();
  const { userRole, user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [schedules, setSchedules] = useState<PMSchedule[]>([]);
  const [pms, setPms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showPMModal, setShowPMModal] = useState(false);
  const [pmSearchTerm, setPmSearchTerm] = useState('');
  const [selectedPM, setSelectedPM] = useState<any>(null);
  const [newSchedule, setNewSchedule] = useState({
    pm_id: '',
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    project_id: id as string,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadProjectData();
    }
  }, [id]);

  useEffect(() => {
    if (showAddModal || showPMModal) {
      loadPMList();
    }
  }, [showAddModal, showPMModal]);

  const loadPMList = async (): Promise<void> => {
    try {
      const [pmByRole, allUsers] = await Promise.all([
        UserService.getUsersByRole('pm').catch(() => []),
        UserService.getAllUsers(),
      ]);
      let pmList = pmByRole;
      if (pmList.length === 0) {
        pmList = allUsers.filter(u => {
          const r = (u as any).role;
          return r && (String(r).toLowerCase() === 'pm' || String(r).toLowerCase() === 'office');
        });
      }
      setPms(pmList.map(u => ({
        id: u.id,
        name: (u as any).name || (u as any).displayName || u.email || 'Unknown',
        email: u.email || '',
        role: (u as any).role,
      })));
    } catch (e) {
      console.error('Error loading PM list:', e);
      setPms([]);
    }
  };

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projectData, projectSchedules] = await Promise.all([
        ProjectService.getProjectById(id as string),
        ScheduleService.getSchedules(),
      ]);
      
      setProject(projectData);
      
      const projectSchedulesFiltered = projectSchedules.filter(s => s.project_id === id);
      setSchedules(projectSchedulesFiltered);
      
      await loadPMList();
    } catch (error) {
      console.error('Error loading project data:', error);
      Alert.alert('Error', 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const validateSchedule = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!newSchedule.pm_id) {
      newErrors.pm_id = 'PM selection is required';
    }
    if (!newSchedule.title || newSchedule.title.trim() === '') {
      newErrors.title = 'Title is required';
    }
    if (!newSchedule.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    if (!newSchedule.end_date) {
      newErrors.end_date = 'End date is required';
    }
    if (newSchedule.start_date && newSchedule.end_date && new Date(newSchedule.start_date) > new Date(newSchedule.end_date)) {
      newErrors.end_date = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSchedule = async () => {
    if (!validateSchedule()) {
      return;
    }

    try {
      const pm = pms.find(p => p.id === newSchedule.pm_id);

      const scheduleData = {
        pm_id: newSchedule.pm_id,
        pm_name: pm?.name || 'Unknown PM',
        title: newSchedule.title,
        description: newSchedule.description,
        start_date: newSchedule.start_date,
        end_date: newSchedule.end_date,
        project_id: newSchedule.project_id,
        project_name: project?.title || '',
      };

      const scheduleId = await ScheduleService.createSchedule(scheduleData);
      
      const newScheduleWithId: PMSchedule = {
        id: scheduleId,
        ...scheduleData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'pending',
      };

      setSchedules(prev => [newScheduleWithId, ...prev]);
      setNewSchedule({
        pm_id: '',
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        project_id: id as string,
      });
      setErrors({});
      setSelectedPM(null);
      setShowPMModal(false);
      setShowAddModal(false);
      Alert.alert('Success', 'Schedule added successfully');
    } catch (error) {
      console.error('Error adding schedule:', error);
      Alert.alert('Error', 'Failed to add schedule');
    }
  };

  const handleUpdateScheduleStatus = async (scheduleId: string, newStatus: PMSchedule['status']) => {
    try {
      await ScheduleService.updateSchedule(scheduleId, { status: newStatus });
      setSchedules(prev => prev.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, status: newStatus }
          : schedule
      ));
    } catch (error) {
      console.error('Error updating schedule status:', error);
      Alert.alert('Error', 'Failed to update schedule status');
    }
  };

  const handleDeleteSchedule = (schedule: any) => {
    setScheduleToDelete(schedule);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (scheduleToDelete) {
      try {
        await ScheduleService.deleteSchedule(scheduleToDelete.id);
        setSchedules(prev => prev.filter(s => s.id !== scheduleToDelete.id));
        setShowDeleteModal(false);
        setScheduleToDelete(null);
        Alert.alert('Success', 'Schedule deleted successfully');
      } catch (error) {
        console.error('Error deleting schedule:', error);
        Alert.alert('Error', 'Failed to delete schedule');
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setScheduleToDelete(null);
  };

  const handlePMSelect = (pm: any) => {
    setSelectedPM(pm);
    setNewSchedule(prev => ({ ...prev, pm_id: pm.id }));
    setShowPMModal(false);
    if (errors.pm_id) {
      setErrors(prev => ({ ...prev, pm_id: '' }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#059669';
      case 'in_progress': return '#0ea5e9';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#000000';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Loading schedule...</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton color="#000000" backgroundColor="rgba(0,0,0,0.06)" />
          <Text style={styles.headerTitle}>Schedule</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Project not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HamburgerMenu />
      <View style={[styles.header, styles.headerZIndex]}>
        <BackButton 
          onPress={() => router.push(`/(tabs)/project/${id}`)}
          color="#000000"
          backgroundColor="rgba(0,0,0,0.06)"
        />
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>Schedule</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{project.title}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {schedules.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#000000" />
            <Text style={styles.emptyText}>No schedules found</Text>
            <Text style={styles.emptySubtext}>Add a new schedule to get started</Text>
          </View>
        ) : (
          <View style={styles.schedulesList}>
            {schedules.map((schedule) => (
              <View key={schedule.id} style={styles.scheduleCard}>
                <View style={styles.scheduleHeader}>
                  <Text style={styles.scheduleTitle}>{schedule.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(schedule.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(schedule.status)}</Text>
                  </View>
                </View>
                
                <Text style={styles.scheduleDescription}>{schedule.description}</Text>
                
                <View style={styles.scheduleDetails}>
                  <View style={styles.detailRow}>
                    <Clock size={16} color="#000000" />
                    <Text style={styles.detailText}>
                      {new Date(schedule.date).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Calendar size={16} color="#000000" />
                    <Text style={styles.detailText}>
                      {new Date(schedule.date).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <User size={16} color="#000000" />
                    <Text style={styles.detailText}>PM: {schedule.pm_name}</Text>
                  </View>
                  
                  {schedule.start_date && schedule.end_date && (
                    <View style={styles.detailRow}>
                      <Calendar size={16} color="#000000" />
                      <Text style={styles.detailText}>
                        {new Date(schedule.start_date).toLocaleDateString()} - {new Date(schedule.end_date).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>

                {userRole === 'admin' && (
                  <View style={styles.scheduleActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.completeButton]}
                      onPress={() => handleUpdateScheduleStatus(schedule.id, 'completed')}>
                      <CheckCircle size={16} color="#059669" />
                      <Text style={styles.actionButtonText}>Complete</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteSchedule(schedule)}>
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {(userRole === 'admin' || userRole === 'pm') && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Plus size={24} color="#000000" />
        </TouchableOpacity>
      )}

      {/* Add Schedule Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Schedule</Text>
            <TouchableOpacity onPress={() => { setShowAddModal(false); setShowPMModal(false); }}>
              <X size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PM *</Text>
              <TouchableOpacity
                style={[styles.selectButton, errors.pm_id && styles.inputError]}
                onPress={() => setShowPMModal(prev => !prev)}
                activeOpacity={0.7}>
                <Text style={[styles.selectButtonText, !selectedPM && styles.placeholderText]}>
                  {selectedPM ? selectedPM.name : 'Select PM'}
                </Text>
                <User size={20} color="#000000" />
              </TouchableOpacity>
              {showPMModal && (
                <View style={styles.pmDropdown}>
                  {pms.length === 0 ? (
                    <View style={styles.pmEmptyState}>
                      <Text style={styles.emptyStateText}>No PMs available. Add users with PM role in Team.</Text>
                    </View>
                  ) : (
                    <ScrollView style={styles.pmDropdownScroll} nestedScrollEnabled>
                      {pms.map((pm) => (
                        <TouchableOpacity
                          key={pm.id}
                          style={[
                            styles.pmOption,
                            selectedPM?.id === pm.id && styles.selectedPMOption,
                          ]}
                          onPress={() => handlePMSelect(pm)}
                          activeOpacity={0.7}>
                          <View style={styles.pmInfo}>
                            <Text style={[styles.pmName, selectedPM?.id === pm.id && styles.selectedPMOptionText]}>{pm.name}</Text>
                            <Text style={[styles.pmEmail, selectedPM?.id === pm.id && styles.selectedPMOptionText]}>{pm.email}</Text>
                          </View>
                          {selectedPM?.id === pm.id && (
                            <CheckCircle size={20} color="#ffffff" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              )}
              {errors.pm_id && (
                <Text style={styles.errorText}>{errors.pm_id}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                value={newSchedule.title}
                onChangeText={(text) => {
                  setNewSchedule(prev => ({ ...prev, title: text }));
                  if (errors.title) {
                    setErrors(prev => ({ ...prev, title: '' }));
                  }
                }}
                placeholder="Enter schedule title"
              />
              {errors.title && (
                <Text style={styles.errorText}>{errors.title}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newSchedule.description}
                onChangeText={(text) => setNewSchedule(prev => ({ ...prev, description: text }))}
                placeholder="Enter description"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date Range *</Text>
              <View style={styles.dateRangeContainer}>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateLabel}>Start Date</Text>
                  {Platform.OS === 'web' ? (
                    <input
                      type="date"
                      value={newSchedule.start_date}
                      onChange={(e) => {
                        setNewSchedule(prev => ({ ...prev, start_date: e.target.value }));
                        if (errors.start_date) {
                          setErrors(prev => ({ ...prev, start_date: '' }));
                        }
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: errors.start_date ? '1px solid #ef4444' : '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        marginTop: '8px',
                        backgroundColor: '#ffffff',
                      }}
                    />
                  ) : (
                    <>
                      <TouchableOpacity 
                        style={[styles.datePickerButton, errors.start_date && styles.inputError]}
                        onPress={() => setShowStartDatePicker(true)}
                      >
                        <Calendar size={20} color="#000000" />
                        <Text style={styles.datePickerText}>
                          {newSchedule.start_date ? new Date(newSchedule.start_date).toLocaleDateString() : 'Select start date'}
                        </Text>
                      </TouchableOpacity>
                      {showStartDatePicker && (
                        <DateTimePicker
                          value={newSchedule.start_date ? new Date(newSchedule.start_date) : new Date()}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={(event, selectedDate) => {
                            setShowStartDatePicker(false);
                            if (selectedDate) {
                              const formattedDate = selectedDate.toISOString().split('T')[0];
                              setNewSchedule(prev => ({ ...prev, start_date: formattedDate }));
                              if (errors.start_date) {
                                setErrors(prev => ({ ...prev, start_date: '' }));
                              }
                            }
                          }}
                          minimumDate={new Date()}
                        />
                      )}
                    </>
                  )}
                  {errors.start_date && (
                    <Text style={styles.errorText}>{errors.start_date}</Text>
                  )}
                </View>
                
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateLabel}>End Date</Text>
                  {Platform.OS === 'web' ? (
                    <input
                      type="date"
                      value={newSchedule.end_date}
                      onChange={(e) => {
                        setNewSchedule(prev => ({ ...prev, end_date: e.target.value }));
                        if (errors.end_date) {
                          setErrors(prev => ({ ...prev, end_date: '' }));
                        }
                      }}
                      min={newSchedule.start_date || new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: errors.end_date ? '1px solid #ef4444' : '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        marginTop: '8px',
                        backgroundColor: '#ffffff',
                      }}
                    />
                  ) : (
                    <>
                      <TouchableOpacity 
                        style={[styles.datePickerButton, errors.end_date && styles.inputError]}
                        onPress={() => setShowEndDatePicker(true)}
                      >
                        <Calendar size={20} color="#000000" />
                        <Text style={styles.datePickerText}>
                          {newSchedule.end_date ? new Date(newSchedule.end_date).toLocaleDateString() : 'Select end date'}
                        </Text>
                      </TouchableOpacity>
                      {showEndDatePicker && (
                        <DateTimePicker
                          value={newSchedule.end_date ? new Date(newSchedule.end_date) : new Date()}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={(event, selectedDate) => {
                            setShowEndDatePicker(false);
                            if (selectedDate) {
                              const formattedDate = selectedDate.toISOString().split('T')[0];
                              setNewSchedule(prev => ({ ...prev, end_date: formattedDate }));
                              if (errors.end_date) {
                                setErrors(prev => ({ ...prev, end_date: '' }));
                              }
                            }
                          }}
                          minimumDate={newSchedule.start_date ? new Date(newSchedule.start_date) : new Date()}
                        />
                      )}
                    </>
                  )}
                  {errors.end_date && (
                    <Text style={styles.errorText}>{errors.end_date}</Text>
                  )}
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddSchedule}>
              <Text style={styles.submitButtonText}>Add Schedule</Text>
            </TouchableOpacity>
          </ScrollView>
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
              Are you sure you want to delete the schedule "{scheduleToDelete?.title}"? This action cannot be undone.
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
    </View>
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
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingRight: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#b0b0b0',
  },
  headerZIndex: {
    zIndex: 10,
    elevation: 10,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#000000',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 40 : 90,
    right: Platform.OS === 'web' ? 40 : 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
    zIndex: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#000000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#000000',
    marginTop: 4,
  },
  schedulesList: {
    gap: 16,
  },
  scheduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#ffffff', // Yellow border like teams
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    marginBottom: 16,
  },
  scheduleDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#000000',
  },
  scheduleActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  completeButton: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  pmDropdown: {
    marginTop: 8,
    maxHeight: 220,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  pmDropdownScroll: {
    maxHeight: 216,
  },
  pmModalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  pmModalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  pmEmptyState: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#000000',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 50,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    marginLeft: 4,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  selectButtonText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  placeholderText: {
    color: '#000000',
  },
  dateRangeContainer: {
    gap: 12,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
    backgroundColor: '#f9fafb',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 8,
  },
  inputText: {
    fontSize: 16,
    color: '#000000',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  timeInput: {
    flex: 1,
  },
  pmList: {
    gap: 8,
  },
  pmOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  selectedPMOption: {
    borderColor: '#000000',
    backgroundColor: '#000000',
  },
  selectedPMOptionText: {
    color: '#ffffff',
  },
  pmInfo: {
    flex: 1,
  },
  pmName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  pmEmail: {
    fontSize: 14,
    color: '#000000',
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerModal: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  datePickerText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  deleteModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  deleteIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#fecaca',
    justifyContent: 'center',
    alignItems: 'center',
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
});



