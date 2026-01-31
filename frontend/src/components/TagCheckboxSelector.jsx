import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

export default function TagCheckboxSelector({ 
  availableTags = [], 
  selectedTags = [], 
  onToggle, 
  darkMode,
  maxSelections = 10,
  excludeTags = [],
  buttonText = "选择标签",
  placeholder = "搜索标签..."
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.current)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Filter available tags
  const filteredTags = availableTags.filter(tag => {
    // Skip if in exclude list
    if (excludeTags.includes(tag.name)) return false;
    // Filter by search term
    if (searchTerm && !tag.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-all w-full text-left ${
          darkMode 
            ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-600' 
            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
        }`}
      >
        <span className="truncate text-sm font-medium">
          {selectedTags.length > 0 ? `已选 ${selectedTags.length} 个标签` : buttonText}
        </span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className={`absolute z-50 mt-1 w-full min-w-[240px] rounded-xl shadow-xl border overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          {/* Search Input */}
          <div className={`p-2 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
            <div className="relative">
              <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                className={`w-full pl-9 pr-3 py-1.5 text-sm rounded-lg outline-none transition-colors ${
                  darkMode 
                    ? 'bg-slate-900/50 text-slate-200 placeholder-slate-500 focus:bg-slate-900' 
                    : 'bg-slate-50 text-slate-700 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-blue-100'
                }`}
                autoFocus
              />
            </div>
          </div>
          
          {/* Tag List */}
          <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
            {filteredTags.length > 0 ? (
              <div className="p-1">
                {filteredTags.map(tag => {
                  const isSelected = selectedTags.includes(tag.name);
                  const isDisabled = !isSelected && selectedTags.length >= maxSelections;
                  
                  return (
                    <label 
                      key={tag.name} 
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm transition-colors ${
                        isDisabled ? 'opacity-50 cursor-not-allowed' : 
                        darkMode 
                          ? 'hover:bg-slate-700' 
                          : 'hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isSelected 
                            ? 'bg-blue-500 border-blue-500 text-white' 
                            : (darkMode ? 'border-slate-600 bg-slate-700' : 'border-slate-300 bg-white')
                        }`}>
                          {isSelected && <Check size={10} strokeWidth={4} />}
                        </div>
                        <span className={`truncate ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          {tag.name}
                        </span>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {tag.count}
                      </span>
                      
                      {/* Hidden actual checkbox */}
                      <input 
                        type="checkbox"
                        className="hidden"
                        checked={isSelected}
                        onChange={() => !isDisabled && onToggle(tag.name)}
                        disabled={isDisabled}
                      />
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  没有找到标签
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
