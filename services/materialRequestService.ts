import { db } from '@/lib/firebase';
import { stripUndefined } from '@/lib/firestoreUtils';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { NotificationService } from './notificationService';
import { ProjectService } from './projectService';
import { UserService } from './userService';

export interface MaterialRequest {
  id: string;
  project_id: string;
  project_name: string;
  substep_id: string;
  substep_name: string;
  quantity: string;
  description: string;
  delivery_date: string;
  sub_contractor?: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  change_request_by?: string;
  change_request_by_name?: string;
  change_request_at?: string;
  change_request_reason?: string;
  requested_by: string;
  requested_at: string;
  approved_at?: string;
  rejected_at?: string;
  approved_by?: string;
  rejected_by?: string;
  rejection_reason?: string;
  purchase_status?: 'pending' | 'ordered' | 'shipped' | 'delivered';
  purchase_date?: string;
  shipping_date?: string;
  delivery_date_actual?: string;
}

export const MaterialRequestService = {
  async createMaterialRequest(requestData: Omit<MaterialRequest, 'id' | 'requested_at'>): Promise<string> {
    try {
      const payload = stripUndefined({
        ...requestData,
        requested_at: new Date().toISOString(),
      } as Record<string, unknown>);
      const docRef = await addDoc(collection(db, 'materialRequests'), payload);
      return docRef.id;
    } catch (error) {
      console.error('Error creating material request:', error);
      throw error;
    }
  },

  async getMaterialRequests(): Promise<MaterialRequest[]> {
    try {
      const requestsCol = collection(db, 'materialRequests');
      const requestSnapshot = await getDocs(requestsCol);
      const requestsList = requestSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MaterialRequest[];
      return requestsList;
    } catch (error) {
      console.error('Error getting material requests:', error);
      return [];
    }
  },

  async getMaterialRequestsByProject(projectId: string): Promise<MaterialRequest[]> {
    try {
      const requestsCol = collection(db, 'materialRequests');
      const q = query(requestsCol, where('project_id', '==', projectId));
      const requestSnapshot = await getDocs(q);
      const requestsList = requestSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MaterialRequest[];
      return requestsList;
    } catch (error) {
      console.error('Error getting material requests by project:', error);
      return [];
    }
  },

  async updateMaterialRequest(requestId: string, updates: Partial<MaterialRequest>): Promise<void> {
    try {
      const requestDocRef = doc(db, 'materialRequests', requestId);
      const requestDoc = await getDoc(requestDocRef);
      const oldData = requestDoc.data() as MaterialRequest;
      
      const payload = stripUndefined(updates as Record<string, unknown>);
      if (Object.keys(payload).length > 0) {
        await updateDoc(requestDocRef, payload);
      }

      // Create notifications for status changes
      try {
        // Check if purchase_status changed
        if (updates.purchase_status && updates.purchase_status !== oldData.purchase_status) {
          const project = await ProjectService.getProject(oldData.project_id);
          if (project) {
            // Get all users who should be notified
            const allUsers = await UserService.getAllUsers();
            const recipients: string[] = [];

            // Add project PMs
            if (project.assigned_pms && project.assigned_pms.length > 0) {
              project.assigned_pms.forEach((pmId: string) => {
                if (!recipients.includes(pmId)) {
                  recipients.push(pmId);
                }
              });
            }

            // Add client
            if (project.client_id && !recipients.includes(project.client_id)) {
              recipients.push(project.client_id);
            }

            // Add admin users
            const adminUsers = allUsers.filter(u => u.role === 'admin');
            adminUsers.forEach(admin => {
              if (!recipients.includes(admin.id)) {
                recipients.push(admin.id);
              }
            });

            // Add requester
            if (oldData.requested_by && !recipients.includes(oldData.requested_by)) {
              recipients.push(oldData.requested_by);
            }

            if (recipients.length > 0 && ['ordered', 'shipped', 'delivered'].includes(updates.purchase_status)) {
              await NotificationService.createMaterialRequestStatusNotification(
                requestId,
                oldData.project_id,
                oldData.project_name || project.title || 'Project',
                updates.purchase_status as 'ordered' | 'shipped' | 'delivered',
                recipients
              );
            }
          }
        }

        // Check if status changed to approved/rejected
        if (updates.status && updates.status !== oldData.status && (updates.status === 'approved' || updates.status === 'rejected')) {
          const project = await ProjectService.getProject(oldData.project_id);
          if (project) {
            const allUsers = await UserService.getAllUsers();
            const recipients: string[] = [];

            // Add requester
            if (oldData.requested_by && !recipients.includes(oldData.requested_by)) {
              recipients.push(oldData.requested_by);
            }

            // Add project PMs
            if (project.assigned_pms && project.assigned_pms.length > 0) {
              project.assigned_pms.forEach((pmId: string) => {
                if (!recipients.includes(pmId)) {
                  recipients.push(pmId);
                }
              });
            }

            if (recipients.length > 0) {
              await NotificationService.createMaterialRequestApprovalNotification(
                requestId,
                oldData.project_id,
                oldData.project_name || project.title || 'Project',
                updates.status as 'approved' | 'rejected',
                recipients,
                updates.approved_by || updates.rejected_by,
                updates.approved_by || updates.rejected_by // Will be replaced with name lookup if needed
              );
            }
          }
        }
      } catch (notifError) {
        // Don't fail update if notification fails
        console.error('Error creating notification:', notifError);
      }
    } catch (error) {
      console.error('Error updating material request:', error);
      throw error;
    }
  },

  async deleteMaterialRequest(requestId: string): Promise<void> {
    try {
      const requestDocRef = doc(db, 'materialRequests', requestId);
      await deleteDoc(requestDocRef);
    } catch (error) {
      console.error('Error deleting material request:', error);
      throw error;
    }
  },
};







