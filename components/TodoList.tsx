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
import { Plus, X, CheckCircle2, Clock, ChevronDown, User } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { TodoItem } from '@/types';
import { TodoService } from '@/services/todoService';
import { UserService, FirebaseUser } from '@/services/userService';
import { TodoCard } from './TodoCard';
import { useAuth } from '@/contexts/AuthContext';

interface TodoListProps {
  projectId: string;
  canCreate: boolean; // Only admin can create
  canEdit: boolean; // Admin and PM can edit
  canDelete: boolean; // Only admin can delete
  onCreateButtonPress?: () => void; // Callback when create button is pressed externally
  hideCreateButton?: boolean; // Hide the create button in TodoList header
  hideHeader?: boolean; // Hide the entire header (title + create button)
}

export const TodoList = React.forwardRef<{ openCreateModal: () => void }, TodoListProps>(({
  projectId,
  canCreate,
  canEdit,
  canDelete,
  onCreateButtonPress,
  hideCreateButton = false,
  hideHeader = false,
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
  const [users, setUsers] = useState<FirebaseUser[]>([]);
  const [newTodoAssignedTo, setNewTodoAssignedTo] = useState('');
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false);
  const [parentIdForNew, setParentIdForNew] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const list = await UserService.getAllUsers();
        setUsers(list);
      } catch (e) {
        console.error(e);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    loadTodos();

    // Subscribe to real-time updates
    const unsubscribe = TodoService.subscribeToTodos(projectId, (updatedTodos) => {
      setTodos(updatedTodos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId]);

  // Expose openCreateModal method via ref (optional parentId for subtask)
  useImperativeHandle(ref, () => ({
    openCreateModal: (parentId?: string) => {
      setParentIdForNew(parentId ?? null);
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

  const assignableUsers = users.filter((u) => u.role !== 'client');
  const newTodoAssignedToName = newTodoAssignedTo
    ? (users.find((u) => u.id === newTodoAssignedTo)?.name || users.find((u) => u.id === newTodoAssignedTo)?.email) ?? ''
    : '';

  const handleCreateTodo = async () => {
    if (!newTodoTitle.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!newTodoDeadline) {
      Alert.alert('Error', 'Due date is required');
      return;
    }
    if (!newTodoAssignedTo) {
      Alert.alert('Error', 'Please assign a team member');
      return;
    }
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setCreating(true);
      setUploadingImages(true);

      const checklistItems = newTodoChecklist
        .filter(item => item.trim())
        .map(item => ({
          text: item.trim(),
          completed: false,
        }));

      const todoId = await TodoService.createTodo({
        project_id: projectId,
        parent_id: parentIdForNew ?? undefined,
        title: newTodoTitle.trim(),
        description: newTodoDescription.trim(),
        status: 'pending',
        deadline: newTodoDeadline.toISOString(),
        created_by: user.id,
        created_by_name: user.name || 'Unknown',
        assigned_to: newTodoAssignedTo,
        assigned_to_name: newTodoAssignedToName,
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
      setNewTodoAssignedTo('');
      setNewTodoImages([]);
      setNewTodoChecklist(['']);
      setParentIdForNew(null);
      setShowCreateModal(false);
    } catch (error: any) {
      console.error('Error creating todo:', error);
      const errorMessage = error?.message || 'Failed to create todo';
      Alert.alert('Error', `Failed to create task: ${errorMessage}`);
      setUploadingImages(false);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
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

  const getTaskTree = (list: TodoItem[]) => {
    const topLevel = list.filter((t) => !t.parent_id).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    const childrenByParent: Record<string, TodoItem[]> = {};
    list.forEach((t) => {
      if (t.parent_id) {
        if (!childrenByParent[t.parent_id]) childrenByParent[t.parent_id] = [];
        childrenByParent[t.parent_id].push(t);
      }
    });
    Object.keys(childrenByParent).forEach((id) =>
      childrenByParent[id].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    );
    return { topLevel, childrenByParent };
  };

  const renderTaskSection = (sectionTodos: TodoItem[], sectionTitle: string) => {
    const { topLevel, childrenByParent } = getTaskTree(sectionTodos);
    if (topLevel.length === 0) return null;
    return (
      <View style={styles.section} key={sectionTitle}>
        <Text style={styles.sectionTitle}>{sectionTitle}</Text>
        {topLevel.map((parent) => (
          <View key={parent.id}>
            <TodoCard todo={parent} onUpdate={loadTodos} canEdit={canEdit} canDelete={canDelete} />
            {canCreate && (
              <TouchableOpacity
                style={styles.addSubtaskRow}
                onPress={() => {
                  setParentIdForNew(parent.id);
                  setShowCreateModal(true);
                }}
              >
                <Plus size={14} color="#3b82f6" />
                <Text style={styles.addSubtaskText}>New subtask</Text>
              </TouchableOpacity>
            )}
            {(childrenByParent[parent.id] ?? []).map((child) => (
              <View key={child.id} style={styles.subtaskWrap}>
                <TodoCard todo={child} onUpdate={loadTodos} canEdit={canEdit} canDelete={canDelete} />
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!hideHeader && (
        <View style={styles.header}>
          <Text style={styles.title}>Tasks</Text>
          {canCreate && !hideCreateButton && (
            <TouchableOpacity
              onPress={() => {
                setParentIdForNew(null);
                if (onCreateButtonPress) {
                  onCreateButtonPress();
                } else {
                  setShowCreateModal(true);
                }
              }}
              style={styles.createButton}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.createButtonText}>New Task</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderTaskSection(pendingTodos, `Pending (${pendingTodos.length})`)}
        {renderTaskSection(inProgressTodos, `In Progress (${inProgressTodos.length})`)}
        {renderTaskSection(completedTodos, `Completed (${completedTodos.length})`)}

        {/* Empty State */}
        {todos.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks yet</Text>
            {canCreate && (
              <Text style={styles.emptySubtext}>
                Tap "New Task" to create your first task
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Create Task Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{parentIdForNew ? 'New Subtask' : 'Create New Task'}</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateModal(false);
                  setNewTodoTitle('');
                  setNewTodoDescription('');
                  setNewTodoDeadline(null);
                  setNewTodoAssignedTo('');
                  setNewTodoImages([]);
                  setNewTodoChecklist(['']);
                  setParentIdForNew(null);
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
                placeholder="Task title..."
                placeholderTextColor="#000000"
                autoFocus
              />

              {/* Assignees (required) */}
              <Text style={styles.inputLabel}>Assignees *</Text>
              <TouchableOpacity
                style={styles.assigneeSelect}
                onPress={() => setAssigneeDropdownOpen(!assigneeDropdownOpen)}
              >
                <User size={18} color="#6b7280" />
                <Text style={[styles.assigneeSelectText, !newTodoAssignedToName && styles.assigneePlaceholder]}>
                  {newTodoAssignedToName || 'Select assignee...'}
                </Text>
                <ChevronDown size={18} color="#6b7280" />
              </TouchableOpacity>
              {assigneeDropdownOpen && (
                <View style={styles.assigneeDropdown}>
                  <ScrollView
                    style={styles.assigneeDropdownScroll}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                  >
                    {assignableUsers.length === 0 ? (
                      <Text style={styles.assigneeEmptyText}>No team members found</Text>
                    ) : (
                      assignableUsers.map((u) => (
                        <TouchableOpacity
                          key={u.id}
                          style={[styles.assigneeOption, newTodoAssignedTo === u.id && styles.assigneeOptionActive]}
                          onPress={() => {
                            setNewTodoAssignedTo(u.id);
                            setAssigneeDropdownOpen(false);
                          }}
                        >
                          <Text style={styles.assigneeOptionText} numberOfLines={1}>
                            {u.name || u.email || 'Unknown'}
                          </Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                </View>
              )}

              {/* Description */}
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.descriptionInput}
                value={newTodoDescription}
                onChangeText={setNewTodoDescription}
                placeholder="Add description..."
                placeholderTextColor="#000000"
                multiline
                numberOfLines={4}
              />

              {/* Due date (required) */}
              <Text style={styles.inputLabel}>Due date *</Text>
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
                        if (selectedDate) {
                          setNewTodoDeadline(selectedDate);
                          setShowDeadlinePicker(false);
                        }
                        if (event?.type === 'dismissed') {
                          setShowDeadlinePicker(false);
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

              {/* Subtasks */}
              <Text style={styles.inputLabel}>Subtasks</Text>
              {newTodoChecklist.map((item, index) => (
                <View key={index} style={styles.checklistItemRow}>
                  <TextInput
                    style={styles.checklistInput}
                    value={item}
                    onChangeText={(value) => handleChecklistItemChange(index, value)}
                    placeholder={`Subtask ${index + 1}...`}
                    placeholderTextColor="#000000"
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
                <Text style={styles.addChecklistButtonText}>New</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateModal(false);
                  setNewTodoTitle('');
                  setNewTodoDescription('');
                  setNewTodoDeadline(null);
                  setNewTodoAssignedTo('');
                  setNewTodoImages([]);
                  setNewTodoChecklist(['']);
                  setParentIdForNew(null);
                }}
                style={styles.modalCancelButton}
                disabled={creating}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateTodo}
                style={[styles.modalCreateButton, creating && styles.modalCreateButtonDisabled]}
                disabled={creating || !newTodoTitle.trim() || !newTodoDeadline || !newTodoAssignedTo}
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
    minHeight: 400,
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
    paddingBottom: 20,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  addSubtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingLeft: 16,
    marginBottom: 4,
  },
  addSubtaskText: { fontSize: 14, color: '#3b82f6', fontWeight: '500' },
  subtaskWrap: { marginLeft: 24, marginBottom: 4 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#000000',
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
    color: '#000000',
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#000000',
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
  assigneeSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  assigneeSelectText: { flex: 1, fontSize: 16, color: '#111827' },
  assigneePlaceholder: { color: '#9ca3af' },
  assigneeDropdown: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 8,
    maxHeight: 200,
    backgroundColor: '#ffffff',
    zIndex: 10,
  },
  assigneeDropdownScroll: {
    maxHeight: 196,
  },
  assigneeEmptyText: {
    padding: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  assigneeOption: { paddingVertical: 12, paddingHorizontal: 12 },
  assigneeOptionActive: { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  assigneeOptionText: { fontSize: 14, color: '#111827' },
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
    color: '#000000',
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
    color: '#000000',
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








