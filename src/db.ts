// ===== DATABASE (IndexedDB) =====
const DB_NAME = 'PrintFlowStudio';
const DB_VERSION = 1;

export interface DocumentBlock {
  id: string;
  type: string;
  content: string;
  settings: Record<string, any>;
}

export interface PrintDocument {
  id: string;
  name: string;
  documentNumber: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  paperSize: string;
  width: number;
  height: number;
  orientation: string;
  margin: { top: number; right: number; bottom: number; left: number };
  contentBlocks: DocumentBlock[];
  printer: string;
  status: string;
  notes: string;
  productName?: string;
  productDetail?: string;
  productUnit?: string;
  priceNormal?: number;
  pricePromo?: number;
  priceStrike?: number;
  promoBadge?: string;
  customBadgeTitle?: string;
  customBadgeContent?: string;
  promoStart?: string;
  promoEnd?: string;
  promoFormat?: string;
  autoCapital?: boolean;
}

export interface QueueItem {
  id: string;
  documentId: string;
  documentName: string;
  documentNumber: string;
  category: string;
  paperSize: string;
  createdAt: string;
  printer: string;
  status: 'WAITING' | 'PRINTING' | 'PRINTED' | 'FAILED';
  document: PrintDocument;
}

export interface PrintHistoryItem {
  id: string;
  documentId: string;
  documentName: string;
  documentNumber: string;
  printer: string;
  paperSize: string;
  printDate: string;
  printTime: string;
  copies: number;
  status: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  paperSize: string;
  contentBlocks: DocumentBlock[];
  createdAt: string;
}

export interface PrinterConfig {
  id: string;
  name: string;
  type: string;
  connection: string;
  status: string;
  paperSize: string;
  isDefault: boolean;
  thermalSettings?: {
    autoCut: boolean;
    paperFeed: number;
    printDensity: number;
    printSpeed: number;
    cashDrawer: boolean;
    copies: number;
    scale: number;
    margins: { top: number; right: number; bottom: number; left: number };
  };
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('documents')) {
        db.createObjectStore('documents', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('printQueue')) {
        db.createObjectStore('printQueue', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('printHistory')) {
        db.createObjectStore('printHistory', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('templates')) {
        db.createObjectStore('templates', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('printers')) {
        db.createObjectStore('printers', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function dbGetAll(storeName: string): Promise<any[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function dbGet(storeName: string, id: string): Promise<any> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function dbPut(storeName: string, data: any): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(data);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function dbDelete(storeName: string, id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function dbClear(storeName: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export function generateId(): string {
  return 'PF-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
}

export function generateDocNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0,10).replace(/-/g,'');
  const seq = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  return `PF-${date}-${seq}`;
}
