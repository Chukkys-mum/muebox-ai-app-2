// /components/dashboard/account-settings/Organisation-Configuration.tsx


'use client';
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { EntityTypes, EntityType } from '@/components/common/EntityTypes';
import { useEntity } from '@/components/common/EntityContext';
import { entityDescriptions } from '@/components/common/entityDescriptions';

const OrganisationConfiguration: React.FC = () => {
  const { entityConfigs, updateEntityStatus } = useEntity();

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            Organisation Structure
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
            Configure your organization's hierarchy and reporting structure
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(EntityTypes).map(([key, entity]) => {
          const entityType = key as EntityType;
          const config = entityConfigs[entityType];
          const description = entityDescriptions[entityType as keyof typeof entityDescriptions];
          
          return (
            <div key={key} className="group relative bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl w-8 h-8 flex items-center justify-center">
                    {entity.value === 'user' ? '👤' : 
                     entity.value === 'team' ? '👥' : '📄'}
                  </span>
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {config.customLabel}
                      </h2>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-4 h-4 p-0">
                            <Info className="w-3 h-3" />
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-2">
                            <h4 className="font-semibold">{description?.title}</h4>
                            <p className="text-sm">{description?.longDescription}</p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                      {description?.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {entity.mandatory && (
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        Required
                      </span>
                    )}
                    <Switch
                      checked={config.enabled}
                      disabled={entity.mandatory}
                      onChange={() => updateEntityStatus(entityType, !config.enabled)}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-600 dark:text-blue-400">
          The organization structure determines how users, content, and permissions are organized within your account.
          Required entities cannot be disabled as they are essential for system functionality.
        </p>
      </div>
    </div>
  );
};

export default OrganisationConfiguration;
