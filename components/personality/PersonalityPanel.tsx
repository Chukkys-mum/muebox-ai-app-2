// /components/personality/PersonalityPanel.tsx

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PersonalityDrawer } from './PersonalityDrawer';
import { usePersonality } from './PersonalityProvider';
import { X } from 'lucide-react';

interface PersonalityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PersonalityPanel({ isOpen, onClose }: PersonalityPanelProps) {
  const { selectedPreset, selectPreset, presets } = usePersonality();

  return (
    <>
      {/* Panel */}
      <div
        className={`fixed right-0 top-0 z-40 h-full w-[400px] transform bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-xl font-bold">Personality Settings</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex-1 overflow-y-auto p-6">
            <Tabs defaultValue="traits" className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="traits">Personality Traits</TabsTrigger>
                <TabsTrigger value="visualization">Visualization</TabsTrigger>
              </TabsList>

              {/* Traits Tab */}
              <TabsContent value="traits" className="mt-4">
                <PersonalityDrawer isOpen={true} onClose={onClose} />
              </TabsContent>

              {/* Visualization Tab */}
              <TabsContent value="visualization" className="mt-4">
                <div>
                  {/* Placeholder for visualization */}
                  <h3 className="text-lg font-semibold">Profile Visualization</h3>
                  <p className="text-sm text-gray-600">
                    Add radar charts or other visual tools here.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <div
        className={`fixed top-1/3 -translate-y-1/2 transform transition-all duration-300 ${
          isOpen ? 'right-[400px]' : 'right-0'
        } z-50`}
      >
        <Button
          onClick={onClose}
          className="h-32 w-8 rounded-r-none rounded-l-md bg-[#F8F8F8] px-0 text-black hover:bg-[#F0F0F0]"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
          }}
        >
          Personality
        </Button>
      </div>
    </>
  );
}
