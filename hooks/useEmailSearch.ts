// /hooks/useEmailSearch.ts

import { useState, useCallback, useEffect } from 'react';
import { useEmail } from '@/context/EmailContext';
import type { Email } from '@/types/email';
import { debounce } from 'lodash';

interface SearchFilters {
  from?: string;
  to?: string;
  subject?: string;
  hasAttachment?: boolean;
  isRead?: boolean;
  isStarred?: boolean;
  label?: string;
  before?: Date;
  after?: Date;
}

interface UseEmailSearchResult {
  searchQuery: string;
  searchResults: Email[];
  parsedFilters: SearchFilters;
  isSearching: boolean;
  error: string | null;
  handleSearch: (query: string) => void;
  clearSearch: () => void;
  searchSuggestions: string[];
}

export function useEmailSearch() {
  const { setLoading, setError } = useEmail();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Email[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [parsedFilters, setParsedFilters] = useState<SearchFilters>({});
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  // Parse search query into filters
  const parseSearchQuery = (query: string): SearchFilters => {
    const filters: SearchFilters = {};
    const terms = query.match(/(?:[^\s"]+|"[^"]*")+/g) || [];

    terms.forEach(term => {
      const [filter, ...valueParts] = term.split(':');
      const value = valueParts.join(':').replace(/^"(.*)"$/, '$1');

      switch (filter.toLowerCase()) {
        case 'from':
          filters.from = value;
          break;
        case 'to':
          filters.to = value;
          break;
        case 'subject':
          filters.subject = value;
          break;
        case 'has':
          if (value === 'attachment') filters.hasAttachment = true;
          break;
        case 'is':
          if (value === 'read') filters.isRead = true;
          if (value === 'unread') filters.isRead = false;
          if (value === 'starred') filters.isStarred = true;
          break;
        case 'label':
        case 'in':
          filters.label = value;
          break;
        case 'before':
          filters.before = new Date(value);
          break;
        case 'after':
          filters.after = new Date(value);
          break;
      }
    });

    return filters;
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string, filters: SearchFilters) => {
      try {
        setIsSearching(true);
        setError(null);

        // Construct the search URL with filters
        const searchParams = new URLSearchParams();
        if (filters.from) searchParams.append('from', filters.from);
        if (filters.to) searchParams.append('to', filters.to);
        if (filters.subject) searchParams.append('subject', filters.subject);
        if (filters.hasAttachment !== undefined) searchParams.append('hasAttachment', String(filters.hasAttachment));
        if (filters.isRead !== undefined) searchParams.append('isRead', String(filters.isRead));
        if (filters.isStarred !== undefined) searchParams.append('isStarred', String(filters.isStarred));
        if (filters.label) searchParams.append('label', filters.label);
        if (filters.before) searchParams.append('before', filters.before.toISOString());
        if (filters.after) searchParams.append('after', filters.after.toISOString());

        // Make the API call
        const response = await fetch(`/api/emails/search?${searchParams.toString()}`);
        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();
        setSearchResults(data.emails);
        
        // Update search suggestions based on results
        updateSearchSuggestions(query, data.emails);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  const updateSearchSuggestions = (query: string, results: Email[]) => {
    // Generate suggestions based on search results and common patterns
    const suggestions = new Set<string>();

    if (results.length > 0) {
      // Add sender-based suggestions
      suggestions.add(`from:${results[0].sender.email}`);
      
      // Add subject-based suggestions
      if (results[0].subject) {
        suggestions.add(`subject:"${results[0].subject}"`);
      }

      // Add label-based suggestions
      results[0].labels?.forEach(label => {
        suggestions.add(`label:${label}`);
      });
    }

    // Add common search patterns
    suggestions.add('is:unread');
    suggestions.add('has:attachment');
    suggestions.add('is:starred');

    setSearchSuggestions(Array.from(suggestions));
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filters = parseSearchQuery(query);
      setParsedFilters(filters);
      debouncedSearch(query, filters);
    } else {
      clearSearch();
    }
  }, [debouncedSearch]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setParsedFilters({});
    setSearchSuggestions([]);
    setIsSearching(false);
    setError(null);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return {
    searchQuery,
    searchResults,
    parsedFilters,
    isSearching,
    error: null,
    handleSearch,
    clearSearch,
    searchSuggestions
  };
}