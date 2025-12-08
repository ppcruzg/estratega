import React, { useState, useEffect } from 'react';
import DiagramNode from './components/DiagramNode';
import ConfirmationModal from './components/ConfirmationModal';
import StatusManagerModal from './components/StatusManagerModal';
import EditableText from './components/EditableText';
import Sidebar from './components/Sidebar';
import NewPageModal from './components/NewPageModal';
import ChangeHistory from './components/ChangeHistory';
import RecentChangesWidget from './components/RecentChangesWidget';
import AuthPanel from './components/AuthPanel';
import UserAdminPanel from './components/UserAdminPanel';
import { Calendar, Layers, ArrowRight, GripVertical, Plus, Trash2, Settings, Hash, Tag, Link as LinkIcon, Pencil, Check, X, Palette, LogOut, ShieldCheck } from 'lucide-react';
import { DashboardColumn, DashboardItem, StatusCategory, PageData, ChangeRecord, DocumentationLink, UserAccount } from './types';

// Default categories for new or existing columns
const DEFAULT_CATEGORIES: StatusCategory[] = [
  { id: 'productivo', label: 'Productivo', color: 'emerald' },
  { id: 'endev', label: 'En Dev', color: 'blue' },
  { id: 'upgrade', label: 'Upgrade', color: 'rose' },
  { id: 'detenido', label: 'Detenido', color: 'rose' },
  { id: 'terminado', label: 'Terminado', color: 'indigo' },
];

// Ensure every column carries the latest default statuses without overwriting custom ones
const ensureDefaultStatusCategories = (categories: StatusCategory[] = []): StatusCategory[] => {
  const existingIds = new Set(categories.map(c => c.id));
  const merged = [...categories];
  DEFAULT_CATEGORIES.forEach(cat => {
    if (!existingIds.has(cat.id)) {
      merged.push(cat);
    }
  });
  return merged;
};

// --- INITIAL DATA STATE ---
const INITIAL_COLUMNS: DashboardColumn[] = [
  {
    id: 'citas',
    title: 'CITAS',
    description: 'Gestión y Agendamiento',
    color: 'blue',
    statusCategories: [...DEFAULT_CATEGORIES],
    items: [
      { id: 'h1', label: 'Módulos Principales', type: 'section-header' },
      { id: 'c1', label: 'INTER', type: 'leaf', status: 'productivo', hasIcon: 'refresh', description: 'Sincronización de datos' },
      { id: 'c2', label: 'BAFAR EL PASO', type: 'leaf', status: 'productivo', description: 'Operación transfronteriza' },
      { id: 'c3', label: 'LOS ENCINOS', type: 'leaf', status: 'productivo', description: 'Gestión local' },
    ]
  },
  {
    id: 'axess',
    title: 'AXESS',
    description: 'Control de Accesos & Panel',
    color: 'purple',
    statusCategories: [...DEFAULT_CATEGORIES],
    items: [
      { id: 'h2', label: 'Plantas y Sitios', type: 'section-header' },
      { id: 'a1', label: 'MINA LOS GATOS', type: 'leaf', status: 'upgrade', hasIcon: 'bulb', description: 'Upgrade de infraestructura' },
      { id: 'a2', label: 'BAFAR PLANTA', type: 'leaf', status: 'productivo', hasIcon: 'dollar', description: 'Control de costos activo' },
      { id: 'a3', label: 'QUESERA', type: 'leaf', status: 'productivo' },
      { id: 'a4', label: 'NOGALERA', type: 'leaf', status: 'productivo' },
    ]
  },
  {
    id: 'poa',
    title: 'POA',
    description: 'Plan Operativo',
    color: 'orange',
    statusCategories: [...DEFAULT_CATEGORIES],
    items: [
      { id: 'h3', label: 'Proyectos Activos', type: 'section-header' },
      { id: 'p1', label: 'TERGIA', type: 'leaf', status: 'productivo', hasIcon: 'dollar', description: 'Gestión financiera' },
      { id: 'p2', label: 'LA NACIONAL', type: 'leaf', status: 'productivo', hasIcon: 'bulb', description: 'Nuevas implementaciones' },
    ]
  },
  {
    id: 'multitenant',
    title: 'MULTITENANT',
    description: 'Arquitectura Global',
    color: 'green',
    statusCategories: [...DEFAULT_CATEGORIES],
    items: [
      { id: 'h4', label: 'Core Services', type: 'section-header' },
      { id: 'm1', label: 'AXESS CORE', type: 'leaf', status: 'productivo', description: 'Servicios compartidos' },
      { id: 'm2', label: 'CITAS CORE', type: 'leaf', status: 'productivo', description: 'Motor de agenda' },
      { id: 'm3', label: 'POA CORE', type: 'leaf', status: 'productivo', description: 'Lógica de negocio' },
    ]
  },
  {
    id: 'compliance',
    title: 'COMPLIANCE',
    description: 'Gestión Regulatoria y de Cumplimiento',
    color: 'green',
    statusCategories: [...DEFAULT_CATEGORIES],
    items: []
  }
];

type MetricColor = 'emerald' | 'blue' | 'purple' | 'rose' | 'white' | 'amber';

interface FooterMetric {
  id: string;
  label: string;
  value: string;
  color: MetricColor;
}

const INITIAL_METRICS: FooterMetric[] = [
  { id: 'm1', label: 'UPTIME', value: '99.9%', color: 'emerald' },
  { id: 'm2', label: 'USUARIOS ACTIVOS', value: '1,240', color: 'blue' },
  { id: 'm3', label: 'TENANTS', value: '8', color: 'purple' },
  { id: 'm4', label: 'ESTADO', value: '• Operativo', color: 'emerald' },
];

