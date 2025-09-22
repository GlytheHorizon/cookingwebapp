'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';

interface StepByStepViewProps {
  steps: string[];
}

export function StepByStepView({ steps }: StepByStepViewProps) {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const handleStepToggle = (index: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <AnimatePresence>
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div
                  className={`flex items-start space-x-4 rounded-lg p-4 transition-colors ${
                    completedSteps[index] ? 'bg-primary/10' : 'bg-transparent'
                  }`}
                >
                  <Checkbox
                    id={`step-${index}`}
                    checked={!!completedSteps[index]}
                    onCheckedChange={() => handleStepToggle(index)}
                    className="mt-1 h-5 w-5"
                    aria-label={`Mark step ${index + 1} as complete`}
                  />
                  <Label
                    htmlFor={`step-${index}`}
                    className={`flex-1 text-base transition-all ${
                      completedSteps[index]
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground'
                    }`}
                  >
                    <span className="mr-2 font-bold">{index + 1}.</span>
                    {step}
                  </Label>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
