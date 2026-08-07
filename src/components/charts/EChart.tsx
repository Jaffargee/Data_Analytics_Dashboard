import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { EmptyState } from '@/components/ui/primitives';
import { fmtCurrency } from '@/lib/utils';
import { Card } from '@fluentui/react-components';
import type { EChartsOption } from 'echarts';

interface EChartProps {
      option: EChartsOption;
      height?: string;
      className?: string;
      loading?: boolean;
}

export default function EChart({
      option,
      height = "320px",
      className = "",
      loading = false,
}: EChartProps): JSX.Element {
      const containerRef = useRef<HTMLDivElement | null>(null);
      const chartRef = useRef<echarts.ECharts | null>(null);

      useEffect(() => {
            if (!containerRef.current) return;

            const chart = echarts.init(containerRef.current);
            chartRef.current = chart;

            const handleResize = () => chart.resize();
            window.addEventListener("resize", handleResize);

            const resizeObserver = new ResizeObserver(() => chart.resize());
            resizeObserver.observe(containerRef.current);

            return () => {
                  window.removeEventListener("resize", handleResize);
                  resizeObserver.disconnect();
                  chart.dispose();
                  chartRef.current = null;
            };
      }, []);

      useEffect(() => {
            if (!chartRef.current) return;
            if (loading) {
                  chartRef.current.showLoading();
            } else {
                  chartRef.current.hideLoading();
                  chartRef.current.setOption(option, true);
            }
      }, [option, loading]);

      return (
            <div
                  ref={containerRef}
                  className={className}
                  style={{ width: "100%", height }}
            />
      );
}
