import { useEffect } from 'react';
import * as echarts from 'echarts';

// Same dark-gold palette used in CategoryPerformance/ProductCharts — keep these three
// files in sync, or better, import COLORS from one shared place once you settle on
// the exact hex values from your tailwind.config.
export const CHART_COLORS = {
      gold: '#D4AF37',
      goldSoft: 'rgba(212, 175, 55, 0.35)',
      teal: '#2dd4bf',
      ink: '#E5E1D8',
      inkMuted: '#8A8578',
      border: 'rgba(138, 133, 120, 0.18)',
      panel: '#1A1712',
};

export function useEChart(
      containerRef: React.RefObject<HTMLDivElement>,
      option: echarts.EChartsOption,
      deps: React.DependencyList
) {
      useEffect(() => {
            if (!containerRef.current) return;

            const chart = echarts.init(containerRef.current);
            chart.setOption(option);

            const resize = () => chart.resize();
            window.addEventListener('resize', resize);

            return () => {
                  window.removeEventListener('resize', resize);
                  chart.dispose();
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, deps);
}