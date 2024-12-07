// /components/dashboard/account-settings/EntityTypeConfiguration.tsx

'use client';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { EntityTypes, EntityType } from '@/components/common/EntityTypes';
import { useEntity } from '@/components/common/EntityContext';

const EntityTypeConfiguration: React.FC = () => {
  const supabase = createClientComponentClient();
  const { entityConfigs, updateEntityLabel } = useEntity();
  const [modifiedEntities, setModifiedEntities] = useState<Set<EntityType>>(new Set());

  const handleLabelChange = (entityType: EntityType, newLabel: string) => {
    updateEntityLabel(entityType, newLabel);
    setModifiedEntities(prev => {
      const newSet = new Set(prev);
      if (newLabel !== EntityTypes[entityType].label) {
        newSet.add(entityType);
      } else {
        newSet.delete(entityType);
      }
      return newSet;
    });
  };

  const saveChanges = async () => {
    try {
      const updates = Array.from(modifiedEntities).map(entityType => ({
        type: entityType,
        name: entityConfigs[entityType].customLabel,
        updated_at: new Date().toISOString()
      }));

      if (updates.length === 0) return;

      const { error } = await supabase
        .from('entities')
        .upsert(updates);

      if (error) throw error;
      setModifiedEntities(new Set());
      // Show success message
    } catch (error) {
      // Show error message
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Entity Type Labels</h2>
        <Button onClick={saveChanges} disabled={modifiedEntities.size === 0}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Alert>
        <AlertDescription>
          Customize entity type labels to match your organization's terminology.
          These changes will be reflected throughout the system.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {Object.entries(EntityTypes).map(([key, config]) => {
          const entityType = key as EntityType;
          const isModified = modifiedEntities.has(entityType);
          
          return (
            <div key={key} className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="text-sm font-medium text-zinc-900 dark:text-white">
                  {config.label}
                  {config.mandatory && (
                    <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">Required</span>
                  )}
                </label>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {config.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={entityConfigs[entityType].customLabel}
                  onChange={(e) => handleLabelChange(entityType, e.target.value)}
                  className={isModified ? 'border-amber-500' : ''}
                  disabled={config.mandatory}
                  placeholder={`Enter custom label for ${config.label}`}
                />
                {isModified && (
                  <span className="text-xs text-amber-600">Modified</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EntityTypeConfiguration;
