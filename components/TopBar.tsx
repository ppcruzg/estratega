import React, { useState } from 'react';
import { Plus, ChevronDown, Trash2 } from 'lucide-react';

interface Page {
  id: string;
  identifier: string;
  title: string;
}

interface TopBarProps {
  pages: Page[];
  currentPageId: string | null;
  onPageSelect: (pageId: string) => void;
  onCreatePage: () => void;
  onDeletePage: (pageId: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ 
  pages, 
  currentPageId, 
  onPageSelect, 
  onCreatePage, 
  onDeletePage 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Pages Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium text-slate-700"
          >
            <span>Páginas</span>
            <ChevronDown size={18} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
              <div className="max-h-96 overflow-y-auto">
                {pages.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-sm">
                    No hay páginas creadas aún
                  </div>
                ) : (
                  pages.map(page => (
                    <button
                      key={page.id}
                      onClick={() => {
                        onPageSelect(page.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors flex items-center justify-between group ${
                        currentPageId === page.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                      }`}
                    >
                      <div>
                        <p className="font-medium text-slate-900">{page.title}</p>
                        <p className="text-xs text-slate-500">{page.identifier}</p>
                      </div>
                      {currentPageId === page.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePage(page.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="border-t border-slate-200 p-3">
                <button
                  onClick={() => {
                    onCreatePage();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Plus size={18} />
                  Nueva Página
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Current Page Title */}
        {currentPageId && pages.find(p => p.id === currentPageId) && (
          <div className="ml-4 pl-4 border-l border-slate-200">
            <p className="text-sm text-slate-500">Página Actual:</p>
            <p className="font-bold text-slate-900">
              {pages.find(p => p.id === currentPageId)?.title}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
