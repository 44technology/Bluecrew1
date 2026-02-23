import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { stripUndefined } from '@/lib/firestoreUtils';

type DocumentCategory = 'Plans' | 'Permits' | 'Designs' | 'Inspection' | 'Insurance' | 'Licence' | 'Other';

export interface Document {
  id: string;
  project_id: string;
  category: DocumentCategory;
  name: string;
  file_url: string;
  file_type: 'image' | 'document';
  uploaded_by: string;
  uploaded_by_id?: string;
  uploaded_at: string;
  thumbnail_url?: string;
  file_size?: number;
  /** Storage path for delete (e.g. documents/projectId/123_name.pdf). If missing, derived from file_url. */
  storage_path?: string;
}

const DOCUMENTS_COLLECTION = 'documents';

/** Extract Storage path from Firebase download URL (for docs saved before storage_path was stored). */
function getStoragePathFromDownloadUrl(fileUrl: string): string | null {
  try {
    // Format: https://firebasestorage.googleapis.com/v0/b/BUCKET/o/PATH_ENCODED?alt=media&token=...
    const match = fileUrl.match(/\/o\/(.+?)(\?|$)/);
    if (!match || !match[1]) return null;
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export class DocumentService {
  // Get documents by project ID
  static async getDocumentsByProjectId(projectId: string): Promise<Document[]> {
    try {
      // First, try with index (if it exists)
      try {
        const documentsQuery = query(
          collection(db, DOCUMENTS_COLLECTION),
          where('project_id', '==', projectId),
          orderBy('uploaded_at', 'desc')
        );
        const documentsSnapshot = await getDocs(documentsQuery);
        
        return documentsSnapshot.docs.map(doc => ({
          ...doc.data() as Document,
          id: doc.id
        }));
      } catch (indexError: any) {
        // If index doesn't exist, fallback to client-side sorting
        if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
          console.warn('Index not found, using client-side sorting. Please create the index:', indexError.message);
          
          // Get all documents for the project without orderBy
          const documentsQuery = query(
            collection(db, DOCUMENTS_COLLECTION),
            where('project_id', '==', projectId)
          );
          const documentsSnapshot = await getDocs(documentsQuery);
          
          // Sort on client side
          const documents = documentsSnapshot.docs.map(doc => ({
            ...doc.data() as Document,
            id: doc.id
          }));
          
          // Sort by uploaded_at descending
          return documents.sort((a, b) => {
            const dateA = new Date(a.uploaded_at || 0).getTime();
            const dateB = new Date(b.uploaded_at || 0).getTime();
            return dateB - dateA; // descending
          });
        }
        throw indexError;
      }
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  }

  // Get documents by project ID and category
  static async getDocumentsByProjectAndCategory(
    projectId: string, 
    category: DocumentCategory
  ): Promise<Document[]> {
    try {
      const documentsQuery = query(
        collection(db, DOCUMENTS_COLLECTION),
        where('project_id', '==', projectId),
        where('category', '==', category),
        orderBy('uploaded_at', 'desc')
      );
      const documentsSnapshot = await getDocs(documentsQuery);
      
      return documentsSnapshot.docs.map(doc => ({
        ...doc.data() as Document,
        id: doc.id
      }));
    } catch (error) {
      console.error('Error getting documents by category:', error);
      return [];
    }
  }

  // Upload document
  static async uploadDocument(
    projectId: string,
    category: DocumentCategory,
    file: File | Blob,
    fileName: string,
    fileType: 'image' | 'document',
    uploadedBy: string,
    uploadedById?: string
  ): Promise<string> {
    try {
      // Upload file to Firebase Storage (store path for reliable delete later)
      const storagePath = `documents/${projectId}/${Date.now()}_${fileName}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      // Save document metadata to Firestore (stripUndefined: Firestore rejects undefined)
      const fileSize = typeof (file as Blob).size === 'number' ? (file as Blob).size : undefined;
      const payload = stripUndefined({
        project_id: projectId,
        category,
        name: fileName,
        file_url: fileUrl,
        file_type: fileType,
        uploaded_by: uploadedBy,
        uploaded_by_id: uploadedById,
        uploaded_at: new Date().toISOString(),
        storage_path: storagePath,
        ...(fileSize !== undefined && { file_size: fileSize }),
      } as Record<string, unknown>);
      const docRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), payload);

      return docRef.id;
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string; serverResponse?: string };
      console.error('Error uploading document:', error);
      if (err?.serverResponse) console.error('Storage serverResponse:', err.serverResponse);
      if (err?.message) console.error('Storage message:', err.message);
      throw error;
    }
  }

  // Delete document
  static async deleteDocument(documentId: string): Promise<void> {
    try {
      // Get document to get file URL
      const documentDoc = await getDoc(doc(db, DOCUMENTS_COLLECTION, documentId));
      if (!documentDoc.exists()) {
        throw new Error('Document not found');
      }

      const documentData = documentDoc.data() as Document;

      // Get Storage path: prefer stored storage_path; fallback parse from download URL
      const storagePath = documentData.storage_path ?? getStoragePathFromDownloadUrl(documentData.file_url);

      // Delete file from Storage
      if (storagePath) {
        try {
          const fileRef = ref(storage, storagePath);
          await deleteObject(fileRef);
        } catch (storageError) {
          console.error('Error deleting file from storage:', storageError);
          // Continue with Firestore deletion even if storage deletion fails
        }
      }

      // Delete document from Firestore
      await deleteDoc(doc(db, DOCUMENTS_COLLECTION, documentId));
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Get document by ID
  static async getDocumentById(documentId: string): Promise<Document | null> {
    try {
      const documentDoc = await getDoc(doc(db, DOCUMENTS_COLLECTION, documentId));
      
      if (!documentDoc.exists()) {
        return null;
      }

      return {
        ...documentDoc.data() as Document,
        id: documentDoc.id
      };
    } catch (error) {
      console.error('Error getting document:', error);
      return null;
    }
  }
}

