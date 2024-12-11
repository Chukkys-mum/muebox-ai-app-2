// /hooks/useNameValidation.ts
import { useState, useCallback } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface ValidationConfig {
  tableName: string;        
  columnName?: string;      
  minSimilarity?: number;   
  enableSimilarCheck?: boolean; 
  customErrorMessage?: string;  
  customWarningMessage?: string;
  skipId?: string; // Add this for edit validation
}

interface ValidationResult {
  isValid: boolean;
  errorMessage: string;
  warnings: string[];
}

interface DatabaseRecord {
  [key: string]: string;
}

export const useNameValidation = (config: ValidationConfig) => {
  const [isValidating, setIsValidating] = useState(false);
  const supabase = createClientComponentClient();

  const {
    tableName,
    columnName = 'name',
    minSimilarity = 0.8,
    enableSimilarCheck = true,
    customErrorMessage,
    customWarningMessage = 'Similar name exists: "{name}"',
    skipId
  } = config;

  const calculateStringSimilarity = (str1: string, str2: string): number => {
    const track = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
    }
    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }
    return 1 - (track[str2.length][str1.length] / Math.max(str1.length, str2.length));
  };

  const validateName = useCallback(async (name: string): Promise<ValidationResult> => {
    setIsValidating(true);
    const result: ValidationResult = {
      isValid: true,
      errorMessage: '',
      warnings: []
    };

    try {
      // Build query
      let query = supabase
        .from(tableName)
        .select<string, DatabaseRecord>(columnName);

      // Add ID exclusion if provided
      if (skipId) {
        query = query.neq('id', skipId);
      }

      // Add name filter
      const { data: existingItems } = await query.ilike(columnName, name);

      if (existingItems && existingItems.length > 0) {
        const exactMatch = existingItems.some(
          (item: DatabaseRecord) => item[columnName].toLowerCase() === name.toLowerCase()
        );
        
        if (exactMatch) {
          result.isValid = false;
          result.errorMessage = customErrorMessage || 
            `A ${tableName.replace(/_/g, ' ').slice(0, -1)} with this name already exists`;
        } else if (enableSimilarCheck) {
          existingItems.forEach((item: DatabaseRecord) => {
            const similarity = calculateStringSimilarity(
              item[columnName].toLowerCase(),
              name.toLowerCase()
            );
            if (similarity > minSimilarity) {
              result.warnings.push(
                customWarningMessage.replace('{name}', item[columnName])
              );
            }
          });
        }
      }
    } catch (error) {
      console.error('Name validation error:', error);
      result.isValid = false;
      result.errorMessage = 'Error validating name. Please try again.';
    } finally {
      setIsValidating(false);
    }

    return result;
  }, [supabase, tableName, columnName, minSimilarity, enableSimilarCheck, customErrorMessage, customWarningMessage, skipId]);

  return {
    validateName,
    isValidating
  };
};