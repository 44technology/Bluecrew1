import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  deleteField,
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { stripUndefined, stripUndefinedFromArray } from '@/lib/firestoreUtils';
import { TodoItem, TodoImage, TodoComment, TodoChecklistItem } from '@/types';

const TODOS_COLLECTION = 'todos';

export class TodoService {
  // Get all todos for a project
  static async getTodosByProjectId(projectId: string): Promise<TodoItem[]> {
    try {
      // First, try with index (if it exists)
      try {
        const todosQuery = query(
          collection(db, TODOS_COLLECTION),
          where('project_id', '==', projectId),
          orderBy('order_index', 'asc')
        );
        const todosSnapshot = await getDocs(todosQuery);
        
        return todosSnapshot.docs.map(todoDoc => ({
          ...todoDoc.data() as TodoItem,
          id: todoDoc.id
        }));
      } catch (indexError: any) {
        // If index doesn't exist, fallback to client-side sorting
        if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
          // Silently fallback to client-side sorting (don't show warning to user)
          // console.warn('Index not found for todos, using client-side sorting. Please create the index:', indexError.message);
          
          // Get all todos for the project without orderBy
          const todosQuery = query(
            collection(db, TODOS_COLLECTION),
            where('project_id', '==', projectId)
          );
          const todosSnapshot = await getDocs(todosQuery);
          
          // Sort on client side
          const todos = todosSnapshot.docs.map(todoDoc => ({
            ...todoDoc.data() as TodoItem,
            id: todoDoc.id
          }));
          
          // Sort by order_index ascending, then by created_at
          return todos.sort((a, b) => {
            const orderA = a.order_index ?? 0;
            const orderB = b.order_index ?? 0;
            if (orderA !== orderB) {
              return orderA - orderB;
            }
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateA - dateB;
          });
        }
        throw indexError;
      }
    } catch (error) {
      console.error('Error getting todos:', error);
      return [];
    }
  }

  // Get todo by ID
  static async getTodoById(todoId: string): Promise<TodoItem | null> {
    try {
      const todoDoc = await getDoc(doc(db, TODOS_COLLECTION, todoId));
      
      if (!todoDoc.exists()) {
        return null;
      }
      
      return {
        ...todoDoc.data() as TodoItem,
        id: todoDoc.id
      };
    } catch (error) {
      console.error('Error getting todo:', error);
      throw error;
    }
  }

  // Create new todo (optionally subtask via parent_id)
  static async createTodo(todo: Omit<TodoItem, 'id'>): Promise<string> {
    try {
      const todosQuery = query(
        collection(db, TODOS_COLLECTION),
        where('project_id', '==', todo.project_id)
      );
      const todosSnapshot = await getDocs(todosQuery);
      const parentKey = todo.parent_id ?? null;
      const siblings = todosSnapshot.docs.filter((d) => (d.data().parent_id ?? null) === parentKey);
      const maxOrder = siblings.reduce((max, d) => Math.max(max, d.data().order_index ?? 0), -1);

      const payload = stripUndefined({
        ...todo,
        order_index: maxOrder + 1,
        parent_id: todo.parent_id,
        created_at: new Date().toISOString(),
        status: 'pending' as const,
        images: todo.images || [],
        comments: todo.comments || [],
        checklist: todo.checklist || [],
      } as Record<string, unknown>);
      console.log('Creating todo with data:', payload);
      const docRef = await addDoc(collection(db, TODOS_COLLECTION), payload);
      console.log('Todo created with ID:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating todo:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Update todo
  static async updateTodo(todoId: string, updates: Partial<TodoItem>): Promise<void> {
    try {
      const todoRef = doc(db, TODOS_COLLECTION, todoId);
      const payload = stripUndefined({ ...updates, updated_at: new Date().toISOString() } as Record<string, unknown>);
      if (Object.keys(payload).length === 0) return;
      await updateDoc(todoRef, payload);
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  }

  // Delete todo
  static async deleteTodo(todoId: string): Promise<void> {
    try {
      const todo = await this.getTodoById(todoId);
      
      // Delete associated images from storage
      if (todo?.images) {
        for (const image of todo.images) {
          try {
            const imageRef = ref(storage, image.url);
            await deleteObject(imageRef);
          } catch (error) {
            console.error('Error deleting image:', error);
            // Continue even if image deletion fails
          }
        }
      }
      
      await deleteDoc(doc(db, TODOS_COLLECTION, todoId));
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  }

  // Upload image for todo
  static async uploadTodoImage(
    todoId: string,
    file: File | Blob,
    fileName: string,
    uploadedBy: string,
    uploadedByName: string
  ): Promise<TodoImage> {
    try {
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `todos/${todoId}/${Date.now()}_${sanitizedName}`);
      
      let fileToUpload: File | Blob = file;
      if (file instanceof Blob && !(file instanceof File)) {
        fileToUpload = new File([file], fileName, { type: file.type || 'image/jpeg' });
      }
      
      await uploadBytes(storageRef, fileToUpload);
      const fileUrl = await getDownloadURL(storageRef);

      const image: TodoImage = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: fileUrl,
        uploaded_by: uploadedBy,
        uploaded_by_name: uploadedByName,
        uploaded_at: new Date().toISOString()
      };

      // Update todo with new image
      const todo = await this.getTodoById(todoId);
      if (todo) {
        const currentImages = todo.images || [];
        await this.updateTodo(todoId, {
          images: [...currentImages, image]
        });
      }

      return image;
    } catch (error) {
      console.error('Error uploading todo image:', error);
      throw error;
    }
  }

  // Delete image from todo
  static async deleteTodoImage(todoId: string, imageId: string): Promise<void> {
    try {
      const todo = await this.getTodoById(todoId);
      if (!todo || !todo.images) return;

      const image = todo.images.find(img => img.id === imageId);
      if (image) {
        // Delete from storage
        try {
          const imageRef = ref(storage, image.url);
          await deleteObject(imageRef);
        } catch (error) {
          console.error('Error deleting image from storage:', error);
        }
      }

      // Update todo
      const updatedImages = todo.images.filter(img => img.id !== imageId);
      await this.updateTodo(todoId, {
        images: updatedImages
      });
    } catch (error) {
      console.error('Error deleting todo image:', error);
      throw error;
    }
  }

  // Update image drawing data
  static async updateImageDrawing(
    todoId: string,
    imageId: string,
    drawingData: string
  ): Promise<void> {
    try {
      const todo = await this.getTodoById(todoId);
      if (!todo || !todo.images) return;

      const updatedImages = todo.images.map(img => 
        img.id === imageId ? { ...img, drawing_data: drawingData } : img
      );

      await this.updateTodo(todoId, {
        images: updatedImages
      });
    } catch (error) {
      console.error('Error updating image drawing:', error);
      throw error;
    }
  }

  // Add comment to todo
  static async addComment(
    todoId: string,
    comment: Omit<TodoComment, 'id' | 'created_at'>
  ): Promise<string> {
    try {
      const todo = await this.getTodoById(todoId);
      if (!todo) throw new Error('Todo not found');

      const newComment: TodoComment = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...comment,
        created_at: new Date().toISOString()
      };

      const currentComments = todo.comments || [];
      await this.updateTodo(todoId, {
        comments: [...currentComments, newComment]
      });

      return newComment.id;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Add checklist item
  static async addChecklistItem(
    todoId: string,
    item: Omit<TodoChecklistItem, 'id'>
  ): Promise<string> {
    try {
      const todo = await this.getTodoById(todoId);
      if (!todo) throw new Error('Todo not found');

      const newItem: TodoChecklistItem = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...item
      };

      const currentChecklist = todo.checklist || [];
      await this.updateTodo(todoId, {
        checklist: [...currentChecklist, newItem]
      });

      return newItem.id;
    } catch (error) {
      console.error('Error adding checklist item:', error);
      throw error;
    }
  }

  // Update checklist item (strips undefined so Firestore accepts; sets task in_progress when a subtask is completed)
  static async updateChecklistItem(
    todoId: string,
    itemId: string,
    updates: Partial<TodoChecklistItem>
  ): Promise<void> {
    try {
      const todo = await this.getTodoById(todoId);
      if (!todo || !todo.checklist) return;

      const updatedChecklist = todo.checklist.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      );
      const sanitizedChecklist = stripUndefinedFromArray(
        updatedChecklist as unknown as Record<string, unknown>[]
      ) as TodoChecklistItem[];

      await this.updateTodo(todoId, {
        checklist: sanitizedChecklist
      });

      const isMarkingCompleted = updates.completed === true;
      if (isMarkingCompleted && todo.status === 'pending') {
        await this.updateTodo(todoId, { status: 'in_progress' });
      }
    } catch (error) {
      console.error('Error updating checklist item:', error);
      throw error;
    }
  }

  // Delete checklist item
  static async deleteChecklistItem(todoId: string, itemId: string): Promise<void> {
    try {
      const todo = await this.getTodoById(todoId);
      if (!todo || !todo.checklist) return;

      const updatedChecklist = todo.checklist.filter(item => item.id !== itemId);
      await this.updateTodo(todoId, {
        checklist: updatedChecklist
      });
    } catch (error) {
      console.error('Error deleting checklist item:', error);
      throw error;
    }
  }

  // Mark todo as completed
  static async completeTodo(
    todoId: string,
    completedBy: string,
    completedByName: string
  ): Promise<void> {
    try {
      await this.updateTodo(todoId, {
        status: 'completed',
        completed_by: completedBy,
        completed_by_name: completedByName,
        completed_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error completing todo:', error);
      throw error;
    }
  }

  // Revert task from completed back to previous status (for undo). Also unchecks one checklist item so at least one is in progress.
  static async revertCompleteTodo(
    todoId: string,
    previousStatus: 'pending' | 'in_progress'
  ): Promise<void> {
    try {
      const todo = await this.getTodoById(todoId);
      const todoRef = doc(db, TODOS_COLLECTION, todoId);
      const updates: Record<string, unknown> = {
        status: previousStatus,
        updated_at: new Date().toISOString(),
        completed_by: deleteField(),
        completed_by_name: deleteField(),
        completed_at: deleteField(),
      };

      if (todo?.checklist && todo.checklist.length > 0) {
        const completedItems = todo.checklist.filter((item) => item.completed);
        if (completedItems.length > 0) {
          const lastCompleted = completedItems[completedItems.length - 1];
          const revertedChecklist = todo.checklist.map((item) =>
            item.id === lastCompleted.id
              ? { id: item.id, text: item.text, completed: false }
              : item
          );
          updates.checklist = stripUndefinedFromArray(
            revertedChecklist as unknown as Record<string, unknown>[]
          );
        }
      }

      await updateDoc(todoRef, updates);
    } catch (error) {
      console.error('Error reverting todo completion:', error);
      throw error;
    }
  }

  // Real-time listener for todos
  static subscribeToTodos(
    projectId: string,
    callback: (todos: TodoItem[]) => void
  ): () => void {
    // Try with orderBy first, fallback to without orderBy if index doesn't exist
    let todosQuery;
    try {
      todosQuery = query(
        collection(db, TODOS_COLLECTION),
        where('project_id', '==', projectId),
        orderBy('order_index', 'asc')
      );
    } catch (error) {
      // If orderBy fails, use query without orderBy
      todosQuery = query(
        collection(db, TODOS_COLLECTION),
        where('project_id', '==', projectId)
      );
    }

    const unsubscribe = onSnapshot(
      todosQuery,
      (snapshot) => {
        const todos: TodoItem[] = snapshot.docs.map(todoDoc => ({
          ...todoDoc.data() as TodoItem,
          id: todoDoc.id
        }));
        
        // Sort on client side if orderBy wasn't used
        const sortedTodos = todos.sort((a, b) => {
          const orderA = a.order_index ?? 0;
          const orderB = b.order_index ?? 0;
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateA - dateB;
        });
        
        callback(sortedTodos);
      },
      (error) => {
        console.error('Error in todos subscription:', error);
        // If subscription fails due to index, try without orderBy
        if (error.code === 'failed-precondition' || error.message?.includes('index')) {
          const fallbackQuery = query(
            collection(db, TODOS_COLLECTION),
            where('project_id', '==', projectId)
          );
          const fallbackUnsubscribe = onSnapshot(fallbackQuery, (snapshot) => {
            const todos: TodoItem[] = snapshot.docs.map(todoDoc => ({
              ...todoDoc.data() as TodoItem,
              id: todoDoc.id
            }));
            
            const sortedTodos = todos.sort((a, b) => {
              const orderA = a.order_index ?? 0;
              const orderB = b.order_index ?? 0;
              if (orderA !== orderB) {
                return orderA - orderB;
              }
              const dateA = new Date(a.created_at || 0).getTime();
              const dateB = new Date(b.created_at || 0).getTime();
              return dateA - dateB;
            });
            
            callback(sortedTodos);
          });
          return fallbackUnsubscribe;
        }
      }
    );

    return unsubscribe;
  }
}








