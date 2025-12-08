import React, { useState } from 'react';
import { Menu, X, Plus, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';

interface Page {
  id: string;
  identifier: string;
  title: string;
}

interface SidebarProps {
  pages: Page[];
  currentPageId: string | null;
  onPageSelect: (pageId: string) => void;
  onCreatePage: () => void;
  onDeletePage: (pageId: string) => void;
  isCollapsed?: boolean;
  onCollapseChange?: (isCollapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  pages, 
  currentPageId, 
  onPageSelect, 
  onCreatePage, 
  onDeletePage,
  isCollapsed = false,
  onCollapseChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentPage = pages.find(p => p.id === currentPageId);

  const closeSidebar = () => setIsOpen(false);
  
  const handleCollapse = () => {
    onCollapseChange?.(!isCollapsed);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
        title="Abrir menú"
      >
        {isOpen ? (
          <X size={24} className="text-slate-700" />
        ) : (
          <Menu size={24} className="text-slate-700" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 shadow-lg z-50 transition-all duration-300 overflow-y-auto
          ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
          lg:relative lg:h-auto lg:shadow-none lg:border-r
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* Header */}
        <div className={`p-6 border-b border-slate-200 sticky top-0 bg-white ${isCollapsed ? 'lg:p-3' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            {!isCollapsed && (
              <h2 className="text-lg font-bold text-slate-900">Estratega</h2>
            )}
            <div className="flex items-center gap-1">
              <button
                onClick={handleCollapse}
                className={`hidden lg:flex p-1.5 hover:bg-slate-100 rounded transition-colors ${isCollapsed ? 'ml-auto' : ''}`}
                title={isCollapsed ? "Expandir" : "Contraer"}
              >
                <Menu size={18} className="text-slate-600" />
              </button>
              <button
                onClick={closeSidebar}
                className="lg:hidden p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          {!isCollapsed && currentPage && (
            <div className="text-xs">
              <p className="text-slate-500 mb-1">Actual:</p>
              <p className="font-semibold text-slate-900 truncate">{currentPage.title}</p>
              <p className="text-slate-400 text-xs truncate">{currentPage.identifier}</p>
            </div>
          )}
        </div>

        {/* Pages List */}
        <div className={`divide-y divide-slate-100 ${isCollapsed ? 'lg:p-1' : ''}`}>
          {pages.length === 0 ? (
            <div className={`text-center text-slate-500 text-sm ${isCollapsed ? 'lg:p-2' : 'p-6'}`}>
              {isCollapsed ? (
                <div className="text-xs text-slate-400">Sin págs</div>
              ) : (
                'No hay páginas creadas aún'
              )}
            </div>
          ) : (
            pages.map((page) => (
              <button
                key={page.id}
                onClick={() => {
                  onPageSelect(page.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left hover:bg-slate-50 transition-colors flex items-center justify-center lg:justify-between group
                  ${isCollapsed ? 'lg:p-2 lg:flex-col' : 'px-4 py-4'}
                  ${currentPageId === page.id ? 'bg-blue-50 border-l-4 lg:border-l-4 lg:border-l-blue-600' : 'border-l-4 border-l-transparent'}
                `}
                title={isCollapsed && currentPageId === page.id ? page.title : undefined}
              >
                {isCollapsed ? (
                  <>
                    <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center mb-1">
                      {currentPageId === page.id && (
                        <ChevronRight size={12} className="text-blue-600" />
                      )}
                    </div>
                    <div className="text-xs font-medium text-slate-600 text-center hidden lg:block truncate">
                      {page.identifier.substring(0, 3)}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{page.title}</p>
                      <p className="text-xs text-slate-500 truncate">{page.identifier}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {currentPageId === page.id && (
                        <ChevronRight size={16} className="text-blue-600 flex-shrink-0" />
                      )}
                      {currentPageId === page.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (pages.length > 1) {
                              onDeletePage(page.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded transition-all flex-shrink-0"
                          title="Eliminar página"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </button>
            ))
          )}
        </div>

        {/* Create Page Button */}
        <div className={`border-t border-slate-200 sticky bottom-0 bg-white ${isCollapsed ? 'lg:p-1' : 'p-4'}`}>
          <button
            onClick={() => {
              onCreatePage();
              setIsOpen(false);
            }}
            className={`flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium
              ${isCollapsed ? 'lg:p-2' : 'w-full px-4 py-3'}
            `}
            title={isCollapsed ? "Nueva Página" : undefined}
          >
            <Plus size={18} />
            {!isCollapsed && 'Nueva Página'}
          </button>
        </div>
      </aside>

      {/* Main content margin adjustment for desktop */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`} />
    </>
  );
};

export default Sidebar;