const App: React.FC = () => {
  // --- AUTH STATE ---
  const [authMode, setAuthMode] = useState<'login' | 'reset'>('login');
  const [authEmail, setAuthEmail] = useState(() => localStorage.getItem('authUser') || '');
  const [sessionEmail, setSessionEmail] = useState(() => localStorage.getItem('authUser') || '');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('authUser'));
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading users', e);
      }
    }
    return [
      {
        id: 'admin',
        name: 'Administrador',
        email: 'admin@estratega.com',
        password: 'admin123',
        isAdmin: true,
        permissions: {}
      }
    ];
  });
  const [showAdminPanel, setShowAdminPanel] = useState(false);


  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value.trim());

  const handleLogin = () => {
    const trimmedEmail = authEmail.trim().toLowerCase();
    const trimmedPassword = authPassword.trim();
    setAuthError(null);
    setAuthMessage(null);

    if (!validateEmail(trimmedEmail)) {
      setAuthError('Ingresa un correo electronico valido.');
      return;
    }

    if (trimmedPassword.length < 6) {
      setAuthError('La contrasena debe tener al menos 6 caracteres.');
      return;
    }

    const foundUser = users.find(u => u.email === trimmedEmail && u.password === trimmedPassword);
    if (!foundUser) {
      setAuthError('Credenciales invalidas.');
      return;
    }

    localStorage.setItem('authUser', trimmedEmail);
    setSessionEmail(trimmedEmail);
    setAuthEmail(trimmedEmail);
    setIsAuthenticated(true);
    setAuthPassword('');
    setAuthMessage('Sesion iniciada correctamente.');
  };

  const handlePasswordRecovery = () => {
    const trimmedEmail = authEmail.trim().toLowerCase();
    setAuthError(null);
    setAuthMessage(null);

    if (!validateEmail(trimmedEmail)) {
      setAuthError('Ingresa un correo valido para recuperar tu contrasena.');
      return;
    }

    const foundUser = users.find(u => u.email === trimmedEmail);
    if (!foundUser) {
      setAuthError('No existe un usuario con ese correo.');
      return;
    }

    setAuthMessage(`Te enviamos un enlace de recuperacion a ${trimmedEmail}. Revisa tu bandeja de entrada o spam.`);
    setAuthMode('login');
  };

  const handleSwitchMode = (mode: 'login' | 'reset') => {
    setAuthMode(mode);
    setAuthError(null);
    setAuthMessage(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('authUser');
    setIsAuthenticated(false);
    setSessionEmail('');
    setAuthPassword('');
    setAuthMode('login');
    setAuthMessage(null);
    setAuthError(null);
  };
  
  const handleSaveUserAccount = (user: UserAccount) => {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...user } : u));
    if (sessionEmail === user.email) {
      localStorage.setItem('authUser', user.email);
      setSessionEmail(user.email);
    }
  };

  const handleAddUserAccount = (user: UserAccount) => {
    setUsers(prev => [...prev, user]);
  };

  const handleDeleteUserAccount = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUser?.id === userId) {
      handleLogout();
    }
  };

  // --- PAGES MANAGEMENT ---
  const TEMPLATE_PAGE_INDEX = 0; // La primera página es siempre la plantilla
  
  const [pages, setPages] = useState<PageData[]>(() => {
    const saved = localStorage.getItem('allPages');
    if (saved) {
      try {
        const parsedPages = JSON.parse(saved);
        // Asegurar que la primera página se llama "plantilla"
        if (parsedPages.length > 0 && parsedPages[0].pageConfig.identifier !== 'plantilla') {
          parsedPages[0].pageConfig.identifier = 'plantilla';
          parsedPages[0].pageConfig.title = 'PLANTILLA';
        }
        return parsedPages;
      } catch (e) {
        console.error('Error loading pages:', e);
      }
    }
    return [];
  });

  const [currentPageId, setCurrentPageId] = useState<string | null>(() => {
    const saved = localStorage.getItem('currentPageId');
    return saved || (pages.length > 0 ? pages[0].id : null);
  });

  const [showNewPageModal, setShowNewPageModal] = useState(false);

  const currentPage = currentPageId ? pages.find(p => p.id === currentPageId) : null;
  const currentUser = sessionEmail ? users.find(u => u.email === sessionEmail) || null : null;

  const canViewCurrent = currentUser?.isAdmin
    ? true
    : currentPageId
      ? currentUser?.permissions[currentPageId]?.canView || false
      : true;

  const canEditCurrent = currentUser?.isAdmin
    ? true
    : currentPageId
      ? currentUser?.permissions[currentPageId]?.canEdit || false
      : false;

  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      setSessionEmail(storedUser);
      setAuthEmail(storedUser);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && sessionEmail && !currentUser) {
      handleLogout();
    }
  }, [isAuthenticated, sessionEmail, currentUser]);

  const guardEdit = () => {
    return !!canEditCurrent;
  };
  
  // Set default page if none selected
  useEffect(() => {
    if (!currentPageId && pages.length > 0) {
      setCurrentPageId(pages[0].id);
    }
  }, [pages, currentPageId]);

  // --- PAGE CONFIG STATE (from current page) ---
  const [pageConfig, setPageConfig] = useState(() => {
    if (currentPage?.pageConfig) {
      return currentPage.pageConfig;
    }
    return {
      identifier: 'O2T-STRATEGY-2026',
      title: '2026 – Ruta de Trabajo',
      description: 'Estrategia de Desarrollo Equipo O2T — 2do Trimestre',
      footerTitle: 'SIDON-AXESS',
      footerDescription: 'Plataforma base transversal que orquesta la autenticación, seguridad y componentes comunes para todos los módulos (Citas, POA, Axess) y entornos Multitenant.',
      footerVersion: 'v2.4.0 Stable',
      footerButtonLabel: 'Ver Documentación',
      footerUrl: 'https://docs.google.com'
    };
  });

  const [footerMetrics, setFooterMetrics] = useState(() => {
    if (currentPage?.footerMetrics) {
      return currentPage.footerMetrics;
    }
    return INITIAL_METRICS;
  });

  const [documentationLinks, setDocumentationLinks] = useState<DocumentationLink[]>(() => {
    if (currentPage?.documentationLinks) {
      return currentPage.documentationLinks;
    }
    return [];
  });

  const [columns, setColumns] = useState<DashboardColumn[]>(() => {
    if (currentPage?.columns) {
      return currentPage.columns.map(col => ({
        ...col,
        statusCategories: ensureDefaultStatusCategories(col.statusCategories)
      }));
    }
    return INITIAL_COLUMNS.map(col => ({
      ...col,
      statusCategories: ensureDefaultStatusCategories(col.statusCategories)
    }));
  });
  
  // UI States
  const [isEditingButton, setIsEditingButton] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  const [activeColumnColorPicker, setActiveColumnColorPicker] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Get changeHistory from current page
  const pageChangeHistory = currentPage?.changeHistory || [];
  
  // Modal States
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [statusModalConfig, setStatusModalConfig] = useState<{
    isOpen: boolean;
    columnId: string | null;
  }>({
    isOpen: false,
    columnId: null
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));
  const closeStatusModal = () => setStatusModalConfig({ isOpen: false, columnId: null });

  // --- DRAG AND DROP STATE ---
  const [dragState, setDragState] = useState<{
    activeId: string | null;
    type: 'COLUMN' | 'ITEM' | null;
    sourceColId: string | null;
  }>({ activeId: null, type: null, sourceColId: null });

  const [dragOverId, setDragOverId] = useState<string | null>(null);
  
  const [dropIndicator, setDropIndicator] = useState<{
    id: string | null;
    position: 'before' | 'after' | 'inside' | null;
  }>({ id: null, position: null });

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => {
    localStorage.setItem('pageConfig', JSON.stringify(pageConfig));
  }, [pageConfig]);

  useEffect(() => {
    localStorage.setItem('dashboardColumns', JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('footerMetrics', JSON.stringify(footerMetrics));
  }, [footerMetrics]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  // Save all pages to localStorage
  useEffect(() => {
    localStorage.setItem('allPages', JSON.stringify(pages));
  }, [pages]);

  // Save current page ID
  useEffect(() => {
    if (currentPageId) {
      localStorage.setItem('currentPageId', currentPageId);
    }
  }, [currentPageId]);

  // Update current page data when config changes
  useEffect(() => {
    if (currentPageId && (pageConfig || footerMetrics || columns || documentationLinks)) {
      setPages(prev => {
        const newPages = prev.map(p =>
          p.id === currentPageId
            ? { ...p, pageConfig, columns, footerMetrics, documentationLinks }
            : p
        );

        // La plantilla y las páginas hijas son completamente independientes
        // No se propagan cambios en cascada
        return newPages;
      });
    }
  }, [pageConfig, footerMetrics, columns, documentationLinks, currentPageId]);

  // --- HANDLERS ---

  // Change Tracking Helper
  const addChangeRecord = (
    type: 'item' | 'status' | 'group' | 'column' | 'metric',
    action: 'created' | 'updated' | 'deleted',
    description: string,
    details: {
      itemName?: string;
      groupName?: string;
      groupDescription?: string;
      previousValue?: string;
      newValue?: string;
    } = {}
  ) => {
    if (!currentPageId) return;
    
    const newRecord: ChangeRecord = {
      id: `change-${Date.now()}`,
      timestamp: Date.now(),
      type,
      action,
      description,
      details
    };

    // Update the current page with the new change record
    setPages(prev => prev.map(p => {
      if (p.id !== currentPageId) return p;
      return {
        ...p,
        changeHistory: [newRecord, ...(p.changeHistory || [])]
      };
    }));
  };

  // Page Management Handlers
  const handleCreatePage = (identifier: string, title: string) => {
    if (!currentUser?.isAdmin) return;
    const newPageId = `page-${Date.now()}`;
    // Obtener la plantilla actual como base
    const templatePage = pages[TEMPLATE_PAGE_INDEX];
    const baseColumns = templatePage ? templatePage.columns : INITIAL_COLUMNS;
    const baseMetrics = templatePage ? templatePage.footerMetrics : INITIAL_METRICS;
    const baseDocumentation = templatePage ? templatePage.documentationLinks : [];

    const newPage: PageData = {
      id: newPageId,
      pageConfig: {
        identifier,
        title,
        description: 'Nueva página basada en la plantilla',
        footerTitle: 'Nuevo Sistema',
        footerDescription: 'Descripción del nuevo sistema',
        footerVersion: 'v1.0.0',
        footerButtonLabel: 'Ver Documentación',
        footerUrl: 'https://docs.google.com'
      },
      columns: JSON.parse(JSON.stringify(baseColumns)).map((col: DashboardColumn) => ({
        ...col,
        statusCategories: ensureDefaultStatusCategories(col.statusCategories)
      })), // Deep copy de la plantilla con estados actualizados
      footerMetrics: JSON.parse(JSON.stringify(baseMetrics)), // Deep copy de la plantilla
      documentationLinks: JSON.parse(JSON.stringify(baseDocumentation)), // Deep copy de la plantilla
      connections: [],
      changeHistory: [],
      createdAt: Date.now()
    };

    setPages(prev => [...prev, newPage]);
    setCurrentPageId(newPageId);
    // Cargar el pageConfig de la nueva página
    setPageConfig(newPage.pageConfig);
    setColumns(newPage.columns);
    setFooterMetrics(newPage.footerMetrics);
    setDocumentationLinks(newPage.documentationLinks);
  };

  const handleDeletePage = (pageId: string) => {
    if (!currentUser?.isAdmin) return;
    const newPages = pages.filter(p => p.id !== pageId);
    setPages(newPages);
    
    if (currentPageId === pageId) {
      const nextPage = newPages.length > 0 ? newPages[0] : null;
      setCurrentPageId(nextPage?.id || null);
    }
  };

  const handleSelectPage = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (page) {
      setCurrentPageId(pageId);
      setPageConfig(page.pageConfig);
      setColumns(page.columns.map(col => ({
        ...col,
        statusCategories: ensureDefaultStatusCategories(col.statusCategories)
      })));
      setFooterMetrics(page.footerMetrics);
      setDocumentationLinks(page.documentationLinks);
    }
  };

  const handleUpdatePageConfig = (field: keyof typeof pageConfig, value: string) => {
    if (!guardEdit()) return;
    setPageConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleDragStart = (e: React.DragEvent, id: string, type: 'COLUMN' | 'ITEM', sourceColId: string | null = null) => {
    const target = e.target as HTMLElement;
    if (type === 'ITEM') {
      e.stopPropagation(); // avoid triggering column drag
      if (!target.closest('.drag-handle')) {
        e.preventDefault();
        return;
      }
    }

    if (type === 'COLUMN' && !target.closest('.drag-handle')) {
      e.preventDefault();
      return;
    }

    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea')
    ) {
      e.preventDefault();
      return;
    }

    setDragState({ activeId: id, type, sourceColId });
    e.dataTransfer.effectAllowed = 'move';
    // Set a dummy payload to ensure drop events fire across browsers
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string, targetType: 'COLUMN' | 'ITEM') => {
    e.preventDefault(); 
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    if (!dragState.activeId || !dragState.type) return;

    if (dragState.type === 'COLUMN' && targetType === 'COLUMN') {
        if (dragOverId !== targetId) {
            setDragOverId(targetId);
            setDropIndicator({ id: null, position: null }); 
        }
        return;
    }

    if (dragState.type === 'ITEM') {
        if (targetType === 'COLUMN') {
            // Only allow highlighting the source column
            if (targetId === dragState.sourceColId && dragOverId !== targetId) {
                setDragOverId(targetId);
                setDropIndicator({ id: targetId, position: 'inside' });
            }
            return;
        }

        if (targetType === 'ITEM') {
             const targetColumn = columns.find(c => c.items.some(i => i.id === targetId));
             // Ignore items that are not in the source column
             if (!targetColumn || targetColumn.id !== dragState.sourceColId) return;

             const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
             const midY = rect.top + rect.height / 2;
             const position = e.clientY < midY ? 'before' : 'after';

             if (dropIndicator.id !== targetId || dropIndicator.position !== position) {
                 setDragOverId(targetId);
                 setDropIndicator({ id: targetId, position });
             }
        }
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDragState({ activeId: null, type: null, sourceColId: null });
    setDragOverId(null);
    setDropIndicator({ id: null, position: null });
  };

  const handleDrop = (e: React.DragEvent, targetId: string, targetType: 'COLUMN' | 'ITEM') => {
    e.preventDefault();
    e.stopPropagation();
    
    const { activeId, type, sourceColId } = dragState;
    if (!activeId || !type) return;

    if (type === 'COLUMN' && targetType === 'COLUMN') {
        if (activeId === targetId) return;
        
        const oldIndex = columns.findIndex(c => c.id === activeId);
        const newIndex = columns.findIndex(c => c.id === targetId);
        
        if (oldIndex !== -1 && newIndex !== -1) {
            const newCols = [...columns];
            const [moved] = newCols.splice(oldIndex, 1);
            newCols.splice(newIndex, 0, moved);
            setColumns(newCols);
        }
    }

    if (type === 'ITEM') {
        const sourceColIndex = columns.findIndex(c => c.id === sourceColId);
        if (sourceColIndex === -1) return;

        const sourceCol = columns[sourceColIndex];
        const itemIndex = sourceCol.items.findIndex(i => i.id === activeId);
        if (itemIndex === -1) return;
        
        const itemToMove = sourceCol.items[itemIndex];
        
        const newCols = columns.map(col => ({ ...col, items: [...col.items] }));
        newCols[sourceColIndex].items.splice(itemIndex, 1);

        let destColId = '';
        let insertIndex = -1;

        if (targetType === 'COLUMN') {
            destColId = targetId;
            const destCol = newCols.find(c => c.id === destColId);
            if(destCol) insertIndex = destCol.items.length;

        } else if (targetType === 'ITEM') {
            const destCol = newCols.find(c => c.items.some(i => i.id === targetId));
            if (destCol) {
                destColId = destCol.id;
                const targetIndex = destCol.items.findIndex(i => i.id === targetId);
                if (targetIndex !== -1) {
                    insertIndex = targetIndex + (dropIndicator.position === 'after' ? 1 : 0);
                }
            }
        }

        // Only allow moves within the same column
        if (destColId !== sourceColId) {
            handleDragEnd(e);
            return;
        }

        if (destColId && insertIndex !== -1) {
            const destCol = newCols.find(c => c.id === destColId);
            if (destCol) {
                destCol.items.splice(insertIndex, 0, itemToMove);
                setColumns(newCols);
            }
        }
    }

    handleDragEnd(e);
  };


  const handleUpdateTitle = (id: string, newTitle: string) => {
    if (!guardEdit()) return;
    setColumns(cols => cols.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };

  const handleUpdateDesc = (id: string, newDesc: string) => {
    if (!guardEdit()) return;
    setColumns(cols => cols.map(c => c.id === id ? { ...c, description: newDesc } : c));
  };

  const handleUpdateItem = (colId: string, itemId: string, field: 'label' | 'description' | 'date', value: string) => {
    if (!guardEdit()) return;

    const column = columns.find(c => c.id === colId);
    const item = column?.items.find(i => i.id === itemId);

    // Track change for date updates
    if (field === 'date' && item) {
      const previousDate = item.date ? new Date(item.date).toLocaleDateString('es-ES') : 'sin fecha';
      const newDate = value ? new Date(value).toLocaleDateString('es-ES') : 'sin fecha';

      addChangeRecord(
        'item',
        'updated',
        `Fecha actualizada en "${column?.title || 'grupo'}" para "${item.label}"`,
        {
          itemName: item.label,
          groupName: column?.title,
          groupDescription: column?.description,
          previousValue: previousDate,
          newValue: newDate
        }
      );
    }

    setColumns(prev => prev.map(col => {
      if (col.id !== colId) return col;
      return {
        ...col,
        items: col.items.map(item => {
          if (item.id !== itemId) return item;
          return { ...item, [field]: value };
        })
      };
    }));
  };

  const handleUpdateItemStatus = (colId: string, itemId: string, newStatusId: string) => {
    if (!guardEdit()) return;
    // Find previous value for change record
    const column = columns.find(c => c.id === colId);
    const item = column?.items.find(i => i.id === itemId);
    const previousStatus = item?.status;
    const previousStatusLabel = column?.statusCategories.find(s => s.id === previousStatus)?.label || previousStatus;
    const newStatusLabel = column?.statusCategories.find(s => s.id === newStatusId)?.label || newStatusId;
    
    setColumns(prev => prev.map(col => {
      if (col.id !== colId) return col;
      return {
        ...col,
        items: col.items.map(item => {
          if (item.id !== itemId) return item;
          return { ...item, status: newStatusId };
        })
      };
    }));

    // Track change
    addChangeRecord(
      'status',
      'updated',
      `Estado actualizado en "${column?.title || 'grupo'}" para "${item?.label || 'tarjeta'}"`,
      {
        itemName: item?.label,
        groupName: column?.title,
        groupDescription: column?.description,
        previousValue: previousStatusLabel,
        newValue: newStatusLabel
      }
    );
  };

  const handleUpdateColumnCategories = (colId: string, newCategories: StatusCategory[]) => {
    if (!guardEdit()) return;
    setColumns(prev => prev.map(col => 
      col.id === colId ? { ...col, statusCategories: newCategories } : col
    ));
  };

  const handleUpdateColumnColor = (colId: string, newColor: string) => {
    if (!guardEdit()) return;
    setColumns(prev => prev.map(col => 
      col.id === colId ? { ...col, color: newColor } : col
    ));
    setActiveColumnColorPicker(null);
  };

  const handleAddColumn = () => {
    if (!guardEdit()) return;
    const newColumn: DashboardColumn = {
      id: `col-${Date.now()}`,
      title: 'NUEVO GRUPO',
      description: 'Descripción del nuevo grupo',
      color: 'slate',
      statusCategories: [...DEFAULT_CATEGORIES],
      items: []
    };
    setColumns(prev => [...prev, newColumn]);

    // Track change
    addChangeRecord(
      'column',
      'created',
      'Nuevo grupo creado',
      {
        groupName: 'NUEVO GRUPO',
        groupDescription: 'Descripción del nuevo grupo'
      }
    );
  };

  const confirmDeleteColumn = (id: string) => {
    if (!guardEdit()) return;
    const col = columns.find(c => c.id === id);
    if (!col) return;
    const itemCount = col.items.length;
    setModalConfig({
      isOpen: true,
      title: '¿Eliminar Grupo Completo?',
      confirmLabel: 'Sí, eliminar grupo',
      message: (
        <>
          Estás a punto de eliminar el grupo <strong className="text-slate-900">{col.title}</strong>.
          {itemCount > 0 ? (
            <p className="mt-2 text-red-600 font-medium bg-red-50 p-2 rounded-md border border-red-100">
              ¡Cuidado! Esta acción eliminará permanentemente el grupo y sus {itemCount} tarjetas asociadas.
            </p>
          ) : (
            <p className="mt-2">El grupo está vacío, pero la acción no se puede deshacer.</p>
          )}
        </>
      ),
      onConfirm: () => {
        setColumns(prev => prev.filter(c => c.id !== id));
      }
    });
  };

  const confirmDeleteItem = (colId: string, itemId: string, itemLabel: string) => {
    if (!guardEdit()) return;
    const col = columns.find(c => c.id === colId);
    setModalConfig({
      isOpen: true,
      title: 'Eliminar Tarjeta',
      message: (
        <>
          ¿Estás seguro de que deseas eliminar la tarjeta <strong className="text-slate-900">{itemLabel}</strong>? 
          <br/>Esta acción no se puede deshacer.
        </>
      ),
      onConfirm: () => {
        setColumns(prev => prev.map(col => {
          if (col.id !== colId) return col;
          return {
            ...col,
            items: col.items.filter(i => i.id !== itemId)
          };
        }));

        // Track change
        addChangeRecord(
          'item',
          'deleted',
          `Tarjeta eliminada de "${col?.title || 'grupo'}"`,
          {
            itemName: itemLabel,
            groupName: col?.title,
            groupDescription: col?.description
          }
        );
      }
    });
  };

  const confirmDeleteSection = (colId: string, itemId: string, label: string) => {
    if (!guardEdit()) return;
    setModalConfig({
      isOpen: true,
      title: 'Eliminar Sección',
      message: `¿Estás seguro de que deseas eliminar el separador "${label}"?`,
      onConfirm: () => {
        setColumns(prev => prev.map(col => {
          if (col.id !== colId) return col;
          return {
            ...col,
            items: col.items.filter(i => i.id !== itemId)
          };
        }));
      }
    });
  };

  const handleAddItem = (colId: string) => {
    if (!guardEdit()) return;
    const col = columns.find(c => c.id === colId);
    const defaultStatus = col?.statusCategories[0]?.id || 'productivo';
    const newItem: DashboardItem = {
      id: `item-${Date.now()}`,
      label: 'Nuevo Item',
      type: 'leaf',
      status: defaultStatus
    };
    setColumns(prev => prev.map(c => {
      if (c.id !== colId) return c;
      return { ...c, items: [...c.items, newItem] };
    }));

    // Track change
    addChangeRecord(
      'item',
      'created',
      `Nueva tarjeta creada en "${col?.title || 'grupo'}"`,
      {
        itemName: 'Nuevo Item',
        groupName: col?.title,
        groupDescription: col?.description
      }
    );
  };

  // --- FOOTER METRICS HANDLERS ---
  const handleAddMetric = () => {
    if (!guardEdit()) return;
    const newMetric: FooterMetric = {
      id: `m-${Date.now()}`,
      label: 'NUEVA METRICA',
      value: 'Valor',
      color: 'white'
    };
    setFooterMetrics(prev => [...prev, newMetric]);
  };

  const handleUpdateMetric = (id: string, field: keyof FooterMetric, value: string) => {
    if (!guardEdit()) return;
    setFooterMetrics(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleUpdateMetricColor = (id: string, color: MetricColor) => {
    if (!guardEdit()) return;
    setFooterMetrics(prev => prev.map(m => m.id === id ? { ...m, color } : m));
    setActiveColorPicker(null);
  };

  const handleDeleteMetric = (id: string) => {
    if (!guardEdit()) return;
    setFooterMetrics(prev => prev.filter(m => m.id !== id));
  };

  // --- DOCUMENTATION LINKS HANDLERS ---
  const handleAddDocumentationLink = () => {
    if (!guardEdit()) return;
    const newLink: DocumentationLink = {
      id: `doc-${Date.now()}`,
      title: '',
      description: '',
      url: '',
      date: ''
    };
    setDocumentationLinks(prev => [...prev, newLink]);
  };

  const handleUpdateDocumentationLink = (id: string, field: keyof DocumentationLink, value: string) => {
    if (!guardEdit()) return;
    setDocumentationLinks(prev => prev.map(link => link.id === id ? { ...link, [field]: value } : link));
  };

  const handleDeleteDocumentationLink = (id: string) => {
    if (!guardEdit()) return;
    setDocumentationLinks(prev => prev.filter(link => link.id !== id));
  };

  const openDocumentationLink = (url: string) => {
    const trimmed = (url || '').trim();
    if (!trimmed) return;
    const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const getHeaderColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-600';
      case 'purple': return 'bg-purple-600';
      case 'orange': return 'bg-orange-500';
      case 'green': return 'bg-emerald-600';
      case 'slate': return 'bg-slate-600';
      default: return 'bg-slate-600';
    }
  };

  const getSubHeaderColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-100';
      case 'purple': return 'text-purple-100';
      case 'orange': return 'text-orange-100';
      case 'green': return 'text-emerald-100';
      case 'slate': return 'text-slate-200';
      default: return 'text-slate-200';
    }
  };

  const getMetricColorClass = (color: MetricColor) => {
    switch (color) {
      case 'emerald': return 'text-emerald-400';
      case 'blue': return 'text-blue-400';
      case 'purple': return 'text-purple-400';
      case 'rose': return 'text-rose-400';
      case 'amber': return 'text-amber-400';
      default: return 'text-white';
    }
  };

  const activeStatusColumn = columns.find(c => c.id === statusModalConfig.columnId);

  if (!isAuthenticated) {
    return (
      <AuthPanel
        mode={authMode}
        email={authEmail}
        password={authPassword}
        error={authError}
        message={authMessage}
        onEmailChange={setAuthEmail}
        onPasswordChange={setAuthPassword}
        onLogin={handleLogin}
        onReset={handlePasswordRecovery}
        onSwitchMode={handleSwitchMode}
      />
    );
  }

  
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        pages={pages.map(p => ({
          id: p.id,
          identifier: p.pageConfig.identifier,
          title: p.pageConfig.title
        }))}
        currentPageId={currentPageId}
        onPageSelect={handleSelectPage}
        onCreatePage={() => setShowNewPageModal(true)}
        onDeletePage={handleDeletePage}
        isCollapsed={sidebarCollapsed}
        onCollapseChange={setSidebarCollapsed}
      />

      <div className="flex-1 flex flex-col">
        {(!currentPageId || canViewCurrent) ? (
          <div className="flex-1 overflow-y-auto p-2 md:p-4 lg:p-4 font-sans text-slate-800">
            <div className="max-w-[1600px] mx-0 space-y-6">

              {/* --- HEADER --- */}
              <header className="flex items-center justify-between gap-4 flex-wrap bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-start gap-5 w-full md:w-auto">
                  <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg text-white shrink-0 mt-1">
                    <Calendar size={28} />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-mono font-medium text-slate-600 group hover:bg-slate-200/50 transition-colors">
                        <Tag size={12} className="text-slate-400" />
                        <div className="min-w-[50px]">
                          <EditableText 
                            value={pageConfig.identifier} 
                            onSave={(val) => handleUpdatePageConfig('identifier', val)}
                            variant="dark"
                            placeholder="ID-PROYECTO"
                            className="bg-transparent border-none p-0 w-auto inline-block focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                      <EditableText 
                        value={pageConfig.title} 
                        onSave={(val) => handleUpdatePageConfig('title', val)}
                        variant="dark"
                        placeholder="Titulo de la pagina"
                        className="font-bold text-slate-900"
                      />
                    </div>

                    <div className="text-slate-500 font-medium">
                      <EditableText 
                        value={pageConfig.description} 
                        onSave={(val) => handleUpdatePageConfig('description', val)}
                        variant="dark"
                        placeholder="Descripcion o subtitulo"
                        className="text-slate-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-1">
                  <div className="hidden md:flex flex-col items-end text-right pr-3 border-r border-slate-200 mr-2">
                    <span className="text-[11px] uppercase tracking-[0.08em] text-slate-500 font-semibold">Sesion</span>
                    <span className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">
                      {sessionEmail || 'usuario@estratega.com'}
                    </span>
                  </div>
                  {currentUser?.isAdmin && (
                    <button
                      onClick={() => setShowAdminPanel(true)}
                      className="flex items-center gap-2 px-3 py-2 border border-slate-200 text-slate-700 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm font-medium"
                    >
                      <ShieldCheck size={16} />
                      Administrar usuarios
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 border border-slate-200 text-slate-700 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm font-medium"
                  >
                    <LogOut size={16} />
                    Cerrar sesion
                  </button>
                  <button 
                    onClick={handleAddColumn}
                    disabled={!canEditCurrent}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm font-medium ${
                      canEditCurrent ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Plus size={18} />
                    Nuevo Grupo
                  </button>
                </div>
              </header>

              {/* --- MAIN GRID --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {columns.map((col) => {
                  const isColumnDragging = dragState.activeId === col.id && dragState.type === 'COLUMN';
                  const isColumnOver = dragOverId === col.id && dragState.type === 'COLUMN';
                  const isItemDroppingInside = dragOverId === col.id && dragState.type === 'ITEM' && dropIndicator.position === 'inside';

                  return (
                    <div 
                      key={col.id}
                      className={`flex flex-col bg-white rounded-2xl shadow-sm border overflow-hidden h-full transition-all duration-200 group/card
                        ${isColumnOver ? 'border-dashed border-2 border-blue-400 bg-blue-50 scale-[1.02]' : 'border-slate-200'}
                        ${isItemDroppingInside ? 'ring-2 ring-blue-300 bg-blue-50/50' : ''}
                        ${isColumnDragging ? 'opacity-40' : 'opacity-100'}
                      `}
                      draggable
                      onDragStart={(e) => handleDragStart(e, col.id, 'COLUMN')}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, col.id, 'COLUMN')}
                      onDrop={(e) => handleDrop(e, col.id, 'COLUMN')}
                    >
                      <div className={`${getHeaderColor(col.color)} p-5 text-white relative group/header`}>
                        <div className="absolute top-3 right-3 flex items-center gap-1 z-20">
                          <div 
                            className="drag-handle opacity-30 group-hover/header:opacity-100 transition-opacity p-1.5 cursor-grab hover:text-white" 
                            title="Arrastrar para reordenar"
                            draggable
                            onDragStart={(e) => handleDragStart(e, col.id, 'COLUMN')}
                            onDragEnd={handleDragEnd}
                          >
                            <GripVertical size={20} />
                          </div>
                          <button 
                            type="button"
                            onMouseDown={(e) => e.stopPropagation()} 
                            onClick={(e) => {
                              e.stopPropagation(); 
                              setActiveColumnColorPicker(activeColumnColorPicker === col.id ? null : col.id);
                            }}
                            className="opacity-40 hover:opacity-100 transition-opacity p-1.5 hover:bg-white/20 rounded-md text-white cursor-pointer"
                            title="Cambiar color del grupo"
                          >
                            <Palette size={16} />
                          </button>
                          <button 
                            type="button"
                            onMouseDown={(e) => e.stopPropagation()} 
                            onClick={(e) => {
                              e.stopPropagation(); 
                              setStatusModalConfig({ isOpen: true, columnId: col.id });
                            }}
                            className="opacity-40 hover:opacity-100 transition-opacity p-1.5 hover:bg-white/20 rounded-md text-white cursor-pointer"
                          >
                            <Settings size={16} />
                          </button>
                          <button 
                            type="button"
                            onMouseDown={(e) => e.stopPropagation()} 
                            onClick={(e) => {
                              e.stopPropagation(); 
                              confirmDeleteColumn(col.id);
                            }}
                            className="opacity-40 hover:opacity-100 transition-opacity p-1.5 hover:bg-red-500 hover:text-white rounded-md text-white cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="pr-16">
                          <div className="text-xl font-bold">
                            <EditableText 
                              value={col.title} 
                              onSave={(val) => handleUpdateTitle(col.id, val)} 
                              variant="light"
                              placeholder="Titulo del grupo"
                            />
                          </div>
                          <div className={`${getSubHeaderColor(col.color)} text-sm opacity-90 mt-1`}>
                            <EditableText 
                              value={col.description} 
                              onSave={(val) => handleUpdateDesc(col.id, val)} 
                              multiline={true}
                              variant="light"
                              placeholder="Descripcion del grupo"
                            />
                          </div>
                        </div>
                      </div>

                      {activeColumnColorPicker === col.id && (
                        <div className="bg-white border-t border-slate-200 p-3 flex items-center gap-2 flex-wrap">
                          {['blue', 'purple', 'orange', 'green', 'slate'].map(colorName => (
                            <button
                              key={colorName}
                              onClick={(e) => { e.stopPropagation(); handleUpdateColumnColor(col.id, colorName); }}
                              className={`w-8 h-8 rounded-lg transition-all border-2 ${
                                col.color === colorName ? 'border-slate-800 scale-110' : 'border-slate-300 hover:scale-105'
                              }`}
                              style={{
                                backgroundColor: {
                                  'blue': '#2563eb',
                                  'purple': '#a855f7',
                                  'orange': '#f97316',
                                  'green': '#059669',
                                  'slate': '#475569'
                                }[colorName] || '#64748b'
                              }}
                              title={colorName.charAt(0).toUpperCase() + colorName.slice(1)}
                            />
                          ))}
                        </div>
                      )}

                      <div 
                        className="p-2 space-y-1 flex-1 flex flex-col cursor-default" 
                        onDragOver={(e) => handleDragOver(e, col.id, 'COLUMN')} 
                        onDrop={(e) => handleDrop(e, col.id, 'COLUMN')} 
                      > 
                        {col.items.length === 0 && (
                          <div className={`text-center py-8 text-slate-400 text-sm italic border-2 border-dashed rounded-lg pointer-events-none transition-colors
                            ${isItemDroppingInside ? 'border-blue-400 bg-blue-100/50 text-blue-500' : 'border-slate-100'}
                          `}>
                            Sin elementos
                          </div>
                        )}

                        {col.items.map((item) => {
                          const isItemDragging = dragState.activeId === item.id && dragState.type === 'ITEM';
                          const isOverThisItem = dragOverId === item.id && dragState.type === 'ITEM';
                          const showLineBefore = isOverThisItem && dropIndicator.position === 'before';
                          const showLineAfter = isOverThisItem && dropIndicator.position === 'after';

                          return (
                            <React.Fragment key={item.id}>
                              {showLineBefore && <div className="h-1.5 w-full bg-blue-500 rounded-full my-1 shadow-sm transition-all animate-pulse" />}
                              <div className={`relative rounded-lg transition-all duration-200 ${isItemDragging ? 'opacity-30' : 'opacity-100'} group/item-drop`}>
                                <div
                                  onDragOver={(e) => handleDragOver(e, item.id, 'ITEM')}
                                  onDrop={(e) => handleDrop(e, item.id, 'ITEM')}
                                  className={`${isItemDragging ? 'pointer-events-none' : ''}`}
                                >
                                  {item.type === 'section-header' ? (
                                    <div className="pb-1 border-b border-slate-100 mb-1 pt-1 first:pt-0 flex justify-between items-start bg-slate-50 hover:bg-slate-50/80 px-0.5 rounded transition-colors">
                                      <div
                                        className="drag-handle opacity-30 hover:opacity-100 group-hover/item-drop:opacity-70 transition-opacity p-1 cursor-grab active:cursor-grabbing hover:text-slate-700 text-slate-400 pr-2"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, item.id, 'ITEM', col.id)}
                                        onDragEnd={handleDragEnd}
                                      >
                                        <GripVertical size={16} />
                                      </div>
                                      <div className="flex-1">
                                        <EditableText
                                          value={item.label}
                                          onSave={(val) => handleUpdateItem(col.id, item.id, 'label', val)}
                                          variant="dark"
                                          className="text-xs font-semibold uppercase text-slate-400 tracking-wider"
                                          placeholder="SECCION"
                                        />
                                      </div>
                                      <button
                                        onClick={() => confirmDeleteSection(col.id, item.id, item.label)}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        className="opacity-0 group-hover/item-drop:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-opacity cursor-pointer mt-[-2px]"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-start gap-1 hover:bg-slate-50/50 rounded-lg p-0.5 -m-0.5 transition-colors">
                                      <div
                                        className="drag-handle opacity-30 hover:opacity-100 group-hover/item-drop:opacity-70 transition-opacity p-1 pt-3 cursor-grab active:cursor-grabbing hover:text-slate-700 text-slate-400 flex-shrink-0 rounded"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, item.id, 'ITEM', col.id)}
                                        onDragEnd={handleDragEnd}
                                      >
                                        <GripVertical size={16} />
                                      </div>
                                      <div className="flex-1">
                                        <DiagramNode
                                          label={item.label}
                                          type={item.type === 'external' ? 'external' : 'leaf'}
                                          color={col.color === 'green' && item.type === 'external' ? 'slate' : col.color as any}
                                          status={item.status}
                                          availableStatuses={col.statusCategories}
                                          hasIcon={item.hasIcon}
                                          description={item.description}
                                          isExternalLink={item.isExternalLink}
                                          date={item.date}
                                          onDelete={() => confirmDeleteItem(col.id, item.id, item.label)}
                                          onUpdateLabel={(val) => handleUpdateItem(col.id, item.id, 'label', val)}
                                          onUpdateDescription={(val) => handleUpdateItem(col.id, item.id, 'description', val)}
                                          onUpdateDate={(val) => handleUpdateItem(col.id, item.id, 'date', val)}
                                          onUpdateStatus={(newStatusId) => handleUpdateItemStatus(col.id, item.id, newStatusId)}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {showLineAfter && <div className="h-1.5 w-full bg-blue-500 rounded-full my-1 shadow-sm transition-all animate-pulse" />}
                            </React.Fragment>
                          );
                        })}

                        <button 
                          onClick={() => handleAddItem(col.id)}
                          className="w-full py-2 border border-dashed border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all mt-4"
                        >
                          <Plus size={14} /> Anadir Tarjeta
                        </button>
                        {col.footerText && (
                          <div className="mt-auto pt-4 border-t border-slate-100">
                            <div className={`flex items-center gap-2 text-xs font-medium text-${col.color}-600`}>
                              <span className={`w-1.5 h-1.5 bg-${col.color}-600 rounded-full animate-pulse`}></span>
                              {col.footerText}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* --- BOTTOM SECTION (MAJOR CARD / FOOTER) --- */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 shadow-xl text-white relative overflow-hidden group/footer">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-5 rounded-full pointer-events-none"></div>

                <div className="mt-8 pt-8 border-t border-slate-700/50 relative">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-200">
                    <LinkIcon size={20} className="text-blue-400" />
                    Documentacion
                  </h3>
                  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${documentationLinks.length > 0 ? '' : 'grid-cols-1'}`}>
                    {documentationLinks.length > 0 ? (
                      documentationLinks.map(link => (
                        <div key={link.id} className="group/doc-link flex items-start gap-2 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:bg-slate-700/40 transition-colors min-h-[80px]">
                          <LinkIcon size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <EditableText
                              value={link.title}
                              onSave={(val) => handleUpdateDocumentationLink(link.id, 'title', val)}
                              variant="light"
                              placeholder="Titulo"
                              className="text-sm font-medium leading-tight"
                            />
                            <EditableText
                              value={link.description}
                              onSave={(val) => handleUpdateDocumentationLink(link.id, 'description', val)}
                              variant="light"
                              placeholder="Descripcion"
                              multiline={true}
                              className="text-xs text-slate-300 mt-1 leading-tight"
                            />
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                type="button"
                                onClick={() => openDocumentationLink(link.url)}
                                className="opacity-0 group-hover/doc-link:opacity-100 text-blue-300 hover:text-blue-100 transition-opacity p-1 rounded hover:bg-white/5"
                                title="Abrir enlace"
                              >
                                <ArrowRight size={14} />
                              </button>
                              <EditableText
                                value={link.url}
                                onSave={(val) => handleUpdateDocumentationLink(link.id, 'url', val)}
                                variant="light"
                                placeholder="https://..."
                                className="text-xs text-blue-400 hover:underline block truncate flex-1 break-all"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteDocumentationLink(link.id)}
                            className="opacity-0 group-hover/doc-link:opacity-100 text-red-400 hover:text-red-300 p-0.5 transition-opacity flex-shrink-0"
                            title="Eliminar enlace"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-500 py-12 col-span-full">
                        <LinkIcon size={40} className="mx-auto mb-3 opacity-50" />
                        <p className="mb-4 text-sm">No hay enlaces de documentacion</p>
                      </div>
                    )}
                    <button
                      onClick={handleAddDocumentationLink}
                      className="flex flex-col items-center justify-center gap-1 p-3 border border-dashed border-slate-600 text-slate-400 hover:text-slate-300 hover:border-slate-500 rounded-lg transition-all min-h-[80px]"
                    >
                      <Plus size={16} />
                      <span className="text-xs font-medium">Agregar enlace</span>
                    </button>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-700/50 relative">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {footerMetrics.map(metric => (
                      <div key={metric.id} className="group/metric relative hover:bg-white/5 p-2 -m-2 rounded-lg transition-colors">
                        <div className="text-slate-400 text-xs uppercase font-semibold mb-1">
                          <EditableText
                            value={metric.label}
                            onSave={(val) => handleUpdateMetric(metric.id, 'label', val)}
                            variant="light"
                            className="text-slate-400"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <div className={`text-lg font-mono ${getMetricColorClass(metric.color)}`}>
                            <EditableText
                              value={metric.value}
                              onSave={(val) => handleUpdateMetric(metric.id, 'value', val)}
                              variant="light"
                              className={getMetricColorClass(metric.color)}
                            />
                          </div>

                          <button
                            onClick={() => setActiveColorPicker(activeColorPicker === metric.id ? null : metric.id)}
                            className="opacity-0 group-hover/metric:opacity-100 p-1 hover:bg-white/10 rounded transition-opacity"
                            title="Cambiar color"
                          >
                            <Palette size={12} className="text-slate-500" />
                          </button>
                        </div>

                        {activeColorPicker === metric.id && (
                          <div className="absolute left-0 top-full mt-1 p-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 flex gap-1">
                            {(['emerald', 'blue', 'purple', 'rose', 'white', 'amber'] as MetricColor[]).map(color => (
                              <button
                                key={color}
                                onClick={() => handleUpdateMetricColor(metric.id, color)}
                                className={`w-4 h-4 rounded-full border border-slate-600 ${
                                  color === 'emerald' ? 'bg-emerald-500' :
                                  color === 'blue' ? 'bg-blue-500' :
                                  color === 'purple' ? 'bg-purple-500' :
                                  color === 'rose' ? 'bg-rose-500' :
                                  color === 'amber' ? 'bg-amber-500' : 'bg-white'
                                }`}
                              />
                            ))}
                          </div>
                        )}

                        <button
                          onClick={() => handleDeleteMetric(metric.id)}
                          className="absolute -top-1 -right-1 opacity-0 group-hover/metric:opacity-100 text-red-400 hover:text-red-200 bg-slate-800 rounded-full p-0.5 shadow-sm"
                          title="Eliminar metrica"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={handleAddMetric}
                      className="flex flex-col items-center justify-center p-2 rounded-lg border border-dashed border-slate-700 text-slate-500 hover:text-blue-400 hover:border-blue-400/50 hover:bg-blue-400/5 transition-all h-full min-h-[60px]"
                    >
                      <Plus size={20} />
                      <span className="text-[10px] font-medium mt-1">ANADIR DATO</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-700">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg text-center max-w-lg space-y-4">
              <div className="text-2xl font-bold">Sin acceso a esta pagina</div>
              <p className="text-sm text-slate-600">
                Tu usuario no tiene permisos de visualizacion sobre esta pagina. Selecciona otra desde el menu lateral o solicita acceso a un administrador.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Cerrar sesion
                </button>
                {currentUser?.isAdmin && (
                  <button
                    onClick={() => setShowAdminPanel(true)}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Administrar accesos
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <UserAdminPanel
          isOpen={showAdminPanel}
          pages={pages}
          users={users}
          currentUserEmail={sessionEmail}
          onClose={() => setShowAdminPanel(false)}
          onSaveUser={handleSaveUserAccount}
          onAddUser={handleAddUserAccount}
          onDeleteUser={handleDeleteUserAccount}
        />

        <NewPageModal
          isOpen={showNewPageModal}
          onClose={() => setShowNewPageModal(false)}
          onCreate={handleCreatePage}
          existingIdentifiers={pages.map(p => p.pageConfig.identifier)}
        />

        <ConfirmationModal
          isOpen={modalConfig.isOpen}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmLabel={modalConfig.confirmLabel}
          onConfirm={modalConfig.onConfirm}
          onCancel={closeModal}
        />

        <StatusManagerModal
          isOpen={statusModalConfig.isOpen}
          columnTitle={activeStatusColumn?.title || ''}
          categories={activeStatusColumn?.statusCategories || []}
          onSave={(newCats) => statusModalConfig.columnId && handleUpdateColumnCategories(statusModalConfig.columnId, newCats)}
          onClose={closeStatusModal}
        />
        
        <RecentChangesWidget changes={pageChangeHistory} />
      </div>
    </div>
  );
};

export default App;
