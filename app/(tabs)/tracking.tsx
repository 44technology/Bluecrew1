import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Package, 
  ShoppingCart, 
  Truck, 
  MapPin, 
  Calendar, 
  Hash,
  CheckCircle,
  Clock,
  Filter,
  ArrowUpDown,
  X
} from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { MaterialRequest, Project } from '@/types';
import { MaterialRequestService } from '@/services/materialRequestService';
import { ProjectService } from '@/services/projectService';
import HamburgerMenu from '@/components/HamburgerMenu';
import TopNavigationBar from '@/components/TopNavigationBar';
import BackButton from '@/components/BackButton';
import { Alert } from 'react-native';

type FilterStatus = 'all' | 'approved' | 'ordered' | 'shipped' | 'delivered';
type SortOption = 'date' | 'name' | 'project' | 'status';

export default function TrackingScreen() {
  const { t } = useLanguage();
  const { userRole } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [projects, setProjects] = useState<{ [key: string]: Project }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortAscending, setSortAscending] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showDeliveryAddressModal, setShowDeliveryAddressModal] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [requestIdForOrder, setRequestIdForOrder] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const allRequests = await MaterialRequestService.getMaterialRequests();
      console.log('All material requests loaded:', allRequests.length);
      
      // Only show approved requests
      // Admin and office can see all approved requests (even without purchase_status)
      // Other roles can only see approved requests that have purchase_status
      const trackingRequests = allRequests.filter(
        req => {
          // Must be approved first
          if (req.status !== 'approved') {
            return false;
          }
          
          // Admin and office can see all approved requests
          if (userRole === 'admin' || userRole === 'office') {
            return true;
          }
          
          // Other roles can only see approved requests with purchase_status
          return req.purchase_status && req.purchase_status !== 'pending';
        }
      );
      
      console.log('Tracking requests filtered:', trackingRequests.length);
      console.log('Sample request:', trackingRequests[0]);
      
      // Load project details for delivery address
      const projectIds = [...new Set(trackingRequests.map(req => req.project_id))];
      const projectsMap: { [key: string]: Project } = {};
      
      for (const projectId of projectIds) {
        try {
          const project = await ProjectService.getProjectById(projectId);
          if (project) {
            projectsMap[projectId] = project;
          }
        } catch (error) {
          console.error(`Error loading project ${projectId}:`, error);
        }
      }
      
      setProjects(projectsMap);
      setRequests(trackingRequests);
    } catch (error) {
      console.error('Error loading tracking requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    if (Platform.OS !== 'web') {
      const { Haptics } = await import('expo-haptics');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setRefreshing(true);
    await loadRequests();
  };

  const filteredRequests = filterStatus === 'all' 
    ? requests 
    : filterStatus === 'approved'
    ? requests.filter(req => !req.purchase_status || req.purchase_status === 'pending')
    : requests.filter(req => req.purchase_status === filterStatus);

  // Sort function
  const sortRequests = (requestsToSort: MaterialRequest[]) => {
    const sorted = [...requestsToSort];
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          const dateA = a.approved_at ? new Date(a.approved_at).getTime() : 0;
          const dateB = b.approved_at ? new Date(b.approved_at).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case 'name':
          const nameA = (a.item_name && a.item_name.trim()) || a.description || '';
          const nameB = (b.item_name && b.item_name.trim()) || b.description || '';
          comparison = nameA.localeCompare(nameB);
          break;
        case 'project':
          comparison = (a.project_name || '').localeCompare(b.project_name || '');
          break;
        case 'status':
          const statusA = a.purchase_status || 'pending';
          const statusB = b.purchase_status || 'pending';
          const statusOrder = { 'pending': 0, 'ordered': 1, 'shipped': 2, 'delivered': 3 };
          comparison = (statusOrder[statusA as keyof typeof statusOrder] || 0) - (statusOrder[statusB as keyof typeof statusOrder] || 0);
          break;
      }
      
      return sortAscending ? comparison : -comparison;
    });
    
    return sorted;
  };

  const sortedAndFilteredRequests = sortRequests(filteredRequests);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ordered': return '#3b82f6'; // Blue
      case 'shipped': return '#f59e0b'; // Orange
      case 'delivered': return '#10b981'; // Green
      default: return '#000000'; // Gray
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'ordered': return ShoppingCart;
      case 'shipped': return Truck;
      case 'delivered': return MapPin;
      default: return Clock;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'ordered': return 'Ordered';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      default: return 'Pending';
    }
  };

  const getTimelineSteps = (request: MaterialRequest) => {
    const steps = [];
    
    // Requested
    steps.push({
      status: 'completed',
      label: 'Requested',
      date: request.requested_at,
      icon: Package,
    });

    // Approved
    if (request.approved_at) {
      steps.push({
        status: 'completed',
        label: 'Approved',
        date: request.approved_at,
        icon: CheckCircle,
      });
    }

    // Ordered
    if (request.purchase_status === 'ordered' || request.purchase_status === 'shipped' || request.purchase_status === 'delivered') {
      steps.push({
        status: 'completed',
        label: 'Ordered',
        date: request.purchase_date,
        icon: ShoppingCart,
      });
    }

    // Shipped
    if (request.purchase_status === 'shipped' || request.purchase_status === 'delivered') {
      steps.push({
        status: 'completed',
        label: 'Shipped',
        date: request.shipping_date,
        icon: Truck,
      });
    }

    // Delivered
    if (request.purchase_status === 'delivered') {
      steps.push({
        status: 'completed',
        label: 'Delivered',
        date: request.delivery_date_actual,
        icon: MapPin,
      });
    } else if (request.purchase_status === 'shipped') {
      steps.push({
        status: 'pending',
        label: 'Delivered',
        date: request.delivery_date,
        icon: MapPin,
      });
    } else if (request.purchase_status === 'ordered') {
      steps.push({
        status: 'pending',
        label: 'Shipped',
        date: null,
        icon: Truck,
      });
      steps.push({
        status: 'pending',
        label: 'Delivered',
        date: request.delivery_date,
        icon: MapPin,
      });
    }

    return steps;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  // Status update functions for office and admin
  const handleUpdateStatus = async (requestId: string, newStatus: 'ordered' | 'shipped' | 'delivered') => {
    try {
      // If marking as ordered, ask for delivery address first
      if (newStatus === 'ordered') {
        const request = requests.find(r => r.id === requestId);
        if (request && (!request.purchase_status || request.purchase_status === 'pending')) {
          setRequestIdForOrder(requestId);
          setDeliveryAddress('');
          setShowDeliveryAddressModal(true);
          return;
        }
      }
      
      // For other statuses or if already ordered, proceed directly
      await performStatusUpdate(requestId, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const performStatusUpdate = async (requestId: string, newStatus: 'ordered' | 'shipped' | 'delivered', address?: string) => {
    try {
      const currentDate = new Date().toISOString();
      const updateData: any = {
        purchase_status: newStatus,
      };

      // Set appropriate date based on status
      if (newStatus === 'ordered') {
        updateData.purchase_date = currentDate;
        if (address) {
          updateData.delivery_address = address;
        }
      } else if (newStatus === 'shipped') {
        updateData.shipping_date = currentDate;
        // Ensure purchase_date exists if not already set
        const request = requests.find(r => r.id === requestId);
        if (request && !request.purchase_date) {
          updateData.purchase_date = currentDate;
        }
      } else if (newStatus === 'delivered') {
        updateData.delivery_date_actual = currentDate;
        // Ensure previous dates exist if not already set
        const request = requests.find(r => r.id === requestId);
        if (request) {
          if (!request.purchase_date) {
            updateData.purchase_date = currentDate;
          }
          if (!request.shipping_date) {
            updateData.shipping_date = currentDate;
          }
        }
      }

      await MaterialRequestService.updateMaterialRequest(requestId, updateData);
      await loadRequests();
      
      const dateStr = formatDate(currentDate);
      Alert.alert('Success', `Status updated to ${getStatusText(newStatus)}\nDate recorded: ${dateStr}`);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleConfirmDeliveryAddress = async () => {
    if (!deliveryAddress.trim()) {
      Alert.alert('Error', 'Please enter delivery address');
      return;
    }
    
    if (requestIdForOrder) {
      setShowDeliveryAddressModal(false);
      await performStatusUpdate(requestIdForOrder, 'ordered', deliveryAddress.trim());
      setRequestIdForOrder(null);
      setDeliveryAddress('');
    }
  };

  const canUpdateStatus = userRole === 'admin' || userRole === 'office';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Loading tracking information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HamburgerMenu />
      {Platform.OS === 'web' && <TopNavigationBar />}
      
      <View style={styles.header}>
        <BackButton 
          color="#000000"
          backgroundColor="rgba(35, 110, 207, 0.1)"
        />
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1}>Material Tracking</Text>
          <Text style={styles.subtitle}>
            {sortedAndFilteredRequests.length} request{sortedAndFilteredRequests.length !== 1 ? 's' : ''} found
          </Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={[styles.filterButtonText, filterStatus === 'all' && styles.filterButtonTextActive]} numberOfLines={1}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'approved' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('approved')}
          >
            <CheckCircle size={16} color={filterStatus === 'approved' ? '#ffffff' : '#000000'} />
            <Text style={[styles.filterButtonText, filterStatus === 'approved' && styles.filterButtonTextActive]} numberOfLines={1}>
              Approved
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'ordered' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('ordered')}
          >
            <ShoppingCart size={16} color={filterStatus === 'ordered' ? '#ffffff' : '#000000'} />
            <Text style={[styles.filterButtonText, filterStatus === 'ordered' && styles.filterButtonTextActive]} numberOfLines={1}>
              Ordered
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'shipped' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('shipped')}
          >
            <Truck size={16} color={filterStatus === 'shipped' ? '#ffffff' : '#000000'} />
            <Text style={[styles.filterButtonText, filterStatus === 'shipped' && styles.filterButtonTextActive]} numberOfLines={1}>
              Shipped
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'delivered' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('delivered')}
          >
            <MapPin size={16} color={filterStatus === 'delivered' ? '#ffffff' : '#000000'} />
            <Text style={[styles.filterButtonText, filterStatus === 'delivered' && styles.filterButtonTextActive]} numberOfLines={1}>
              Delivered
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, styles.sortButton]}
            onPress={() => setShowSortModal(true)}
          >
            <ArrowUpDown size={16} color="#000000" />
            <Text style={styles.filterButtonText} numberOfLines={1}>Sort</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
        scrollEventThrottle={16}
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
        {sortedAndFilteredRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={48} color="#000000" />
            <Text style={styles.emptyText}>No tracking information available</Text>
            <Text style={styles.emptySubtext}>
              {filterStatus === 'all' 
                ? 'No approved material requests with tracking status'
                : filterStatus === 'approved'
                ? 'No approved material requests (pending purchase)'
                : `No requests with status: ${getStatusText(filterStatus)}`
              }
            </Text>
          </View>
        ) : (
          sortedAndFilteredRequests.map((request) => {
            const StatusIcon = getStatusIcon(request.purchase_status);
            const statusColor = getStatusColor(request.purchase_status);
            const timelineSteps = getTimelineSteps(request);

            return (
              <View key={request.id} style={styles.trackingCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Package size={20} color="#000000" />
                    <View style={styles.cardHeaderText}>
                      <Text style={styles.cardTitle}>
                        {request.item_name && request.item_name.trim() 
                          ? request.item_name 
                          : (request.description || 'N/A')}
                      </Text>
                      {request.item_name && request.item_name.trim() && request.description && (
                        <Text style={styles.cardSubtitleText} numberOfLines={1}>
                          {request.description}
                        </Text>
                      )}
                      <View style={styles.cardSubtitle}>
                        <Hash size={12} color="#000000" />
                        <Text style={styles.cardSubtitleText}>{request.project_name}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                    <StatusIcon size={16} color={statusColor} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {getStatusText(request.purchase_status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDetails}>
                  {request.item_name && request.item_name.trim() && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Item Name:</Text>
                      <Text style={styles.detailValue}>{request.item_name}</Text>
                    </View>
                  )}
                  {request.description && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Description:</Text>
                      <Text style={styles.detailValue}>{request.description}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Quantity:</Text>
                    <Text style={styles.detailValue}>{request.quantity}</Text>
                  </View>
                  {request.sub_contractor && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Vendor:</Text>
                      <Text style={styles.detailValue}>{request.sub_contractor}</Text>
                    </View>
                  )}
                  {(projects[request.project_id] || (request as any).delivery_address) && (
                    <View style={styles.detailRowAddress}>
                      <Text style={styles.detailLabel}>Delivery Address:</Text>
                      <Text style={styles.detailValueAddress} numberOfLines={3}>
                        {(request as any).delivery_address || 
                         (projects[request.project_id]?.project_address || 
                          (projects[request.project_id]?.project_street ? 
                           `${projects[request.project_id].project_street}, ${projects[request.project_id].project_city || ''} ${projects[request.project_id].project_state || ''} ${projects[request.project_id].project_zip || ''}`.trim() :
                           'N/A'))}
                      </Text>
                    </View>
                  )}
                  {request.purchase_date && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Ordered Date:</Text>
                      <Text style={[styles.detailValue, { color: '#3b82f6' }]}>{formatDate(request.purchase_date)}</Text>
                    </View>
                  )}
                  {request.shipping_date && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Shipped Date:</Text>
                      <Text style={[styles.detailValue, { color: '#f59e0b' }]}>{formatDate(request.shipping_date)}</Text>
                    </View>
                  )}
                  {request.delivery_date_actual && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Delivered Date:</Text>
                      <Text style={[styles.detailValue, { color: '#10b981' }]}>{formatDate(request.delivery_date_actual)}</Text>
                    </View>
                  )}
                </View>

                {/* Status Update Buttons - Only for admin and office */}
                {canUpdateStatus && (
                  <View style={styles.statusActionsContainer}>
                    <Text style={styles.statusActionsTitle}>Update Status</Text>
                    <View style={styles.statusActions}>
                      {/* Show "Mark as Ordered" if status is pending, doesn't exist, or is approved without purchase_status */}
                      {(!request.purchase_status || request.purchase_status === 'pending') && (
                        <TouchableOpacity
                          style={[styles.statusActionButton, styles.statusActionButtonOrdered]}
                          onPress={() => handleUpdateStatus(request.id, 'ordered')}
                        >
                          <ShoppingCart size={16} color="#ffffff" />
                          <Text style={styles.statusActionButtonText}>Mark as Ordered</Text>
                        </TouchableOpacity>
                      )}
                      {/* Show "Mark as Shipped" if status is ordered */}
                      {request.purchase_status === 'ordered' && (
                        <TouchableOpacity
                          style={[styles.statusActionButton, styles.statusActionButtonShipped]}
                          onPress={() => handleUpdateStatus(request.id, 'shipped')}
                        >
                          <Truck size={16} color="#ffffff" />
                          <Text style={styles.statusActionButtonText}>Mark as Shipped</Text>
                        </TouchableOpacity>
                      )}
                      {/* Show "Mark as Delivered" if status is shipped */}
                      {request.purchase_status === 'shipped' && (
                        <TouchableOpacity
                          style={[styles.statusActionButton, styles.statusActionButtonDelivered]}
                          onPress={() => handleUpdateStatus(request.id, 'delivered')}
                        >
                          <MapPin size={16} color="#ffffff" />
                          <Text style={styles.statusActionButtonText}>Mark as Delivered</Text>
                        </TouchableOpacity>
                      )}
                      {/* If delivered, show message */}
                      {request.purchase_status === 'delivered' && (
                        <View style={styles.statusCompletedMessage}>
                          <CheckCircle size={16} color="#10b981" />
                          <Text style={styles.statusCompletedText}>Order delivered</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Timeline */}
                <View style={styles.timelineContainer}>
                  <Text style={styles.timelineTitle}>Tracking Timeline</Text>
                  {timelineSteps.map((step, index) => {
                    const IconComponent = step.icon;
                    const isLast = index === timelineSteps.length - 1;
                    const isCompleted = step.status === 'completed';

                    return (
                      <View key={index} style={styles.timelineItem}>
                        <View style={styles.timelineLine}>
                          <View style={[
                            styles.timelineIcon,
                            isCompleted ? styles.timelineIconCompleted : styles.timelineIconPending
                          ]}>
                            <IconComponent 
                              size={16} 
                              color={isCompleted ? '#ffffff' : '#000000'} 
                            />
                          </View>
                          {!isLast && (
                            <View style={[
                              styles.timelineConnector,
                              isCompleted ? styles.timelineConnectorCompleted : styles.timelineConnectorPending
                            ]} />
                          )}
                        </View>
                        <View style={styles.timelineContent}>
                          <Text style={[
                            styles.timelineLabel,
                            isCompleted ? styles.timelineLabelCompleted : styles.timelineLabelPending
                          ]}>
                            {step.label}
                          </Text>
                          {step.date && (
                            <Text style={styles.timelineDate}>
                              {formatDate(step.date)}
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sortModalContent}>
            <View style={styles.sortModalHeader}>
              <Text style={styles.sortModalTitle}>Sort By</Text>
              <TouchableOpacity
                onPress={() => setShowSortModal(false)}
                style={styles.sortModalCloseButton}
              >
                <X size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.sortOptions}>
              <TouchableOpacity
                style={[styles.sortOption, sortBy === 'date' && styles.sortOptionActive]}
                onPress={() => {
                  setSortBy('date');
                  setSortAscending(!sortAscending);
                }}
              >
                <Calendar size={20} color={sortBy === 'date' ? '#000000' : '#000000'} />
                <Text style={[styles.sortOptionText, sortBy === 'date' && styles.sortOptionTextActive]}>
                  Date {sortBy === 'date' && (sortAscending ? '↑' : '↓')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.sortOption, sortBy === 'name' && styles.sortOptionActive]}
                onPress={() => {
                  setSortBy('name');
                  setSortAscending(!sortAscending);
                }}
              >
                <Package size={20} color={sortBy === 'name' ? '#000000' : '#000000'} />
                <Text style={[styles.sortOptionText, sortBy === 'name' && styles.sortOptionTextActive]}>
                  Item Name {sortBy === 'name' && (sortAscending ? '↑' : '↓')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.sortOption, sortBy === 'project' && styles.sortOptionActive]}
                onPress={() => {
                  setSortBy('project');
                  setSortAscending(!sortAscending);
                }}
              >
                <Hash size={20} color={sortBy === 'project' ? '#000000' : '#000000'} />
                <Text style={[styles.sortOptionText, sortBy === 'project' && styles.sortOptionTextActive]}>
                  Project {sortBy === 'project' && (sortAscending ? '↑' : '↓')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.sortOption, sortBy === 'status' && styles.sortOptionActive]}
                onPress={() => {
                  setSortBy('status');
                  setSortAscending(!sortAscending);
                }}
              >
                <CheckCircle size={20} color={sortBy === 'status' ? '#000000' : '#000000'} />
                <Text style={[styles.sortOptionText, sortBy === 'status' && styles.sortOptionTextActive]}>
                  Status {sortBy === 'status' && (sortAscending ? '↑' : '↓')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delivery Address Modal */}
      <Modal
        visible={showDeliveryAddressModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowDeliveryAddressModal(false);
          setRequestIdForOrder(null);
          setDeliveryAddress('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deliveryAddressModalContent}>
            <View style={styles.deliveryAddressModalHeader}>
              <Text style={styles.deliveryAddressModalTitle}>Enter Delivery Address</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowDeliveryAddressModal(false);
                  setRequestIdForOrder(null);
                  setDeliveryAddress('');
                }}
                style={styles.deliveryAddressModalCloseButton}
              >
                <X size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.deliveryAddressModalBody}>
              <Text style={styles.deliveryAddressModalLabel}>Delivery Address *</Text>
              <TextInput
                style={styles.deliveryAddressInput}
                placeholder="Enter delivery address"
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.deliveryAddressModalActions}>
              <TouchableOpacity
                style={[styles.deliveryAddressModalButton, styles.deliveryAddressModalButtonCancel]}
                onPress={() => {
                  setShowDeliveryAddressModal(false);
                  setRequestIdForOrder(null);
                  setDeliveryAddress('');
                }}
              >
                <Text style={styles.deliveryAddressModalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deliveryAddressModalButton, styles.deliveryAddressModalButtonConfirm]}
                onPress={handleConfirmDeliveryAddress}
              >
                <Text style={styles.deliveryAddressModalButtonConfirmText}>Confirm</Text>
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
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerContent: {
    flex: 1,
    marginLeft: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#000000',
    marginTop: 4,
  },
  filterContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    gap: 6,
    marginRight: 8,
    minWidth: 80,
  },
  sortButton: {
    marginLeft: 8,
  },
  filterButtonActive: {
    backgroundColor: '#ffffff',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120, // Extra padding for mobile tab bar
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
    marginTop: 8,
    textAlign: 'center',
  },
  trackingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardSubtitleText: {
    fontSize: 12,
    color: '#000000',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetails: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailRowAddress: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  detailValueAddress: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    flex: 1,
  },
  timelineContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLine: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconCompleted: {
    backgroundColor: '#10b981',
  },
  timelineIconPending: {
    backgroundColor: '#e5e7eb',
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    minHeight: 20,
    marginTop: 4,
  },
  timelineConnectorCompleted: {
    backgroundColor: '#10b981',
  },
  timelineConnectorPending: {
    backgroundColor: '#e5e7eb',
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineLabelCompleted: {
    color: '#111827',
  },
  timelineLabelPending: {
    color: '#000000',
  },
  timelineDate: {
    fontSize: 12,
    color: '#000000',
  },
  statusActionsContainer: {
    marginTop: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statusActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  statusActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  statusActionButtonOrdered: {
    backgroundColor: '#3b82f6',
  },
  statusActionButtonShipped: {
    backgroundColor: '#f59e0b',
  },
  statusActionButtonDelivered: {
    backgroundColor: '#10b981',
  },
  statusActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusCompletedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#d1fae5',
    gap: 8,
  },
  statusCompletedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sortModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '80%',
  },
  sortModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sortModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  sortModalCloseButton: {
    padding: 4,
  },
  sortOptions: {
    padding: 20,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
    gap: 12,
  },
  sortOptionActive: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  deliveryAddressModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '80%',
  },
  deliveryAddressModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  deliveryAddressModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  deliveryAddressModalCloseButton: {
    padding: 4,
  },
  deliveryAddressModalBody: {
    padding: 20,
  },
  deliveryAddressModalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  deliveryAddressInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 100,
    backgroundColor: '#ffffff',
  },
  deliveryAddressModalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 0,
  },
  deliveryAddressModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryAddressModalButtonCancel: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  deliveryAddressModalButtonConfirm: {
    backgroundColor: '#ffffff',
  },
  deliveryAddressModalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  deliveryAddressModalButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

