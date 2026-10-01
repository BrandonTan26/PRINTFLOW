import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  dbGetAll, dbPut, dbDelete, dbGet, generateId, generateDocNumber,
  PrintDocument, QueueItem, PrintHistoryItem, Template, PrinterConfig, DocumentBlock
} from './db';

// ===== ICONS (SVG) =====
const Icons = {
  printer: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  doc: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>,
  queue: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  folder: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
  history: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  template: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
  settings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  bell: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  menu: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  close: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  eye: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  up: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18,15 12,9 6,15"/></svg>,
  down: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6,9 12,15 18,9"/></svg>,
  whatsapp: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg>,
  download: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  upload: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  refresh: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
};

// ===== PAPER SIZES =====
const PAPER_SIZES: Record<string, { w: number; h: number; unit: string; label: string }> = {
  'THERMAL_58': { w: 58, h: 200, unit: 'mm', label: 'Thermal 58mm' },
  'THERMAL_80': { w: 80, h: 200, unit: 'mm', label: 'Thermal 80mm' },
  'THERMAL_110': { w: 110, h: 200, unit: 'mm', label: 'Thermal 110mm' },
  'A4': { w: 210, h: 297, unit: 'mm', label: 'A4' },
  'A5': { w: 148, h: 210, unit: 'mm', label: 'A5' },
  'A6': { w: 105, h: 148, unit: 'mm', label: 'A6' },
  'LETTER': { w: 216, h: 279, unit: 'mm', label: 'Letter' },
  'LEGAL': { w: 216, h: 356, unit: 'mm', label: 'Legal' },
  'CUSTOM': { w: 100, h: 150, unit: 'mm', label: 'Custom' },
};

const CATEGORIES = ['POP', 'Price Tag', 'Promo', 'Label', 'Receipt', 'Invoice', 'Nota', 'Surat', 'Dokumen Custom'];
const BADGE_OPTIONS = ['Tanpa Badge', 'BELI 1 GRATIS 1', 'BELI 2 GRATIS 1', 'BELI 2 LEBIH MURAH', 'SERBA GRATIS', 'PROMO SPESIAL', 'HARGA SPESIAL', 'PROMO SPESIAL MINGGUAN', 'PROMO TEBUS MURAH', 'CUSTOM BADGE'];
const BLOCK_TYPES = ['Text', 'Heading', 'Product Name', 'Price', 'Promo Badge', 'Divider', 'Image', 'QR Code', 'Barcode', 'Table', 'Spacer', 'Footer'];

