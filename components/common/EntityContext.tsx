// /components/common/EntityContext.tsx
'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { EntityTypes, EntityType } from '@/components/common/EntityTypes';

interface EntityConfig {
  label: string;
  enabled: boolean;
  customLabel: string;
}

interface EntityContextType {
  entityConfigs: Record<EntityType, EntityConfig>;
  updateEntityStatus: (entityType: EntityType, enabled: boolean) => void;
  updateEntityLabel: (entityType: EntityType, newLabel: string) => void;
}

const EntityContext = createContext<EntityContextType | undefined>(undefined);

export function EntityProvider({ children }: { children: React.ReactNode }) {
  const [entityConfigs, setEntityConfigs] = useState<Record<EntityType, EntityConfig>>(() =>
    Object.entries(EntityTypes).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: {
        label: value.label,
        enabled: value.mandatory,
        customLabel: value.label
      }
    }), {} as Record<EntityType, EntityConfig>)
  );

  const updateEntityStatus = (entityType: EntityType, enabled: boolean) => {
    setEntityConfigs(prev => {
      const newConfigs = { ...prev };
      newConfigs[entityType].enabled = enabled;

      // If enabling an entity, enable its parent entities
      if (enabled) {
        if (entityType === 'team') {
          newConfigs.service.enabled = true;
          newConfigs.directorate.enabled = true;
          newConfigs.organisation.enabled = true;
        } else if (entityType === 'service') {
          newConfigs.directorate.enabled = true;
          newConfigs.organisation.enabled = true;
        } else if (entityType === 'directorate') {
          newConfigs.organisation.enabled = true;
        }
      }

      // If disabling an entity, disable its child entities
      if (!enabled) {
        if (entityType === 'organisation') {
          newConfigs.directorate.enabled = false;
          newConfigs.service.enabled = false;
          newConfigs.team.enabled = false;
        } else if (entityType === 'directorate') {
          newConfigs.service.enabled = false;
          newConfigs.team.enabled = false;
        } else if (entityType === 'service') {
          newConfigs.team.enabled = false;
        }
      }

      return newConfigs;
    });
  };

  const updateEntityLabel = (entityType: EntityType, newLabel: string) => {
    setEntityConfigs(prev => ({
      ...prev,
      [entityType]: {
        ...prev[entityType],
        customLabel: newLabel
      }
    }));
  };

  return (
    <EntityContext.Provider value={{ entityConfigs, updateEntityStatus, updateEntityLabel }}>
      {children}
    </EntityContext.Provider>
  );
};

export const useEntity = () => {
  const context = useContext(EntityContext);
  if (context === undefined) {
    throw new Error('useEntity must be used within an EntityProvider');
  }
  return context;
};