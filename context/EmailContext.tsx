// /context/EmailContext.tsx

import { 
    createContext, 
    useContext, 
    useReducer, 
    ReactNode,
    Dispatch 
  } from 'react';
  import type { Email } from '@/types/email';
  
  interface EmailState {
    selectedEmails: Set<string>;
    sidebarWidth: number;
    searchQuery: string;
    currentPage: number;
    itemsPerPage: number;
    totalEmails: number;
    loading: boolean;
    error: string | null;
  }
  
  type EmailAction =
    | { type: 'SELECT_EMAILS'; payload: Set<string> }
    | { type: 'SET_SIDEBAR_WIDTH'; payload: number }
    | { type: 'SET_SEARCH_QUERY'; payload: string }
    | { type: 'SET_CURRENT_PAGE'; payload: number }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'RESET_SELECTION' }
    | { type: 'SET_TOTAL_EMAILS'; payload: number };
  
  const initialState: EmailState = {
    selectedEmails: new Set(),
    sidebarWidth: 280,
    searchQuery: '',
    currentPage: 1,
    itemsPerPage: 50,
    totalEmails: 0,
    loading: false,
    error: null,
  };
  
  function emailReducer(state: EmailState, action: EmailAction): EmailState {
    switch (action.type) {
      case 'SELECT_EMAILS':
        return {
          ...state,
          selectedEmails: action.payload
        };
      case 'SET_SIDEBAR_WIDTH':
        return {
          ...state,
          sidebarWidth: action.payload
        };
      case 'SET_SEARCH_QUERY':
        return {
          ...state,
          searchQuery: action.payload,
          currentPage: 1 // Reset to first page on new search
        };
      case 'SET_CURRENT_PAGE':
        return {
          ...state,
          currentPage: action.payload
        };
      case 'SET_LOADING':
        return {
          ...state,
          loading: action.payload
        };
      case 'SET_ERROR':
        return {
          ...state,
          error: action.payload
        };
      case 'RESET_SELECTION':
        return {
          ...state,
          selectedEmails: new Set()
        };
      case 'SET_TOTAL_EMAILS':
        return {
          ...state,
          totalEmails: action.payload
        };
      default:
        return state;
    }
  }
  
  interface EmailContextType extends EmailState {
    dispatch: Dispatch<EmailAction>;
    selectEmails: (emails: Set<string>) => void;
    setSidebarWidth: (width: number) => void;
    setSearchQuery: (query: string) => void;
    setCurrentPage: (page: number) => void;
    resetSelection: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setTotalEmails: (total: number) => void;
  }
  
  const EmailContext = createContext<EmailContextType | null>(null);
  
  interface EmailProviderProps {
    children: ReactNode;
  }
  
  export function EmailProvider({ children }: EmailProviderProps) {
    const [state, dispatch] = useReducer(emailReducer, initialState);
  
    const value: EmailContextType = {
      ...state,
      dispatch,
      selectEmails: (emails) => dispatch({ type: 'SELECT_EMAILS', payload: emails }),
      setSidebarWidth: (width) => dispatch({ type: 'SET_SIDEBAR_WIDTH', payload: width }),
      setSearchQuery: (query) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query }),
      setCurrentPage: (page) => dispatch({ type: 'SET_CURRENT_PAGE', payload: page }),
      resetSelection: () => dispatch({ type: 'RESET_SELECTION' }),
      setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
      setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
      setTotalEmails: (total) => dispatch({ type: 'SET_TOTAL_EMAILS', payload: total }),
    };
  
    return (
      <EmailContext.Provider value={value}>
        {children}
      </EmailContext.Provider>
    );
  }
  
  export function useEmail() {
    const context = useContext(EmailContext);
    if (!context) {
      throw new Error('useEmail must be used within an EmailProvider');
    }
    return context;
  }
  
  // Hook for managing bulk actions
  export function useEmailBulkActions() {
    const { selectedEmails, setLoading, setError, resetSelection } = useEmail();
  
    const handleBulkAction = async (
      action: 'archive' | 'delete' | 'markRead' | 'markUnread' | 'star' | 'unstar',
      emails: Set<string>
    ) => {
      setLoading(true);
      try {
        // Implementation will depend on your API structure
        const response = await fetch('/api/emails/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, emails: Array.from(emails) }),
        });
  
        if (!response.ok) throw new Error('Failed to perform bulk action');
        
        // Reset selection after successful action
        resetSelection();
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
  
    return {
      handleBulkAction,
      hasSelection: selectedEmails.size > 0,
      selectedCount: selectedEmails.size,
    };
  }