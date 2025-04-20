import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, History, FileText } from 'lucide-react';
import { searchDocuments, getRecentSearches, type SearchResult } from '../services/searchService';
import { useNavigate } from 'react-router-dom';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const searches = await getRecentSearches();
      setRecentSearches(searches);
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const searchResults = await searchDocuments(searchQuery);
      setResults(searchResults);
      await loadRecentSearches();
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Document Search</h1>
        <p className="text-gray-600" id="search-description">Search across all your immigration documents</p>
      </div>

      <div className="mb-8">
        <div className="flex gap-4" role="search" aria-labelledby="search-description">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              aria-label="Search documents"
              aria-expanded={results.length > 0}
              aria-controls="search-results"
              aria-describedby="search-description"
            />
          </div>
          <button
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => handleSearch(query)}
            disabled={loading}
            aria-label={loading ? 'Searching...' : 'Search'}
          >
            {loading ? (
              <div className="flex items-center" role="status">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" aria-hidden="true"></div>
                <span>Searching...</span>
              </div>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {recentSearches.length > 0 && (
          <div className="mt-4" role="complementary" aria-label="Recent searches">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <History className="h-4 w-4 mr-1" aria-hidden="true" />
              <h2>Recent Searches</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={() => {
                    setQuery(search);
                    handleSearch(search);
                  }}
                  aria-label={`Search for ${search}`}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div id="search-results" role="region" aria-live="polite" aria-atomic="true">
        {results.length > 0 ? (
          <div className="space-y-6">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/documents/${result.id}/analysis`)}
                onKeyPress={(e) => e.key === 'Enter' && navigate(`/documents/${result.id}/analysis`)}
                tabIndex={0}
                role="link"
                aria-label={`View analysis for ${result.title}`}
              >
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-indigo-600 mt-1 mr-3" aria-hidden="true" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {result.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3">
                      {result.content}
                    </p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>Relevance: {(result.relevance * 100).toFixed(0)}%</span>
                      <span className="mx-2" aria-hidden="true">•</span>
                      <span>
                        {new Date(result.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : query && !loading ? (
          <div className="text-center py-12" role="status">
            <p className="text-gray-500">No results found for "{query}"</p>
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default Search;