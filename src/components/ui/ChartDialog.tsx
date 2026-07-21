import * as Dialog from '@radix-ui/react-dialog';
import React from 'react';
import { BarChart } from '../charts/BarChart';
import { LineChart } from '../charts/LineChart';
import { DonutChart } from '../charts/DonutChart';

export interface BarLineData {
      label: string;
      value: number;
}

interface DonutSlice {
      label: string;
      value: number;
      color: string;
}

// interface ChartDialogProps {
//       triggerComponent: React.ReactNode;
//       type: 'line' | 'bar' | 'donut';
//       data: BarLineData[] | DonutSlice[];
//       height?: number;
//       title?: string;
// }

type ChartDialogProps = { type: 'bar' | 'line'; data: BarLineData[]; height?: number; title?: string; triggerComponent: React.ReactNode }
  | { type: 'donut'; data: DonutSlice[]; height?: number; title?: string; triggerComponent: React.ReactNode };

export function ChartDialog({
      triggerComponent,
      data,
      height,
      title,
      type = 'line',
}: ChartDialogProps) {

      function renderChart() {
            switch (type) {
            case 'bar':
                  return <BarChart data={data as BarLineData[]} height={height} />;
            case 'line':
                  return <LineChart data={data as BarLineData[]} height={height} />;
            case 'donut':
                  return <DonutChart data={data as DonutSlice[]} />;
            }
      }

      return (
            <Dialog.Root>
                  <Dialog.Trigger asChild>{triggerComponent}</Dialog.Trigger>
                  <Dialog.Portal>
                        <Dialog.Overlay className="fixed z-10 inset-0 bg-[#00000010] backdrop-blur-sm data-[state=open]:animate-overlayShow" />
                        <Dialog.Content className="fixed flex flex-col items-center justify-center left-1/2 top-1/2 z-50 w-full h-full max-w-[90vw] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-[3rem] bg-bg-base border-accent-gold/30 border border-solid p-6 shadow-xl">
                              <Dialog.Title className="text-3xl text-slate-300">
                                    {title}
                              </Dialog.Title>
                              <Dialog.Description className="text-slate-400">
                                    Accounts Total Summary for a single date
                              </Dialog.Description>
                              <div className="p-8">{renderChart()}</div>
                        </Dialog.Content>
                  </Dialog.Portal>
            </Dialog.Root>
      );
}
