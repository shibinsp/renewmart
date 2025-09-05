import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  const navigate = useNavigate();

  // Mock search data
  const searchData = [
    { id: 1, title: 'Solar Farm Project Alpha', type: 'project', path: '/project-management', category: 'Projects', description: '50MW solar installation in California' },
    { id: 2, title: 'Wind Energy PPA Agreement', type: 'document', path: '/document-management', category: 'Documents', description: 'Power purchase agreement for wind farm' },
    { id: 3, title: 'Texas Wind Farm Listing', type: 'marketplace', path: '/marketplace', category: 'Marketplace', description: '100MW wind farm available for PPA' },
    { id: 4, title: 'Environmental Impact Assessment', type: 'document', path: '/document-management', category: 'Documents', description: 'EIA report for solar project' },
    { id: 5, title: 'Project Beta Dashboard', type: 'project', path: '/project-management', category: 'Projects', description: 'Hydroelectric project in Oregon' },
    { id: 6, title: 'Renewable Energy Analytics', type: 'dashboard', path: '/dashboard', category: 'Dashboard', description: 'Performance metrics and insights' },
    { id: 7, title: 'California Solar Marketplace', type: 'marketplace', path: '/marketplace', category: 'Marketplace', description: 'Browse solar projects in California' },
    { id: 8, title: 'Contract Templates', type: 'document', path: '/document-management', category: 'Documents', description: 'Standard PPA contract templates' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef?.current && !searchRef?.current?.contains(event?.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query?.trim()) {
      setIsLoading(true);
      // Simulate API call delay
      const timer = setTimeout(() => {
        const filtered = searchData?.filter(item =>
          item?.title?.toLowerCase()?.includes(query?.toLowerCase()) ||
          item?.description?.toLowerCase()?.includes(query?.toLowerCase()) ||
          item?.category?.toLowerCase()?.includes(query?.toLowerCase())
        );
        setResults(filtered);
        setIsLoading(false);
        setSelectedIndex(-1);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsLoading(false);
      setSelectedIndex(-1);
    }
  }, [query]);

  const getResultIcon = (type) => {
    switch (type) {
      case 'project': return 'FolderOpen';
      case 'document': return 'FileText';
      case 'marketplace': return 'Store';
      case 'dashboard': return 'LayoutDashboard';
      default: return 'Search';
    }
  };

  const handleInputChange = (e) => {
    setQuery(e?.target?.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || results?.length === 0) return;

    switch (e?.key) {
      case 'ArrowDown':
        e?.preventDefault();
        setSelectedIndex(prev => 
          prev < results?.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e?.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e?.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results?.length) {
          handleResultClick(results?.[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleResultClick = (result) => {
    navigate(result?.path);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <Icon 
          name="Search" 
          size={16} 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="Search projects, documents, marketplace..."
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-2 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
          >
            <Icon name="X" size={16} />
          </button>
        )}
      </div>
      {/* Search Results Dropdown */}
      {isOpen && (query?.trim() || results?.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-elevated z-300 animate-fade-in">
          {isLoading ? (
            <div className="px-4 py-8 text-center">
              <Icon name="Loader2" size={20} className="text-muted-foreground animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Searching...</p>
            </div>
          ) : results?.length === 0 && query?.trim() ? (
            <div className="px-4 py-8 text-center">
              <Icon name="Search" size={20} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
              <p className="text-xs text-muted-foreground mt-1">Try different keywords or check spelling</p>
            </div>
          ) : results?.length > 0 ? (
            <div className="py-2 max-h-80 overflow-y-auto" ref={resultsRef}>
              {results?.map((result, index) => (
                <button
                  key={result?.id}
                  onClick={() => handleResultClick(result)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-muted transition-smooth ${
                    selectedIndex === index ? 'bg-muted' : ''
                  }`}
                >
                  <Icon 
                    name={getResultIcon(result?.type)} 
                    size={16} 
                    className="text-primary flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {result?.title}
                      </h4>
                      <span className="text-xs text-primary font-medium ml-2 flex-shrink-0">
                        {result?.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {result?.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : null}

          {/* Quick Actions */}
          {!query?.trim() && (
            <div className="py-2 border-t border-border">
              <div className="px-4 py-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Quick Actions
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => navigate('/marketplace')}
                    className="w-full flex items-center space-x-3 px-2 py-2 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-smooth"
                  >
                    <Icon name="Plus" size={14} />
                    <span>Browse Marketplace</span>
                  </button>
                  <button
                    onClick={() => navigate('/project-management')}
                    className="w-full flex items-center space-x-3 px-2 py-2 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-smooth"
                  >
                    <Icon name="FolderPlus" size={14} />
                    <span>Create New Project</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;