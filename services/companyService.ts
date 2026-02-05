import { db, storage } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Company, ColorPaletteId } from '@/types';
import { COLOR_PALETTES, DEFAULT_PALETTE_ID } from '@/constants/theme';

const COMPANIES_COLLECTION = 'companies';

export class CompanyService {
  static async getCompany(companyId: string): Promise<Company | null> {
    try {
      const companyDoc = await getDoc(doc(db, COMPANIES_COLLECTION, companyId));
      if (!companyDoc.exists()) return null;
      return { id: companyDoc.id, ...companyDoc.data() } as Company;
    } catch (error) {
      console.error('Get company error:', error);
      return null;
    }
  }

  static async createCompany(data: {
    name: string;
    state?: string;
    city?: string;
    address?: string;
    color_palette?: ColorPaletteId;
  }): Promise<string> {
    try {
      const now = new Date().toISOString();
      const companyData = {
        name: data.name,
        state: data.state || '',
        city: data.city || '',
        address: data.address || '',
        logo_url: '',
        color_palette: data.color_palette ?? DEFAULT_PALETTE_ID,
        created_at: now,
        updated_at: now,
      };
      const companyRef = doc(collection(db, COMPANIES_COLLECTION));
      await setDoc(companyRef, companyData);
      return companyRef.id;
    } catch (error) {
      console.error('Create company error:', error);
      throw error;
    }
  }

  static async updateCompany(
    companyId: string,
    updates: Partial<Omit<Company, 'id' | 'created_at'>>
  ): Promise<void> {
    try {
      const companyRef = doc(db, COMPANIES_COLLECTION, companyId);
      await updateDoc(companyRef, {
        ...updates,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Update company error:', error);
      throw error;
    }
  }

  static async uploadLogo(companyId: string, file: File | Blob, fileName: string): Promise<string> {
    try {
      const storageRef = ref(storage, `companies/${companyId}/logo_${Date.now()}_${fileName}`);
      const fileToUpload = file instanceof Blob && !(file instanceof File)
        ? new File([file], fileName, { type: file.type || 'image/png' })
        : file;
      await uploadBytes(storageRef, fileToUpload);
      const url = await getDownloadURL(storageRef);
      await this.updateCompany(companyId, { logo_url: url });
      return url;
    } catch (error) {
      console.error('Upload logo error:', error);
      throw error;
    }
  }
}
