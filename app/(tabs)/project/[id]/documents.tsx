import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
  InteractionManager,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Plus, Camera, FileText, Folder, X, Image as ImageIcon, File } from 'lucide-react-native';
import BackButton from '@/components/BackButton';
import HamburgerMenu from '@/components/HamburgerMenu';
import { useAuth } from '@/contexts/AuthContext';
import { Project } from '@/types';
import { DocumentService, Document as DocumentType } from '@/services/documentService';
import { ProjectService } from '@/services/projectService';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

type DocumentCategory = 'Plans' | 'Permits' | 'Designs' | 'Inspection' | 'Insurance' | 'Licence' | 'Other';

export default function DocumentsScreen() {
  const { id } = useLocalSearchParams();
  const { user, userRole } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'All'>('All');
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('Plans');
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const documentPickerInProgress = useRef(false);
  const imagePickerInProgress = useRef(false);

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploading(false);
  };

  // All categories - Insurance and Licence only visible to admin and office
  const allCategories: DocumentCategory[] = ['Plans', 'Permits', 'Designs', 'Inspection', 'Insurance', 'Licence', 'Other'];
  const categories: DocumentCategory[] = (userRole === 'admin' || userRole === 'office') 
    ? allCategories 
    : allCategories.filter(cat => cat !== 'Insurance' && cat !== 'Licence');
  const tabCategories: (DocumentCategory | 'All')[] = ['All', ...categories];

  useEffect(() => {
    loadProject();
  }, [id]);

  useEffect(() => {
    if (project?.id) {
      loadDocuments();
    }
  }, [id, selectedCategory, project?.id]);

  useEffect(() => {
    if (showUploadModal) setUploading(false);
  }, [showUploadModal]);

  const loadProject = async () => {
    try {
      if (!id) return;
      const projectData = await ProjectService.getProjectById(id as string);
      setProject(projectData);
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  const loadDocuments = async () => {
    if (!id) return;
    try {
      setLoading(true);
      if (selectedCategory === 'All') {
        const allDocs = await DocumentService.getDocumentsByProjectId(id as string);
        setDocuments(allDocs);
      } else {
        const projectDocuments = await DocumentService.getDocumentsByProjectAndCategory(
          id as string,
          selectedCategory
        );
        setDocuments(projectDocuments);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos');
        return false;
      }
    }
    return true;
  };

  const handleTakePhoto = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return;

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // Web: Use file input
        setShowUploadModal(false);
        const input = window.document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        
        input.onchange = async (e: Event) => {
          const target = e.target as HTMLInputElement;
          if (target.files && target.files[0]) {
            const file = target.files[0];
            await uploadImageFile(file, file.name);
          }
        };
        input.click();
        return;
      } else {
        // Mobile: Prevent multiple pickers at once; keep modal open until picker returns (avoids native state issues)
        if (imagePickerInProgress.current || documentPickerInProgress.current) {
          Alert.alert('Please wait', 'Finish the current action first.');
          return;
        }
        imagePickerInProgress.current = true;
        setUploading(true);
        let result: Awaited<ReturnType<typeof ImagePicker.launchCameraAsync>>;
        try {
          result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });
        } finally {
          imagePickerInProgress.current = false;
        }
        setShowUploadModal(false);
        if (!result!.canceled && result!.assets && result!.assets[0]) {
          const asset = result!.assets[0];
          const fileName = asset.uri.split('/').pop() || `photo_${Date.now()}.jpg`;
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);
            const response = await fetch(asset.uri, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blob = await response.blob();
            await uploadImageFile(blob, fileName);
          } catch (fetchError) {
            console.error('Error reading photo:', fetchError);
            Alert.alert('Error', 'Could not read the photo. Try again.');
          }
        } else {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      imagePickerInProgress.current = false;
      setUploading(false);
    }
  };

  const handleUploadDocument = async () => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // Web: Use file input
        setShowUploadModal(false);
        const input = window.document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf';
        
        input.onchange = async (e: Event) => {
          const target = e.target as HTMLInputElement;
          if (target.files && target.files[0]) {
            const file = target.files[0];
            await uploadDocumentFile(file, file.name);
          }
        };
        input.click();
        return;
      } else {
        // Mobile: Prevent "Different document picking in progress" – only one picker at a time
        if (documentPickerInProgress.current || imagePickerInProgress.current) {
          Alert.alert('Please wait', 'Finish the current action first.');
          return;
        }
        documentPickerInProgress.current = true;
        setUploading(true);
        let result: Awaited<ReturnType<typeof DocumentPicker.getDocumentAsync>>;
        try {
          await new Promise<void>((resolve) => {
            InteractionManager.runAfterInteractions(() => {
              setTimeout(resolve, 400);
            });
          });
          result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'application/rtf'],
            copyToCacheDirectory: true,
          });
        } finally {
          documentPickerInProgress.current = false;
        }
        setShowUploadModal(false);
        if (!result!.canceled && result!.assets && result!.assets[0]) {
          const asset = result!.assets[0];
          const fileName = asset.name;
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);
            const response = await fetch(asset.uri, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blob = await response.blob();
            await uploadDocumentFile(blob, fileName);
          } catch (fetchError) {
            console.error('Error reading document file:', fetchError);
            Alert.alert('Error', 'Could not read the selected file. Try again or choose another file.');
          }
        } else {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      documentPickerInProgress.current = false;
      setUploading(false);
    }
  };

  const uploadImageFile = async (file: Blob | File, fileName?: string) => {
    if (!id || !user) return;

    try {
      setUploading(true);
      const fileExtension = fileName?.split('.').pop() || 'jpg';
      const finalFileName = fileName || `photo_${Date.now()}.${fileExtension}`;

      await DocumentService.uploadDocument(
        id as string,
        uploadCategory,
        file,
        finalFileName,
        'image',
        user.name || user.email || 'Unknown',
        user.id
      );

      Alert.alert('Success', 'Photo uploaded successfully');
      await loadDocuments();
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const uploadDocumentFile = async (file: Blob | File, fileName?: string) => {
    if (!id || !user) return;

    const resolvedName = fileName || (file instanceof File ? file.name : undefined) || `document_${Date.now()}`;
    try {
      setUploading(true);

      await DocumentService.uploadDocument(
        id as string,
        uploadCategory,
        file,
        resolvedName,
        'document',
        user.name || user.email || 'Unknown',
        user.id
      );

      Alert.alert('Success', 'Document uploaded successfully');
      await loadDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DocumentService.deleteDocument(docId);
              setDocuments(prev => prev.filter(doc => doc.id !== docId));
              Alert.alert('Success', 'Document deleted');
            } catch (error) {
              console.error('Error deleting document:', error);
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <HamburgerMenu />
      <View style={styles.header}>
        <BackButton 
          onPress={() => router.push(`/(tabs)/project/${id}`)}
          color="#000000"
          backgroundColor="rgba(0,0,0,0.06)" 
        />
        <Text style={styles.headerTitle} numberOfLines={1}>Documents</Text>
      </View>

      {/* Category Tabs - horizontal scroll */}
      <View style={styles.categoryTabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          bounces={false}
          style={styles.categoryTabsScroll}
          contentContainerStyle={styles.categoryTabsContent}>
          {tabCategories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                selectedCategory === category && styles.categoryTabActive,
              ]}
              onPress={() => {
                setSelectedCategory(category);
                if (category !== 'All') setUploadCategory(category);
              }}>
              <Text
                style={[
                  styles.categoryTabText,
                  selectedCategory === category && styles.categoryTabTextActive,
                ]}
                numberOfLines={1}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Documents List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        ) : documents.length === 0 ? (
          <View style={styles.emptyState}>
            <Folder size={48} color="#ffffff" />
            <Text style={styles.emptyText}>
              {selectedCategory === 'All' ? 'No documents' : `No documents in ${selectedCategory}`}
            </Text>
            <Text style={styles.emptySubtext}>Add a document to get started</Text>
          </View>
        ) : selectedCategory === 'All' ? (
          <View style={styles.documentsByCategory}>
            {categories.map((cat) => {
              const docsInCategory = documents.filter((d) => d.category === cat);
              if (docsInCategory.length === 0) return null;
              return (
                <View key={cat} style={styles.categorySection}>
                  <Text style={styles.categorySectionTitle}>{cat}</Text>
                  <View style={styles.documentsGrid}>
                    {docsInCategory.map((document) => (
                      <View key={document.id} style={styles.documentCard}>
                        {document.file_type === 'image' ? (
                          <Image
                            source={{ uri: document.file_url }}
                            style={styles.documentImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.documentIconContainer}>
                            <FileText size={40} color="#000000" />
                          </View>
                        )}
                        <View style={styles.documentInfo}>
                          <Text style={styles.documentName} numberOfLines={2}>
                            {document.name}
                          </Text>
                          <Text style={styles.documentMeta}>
                            {new Date(document.uploaded_at).toLocaleDateString()}
                          </Text>
                          <Text style={styles.documentMeta}>by {document.uploaded_by}</Text>
                        </View>
                        {userRole === 'admin' && (
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteDocument(document.id)}>
                            <X size={16} color="#ef4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.documentsGrid}>
            {documents.map((document) => (
              <View key={document.id} style={styles.documentCard}>
                {document.file_type === 'image' ? (
                  <Image
                    source={{ uri: document.file_url }}
                    style={styles.documentImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.documentIconContainer}>
                    <FileText size={40} color="#000000" />
                  </View>
                )}
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName} numberOfLines={2}>
                    {document.name}
                  </Text>
                  <Text style={styles.documentMeta}>
                    {new Date(document.uploaded_at).toLocaleDateString()}
                  </Text>
                  <Text style={styles.documentMeta}>by {document.uploaded_by}</Text>
                </View>
                {userRole === 'admin' && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteDocument(document.id)}>
                    <X size={16} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowUploadModal(true)}>
        <Plus size={24} color="#000000" />
      </TouchableOpacity>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Upload Document</Text>
            <TouchableOpacity onPress={closeUploadModal}>
              <X size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {uploading && (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="large" color="#000000" />
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}
            <View style={styles.uploadOptions}>
              <TouchableOpacity
                style={[styles.uploadOption, uploading && styles.uploadOptionDisabled]}
                onPress={handleTakePhoto}
                disabled={uploading}>
                <Camera size={32} color={uploading ? "#000000" : "#000000"} />
                <Text style={[styles.uploadOptionText, uploading && styles.uploadOptionTextDisabled]}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadOption, uploading && styles.uploadOptionDisabled]}
                onPress={handleUploadDocument}
                disabled={uploading}>
                <FileText size={32} color={uploading ? "#000000" : "#000000"} />
                <Text style={[styles.uploadOptionText, uploading && styles.uploadOptionTextDisabled]}>Upload Document</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.categorySelector}>
              <Text style={styles.selectorLabel}>Category:</Text>
              <View style={styles.categoryButtons}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      uploadCategory === category && styles.categoryButtonActive,
                    ]}
                    onPress={() => setUploadCategory(category)}>
                    <Text
                      style={[
                        styles.categoryButtonText,
                        uploadCategory === category && styles.categoryButtonTextActive,
                      ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>
      {/* Global uploading overlay - visible even when modal is closed (e.g. on web after file picker) */}
      {uploading && (
        <View style={styles.uploadingOverlay} pointerEvents="box-none">
          <View style={styles.uploadingBanner}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={styles.uploadingBannerText}>Uploading...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Blue background like teams
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 80 : 100,
    zIndex: 9999,
  },
  uploadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    gap: 12,
  },
  uploadingBannerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingRight: 60,
    paddingBottom: 20,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#b0b0b0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
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
    elevation: 8,
  },
  categoryTabsWrapper: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#b0b0b0',
  },
  categoryTabsScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  categoryTabsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 20,
    paddingRight: 20,
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#b0b0b0',
    flexShrink: 0,
  },
  categoryTabActive: {
    backgroundColor: '#000000',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  categoryTabTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff', // White text on blue background
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#f5f5f5', // Light yellow like teams
    marginTop: 4,
  },
  documentsByCategory: {
    gap: 24,
  },
  categorySection: {
    marginBottom: 8,
  },
  categorySectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#b0b0b0',
  },
  documentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  documentCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    borderLeftWidth: 4,
    borderLeftColor: '#ffffff', // Yellow border like teams
  },
  documentImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f3f4f6',
  },
  documentIconContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentInfo: {
    padding: 12,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 12,
    color: '#000000',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
    padding: 20,
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  uploadOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 24,
    borderWidth: 2,
    borderColor: '#e0f2fe',
    borderStyle: 'dashed',
  },
  uploadOptionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  uploadOptionDisabled: {
    opacity: 0.5,
  },
  uploadOptionTextDisabled: {
    color: '#000000',
  },
  uploadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  uploadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  categorySelector: {
    marginTop: 20,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
});



