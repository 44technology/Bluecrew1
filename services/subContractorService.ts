import { db } from '@/lib/firebase';
import { stripUndefined } from '@/lib/firestoreUtils';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { SubContractor } from '@/types';

export class SubContractorService {
  static async addSubContractor(subContractor: Omit<SubContractor, 'id'>): Promise<string> {
    try {
      const payload = stripUndefined({ ...subContractor, created_at: new Date().toISOString() } as Record<string, unknown>);
      const docRef = await addDoc(collection(db, 'sub_contractors'), payload);
      return docRef.id;
    } catch (error) {
      console.error('Error adding sub contractor:', error);
      throw error;
    }
  }

  static async getSubContractors(): Promise<SubContractor[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'sub_contractors'), orderBy('name', 'asc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SubContractor[];
    } catch (error) {
      console.error('Error getting sub contractors:', error);
      throw error;
    }
  }

  static async updateSubContractor(subContractorId: string, updates: Partial<SubContractor>): Promise<void> {
    try {
      const subContractorRef = doc(db, 'sub_contractors', subContractorId);
      const payload = stripUndefined({ ...updates, updated_at: new Date().toISOString() } as Record<string, unknown>);
      if (Object.keys(payload).length === 0) return;
      await updateDoc(subContractorRef, payload);
    } catch (error) {
      console.error('Error updating sub contractor:', error);
      throw error;
    }
  }

  static async deleteSubContractor(subContractorId: string): Promise<void> {
    try {
      const subContractorRef = doc(db, 'sub_contractors', subContractorId);
      await deleteDoc(subContractorRef);
    } catch (error) {
      console.error('Error deleting sub contractor:', error);
      throw error;
    }
  }
}























