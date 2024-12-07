// components/personality/PersonalityDrawer.tsx

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { usePersonality } from './PersonalityProvider';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface PersonalityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PersonalityDrawer({ isOpen, onClose }: PersonalityDrawerProps) {
  const {
    currentPersonality,
    selectedPreset,
    presets,
    updatePersonality,
    selectPreset
  } = usePersonality();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed right-0 top-0 z-[51] h-full w-[400px] bg-white shadow-lg"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="text-xl font-bold">Personality Profile</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Preset Selection */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Presets</h3>
                  <Select
                    value={selectedPreset || ''}
                    onValueChange={selectPreset}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a preset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.entries(presets).map(([key, preset]) => (
                          <SelectItem key={key} value={key}>
                            {preset.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Card>

                {/* Personality Sliders */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Personality Traits</h3>
                  <div className="space-y-6">
                    {Object.entries(currentPersonality).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <label className="text-sm font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </label>
                        <Slider
                          value={[value]}
                          min={1}
                          max={10}
                          step={1}
                          onValueChange={([newValue]) => 
                            updatePersonality({ [key]: newValue })
                          }
                        />
                        <div className="text-sm text-zinc-500 text-right">
                          {value}/10
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Visualization */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Profile Visualization</h3>
                  {/* Add your radar chart or other visualization here */}
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}