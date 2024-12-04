// /hooks/useEmailPagination.ts

import { useState, useEffect, useCallback } from 'react';
import { useEmail } from '@/context/EmailContext';
import { supabase } from '@/utils/supabase/client';
import { transformEmailData } from '@/types';
import type { Email, EmailData } from '@/types';
import type { Database } from '@/types/types_db';

type DbEmail = Database['public']['Tables']['emails']['Row'];

interface UsePaginationResult {
  emails: Email[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  totalEmails: number;
  pageSize: number;
  setPageSize: (size: number) => void;
}

export function useEmailPagination(
  initialEmails: Email[] = [],
  defaultPageSize: number = 50
): UsePaginationResult {
  const { setLoading, setError } = useEmail();
  const [emails, setEmails] = useState<Email[]>(initialEmails);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEmails, setTotalEmails] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [loading, setPaginationLoading] = useState(false);
  const [error, setPaginationError] = useState<string | null>(null);

  const fetchEmails = useCallback(async (page: number) => {
    setPaginationLoading(true);
    setLoading(true);
    setPaginationError(null);
  
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
  
      const { data, error, count } = await supabase
        .from('emails')
        .select(`
          id,
          user_id,
          email_account_id,
          subject,
          sender,
          recipient,
          email_body,
          status,
          created_at,
          updated_at
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
  
      if (error) throw error;
  
      // Transform the email data using our helper function
      const transformedEmails = (data || []).map(email => 
        transformEmailData(email as unknown as EmailData)
      );
  
      setEmails(transformedEmails);
      if (count !== null) setTotalEmails(count);
  
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch emails';
      setPaginationError(errorMessage);
      setError(errorMessage);
    } finally {
      setPaginationLoading(false);
      setLoading(false);
    }
  }, [pageSize, setLoading, setError]);

  useEffect(() => {
    fetchEmails(currentPage);
  }, [currentPage, pageSize, fetchEmails]);

  const totalPages = Math.ceil(totalEmails / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const goToPage = useCallback((page: number) => {
    const targetPage = Math.max(1, Math.min(page, totalPages));
    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
    }
  }, [currentPage, totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  // Reset to first page when pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  // Handle window resize to adjust page size if needed
  useEffect(() => {
    const handleResize = () => {
      const windowHeight = window.innerHeight;
      const emailRowHeight = 72; // Approximate height of each email row
      const optimalPageSize = Math.floor(windowHeight / emailRowHeight);
      
      // Only update if the difference is significant
      if (Math.abs(optimalPageSize - pageSize) > 5) {
        setPageSize(Math.max(10, optimalPageSize));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pageSize]);

  return {
    emails,
    loading,
    error,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    totalEmails,
    pageSize,
    setPageSize,
  };
}

// Optional: Add a hook for cursor-based pagination if needed
export function useEmailCursorPagination() {
  // Implementation for cursor-based pagination
  // Useful for infinite scroll or very large datasets
}