// types/ui.ts

import { ComponentType, ReactNode } from 'react';

// Page Meta interface
export interface PageMeta {
  title: string;
  description: string;
  cardImage: string;
}

// Route interface
export interface IRoute {
  path: string;
  name: string;
  layout?: string;
  exact?: boolean;
  component?: ComponentType;
  icon?: JSX.Element;
  secondary?: boolean;
  collapse?: boolean;
  items?: IRoute[];
  rightElement?: boolean;
  invisible?: boolean;
}

// You can add more UI-related types or interfaces here as needed

// For example, you might want to add types for common UI components:

export interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  children: ReactNode;
}

export interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'password' | 'email' | 'number';
  error?: string;
  label?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

// Types for theme and styling
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    error: string;
    success: string;
  };
  fonts: {
    body: string;
    heading: string;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Types for layout components
export interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: IRoute[];
}

// Types for data display components
export interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], item: T) => ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onRowClick?: (item: T) => void;
}

// Types for form components
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'checkbox' | 'radio';
  options?: { value: string; label: string }[];
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  };
}

export interface FormProps {
  fields: FormField[];
  onSubmit: (values: Record<string, any>) => void;
  initialValues?: Record<string, any>;
}