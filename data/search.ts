import team10 from 'assets/img/team/40x40/10.webp';
import team12 from 'assets/img/team/40x40/12.webp';
import product60 from 'assets/img/products/60x60/3.png';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faChrome, faFirefoxBrowser } from '@fortawesome/free-brands-svg-icons';

type SearchItemCategory =
  | 'recently_searched'
  | 'products'
  | 'quick_links'
  | 'suggestion_files'
  | 'members'
  | 'related_search';

export type SearchResult = {
  url: string;
  label: string;
  category: SearchItemCategory;
  image?: string;
  details?: string;
  format?: string;
  avatar?: string;
  status?: string;
  icon?: IconProp;
};

export const searchItems: SearchResult[] = [
  {
    url: `/apps/e-commerce/customer/product-details`,
    label: 'Store Macbook',
    category: 'recently_searched'
  },
  {
    url: `/apps/e-commerce/customer/product-details`,
    label: 'MacBook Air - 13″',
    category: 'recently_searched'
  },
  {
    url: `/apps/e-commerce/customer/product-details`,
    image: product60,
    label: 'MacBook Air - 13″',
    details: '8GB Memory - 1.6GHz - 128GB Storage',
    category: 'products'
  },
  {
    url: `/apps/e-commerce/customer/product-details`,
    image: product60,
    label: 'MacBook Pro - 13″',
    details: '30 Sep at 12:30 PM',
    category: 'products'
  },
  {
    url: `/apps/e-commerce/customer/product-details`,
    label: 'Support MacBook House',
    category: 'quick_links'
  },
  {
    url: `/apps/e-commerce/customer/product-details`,
    label: 'Store MacBook″',
    category: 'quick_links'
  },
  {
    url: `/apps/e-commerce/customer/product-details`,
    label: 'Library MacBook folder.rar',
    format: 'rar',
    category: 'suggestion_files'
  },
  {
    url: `/apps/e-commerce/customer/product-details`,
    label: 'Feature MacBook extensions.txt',
    format: 'txt',
    category: 'suggestion_files'
  },
  {
    url: `/apps/e-commerce/customer/product-details`,
    label: 'MacBook Pro_13.jpg',
    format: 'jpg',
    category: 'suggestion_files'
  },
  {
    url: `/pages/members`,
    avatar: team10,
    label: 'Carry Anna',
    details: 'anna@technext.it',
    status: 'online',
    category: 'members'
  },
  {
    url: `/pages/members`,
    avatar: team12,
    label: 'John Smith',
    details: 'smith@technext.it',
    category: 'members'
  },
  {
    url: `/apps/e-commerce/customer/product-details`,
    label: 'Search in the Web MacBook',
    icon: faFirefoxBrowser,
    category: 'related_search'
  },
  {
    url: `/apps/e-commerce/customer/product-details`,
    label: 'Store MacBook″',
    icon: faChrome,
    category: 'related_search'
  }
];
