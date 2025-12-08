export type ProjectStatus = string; // Changed from union to string to support dynamic categories

export type TailwindColor = 'emerald' | 'blue' | 'rose' | 'amber' | 'purple' | 'slate' | 'indigo' | 'cyan';

export interface StatusCategory {
  id: string;
  label: string;
  color: TailwindColor;
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeData {
  id: string;
  label: string;
  type: 'root' | 'group' | 'leaf' | 'external';
  color: 'blue' | 'orange' | 'purple' | 'slate' | 'green';
  status?: ProjectStatus;
  hasIcon?: 'dollar' | 'bulb' | 'refresh';
}

export interface DocumentationLink {
  id: string;
  title: string;
  description: string;
  url: string;
  date?: string; // ISO date string
}

// New types for the dynamic dashboard
export interface DashboardItem {
  id: string;
  label: string;
  type: 'leaf' | 'external' | 'section-header'; // section-header used for dividers like "Módulos Principales"
  status?: ProjectStatus;
  hasIcon?: 'dollar' | 'bulb' | 'refresh';
  description?: string;
  isExternalLink?: boolean;
  date?: string; // ISO date string
}

export interface DashboardColumn {
  id: string;
  title: string;
  description: string;
  color: 'blue' | 'orange' | 'purple' | 'green' | 'slate';
  items: DashboardItem[];
  statusCategories: StatusCategory[]; // New field for per-column status configuration
  footerText?: string; // For the specific Axess footer
}

// Connection types for linking items across columns
export interface Connection {
  id: string;
  fromItemId: string;
  fromColumnId: string;
  toItemId: string;
  toColumnId: string;
  type: 'dependency' | 'integration' | 'shared-resource';
}

// Page Configuration Types
export interface PageConfig {
  identifier: string;
  title: string;
  description: string;
  footerTitle: string;
  footerDescription: string;
  footerVersion: string;
  footerButtonLabel: string;
  footerUrl: string;
}

export interface PageData {
  id: string;
  pageConfig: PageConfig;
  columns: DashboardColumn[];
  documentationLinks: DocumentationLink[];
  footerMetrics: Array<{
    id: string;
    label: string;
    value: string;
    color: 'emerald' | 'blue' | 'purple' | 'rose' | 'white' | 'amber';
  }>;
  connections: Connection[]; // Added connections array
  changeHistory: ChangeRecord[];
  createdAt: number;
}


export interface ChangeRecord {
  id: string;
  timestamp: number;
  type: 'item' | 'status' | 'group' | 'column' | 'metric';
  action: 'created' | 'updated' | 'deleted';
  description: string;
  details: {
    itemName?: string;
    groupName?: string;
    groupDescription?: string;
    previousValue?: string;
    newValue?: string;
  };
}

export interface PagePermission {
  canView: boolean;
  canEdit: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  isAdmin?: boolean;
  permissions: Record<string, PagePermission>;
}
