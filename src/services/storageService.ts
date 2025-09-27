import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  getMetadata,
  updateMetadata
} from 'firebase/storage';
import { storage } from '../config/firebase';

export class StorageService {
  // Upload a file to Firebase Storage
  static async uploadFile(
    file: File | Blob, 
    path: string, 
    metadata?: { contentType?: string; customMetadata?: Record<string, string> }
  ): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      
      const uploadMetadata = {
        contentType: metadata?.contentType || file.type,
        customMetadata: metadata?.customMetadata || {},
      };

      const snapshot = await uploadBytes(storageRef, file, uploadMetadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Upload user document (ID, matric certificate, transcript, CV)
  static async uploadUserDocument(
    userId: string, 
    documentType: 'idCard' | 'matricCert' | 'transcript' | 'cv',
    file: File | Blob
  ): Promise<string> {
    try {
      const fileExtension = file instanceof File ? file.name.split('.').pop() : 'pdf';
      const path = `users/${userId}/documents/${documentType}.${fileExtension}`;
      
      const metadata = {
        contentType: file instanceof File ? file.type : 'application/pdf',
        customMetadata: {
          userId,
          documentType,
          uploadedAt: new Date().toISOString(),
        },
      };

      return await this.uploadFile(file, path, metadata);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Upload bursary image/logo
  static async uploadBursaryImage(
    bursaryId: string, 
    file: File | Blob
  ): Promise<string> {
    try {
      const fileExtension = file instanceof File ? file.name.split('.').pop() : 'jpg';
      const path = `bursaries/${bursaryId}/image.${fileExtension}`;
      
      const metadata = {
        contentType: file instanceof File ? file.type : 'image/jpeg',
        customMetadata: {
          bursaryId,
          uploadedAt: new Date().toISOString(),
        },
      };

      return await this.uploadFile(file, path, metadata);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Upload application attachment
  static async uploadApplicationAttachment(
    applicationId: string, 
    fileName: string,
    file: File | Blob
  ): Promise<string> {
    try {
      const fileExtension = file instanceof File ? file.name.split('.').pop() : 'pdf';
      const path = `applications/${applicationId}/attachments/${fileName}.${fileExtension}`;
      
      const metadata = {
        contentType: file instanceof File ? file.type : 'application/pdf',
        customMetadata: {
          applicationId,
          fileName,
          uploadedAt: new Date().toISOString(),
        },
      };

      return await this.uploadFile(file, path, metadata);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Delete a file from Firebase Storage
  static async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Delete user document
  static async deleteUserDocument(userId: string, documentType: string): Promise<void> {
    try {
      const path = `users/${userId}/documents/${documentType}`;
      await this.deleteFile(path);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get file metadata
  static async getFileMetadata(path: string): Promise<any> {
    try {
      const storageRef = ref(storage, path);
      const metadata = await getMetadata(storageRef);
      return metadata;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Update file metadata
  static async updateFileMetadata(
    path: string, 
    metadata: { contentType?: string; customMetadata?: Record<string, string> }
  ): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await updateMetadata(storageRef, metadata);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // List files in a directory
  static async listFiles(path: string): Promise<string[]> {
    try {
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);
      
      const fileUrls: string[] = [];
      for (const itemRef of result.items) {
        const downloadURL = await getDownloadURL(itemRef);
        fileUrls.push(downloadURL);
      }
      
      return fileUrls;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get user documents
  static async getUserDocuments(userId: string): Promise<{
    idCard?: string;
    matricCert?: string;
    transcript?: string;
    cv?: string;
  }> {
    try {
      const documents: any = {};
      const documentTypes = ['idCard', 'matricCert', 'transcript', 'cv'];
      
      for (const docType of documentTypes) {
        try {
          const path = `users/${userId}/documents/${docType}`;
          const storageRef = ref(storage, path);
          const downloadURL = await getDownloadURL(storageRef);
          documents[docType] = downloadURL;
        } catch (error) {
          // Document doesn't exist, continue
        }
      }
      
      return documents;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Validate file type
  static validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  // Validate file size
  static validateFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  // Get file size in human readable format
  static getFileSizeString(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Generate unique filename
  static generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    return `${timestamp}_${randomString}.${extension}`;
  }

  // Compress image before upload
  static async compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}
