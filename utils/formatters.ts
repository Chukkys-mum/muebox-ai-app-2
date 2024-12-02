// utils/formatters.ts

/**
 * Formats a file size in bytes to a human-readable string.
 * @param bytes The size in bytes.
 * @param decimals The number of decimal places to show.
 * @returns A formatted string representing the file size.
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Alias for formatFileSize.
 */
export const formatBytes = formatFileSize;

/**
 * Formats a date to a string.
 * @param date The date to format.
 * @param locale The locale to use for formatting.
 * @returns A formatted date string.
 */
export const formatDate = (date: Date, locale: string = 'en-US'): string => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * Formats a date to include time.
 * @param date The date to format.
 * @param locale The locale to use for formatting.
 * @returns A formatted date and time string.
 */
export const formatDateTime = (date: Date, locale: string = 'en-US'): string => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

/**
 * Formats a number as currency.
 * @param amount The amount to format.
 * @param currency The currency code (e.g., 'USD', 'EUR').
 * @param locale The locale to use for formatting.
 * @returns A formatted currency string.
 */
export const formatCurrency = (amount: number, currency: string = 'USD', locale: string = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Formats a number with thousands separators.
 * @param number The number to format.
 * @param locale The locale to use for formatting.
 * @returns A formatted number string.
 */
export const formatNumber = (number: number, locale: string = 'en-US'): string => {
  return new Intl.NumberFormat(locale).format(number);
};

/**
 * Truncates a string to a specified length and adds an ellipsis if truncated.
 * @param str The string to truncate.
 * @param maxLength The maximum length of the string.
 * @returns The truncated string.
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
};

/**
 * Capitalizes the first letter of a string.
 * @param str The string to capitalize.
 * @returns The capitalized string.
 */
export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};