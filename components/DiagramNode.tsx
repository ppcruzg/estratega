
import React from 'react';
import { ProjectStatus, StatusCategory, TailwindColor } from '../types';
import EditableText from './EditableText';
import { 
  Lightbulb, 
  DollarSign, 
  RefreshCw, 
  Box, 
  Settings, 
  Activity, 
  Globe, 
  Server,
  Database,
  Link,
  Trash2,
  Zap,
  CheckCircle,
  ArrowUp,
  Wrench,
  AlertCircle,
  Loader,
  TrendingUp,
  Shield
} from 'lucide-react';

interface DiagramNodeProps {
  label: string;
  type: 'root' | 'group' | 'leaf' | 'external';
  color: 'blue' | 'orange' | 'purple' | 'slate' | 'green';
  status?: ProjectStatus;
  availableStatuses?: StatusCategory[]; // New Prop for dynamic categories
  hasIcon?: 'dollar' | 'bulb' | 'refresh';
  description?: string; 
  isExternalLink?: boolean;
  onDelete?: () => void;
  onUpdateLabel?: (val: string) => void;
  onUpdateDescription?: (val: string) => void;
  onUpdateStatus?: (newStatusId: string) => void; // Callback to parent
}

const colorStyles: Record<TailwindColor, string> = {
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  rose: 'bg-rose-100 text-rose-800 border-rose-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  slate: 'bg-slate-100 text-slate-800 border-slate-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

const DiagramNode: React.FC<DiagramNodeProps> = ({
  label,
  color,
  status,
  availableStatuses = [],
  hasIcon,
  description,
  isExternalLink,
  onDelete,
  onUpdateLabel,
  onUpdateDescription,
  onUpdateStatus
}) => {
  
  // Function to generate icon based on status label/text
  const getStatusIcon = (statusLabel: string, sizeOverride?: number) => {
    const size = sizeOverride || 12;
    const normalizedLabel = statusLabel.toLowerCase().trim();
    
    // Map keywords to appropriate icons
    if (normalizedLabel.includes('productivo') || normalizedLabel.includes('prod') || normalizedLabel.includes('production')) {
      return <CheckCircle size={size} />;
    }
    if (normalizedLabel.includes('dev') || normalizedLabel.includes('development') || normalizedLabel.includes('desarrollo')) {
      return <Loader size={size} />;
    }
    if (normalizedLabel.includes('upgrade') || normalizedLabel.includes('actualización')) {
      return <ArrowUp size={size} />;
    }
    if (normalizedLabel.includes('maintenance') || normalizedLabel.includes('mantenimiento')) {
      return <Wrench size={size} />;
    }
    if (normalizedLabel.includes('warning') || normalizedLabel.includes('advertencia') || normalizedLabel.includes('alert')) {
      return <AlertCircle size={size} />;
    }
    if (normalizedLabel.includes('active') || normalizedLabel.includes('activo')) {
      return <Zap size={size} />;
    }
    if (normalizedLabel.includes('improvement') || normalizedLabel.includes('mejora')) {
      return <TrendingUp size={size} />;
    }
    if (normalizedLabel.includes('security') || normalizedLabel.includes('seguridad')) {
      return <Shield size={size} />;
    }
    
    // Default icon
    return <Activity size={size} />;
  };
  
  // Icon mapping based on node type/props
  const renderIcon = () => {
    if (isExternalLink) return <Link size={16} className="text-slate-400" />;
    
    // Specific icon requests
    if (hasIcon === 'dollar') return <DollarSign size={16} className="text-emerald-600" />;
    if (hasIcon === 'bulb') return <Lightbulb size={16} className="text-amber-500" />;
    if (hasIcon === 'refresh') return <RefreshCw size={16} className="text-blue-500" />;

    // General default icons based on color context
    switch (color) {
      case 'blue': return <Box size={16} className="text-blue-500" />;
      case 'orange': return <Activity size={16} className="text-orange-500" />;
      case 'purple': return <Server size={16} className="text-purple-500" />;
      case 'green': return <Globe size={16} className="text-green-600" />;
      default: return <Settings size={16} className="text-slate-400" />;
    }
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExternalLink || !onUpdateStatus || availableStatuses.length === 0) return;

    // Find current index
    const currentIndex = availableStatuses.findIndex(cat => cat.id === status);
    // Calculate next index
    const nextIndex = (currentIndex + 1) % availableStatuses.length;
    
    onUpdateStatus(availableStatuses[nextIndex].id);
  };

  const getStatusBadge = () => {
    if (isExternalLink || !status) return null;

    // Find the category object for the current status ID
    // If not found (e.g. data mismatch), try to fallback to a default styling or simple text
    const category = availableStatuses.find(cat => cat.id === status);

    // If we have a matching category definition
    if (category) {
       const styleClass = colorStyles[category.color] || colorStyles.slate;
       return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium border select-none whitespace-nowrap ${styleClass}`}>
          {getStatusIcon(category.label)}
          {category.label}
        </span>
       );
    }

    // Fallback if status exists but category definition is missing (e.g. legacy data)
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
        {getStatusIcon(status)}
        {status}
      </span>
    );
  };

  return (
    <div className="group flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 relative">
      {/* Status Icon - shown on the left if status exists */}
      {status && availableStatuses.length > 0 && (() => {
        const category = availableStatuses.find(cat => cat.id === status);
        if (category) {
          const iconColor = colorStyles[category.color]?.split(' ')[1] || 'text-slate-500';
          return (
            <div className={`mt-0.5 flex-shrink-0 ${iconColor}`}>
              {getStatusIcon(category.label, 20)}
            </div>
          );
        }
        return null;
      })()}
      
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {onUpdateLabel ? (
              <EditableText 
                value={label} 
                onSave={onUpdateLabel} 
                variant="dark"
                className="font-medium text-slate-700 text-sm"
              />
            ) : (
              <p className="text-sm font-medium text-slate-700 truncate">{label}</p>
            )}
          </div>
          
          {/* Status Toggle Area - Fixed size button */}
          <div 
            className="cursor-pointer flex-shrink-0 ml-2 hover:opacity-80 transition-opacity w-fit"
            onClick={handleStatusClick}
            title="Clic para cambiar estado"
          >
            {getStatusBadge()}
          </div>
        </div>

        {/* Editable Description */}
        <div className="mt-0.5">
          {onUpdateDescription ? (
             <EditableText 
                value={description || ''} 
                onSave={onUpdateDescription} 
                variant="dark"
                className="text-xs text-slate-500"
                placeholder="Añadir descripción..."
                multiline={true}
              />
          ) : (
            description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all cursor-pointer z-10"
          title="Eliminar tarjeta"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
};

export default DiagramNode;
