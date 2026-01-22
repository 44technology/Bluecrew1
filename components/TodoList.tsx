import React, { useState, useEffect, useImperativeHandle } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  Image as RNImage,
} from 'react-native';
import { Plus, X, CheckCircle2, Clock } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { TodoItem } from '@/types';
import { TodoService } from '@/services/todoService';
import { TodoCard } from './TodoCard';
import { useAuth } from '@/contexts/AuthContext';

interface TodoListProps {
  projectId: string;
  canCreate: boolean; // Only admin can create
  canEdit: boolean; // Admin and PM can edit
  canDelete: boolean; // Only admin can delete
  onCreateButtonPress?: () => void; // Callback when create button is pressed externally
  hideCreateButton?: boolean; // Hide the create button in TodoList header
}

export const TodoList = React.forwardRef<{ openCreateModal: () => void }, TodoListProps>(({
  projectId,
  canCreate,
  canEdit,
  canDelete,
  onCreateButtonPress,
  hideCreateButton = false,
}, ref) => {
  const authContext = useAuth();
  const user = authContext?.user || null;

  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDescription, setNewTodoDescription] = useState('');
  const [newTodoDeadline, setNewTodoDeadline] = useState<Date | null>(null);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [newTodoImages, setNewTodoImages] = useState<string[]>([]);
  const [newTodoChecklist, setNewTodoChecklist] = useState<string[]>(['']);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadTodos();

    // Subscribe to real-time updates
    const unsubscribe = TodoService.subscribeToTodos(projectId, (updatedTodos) => {
      setTodos(updatedTodos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId]);

  // Expose openCreateModal method via ref
  useImperativeHandle(ref, () => ({
    openCreateModal: () => {
      setShowCreateModal(true);
    },
  }));

  const loadTodos = async () => {
    try {
      setLoading(true);
      const projectTodos = await TodoService.getTodosByProjectId(projectId);
      setTodos(projectTodos);
    } catch (error) {
      console.error('Error loading todos:', error);
      Alert.alert('Error', 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web: Use HTML file input
        if (typeof window === 'undefined' || !window.document) {
          Alert.alert('Error', 'File picker is not available in this environment');
          return;
        }
        const input = window.document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.style.display = 'none';
        input.onchange = async (e: Event) => {
          const target = e.target as HTMLInputElement;
          if (target.files && target.files.length > 0) {
            const files = Array.from(target.files);
            const imageUris: string[] = [];
            for (const file of files) {
              const uri = URL.createObjectURL(file);
              imageUris.push(uri);
            }
            setNewTodoImages([...newTodoImages, ...imageUris]);
          }
          // Clean up
          if (input.parentNode) {
            input.parentNode.removeChild(input);
          }
        };
        window.document.body.appendChild(input);
        input.click();
        return;
      } else {
        // Mobile: Use ImagePicker
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please grant camera roll permissions');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
          allowsMultipleSelection: true,
        });

        if (!result.canceled && result.assets) {
          const imageUris = result.assets.map(asset => asset.uri);
          setNewTodoImages([...newTodoImages, ...imageUris]);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRemoveImage = (index: number) => {
    setNewTodoImages(newTodoImages.filter((_, i) => i !== index));
  };

  const handleAddChecklistItem = () => {
    setNewTodoChecklist([...newTodoChecklist, '']);
  };

  const handleRemoveChecklistItem = (index: number) => {
    if (newTodoChecklist.length > 1) {
      setNewTodoChecklist(newTodoChecklist.filter((_, i) => i !== index));
    }
  };

  const handleChecklistItemChange = (index: number, value: string) => {
    const updated = [...newTodoChecklist];
    updated[index] = value;
    setNewTodoChecklist(updated);
  };

  const handleCreateTodo = async () => {
    if (!newTodoTitle.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setCreating(true);
      setUploadingImages(true);

      // Create checklist items array
      const checklistItems = newTodoChecklist
        .filter(item => item.trim())
        .map(item => ({
          text: item.trim(),
          completed: false,
        }));

      // Create todo first
      const todoId = await TodoService.createTodo({
        project_id: projectId,
        title: newTodoTitle.trim(),
        description: newTodoDescription.trim(),
        status: 'pending',
        deadline: newTodoDeadline ? newTodoDeadline.toISOString() : undefined,
        created_by: user.id,
        created_by_name: user.name || 'Unknown',
        images: [],
        comments: [],
        checklist: [],
      });

      // Upload images
      for (const imageUri of newTodoImages) {
        try {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const file = new File([blob], `image_${Date.now()}.jpg`, { type: 'image/jpeg' });
          
          await TodoService.uploadTodoImage(
            todoId,
            file,
            `image_${Date.now()}.jpg`,
            user.id,
            user.name || 'Unknown'
          );
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }

      // Add checklist items
      for (const item of checklistItems) {
        await TodoService.addChecklistItem(todoId, item);
      }

      setUploadingImages(false);
      
      // Reload todos to ensure it appears
      await loadTodos();
      
      // Reset form
      setNewTodoTitle('');
      setNewTodoDescription('');
      setNewTodoDeadline(null);
      setNewTodoImages([]);
      setNewTodoChecklist(['']);
      setShowCreateModal(false);
    } catch (error: any) {
      console.error('Error creating todo:', error);
      const errorMessage = error?.message || 'Failed to create todo';
      Alert.alert('Error', `Failed to create todo: ${errorMessage}`);
      setUploadingImages(false);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    Alert.alert(
      'Delete Todo',
      'Are you sure you want to delete this todo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await TodoService.deleteTodo(todoId);
              loadTodos();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete todo');
            }
          },
        },
      ]
    );
  };

  const pendingTodos = todos.filter(todo => todo.status === 'pending');
  const inProgressTodos = todos.filter(todo => todo.status === 'in_progress');
  const completedTodos = todos.filter(todo => todo.status === 'completed');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading todos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>To-Do List</Text>
        {canCreate && !hideCreateButton && (
          <TouchableOpacity
            onPress={() => {
              if (onCreateButtonPress) {
                onCreateButtonPress();
              } else {
                setShowCreateModal(true);
              }
            }}
            style={styles.createButton}
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.createButtonText}>New Todo</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Pending Todos */}
        {pendingTodos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending ({pendingTodos.length})</Text>
            {pendingTodos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onUpdate={loadTodos}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            ))}
          </View>
        )}

        {/* In Progress Todos */}
        {inProgressTodos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>In Progress ({inProgressTodos.length})</Text>
            {inProgressTodos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onUpdate={loadTodos}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            ))}
          </View>
        )}

        {/* Completed Todos */}
        {completedTodos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Completed ({completedTodos.length})
            </Text>
            {completedTodos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onUpdate={loadTodos}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {todos.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No todos yet</Text>
            {canCreate && (
              <Text style={styles.emptySubtext}>
                Tap "New Todo" to create your first todo item
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Create Todo Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Todo</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateModal(false);
                  // Reset form
                  setNewTodoTitle('');
                  setNewTodoDescription('');
                  setNewTodoDeadline(null);
                  setNewTodoImages([]);
                  setNewTodoChecklist(['']);
                }}
                style={styles.closeModalButton}
                disabled={creating}
              >
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={true}>
              {/* Title */}
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.titleInput}
                value={newTodoTitle}
                onChangeText={setNewTodoTitle}
                placeholder="Todo title..."
                placeholderTextColor="#9ca3af"
                autoFocus
              />

              {/* Description */}
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.descriptionInput}
                value={newTodoDescription}
                onChangeText={setNewTodoDescription}
                placeholder="Add description..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
              />

              {/* Deadline */}
              <Text style={styles.inputLabel}>Deadline</Text>
              {Platform.OS === 'web' ? (
                <View>
                  <input
                    type="date"
                    value={newTodoDeadline ? newTodoDeadline.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const date = new Date(e.target.value);
                        setNewTodoDeadline(date);
                      } else {
                        setNewTodoDeadline(null);
                      }
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      marginTop: '8px',
                      backgroundColor: '#ffffff',
                    }}
                  />
                  {newTodoDeadline && (
                    <TouchableOpacity
                      onPress={() => setNewTodoDeadline(null)}
                      style={styles.removeDeadlineButton}
                    >
                      <X size={16} color="#ef4444" />
                      <Text style={{ marginLeft: 8, color: '#ef4444' }}>Remove deadline</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.deadlineButton}
                    onPress={() => setShowDeadlinePicker(true)}
                  >
                    <Clock size={20} color="#3b82f6" />
                    <Text style={styles.deadlineText}>
                      {newTodoDeadline
                        ? newTodoDeadline.toLocaleDateString()
                        : 'Select deadline'}
                    </Text>
                    {newTodoDeadline && (
                      <TouchableOpacity
                        onPress={() => setNewTodoDeadline(null)}
                        style={styles.removeDeadlineButton}
                      >
                        <X size={16} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>

                  {showDeadlinePicker && (
                    <DateTimePicker
                      value={newTodoDeadline || new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        setShowDeadlinePicker(Platform.OS === 'ios');
                        if (selectedDate) {
                          setNewTodoDeadline(selectedDate);
                        }
                      }}
                      minimumDate={new Date()}
                    />
                  )}
                </>
              )}

              {/* Images */}
              <Text style={styles.inputLabel}>Images</Text>
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handleImagePicker}
                disabled={uploadingImages}
              >
                <Plus size={20} color="#3b82f6" />
                <Text style={styles.addImageButtonText}>Add Images</Text>
              </TouchableOpacity>

              {newTodoImages.length > 0 && (
                <ScrollView horizontal style={styles.imagesPreviewContainer}>
                  {newTodoImages.map((uri, index) => (
                    <View key={index} style={styles.imagePreviewWrapper}>
                      <RNImage source={{ uri }} style={styles.imagePreview} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <X size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}

              {/* Checklist */}
              <Text style={styles.inputLabel}>Checklist</Text>
              {newTodoChecklist.map((item, index) => (
                <View key={index} style={styles.checklistItemRow}>
                  <TextInput
                    style={styles.checklistInput}
                    value={item}
                    onChangeText={(value) => handleChecklistItemChange(index, value)}
                    placeholder={`Checklist item ${index + 1}...`}
                    placeholderTextColor="#9ca3af"
                  />
                  {newTodoChecklist.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeChecklistButton}
                      onPress={() => handleRemoveChecklistItem(index)}
                    >
                      <X size={18} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity
                style={styles.addChecklistButton}
                onPress={handleAddChecklistItem}
              >
                <Plus size={16} color="#3b82f6" />
                <Text style={styles.addChecklistButtonText}>Add Checklist Item</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateModal(false);
                  // Reset form
                  setNewTodoTitle('');
                  setNewTodoDescription('');
                  setNewTodoDeadline(null);
                  setNewTodoImages([]);
                  setNewTodoChecklist(['']);
                }}
                style={styles.modalCancelButton}
                disabled={creating}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateTodo}
                style={[styles.modalCreateButton, creating && styles.modalCreateButtonDisabled]}
                disabled={creating || !newTodoTitle.trim()}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalCreateButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
});

TodoList.displayName = 'TodoList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeModalButton: {
    padding: 4,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  deadlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  deadlineText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  removeDeadlineButton: {
    padding: 4,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#eff6ff',
  },
  addImageButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  imagesPreviewContainer: {
    marginBottom: 12,
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginRight: 8,
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  checklistItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  checklistInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  removeChecklistButton: {
    padding: 8,
  },
  addChecklistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    marginTop: 4,
  },
  addChecklistButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  modalCreateButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCreateButtonDisabled: {
    opacity: 0.5,
  },
  modalCreateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});








