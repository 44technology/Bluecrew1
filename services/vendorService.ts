import { db } from '@/lib/firebase';
import { stripUndefined } from '@/lib/firestoreUtils';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Vendor } from '@/types';

export class VendorService {
  static async addVendor(vendor: Omit<Vendor, 'id'>): Promise<string> {
    try {
      const payload = stripUndefined({ ...vendor, created_at: new Date().toISOString() } as Record<string, unknown>);
      const docRef = await addDoc(collection(db, 'vendors'), payload);
      return docRef.id;
    } catch (error) {
      console.error('Error adding vendor:', error);
      throw error;
    }
  }

  static async getVendors(): Promise<Vendor[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'vendors'), orderBy('companyName', 'asc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Vendor[];
    } catch (error) {
      console.error('Error getting vendors:', error);
      throw error;
    }
  }

  static async updateVendor(vendorId: string, updates: Partial<Vendor>): Promise<void> {
    try {
      const vendorRef = doc(db, 'vendors', vendorId);
      const payload = stripUndefined({ ...updates, updated_at: new Date().toISOString() } as Record<string, unknown>);
      if (Object.keys(payload).length === 0) return;
      await updateDoc(vendorRef, payload);
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  }

  static async deleteVendor(vendorId: string): Promise<void> {
    try {
      const vendorRef = doc(db, 'vendors', vendorId);
      await deleteDoc(vendorRef);
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  }
}