// ===== MAIN APP =====
export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('printflow-theme') || 'light');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<{id: string; message: string; type: string}[]>([]);
  const [documents, setDocuments] = useState<PrintDocument[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [history, setHistory] = useState<PrintHistoryItem[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [printers, setPrinters] = useState<PrinterConfig[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [editingDoc, setEditingDoc] = useState<PrintDocument | null>(null);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [previewZoom, setPreviewZoom] = useState(100);
  const [draft, setDraft] = useState<PrintDocument | null>(null);
  const [showDraftModal, setShowDraftModal] = useState(false);

  // Form state for document builder
  const [form, setForm] = useState<Partial<PrintDocument>>({
    name: '', documentNumber: '', category: 'POP', paperSize: 'THERMAL_80',
    orientation: 'portrait', margin: { top: 5, right: 5, bottom: 5, left: 5 },
    contentBlocks: [], productName: '', productDetail: '', productUnit: '',
    priceNormal: 0, pricePromo: 0, priceStrike: 0, promoBadge: 'Tanpa Badge',
    customBadgeTitle: '', customBadgeContent: '', promoStart: '', promoEnd: '',
    promoFormat: '0', autoCapital: true, notes: '', printer: ''
  });

  // Load data
  useEffect(() => {
    loadData();
    const savedDraft = localStorage.getItem('printflow-draft');
    if (savedDraft) {
      setShowDraftModal(true);
      setDraft(JSON.parse(savedDraft));
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (currentPage === 'create' && form.name) {
      const timer = setTimeout(() => {
        localStorage.setItem('printflow-draft', JSON.stringify(form));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [form, currentPage]);

  // Theme
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark', 'neon');
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('printflow-theme', theme);
  }, [theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'n') { e.preventDefault(); setCurrentPage('create'); resetForm(); }
        if (e.key === 's') { e.preventDefault(); saveToQueue(); }
        if (e.key === 'f') { e.preventDefault(); document.querySelector<HTMLInputElement>('.topbar-search input')?.focus(); }
      }
      if (e.key === 'Escape') { setShowModal(null); setMobileSidebarOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [form, documents]);

  async function loadData() {
    const [docs, q, h, t, p] = await Promise.all([
      dbGetAll('documents'), dbGetAll('printQueue'), dbGetAll('printHistory'),
      dbGetAll('templates'), dbGetAll('printers')
    ]);
    setDocuments(docs); setQueue(q); setHistory(h); setTemplates(t); setPrinters(p);
    if (p.length === 0) {
      const defaultPrinter: PrinterConfig = {
        id: 'default', name: 'System Printer', type: 'System Printer',
        connection: 'USB', status: 'Connected', paperSize: 'A4', isDefault: true,
        thermalSettings: { autoCut: true, paperFeed: 3, printDensity: 8, printSpeed: 5, cashDrawer: false, copies: 1, scale: 100, margins: { top: 0, right: 0, bottom: 0, left: 0 } }
      };
      await dbPut('printers', defaultPrinter);
      setPrinters([defaultPrinter]);
    }
  }

  function toast(message: string, type = 'success') {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }

  function resetForm() {
    setForm({
      name: '', documentNumber: generateDocNumber(), category: 'POP', paperSize: 'THERMAL_80',
      orientation: 'portrait', margin: { top: 5, right: 5, bottom: 5, left: 5 },
      contentBlocks: [], productName: '', productDetail: '', productUnit: '',
      priceNormal: 0, pricePromo: 0, priceStrike: 0, promoBadge: 'Tanpa Badge',
      customBadgeTitle: '', customBadgeContent: '', promoStart: '', promoEnd: '',
      promoFormat: '0', autoCapital: true, notes: '', printer: printers[0]?.name || 'System Printer'
    });
    setEditingDoc(null);
  }

  function updateForm(key: string, value: any) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function saveToQueue() {
    if (!form.name) { toast('Nama dokumen wajib diisi', 'error'); return; }
    if (!form.paperSize) { toast('Ukuran kertas wajib dipilih', 'error'); return; }

    const paperInfo = PAPER_SIZES[form.paperSize] || PAPER_SIZES['CUSTOM'];
    const doc: PrintDocument = {
      id: editingDoc?.id || generateId(),
      name: form.name || 'Untitled',
      documentNumber: form.documentNumber || generateDocNumber(),
      category: form.category || 'Dokumen Custom',
      createdAt: editingDoc?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paperSize: form.paperSize || 'THERMAL_80',
      width: paperInfo.w,
      height: paperInfo.h,
      orientation: form.orientation || 'portrait',
      margin: form.margin || { top: 5, right: 5, bottom: 5, left: 5 },
      contentBlocks: form.contentBlocks || [],
      printer: form.printer || printers[0]?.name || 'System Printer',
      status: 'SAVED',
      notes: form.notes || '',
      productName: form.productName, productDetail: form.productDetail,
      productUnit: form.productUnit, priceNormal: form.priceNormal,
      pricePromo: form.pricePromo, priceStrike: form.priceStrike,
      promoBadge: form.promoBadge, customBadgeTitle: form.customBadgeTitle,
      customBadgeContent: form.customBadgeContent, promoStart: form.promoStart,
      promoEnd: form.promoEnd, promoFormat: form.promoFormat, autoCapital: form.autoCapital,
    };

    await dbPut('documents', doc);
    
    const queueItem: QueueItem = {
      id: generateId(),
      documentId: doc.id,
      documentName: doc.name,
      documentNumber: doc.documentNumber,
      category: doc.category,
      paperSize: doc.paperSize,
      createdAt: new Date().toISOString(),
      printer: doc.printer,
      status: 'WAITING',
      document: doc,
    };
    await dbPut('printQueue', queueItem);
    
    localStorage.removeItem('printflow-draft');
    toast('Dokumen berhasil disimpan ke antrian');
    await loadData();
    setCurrentPage('queue');
  }

  async function deleteDocument(id: string) {
    await dbDelete('documents', id);
    const qItems = await dbGetAll('printQueue');
    for (const item of qItems) {
      if (item.documentId === id) await dbDelete('printQueue', item.id);
    }
    toast('Dokumen berhasil dihapus');
    setShowModal(null);
    await loadData();
  }

  async function duplicateDocument(doc: PrintDocument) {
    const newDoc = { ...doc, id: generateId(), documentNumber: generateDocNumber(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await dbPut('documents', newDoc);
    toast('Dokumen berhasil diduplikasi');
    await loadData();
  }

  async function printFromQueue(item: QueueItem) {
    await dbPut('printQueue', { ...item, status: 'PRINTING' });
    
    const historyItem: PrintHistoryItem = {
      id: generateId(),
      documentId: item.documentId,
      documentName: item.documentName,
      documentNumber: item.documentNumber,
      printer: item.printer,
      paperSize: item.paperSize,
      printDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
      printTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      copies: 1,
      status: 'PRINTED'
    };
    await dbPut('printHistory', historyItem);
    await dbPut('printQueue', { ...item, status: 'PRINTED' });
    
    // Trigger browser print
    setTimeout(() => window.print(), 300);
    toast('Dokumen berhasil dicetak');
    await loadData();
  }

  async function deleteFromQueue(id: string) {
    await dbDelete('printQueue', id);
    toast('Item dihapus dari antrian');
    await loadData();
  }

  function editDocument(doc: PrintDocument) {
    setEditingDoc(doc);
    setForm(doc);
    setCurrentPage('create');
  }

  function addBlock(type: string) {
    const block: DocumentBlock = {
      id: Date.now().toString(),
      type,
      content: type === 'Heading' ? 'Heading Text' : type === 'Text' ? 'Enter text here...' : type === 'Divider' ? '' : type === 'Spacer' ? '20' : '',
      settings: type === 'Text' ? { fontSize: 14, fontWeight: 'normal', align: 'left' } :
                type === 'Heading' ? { fontSize: 24, fontWeight: 'bold', align: 'center' } : {}
    };
    updateForm('contentBlocks', [...(form.contentBlocks || []), block]);
  }

  function updateBlock(blockId: string, content: string) {
    updateForm('contentBlocks', (form.contentBlocks || []).map(b => b.id === blockId ? { ...b, content } : b));
  }

  function deleteBlock(blockId: string) {
    updateForm('contentBlocks', (form.contentBlocks || []).filter(b => b.id !== blockId));
  }

  function moveBlock(blockId: string, dir: 'up' | 'down') {
    const blocks = [...(form.contentBlocks || [])];
    const idx = blocks.findIndex(b => b.id === blockId);
    if (dir === 'up' && idx > 0) { [blocks[idx-1], blocks[idx]] = [blocks[idx], blocks[idx-1]]; }
    if (dir === 'down' && idx < blocks.length - 1) { [blocks[idx+1], blocks[idx]] = [blocks[idx], blocks[idx+1]]; }
    updateForm('contentBlocks', blocks);
  }

  async function saveAsTemplate() {
    if (!form.name) { toast('Nama dokumen wajib diisi', 'error'); return; }
    const tmpl: Template = {
      id: generateId(),
      name: form.name + ' Template',
      category: form.category || 'Dokumen Custom',
      paperSize: form.paperSize || 'A4',
      contentBlocks: form.contentBlocks || [],
      createdAt: new Date().toISOString(),
    };
    await dbPut('templates', tmpl);
    toast('Template berhasil disimpan');
    await loadData();
  }

  function useTemplate(tmpl: Template) {
    setForm(prev => ({ ...prev, contentBlocks: tmpl.contentBlocks, paperSize: tmpl.paperSize, category: tmpl.category }));
    setCurrentPage('create');
    toast('Template berhasil diterapkan');
  }

  async function deleteTemplate(id: string) {
    await dbDelete('templates', id);
    toast('Template berhasil dihapus');
    await loadData();
  }

  async function exportBackup() {
    const data = {
      documents: await dbGetAll('documents'),
      printQueue: await dbGetAll('printQueue'),
      printHistory: await dbGetAll('printHistory'),
      templates: await dbGetAll('templates'),
      printers: await dbGetAll('printers'),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `printflow-backup-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    toast('Backup berhasil dibuat');
  }

  async function importBackup(file: File) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.documents || !data.version) throw new Error('Invalid backup file');
      for (const doc of data.documents) await dbPut('documents', doc);
      for (const q of (data.printQueue || [])) await dbPut('printQueue', q);
      for (const h of (data.printHistory || [])) await dbPut('printHistory', h);
      for (const t of (data.templates || [])) await dbPut('templates', t);
      for (const p of (data.printers || [])) await dbPut('printers', p);
      toast('Backup berhasil dipulihkan');
      await loadData();
    } catch (e) {
      toast('File backup tidak valid', 'error');
    }
  }

  function restoreDraft() {
    if (draft) { setForm(draft); setCurrentPage('create'); }
    setShowDraftModal(false);
    localStorage.removeItem('printflow-draft');
  }

  function discardDraft() {
    setShowDraftModal(false);
    localStorage.removeItem('printflow-draft');
  }

  // Computed values
  const priceNormal = Number(form.priceNormal) || 0;
  const pricePromo = Number(form.pricePromo) || 0;
  const savings = priceNormal - pricePromo;
  const discountPct = priceNormal > 0 ? ((savings / priceNormal) * 100).toFixed(1) : '0';

  function formatPromoPeriod() {
    if (!form.promoStart || !form.promoEnd) return '';
    const start = new Date(form.promoStart);
    const end = new Date(form.promoEnd);
    const months = ['JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI','JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'];
    const format = form.promoFormat || '0';
    if (format === '0') return `${String(start.getDate()).padStart(2,'0')} - ${String(end.getDate()).padStart(2,'0')} ${months[end.getMonth()]} ${end.getFullYear()}`;
    if (format === '1') return `${String(start.getDate()).padStart(2,'0')} ${months[start.getMonth()]} - ${String(end.getDate()).padStart(2,'0')} ${months[end.getMonth()]} ${end.getFullYear()}`;
    return `${String(start.getDate()).padStart(2,'0')}/${String(start.getMonth()+1).padStart(2,'0')}/${start.getFullYear()} - ${String(end.getDate()).padStart(2,'0')}/${String(end.getMonth()+1).padStart(2,'0')}/${end.getFullYear()}`;
  }

  const filteredDocs = documents.filter(d =>
    !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.productName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQueue = queue.filter(q =>
    !searchQuery || q.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.documentNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paperInfo = PAPER_SIZES[form.paperSize || 'THERMAL_80'] || PAPER_SIZES['CUSTOM'];
  const previewW = form.orientation === 'landscape' ? paperInfo.h : paperInfo.w;
  const previewH = form.orientation === 'landscape' ? paperInfo.w : paperInfo.h;
  const scale = Math.min(1, 350 / previewW);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
    { id: 'create', label: 'Buat Dokumen', icon: Icons.doc },
    { id: 'queue', label: 'Antrian Print', icon: Icons.queue },
    { id: 'documents', label: 'Dokumen Tersimpan', icon: Icons.folder },
    { id: 'history', label: 'Riwayat Print', icon: Icons.history },
    { id: 'templates', label: 'Template', icon: Icons.template },
    { id: 'printers', label: 'Printer', icon: Icons.printer },
    { id: 'settings', label: 'Pengaturan', icon: Icons.settings },
  ];

  // ===== RENDER =====
  return (
    <div className="app-layout">
      {/* Sidebar Overlay */}
      {mobileSidebarOpen && <div className="sidebar-overlay active" onClick={() => setMobileSidebarOpen(false)} />}
      
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
          </div>
          {!sidebarCollapsed && (
            <div className="sidebar-brand">
              <h1>PRINTFLOW</h1>
              <p>Smart Print Studio</p>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => { setCurrentPage(item.id); setMobileSidebarOpen(false); if (item.id === 'create') resetForm(); }}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="theme-switcher">
            {['light', 'dark', 'neon'].map(t => (
              <button key={t} className={`theme-btn ${theme === t ? 'active' : ''}`} onClick={() => setTheme(t)}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>
          {!sidebarCollapsed && (
            <div className="system-status">
              <div className="status-item"><span className="status-dot"></span> Database: Connected</div>
              <div className="status-item"><span className="status-dot"></span> Storage: Local</div>
              <div className="status-item"><span className="status-dot"></span> v1.0.0</div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <button className="topbar-btn menu-toggle" onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} aria-label="Toggle menu">
            {Icons.menu}
          </button>
          <button className="topbar-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} aria-label="Toggle sidebar" style={{display: sidebarCollapsed ? 'none' : undefined}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
          </button>
          <div>
            <div className="topbar-title">{menuItems.find(m => m.id === currentPage)?.label || 'Dashboard'}</div>
            <div className="topbar-breadcrumb">PRINTFLOW / {menuItems.find(m => m.id === currentPage)?.label}</div>
          </div>
          <div className="topbar-search">
            <span className="search-icon">{Icons.search}</span>
            <input type="text" placeholder="Cari dokumen, ID, produk..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="topbar-actions">
            <button className="topbar-btn" aria-label="Notifications">{Icons.bell}</button>
            <button className="topbar-btn" onClick={() => { const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'neon' : 'light'; setTheme(next); }} aria-label="Toggle theme">
              {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '💜'}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content" style={currentPage === 'create' ? { padding: '16px 20px', overflow: 'hidden' } : {}}>
          {currentPage === 'dashboard' && <DashboardPage documents={documents} queue={queue} history={history} templates={templates} printers={printers} setCurrentPage={setCurrentPage} resetForm={resetForm} />}
          {currentPage === 'create' && (
            <CreatePage
              form={form} updateForm={updateForm} addBlock={addBlock} updateBlock={updateBlock}
              deleteBlock={deleteBlock} moveBlock={moveBlock} saveToQueue={saveToQueue}
              saveAsTemplate={saveAsTemplate} paperInfo={paperInfo} previewW={previewW}
              previewH={previewH} scale={scale} previewZoom={previewZoom} setPreviewZoom={setPreviewZoom}
              priceNormal={priceNormal} pricePromo={pricePromo} savings={savings} discountPct={discountPct}
              formatPromoPeriod={formatPromoPeriod} mobileTab={mobileTab} setMobileTab={setMobileTab}
              printers={printers} editingDoc={editingDoc}
            />
          )}
          {currentPage === 'queue' && <QueuePage queue={filteredQueue} printFromQueue={printFromQueue} deleteFromQueue={deleteFromQueue} setShowModal={setShowModal} setModalData={setModalData} loadData={loadData} editDocument={editDocument} />}
          {currentPage === 'documents' && <DocumentsPage documents={filteredDocs} editDocument={editDocument} duplicateDocument={duplicateDocument} deleteDocument={deleteDocument} setShowModal={setShowModal} setModalData={setModalData} />}
          {currentPage === 'history' && <HistoryPage history={history} />}
          {currentPage === 'templates' && <TemplatesPage templates={templates} useTemplate={useTemplate} deleteTemplate={deleteTemplate} setShowModal={setShowModal} setModalData={setModalData} />}
          {currentPage === 'printers' && <PrintersPage printers={printers} loadData={loadData} />}
          {currentPage === 'settings' && <SettingsPage exportBackup={exportBackup} importBackup={importBackup} theme={theme} setTheme={setTheme} />}
        </div>

        {/* Footer */}
        <AppFooter />
      </div>

      {/* Floating WhatsApp */}
      <a href="https://wa.me/6285774122710?text=Halo%20Admin%20BrandRetailCortex%2C%20saya%20tertarik%20membuat%20website%20untuk%20UMKM.%20Saya%20ingin%20konsultasi%20terlebih%20dahulu." target="_blank" rel="noopener noreferrer" className="floating-wa" title="Chat Admin">
        {Icons.whatsapp}
      </a>

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showModal === 'delete' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Hapus Dokumen?</h3>
              <button className="btn-icon" onClick={() => setShowModal(null)}>{Icons.close}</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Dokumen ini akan dihapus dari database dan antrian. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(null)}>Batal</button>
              <button className="btn btn-danger" onClick={() => {
                if (modalData?.type === 'document') deleteDocument(modalData.id);
                else if (modalData?.type === 'queue') deleteFromQueue(modalData.id);
                else if (modalData?.type === 'template') deleteTemplate(modalData.id);
              }}>Hapus Dokumen</button>
            </div>
          </div>
        </div>
      )}

      {/* Draft Recovery Modal */}
      {showDraftModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Draft Terakhir Ditemukan</h3>
              <button className="btn-icon" onClick={discardDraft}>{Icons.close}</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Ada draft dokumen yang belum disimpan. Apakah Anda ingin melanjutkannya?
              </p>
              {draft && <p style={{ marginTop: '8px', fontSize: '13px', fontWeight: 600 }}>{draft.name || 'Untitled Document'}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={discardDraft}>Discard</button>
              <button className="btn btn-primary" onClick={restoreDraft}>Restore Draft</button>
            </div>
          </div>
        </div>
      )}

      {/* Print Area (hidden, used for actual printing) */}
      <div className="print-area" style={{ display: 'none' }}>
        {queue.filter(q => q.status === 'PRINTING').map(q => (
          <div key={q.id} style={{ padding: '10mm' }}>
            <DocumentPreview doc={q.document} paperInfo={PAPER_SIZES[q.paperSize] || PAPER_SIZES['THERMAL_80']} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== DASHBOARD PAGE =====
function DashboardPage({ documents, queue, history, templates, printers, setCurrentPage, resetForm }: any) {
  const stats = [
    { label: 'Total Dokumen', value: documents.length, icon: '📄', color: 'var(--accent-light)', textColor: 'var(--accent)' },
    { label: 'Antrian Print', value: queue.filter((q: QueueItem) => q.status === 'WAITING').length, icon: '🖨️', color: 'rgba(243,156,18,0.1)', textColor: 'var(--warning)' },
    { label: 'Sudah Dicetak', value: history.filter((h: PrintHistoryItem) => h.status === 'PRINTED').length, icon: '✅', color: 'rgba(46,204,113,0.1)', textColor: 'var(--success)' },
    { label: 'Print Failed', value: history.filter((h: PrintHistoryItem) => h.status === 'FAILED').length, icon: '❌', color: 'rgba(231,76,60,0.1)', textColor: 'var(--danger)' },
    { label: 'Template', value: templates.length, icon: '📋', color: 'rgba(52,152,219,0.1)', textColor: 'var(--info)' },
    { label: 'Printer Aktif', value: printers.filter((p: PrinterConfig) => p.status === 'Connected').length, icon: '🖥️', color: 'rgba(139,92,246,0.1)', textColor: 'var(--accent)' },
  ];

  return (
    <div className="fade-in">
      {/* How to use stepper */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>CARA MENGGUNAKAN PRINTFLOW</h3>
        <div className="stepper">
          {[
            'Pilih jenis dokumen dan ukuran kertas',
            'Isi data dokumen',
            'Atur layout dan tampilan',
            'Periksa Live Preview',
            'Klik Simpan ke Antrian',
            'Buka Antrian Print dan klik Print'
          ].map((step, i) => (
            <React.Fragment key={i}>
              <div className="step">
                <div className="step-number">{String(i+1).padStart(2,'0')}</div>
                <div className="step-text">{step}</div>
              </div>
              {i < 5 && <div className="step-connector"></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-6" style={{ marginBottom: '24px' }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.color, color: s.textColor }}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>QUICK ACTIONS</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => { resetForm(); setCurrentPage('create'); }}>
            {Icons.plus} Buat Dokumen
          </button>
          <button className="btn btn-secondary" onClick={() => setCurrentPage('queue')}>
            {Icons.queue} Buka Antrian
          </button>
          <button className="btn btn-secondary" onClick={() => setCurrentPage('documents')}>
            {Icons.folder} Dokumen Tersimpan
          </button>
          <button className="btn btn-secondary" onClick={() => setCurrentPage('printers')}>
            {Icons.settings} Printer Settings
          </button>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="grid-2" style={{ gap: '20px' }}>
        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>RECENT DOCUMENTS</h3>
          {documents.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Belum ada dokumen</p>
          ) : (
            documents.slice(0, 5).map((doc: PrintDocument) => (
              <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{doc.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{doc.documentNumber} • {doc.category}</div>
                </div>
                <span className="badge badge-primary">{doc.paperSize}</span>
              </div>
            ))
          )}
        </div>
        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>RECENT QUEUE</h3>
          {queue.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Antrian kosong</p>
          ) : (
            queue.slice(0, 5).map((item: QueueItem) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.documentName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.documentNumber}</div>
                </div>
                <span className={`badge ${item.status === 'WAITING' ? 'badge-warning' : item.status === 'PRINTED' ? 'badge-success' : item.status === 'FAILED' ? 'badge-danger' : 'badge-info'}`}>
                  {item.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ===== CREATE PAGE =====
function CreatePage({ form, updateForm, addBlock, updateBlock, deleteBlock, moveBlock, saveToQueue, saveAsTemplate, paperInfo, previewW, previewH, scale, previewZoom, setPreviewZoom, priceNormal, pricePromo, savings, discountPct, formatPromoPeriod, mobileTab, setMobileTab, printers, editingDoc }: any) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => { const h = () => setIsMobile(window.innerWidth <= 768); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);
  
  return (
    <div className="fade-in" style={{ height: '100%' }}>
      {/* Mobile Tabs */}
      {isMobile && (
        <div className="tabs">
          <button className={`tab ${mobileTab === 'edit' ? 'active' : ''}`} onClick={() => setMobileTab('edit')}>EDIT</button>
          <button className={`tab ${mobileTab === 'preview' ? 'active' : ''}`} onClick={() => setMobileTab('preview')}>PREVIEW</button>
        </div>
      )}

      <div className="editor-layout">
        {/* Editor Panel */}
        <div className="editor-panel" style={isMobile && mobileTab !== 'edit' ? { display: 'none' } : {}}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{editingDoc ? 'Edit Dokumen' : 'Buat Dokumen Baru'}</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={saveAsTemplate}>Save Template</button>
              <button className="btn btn-primary btn-sm" onClick={saveToQueue}>
                {Icons.queue} Simpan ke Antrian
              </button>
            </div>
          </div>

          {/* Document Info */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>INFORMASI DOKUMEN</h4>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nama Dokumen *</label>
                <input className="form-input" value={form.name || ''} onChange={e => updateForm('name', e.target.value)} placeholder="Nama dokumen..." />
              </div>
              <div className="form-group">
                <label className="form-label">Nomor Dokumen</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input className="form-input" value={form.documentNumber || ''} onChange={e => updateForm('documentNumber', e.target.value)} />
                  <button className="btn btn-secondary btn-sm" onClick={() => updateForm('documentNumber', generateDocNumber())}>Auto</button>
                </div>
              </div>
            </div>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select className="form-select" value={form.category || ''} onChange={e => updateForm('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tanggal</label>
                <input className="form-input" type="date" value={form.notes ? new Date(form.notes).toISOString().slice(0,10) : new Date().toISOString().slice(0,10)} onChange={e => updateForm('notes', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Printer</label>
                <select className="form-select" value={form.printer || ''} onChange={e => updateForm('printer', e.target.value)}>
                  {printers.map((p: PrinterConfig) => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>INFORMASI PRODUK</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>AUTO CAPITAL</label>
              <div className={`toggle ${form.autoCapital ? 'active' : ''}`} onClick={() => updateForm('autoCapital', !form.autoCapital)}></div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nama Item</label>
                <input className="form-input" value={form.productName || ''} onChange={e => updateForm('productName', form.autoCapital ? e.target.value.toUpperCase() : e.target.value)} placeholder="Nama produk..." />
              </div>
              <div className="form-group">
                <label className="form-label">Detail / Kemasan</label>
                <input className="form-input" value={form.productDetail || ''} onChange={e => updateForm('productDetail', e.target.value)} placeholder="600 ml" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Satuan</label>
                <input className="form-input" value={form.productUnit || ''} onChange={e => updateForm('productUnit', e.target.value)} placeholder="/3 PCS" />
              </div>
              <div className="form-group">
                <label className="form-label">Harga Normal</label>
                <input className="form-input" type="number" value={form.priceNormal || ''} onChange={e => updateForm('priceNormal', Number(e.target.value))} placeholder="9600" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Harga Promo</label>
                <input className="form-input" type="number" value={form.pricePromo || ''} onChange={e => updateForm('pricePromo', Number(e.target.value))} placeholder="6400" />
              </div>
              <div className="form-group">
                <label className="form-label">Harga Coret</label>
                <input className="form-input" type="number" value={form.priceStrike || ''} onChange={e => updateForm('priceStrike', Number(e.target.value))} placeholder="9600" />
              </div>
            </div>
            {savings > 0 && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <span className="badge badge-success">HEMAT RP {savings.toLocaleString('id-ID')}</span>
                <span className="badge badge-danger">DISKON {discountPct}%</span>
              </div>
            )}
          </div>

          {/* Promo Badge */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>PROMO BADGE</h4>
            <div className="form-group">
              <label className="form-label">Badge</label>
              <select className="form-select" value={form.promoBadge || 'Tanpa Badge'} onChange={e => updateForm('promoBadge', e.target.value)}>
                {BADGE_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            {form.promoBadge === 'CUSTOM BADGE' && (
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Judul Badge</label>
                  <input className="form-input" value={form.customBadgeTitle || ''} onChange={e => updateForm('customBadgeTitle', e.target.value)} placeholder="Judul..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Isi Badge</label>
                  <input className="form-input" value={form.customBadgeContent || ''} onChange={e => updateForm('customBadgeContent', e.target.value)} placeholder="Isi..." />
                </div>
              </div>
            )}
          </div>

          {/* Promo Period */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>PERIODE PROMO</h4>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Tanggal Mulai</label>
                <input className="form-input" type="date" value={form.promoStart || ''} onChange={e => updateForm('promoStart', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Tanggal Selesai</label>
                <input className="form-input" type="date" value={form.promoEnd || ''} onChange={e => updateForm('promoEnd', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Format</label>
                <select className="form-select" value={form.promoFormat || '0'} onChange={e => updateForm('promoFormat', e.target.value)}>
                  <option value="0">01 - 15 OKTOBER 2026</option>
                  <option value="1">01 OKTOBER - 15 OKTOBER 2026</option>
                  <option value="2">01/10/2026 - 15/10/2026</option>
                </select>
              </div>
            </div>
            {formatPromoPeriod() && (
              <div style={{ marginTop: '8px', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius)', fontSize: '12px', fontWeight: 600, color: 'var(--accent)' }}>
                PERIODE: {formatPromoPeriod()}
              </div>
            )}
          </div>

          {/* Paper Settings */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>PENGATURAN KERTAS</h4>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Ukuran Kertas</label>
                <select className="form-select" value={form.paperSize || 'THERMAL_80'} onChange={e => updateForm('paperSize', e.target.value)}>
                  {Object.entries(PAPER_SIZES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Orientasi</label>
                <select className="form-select" value={form.orientation || 'portrait'} onChange={e => updateForm('orientation', e.target.value)}>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ukuran</label>
                <div style={{ fontSize: '13px', padding: '10px 0', color: 'var(--text-secondary)' }}>
                  {paperInfo.w} × {paperInfo.h} {paperInfo.unit}
                </div>
              </div>
            </div>
            <div className="grid-4">
              {(['top', 'right', 'bottom', 'left'] as const).map(side => (
                <div className="form-group" key={side}>
                  <label className="form-label">Margin {side.charAt(0).toUpperCase() + side.slice(1)} (mm)</label>
                  <input className="form-input" type="number" value={(form.margin as any)?.[side] || 0} onChange={e => updateForm('margin', { ...(form.margin || {}), [side]: Number(e.target.value) })} />
                </div>
              ))}
            </div>
          </div>

          {/* Block Builder */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>DOCUMENT BUILDER</h4>
              <div style={{ position: 'relative' }}>
                <select className="form-select" style={{ width: 'auto', paddingRight: '30px' }} onChange={e => { if (e.target.value) addBlock(e.target.value); e.target.value = ''; }} defaultValue="">
                  <option value="">+ Tambah Block</option>
                  {BLOCK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            {(form.contentBlocks || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                Belum ada block. Tambahkan block untuk membuat dokumen.
              </div>
            ) : (
              (form.contentBlocks || []).map((block: DocumentBlock, idx: number) => (
                <div key={block.id} className="builder-block">
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, minWidth: '20px' }}>{idx + 1}</span>
                  <span className="badge badge-primary" style={{ fontSize: '10px' }}>{block.type}</span>
                  <input
                    className="form-input"
                    style={{ flex: 1, padding: '6px 10px', fontSize: '12px' }}
                    value={block.content}
                    onChange={e => updateBlock(block.id, e.target.value)}
                    placeholder="Content..."
                  />
                  <div className="block-actions">
                    <button className="btn-icon" style={{ width: '26px', height: '26px' }} onClick={() => moveBlock(block.id, 'up')} title="Move Up">{Icons.up}</button>
                    <button className="btn-icon" style={{ width: '26px', height: '26px' }} onClick={() => moveBlock(block.id, 'down')} title="Move Down">{Icons.down}</button>
                    <button className="btn-icon" style={{ width: '26px', height: '26px' }} onClick={() => deleteBlock(block.id)} title="Delete">{Icons.trash}</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="preview-container" style={isMobile && mobileTab !== 'preview' ? { display: 'none' } : {}}>
          <div className="preview-controls">
            <button className="btn-icon" onClick={() => setPreviewZoom(Math.max(25, previewZoom - 25))}>−</button>
            <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>{previewZoom}%</span>
            <button className="btn-icon" onClick={() => setPreviewZoom(Math.min(200, previewZoom + 25))}>+</button>
            <button className="btn-icon" onClick={() => setPreviewZoom(100)}>Fit</button>
            <button className="btn-icon" onClick={() => setPreviewZoom(100)}>100%</button>
          </div>
          <div style={{ overflow: 'auto', maxWidth: '100%', maxHeight: 'calc(100vh - 200px)' }}>
            <div style={{ transform: `scale(${(previewZoom / 100) * scale})`, transformOrigin: 'top center' }}>
              <DocumentPreview form={form} paperInfo={paperInfo} previewW={previewW} previewH={previewH} priceNormal={priceNormal} pricePromo={pricePromo} savings={savings} discountPct={discountPct} formatPromoPeriod={formatPromoPeriod} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== DOCUMENT PREVIEW COMPONENT =====
function DocumentPreview({ form, paperInfo, previewW, previewH, priceNormal, pricePromo, savings, discountPct, formatPromoPeriod, doc }: any) {
  const d = doc || form || {};
  const pW = previewW || (d.width || paperInfo?.w || 80);
  const pH = previewH || (d.height || paperInfo?.h || 200);
  const margin = d.margin || { top: 5, right: 5, bottom: 5, left: 5 };
  const mmToPx = 3.78;
  
  return (
    <div
      className="preview-paper"
      style={{
        width: `${pW * mmToPx}px`,
        minHeight: `${pH * mmToPx}px`,
        padding: `${margin.top * mmToPx}px ${margin.right * mmToPx}px ${margin.bottom * mmToPx}px ${margin.left * mmToPx}px`,
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        lineHeight: '1.4',
      }}
    >
      {/* Product Name */}
      {d.productName && (
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: d.autoCapital ? '14px' : '13px', marginBottom: '4px', textTransform: d.autoCapital ? 'uppercase' : 'none' }}>
          {d.productName}
        </div>
      )}
      {/* Detail */}
      {d.productDetail && (
        <div style={{ textAlign: 'center', fontSize: '11px', color: '#666', marginBottom: '4px' }}>
          {d.productDetail} {d.productUnit || ''}
        </div>
      )}
      {/* Promo Badge */}
      {d.promoBadge && d.promoBadge !== 'Tanpa Badge' && (
        <div style={{ textAlign: 'center', margin: '6px 0', padding: '4px 8px', background: '#ff4444', color: '#fff', borderRadius: '3px', fontSize: '10px', fontWeight: 'bold' }}>
          {d.promoBadge === 'CUSTOM BADGE' ? `${d.customBadgeTitle || ''} ${d.customBadgeContent || ''}` : d.promoBadge}
        </div>
      )}
      {/* Prices */}
      {d.pricePromo > 0 && (
        <div style={{ textAlign: 'center', margin: '6px 0' }}>
          {d.priceNormal > 0 && d.priceNormal > d.pricePromo && (
            <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '11px' }}>
              Rp {Number(d.priceNormal).toLocaleString('id-ID')}
            </div>
          )}
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#e74c3c' }}>
            Rp {Number(d.pricePromo).toLocaleString('id-ID')}
          </div>
          {savings > 0 && (
            <div style={{ fontSize: '10px', color: '#27ae60', fontWeight: 'bold', marginTop: '2px' }}>
              HEMAT RP {Number(savings).toLocaleString('id-ID')} • DISKON {discountPct}%
            </div>
          )}
        </div>
      )}
      {/* Promo Period */}
      {formatPromoPeriod && formatPromoPeriod() && (
        <div style={{ textAlign: 'center', fontSize: '9px', color: '#888', margin: '6px 0', borderTop: '1px dashed #ccc', paddingTop: '4px' }}>
          PERIODE: {formatPromoPeriod()}
        </div>
      )}
      {/* Content Blocks */}
      {(d.contentBlocks || []).map((block: DocumentBlock) => {
        switch (block.type) {
          case 'Heading':
            return <div key={block.id} style={{ fontSize: `${block.settings?.fontSize || 18}px`, fontWeight: block.settings?.fontWeight || 'bold', textAlign: block.settings?.align || 'center', margin: '8px 0' }}>{block.content}</div>;
          case 'Text':
            return <div key={block.id} style={{ fontSize: `${block.settings?.fontSize || 12}px`, textAlign: block.settings?.align || 'left', margin: '4px 0' }}>{block.content}</div>;
          case 'Divider':
            return <hr key={block.id} style={{ border: 'none', borderTop: '1px dashed #ccc', margin: '8px 0' }} />;
          case 'Spacer':
            return <div key={block.id} style={{ height: `${block.content || 20}px` }} />;
          case 'Footer':
            return <div key={block.id} style={{ textAlign: 'center', fontSize: '9px', color: '#999', marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '6px' }}>{block.content}</div>;
          case 'Product Name':
            return <div key={block.id} style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '14px', margin: '4px 0' }}>{block.content}</div>;
          case 'Price':
            return <div key={block.id} style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '16px', color: '#e74c3c', margin: '4px 0' }}>{block.content}</div>;
          case 'Promo Badge':
            return <div key={block.id} style={{ textAlign: 'center', background: '#ff4444', color: '#fff', padding: '3px 8px', borderRadius: '3px', fontSize: '10px', fontWeight: 'bold', margin: '4px 0' }}>{block.content}</div>;
          case 'Barcode':
            return <div key={block.id} style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '10px', margin: '8px 0', letterSpacing: '2px' }}>||||| {block.content} |||||</div>;
          case 'QR Code':
            return <div key={block.id} style={{ textAlign: 'center', margin: '8px 0', padding: '8px', border: '1px solid #ddd', display: 'inline-block' }}>
              <div style={{ width: '60px', height: '60px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}>QR</div>
            </div>;
          case 'Table':
            return <div key={block.id} style={{ margin: '8px 0', fontSize: '11px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody><tr><td style={{ border: '1px solid #ddd', padding: '4px' }}>{block.content}</td></tr></tbody>
              </table>
            </div>;
          default:
            return <div key={block.id} style={{ margin: '4px 0' }}>{block.content}</div>;
        }
      })}
      {/* Document Name */}
      {d.name && !d.productName && (
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', margin: '8px 0' }}>{d.name}</div>
      )}
    </div>
  );
}

// ===== QUEUE PAGE =====
function QueuePage({ queue, printFromQueue, deleteFromQueue, setShowModal, setModalData, loadData, editDocument }: any) {
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSize, setFilterSize] = useState('');

  const filtered = queue.filter((q: QueueItem) => {
    if (filterStatus && q.status !== filterStatus) return false;
    if (filterSize && q.paperSize !== filterSize) return false;
    return true;
  });

  return (
    <div className="fade-in">
      <div className="section-header">
        <div>
          <h2 className="section-title">ANTRIAN PRINT</h2>
          <p className="section-subtitle">{filtered.length} dokumen dalam antrian</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select className="form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="WAITING">Waiting</option>
            <option value="PRINTING">Printing</option>
            <option value="PRINTED">Printed</option>
            <option value="FAILED">Failed</option>
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={filterSize} onChange={e => setFilterSize(e.target.value)}>
            <option value="">Semua Ukuran</option>
            <option value="THERMAL_58">58mm</option>
            <option value="THERMAL_80">80mm</option>
            <option value="THERMAL_110">110mm</option>
            <option value="A4">A4</option>
            <option value="A5">A5</option>
            <option value="A6">A6</option>
            <option value="LETTER">Letter</option>
            <option value="LEGAL">Legal</option>
          </select>
          <button className="btn btn-secondary btn-sm" onClick={loadData}>{Icons.refresh} Refresh</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🖨️</div>
          <h3>ANTRIAN PRINT KOSONG</h3>
          <p>Simpan dokumen untuk memasukkannya ke antrian.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="card" style={{ padding: 0, overflow: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama Dokumen</th>
                  <th>Kategori</th>
                  <th>Ukuran</th>
                  <th>Printer</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item: QueueItem) => (
                  <tr key={item.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{item.documentNumber}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.documentName}</td>
                    <td>{item.category}</td>
                    <td>{PAPER_SIZES[item.paperSize]?.label || item.paperSize}</td>
                    <td>{item.printer}</td>
                    <td>
                      <span className={`badge ${item.status === 'WAITING' ? 'badge-warning' : item.status === 'PRINTED' ? 'badge-success' : item.status === 'FAILED' ? 'badge-danger' : 'badge-info'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn-icon" onClick={() => editDocument(item.document)} title="Edit">{Icons.edit}</button>
                        <button className="btn-icon" onClick={() => printFromQueue(item)} title="Print" style={{ color: 'var(--success)' }}>{Icons.printer}</button>
                        <button className="btn-icon" onClick={() => { setShowModal('delete'); setModalData({ type: 'queue', id: item.id }); }} title="Delete" style={{ color: 'var(--danger)' }}>{Icons.trash}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="mobile-cards">
            {filtered.map((item: QueueItem) => (
              <div key={item.id} className="mobile-card">
                <div className="mobile-card-header">
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>{item.documentNumber}</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{item.documentName}</div>
                  </div>
                  <span className={`badge ${item.status === 'WAITING' ? 'badge-warning' : item.status === 'PRINTED' ? 'badge-success' : item.status === 'FAILED' ? 'badge-danger' : 'badge-info'}`}>
                    {item.status}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {PAPER_SIZES[item.paperSize]?.label || item.paperSize} • {item.printer}
                </div>
                <div className="mobile-card-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => editDocument(item.document)}>{Icons.edit} Edit</button>
                  <button className="btn btn-primary btn-sm" onClick={() => printFromQueue(item)}>{Icons.printer} Print</button>
                  <button className="btn btn-danger btn-sm" onClick={() => { setShowModal('delete'); setModalData({ type: 'queue', id: item.id }); }}>{Icons.trash} Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ===== DOCUMENTS PAGE =====
function DocumentsPage({ documents, editDocument, duplicateDocument, deleteDocument, setShowModal, setModalData }: any) {
  const [filterCat, setFilterCat] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  let filtered = documents.filter((d: PrintDocument) => !filterCat || d.category === filterCat);
  if (sortBy === 'newest') filtered.sort((a: PrintDocument, b: PrintDocument) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  if (sortBy === 'oldest') filtered.sort((a: PrintDocument, b: PrintDocument) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  if (sortBy === 'name') filtered.sort((a: PrintDocument, b: PrintDocument) => a.name.localeCompare(b.name));

  return (
    <div className="fade-in">
      <div className="section-header">
        <div>
          <h2 className="section-title">DOKUMEN TERSIMPAN</h2>
          <p className="section-subtitle">{filtered.length} dokumen</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select className="form-select" style={{ width: 'auto' }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">Semua Kategori</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="name">Nama A-Z</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <h3>BELUM ADA DOKUMEN</h3>
          <p>Buat dokumen pertama untuk memulai.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Kertas</th>
                <th>Tanggal</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc: PrintDocument) => (
                <tr key={doc.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{doc.documentNumber}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{doc.name}</td>
                  <td><span className="badge badge-primary">{doc.category}</span></td>
                  <td>{PAPER_SIZES[doc.paperSize]?.label || doc.paperSize}</td>
                  <td style={{ fontSize: '12px' }}>{new Date(doc.createdAt).toLocaleDateString('id-ID')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn-icon" onClick={() => editDocument(doc)} title="Edit">{Icons.edit}</button>
                      <button className="btn-icon" onClick={() => duplicateDocument(doc)} title="Duplicate">{Icons.copy}</button>
                      <button className="btn-icon" onClick={() => { setShowModal('delete'); setModalData({ type: 'document', id: doc.id }); }} title="Delete" style={{ color: 'var(--danger)' }}>{Icons.trash}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ===== HISTORY PAGE =====
function HistoryPage({ history }: any) {
  return (
    <div className="fade-in">
      <div className="section-header">
        <div>
          <h2 className="section-title">RIWAYAT PRINT</h2>
          <p className="section-subtitle">{history.length} riwayat cetak</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>BELUM ADA RIWAYAT</h3>
          <p>Riwayat print akan muncul setelah Anda mencetak dokumen.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Document ID</th>
                <th>Nama</th>
                <th>Printer</th>
                <th>Ukuran</th>
                <th>Tanggal</th>
                <th>Waktu</th>
                <th>Copies</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item: PrintHistoryItem) => (
                <tr key={item.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{item.documentNumber}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.documentName}</td>
                  <td>{item.printer}</td>
                  <td>{PAPER_SIZES[item.paperSize]?.label || item.paperSize}</td>
                  <td style={{ fontSize: '12px' }}>{item.printDate}</td>
                  <td style={{ fontSize: '12px' }}>{item.printTime}</td>
                  <td>{item.copies}</td>
                  <td><span className={`badge ${item.status === 'PRINTED' ? 'badge-success' : 'badge-danger'}`}>{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ===== TEMPLATES PAGE =====
function TemplatesPage({ templates, useTemplate, deleteTemplate, setShowModal, setModalData }: any) {
  return (
    <div className="fade-in">
      <div className="section-header">
        <div>
          <h2 className="section-title">TEMPLATE</h2>
          <p className="section-subtitle">{templates.length} template tersedia</p>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>BELUM ADA TEMPLATE</h3>
          <p>Simpan dokumen sebagai template untuk digunakan kembali.</p>
        </div>
      ) : (
        <div className="grid-3">
          {templates.map((tmpl: Template) => (
            <div key={tmpl.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{tmpl.name}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{tmpl.category} • {PAPER_SIZES[tmpl.paperSize]?.label}</p>
                </div>
                <span className="badge badge-primary">{tmpl.contentBlocks?.length || 0} blocks</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Dibuat: {new Date(tmpl.createdAt).toLocaleDateString('id-ID')}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="btn btn-primary btn-sm" onClick={() => useTemplate(tmpl)}>Gunakan</button>
                <button className="btn btn-danger btn-sm" onClick={() => { setShowModal('delete'); setModalData({ type: 'template', id: tmpl.id }); }}>{Icons.trash}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== PRINTERS PAGE =====
function PrintersPage({ printers, loadData }: any) {
  const [editing, setEditing] = useState<PrinterConfig | null>(null);

  async function savePrinter() {
    if (editing) {
      await dbPut('printers', editing);
      setEditing(null);
      loadData();
    }
  }

  return (
    <div className="fade-in">
      <div className="section-header">
        <div>
          <h2 className="section-title">PRINTER MANAGEMENT</h2>
          <p className="section-subtitle">{printers.length} printer terdaftar</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>PRINTER TERDAFTAR</h4>
        {printers.map((p: PrinterConfig) => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', background: 'var(--accent-light)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {Icons.printer}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{p.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.type} • {p.connection} • {p.paperSize}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className={`badge ${p.status === 'Connected' ? 'badge-success' : 'badge-danger'}`}>{p.status}</span>
              {p.isDefault && <span className="badge badge-primary">Default</span>}
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(p)}>{Icons.edit} Edit</button>
            </div>
          </div>
        ))}
      </div>

      {/* Thermal Settings */}
      {printers.some((p: PrinterConfig) => p.type === 'Thermal Printer') && (
        <div className="card">
          <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>THERMAL SETTINGS</h4>
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Auto Cut</label>
              <div className={`toggle ${printers[0]?.thermalSettings?.autoCut ? 'active' : ''}`}></div>
            </div>
            <div className="form-group">
              <label className="form-label">Paper Feed (mm)</label>
              <input className="form-input" type="number" value={printers[0]?.thermalSettings?.paperFeed || 3} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Print Density</label>
              <input className="form-input" type="number" value={printers[0]?.thermalSettings?.printDensity || 8} readOnly />
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>TEST PRINT</button>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Printer</h3>
              <button className="btn-icon" onClick={() => setEditing(null)}>{Icons.close}</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nama Printer</label>
                <input className="form-input" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Tipe</label>
                <select className="form-select" value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value })}>
                  <option>Thermal Printer</option>
                  <option>Inkjet Printer</option>
                  <option>Laser Printer</option>
                  <option>PDF Printer</option>
                  <option>System Printer</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Koneksi</label>
                <input className="form-input" value={editing.connection} onChange={e => setEditing({ ...editing, connection: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })}>
                  <option>Connected</option>
                  <option>Disconnected</option>
                  <option>Unknown</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditing(null)}>Batal</button>
              <button className="btn btn-primary" onClick={savePrinter}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== SETTINGS PAGE =====
function SettingsPage({ exportBackup, importBackup, theme, setTheme }: any) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fade-in">
      <div className="section-header">
        <div>
          <h2 className="section-title">PENGATURAN</h2>
          <p className="section-subtitle">Konfigurasi aplikasi</p>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '20px' }}>
        {/* Appearance */}
        <div className="card">
          <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>🎨 APPEARANCE</h4>
          <div className="form-group">
            <label className="form-label">Tema</label>
            <div className="theme-switcher" style={{ maxWidth: '240px' }}>
              {['light', 'dark', 'neon'].map(t => (
                <button key={t} className={`theme-btn ${theme === t ? 'active' : ''}`} onClick={() => setTheme(t)}>{t.toUpperCase()}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Database */}
        <div className="card">
          <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>💾 DATABASE</h4>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            <p>Storage: IndexedDB (Local)</p>
            <p>Status: Connected</p>
          </div>
        </div>

        {/* Backup */}
        <div className="card">
          <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>📦 BACKUP & RESTORE</h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" onClick={exportBackup}>{Icons.download} Export Backup</button>
            <button className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>{Icons.upload} Import Backup</button>
            <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) importBackup(e.target.files[0]); }} />
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="card">
          <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>⌨️ KEYBOARD SHORTCUTS</h4>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Ctrl + N</span><span>New Document</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Ctrl + S</span><span>Save to Queue</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Ctrl + P</span><span>Print</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Ctrl + F</span><span>Search</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>ESC</span><span>Close Modal</span></div>
          </div>
        </div>

        {/* About */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>ℹ️ ABOUT</h4>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>PRINTFLOW STUDIO</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Smart Print Queue & Document Builder</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Version 1.0.0</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Local Document & Print Management System</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== FOOTER =====
function AppFooter() {
  return (
    <footer className="app-footer no-print">
      <div className="footer-grid">
        <div className="footer-brand">
          <h3>PRINTFLOW STUDIO</h3>
          <p>Smart Print Queue & Document Builder</p>
        </div>
        <div className="footer-cta">
          <p>PENGEN BUAT WEBSITE UNTUK UMKM DLL?</p>
          <a href="https://wa.me/6285774122710?text=Halo%20Admin%20BrandRetailCortex%2C%20saya%20tertarik%20membuat%20website%20untuk%20UMKM.%20Saya%20ingin%20konsultasi%20terlebih%20dahulu." target="_blank" rel="noopener noreferrer" className="wa-btn">
            {Icons.whatsapp} WhatsApp Admin
          </a>
          <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>+62 857-7412-2710</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>CRAFTED WITH ❤️ BY <a href="https://brandretailcortex.store" target="_blank" rel="noopener noreferrer">BRANDRETAILCORTEX.STORE</a></p>
        <p style={{ marginTop: '4px' }}>© 2026 PRINTFLOW STUDIO • Version 1.0.0</p>
      </div>
    </footer>
  );
}
