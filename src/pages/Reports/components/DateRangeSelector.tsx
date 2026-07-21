import React from 'react';
import { Card } from "@fluentui/react-components";
import { CardHeader, CardTitle, Badge } from '@/components/ui/primitives';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CalendarRegular as Calendar } from '@fluentui/react-icons';
import { RefreshCw, Loader2 } from 'lucide-react';
import { PRESETS } from '../constants';
import { nDaysAgo, today } from '../utils';
import type { ReportType } from '../constants';

interface DateRangeSelectorProps {
      fromDate: string;
      toDate: string;
      onFromDateChange: (date: string) => void;
      onToDateChange: (date: string) => void;
      onGenerate: () => void;
      loading: boolean;
      generated: boolean;
      reportDate: string;
      onReportDateChange: (date: string) => void;
      onGenerateSummary: (type: ReportType) => void;
      summaryLoading: boolean;
}

export function DateRangeSelector({
      fromDate,
      toDate,
      onFromDateChange,
      onToDateChange,
      onGenerate,
      loading,
      generated,
      reportDate,
      onReportDateChange,
      onGenerateSummary,
      summaryLoading,
}: DateRangeSelectorProps) {
      return (
            <Card appearance="outline">
                  <CardHeader>
                        <CardTitle>Select Period</CardTitle>
                        {generated && (
                              <Badge variant="teal">Report generated</Badge>
                        )}
                  </CardHeader>

                  <div className="flex flex-wrap items-end gap-4">
                        {/* Quick presets */}
                        <div className="flex flex-wrap gap-2">
                              {PRESETS.map((p) => (
                                    <button
                                          key={p.days}
                                          onClick={() => {
                                                onFromDateChange(
                                                      nDaysAgo(p.days)
                                                );
                                                onToDateChange(today());
                                          }}
                                          className="px-3 py-1.5 text-xs font-mono border border-bg-border rounded-full text-ink-muted hover:text-accent-gold hover:border-accent-gold/30 transition-all"
                                    >
                                          {p.label}
                                    </button>
                              ))}
                        </div>

                        {/* Custom date pickers */}
                        <DatePickerGroup
                              fromDate={fromDate}
                              toDate={toDate}
                              onFromDateChange={onFromDateChange}
                              onToDateChange={onToDateChange}
                        />

                        <GenerateButton
                              onClick={onGenerate}
                              loading={loading}
                              disabled={!fromDate || !toDate}
                        />
                  </div>

                  {/* Summary Reports Section */}
                  <SummaryReportSection
                        reportDate={reportDate}
                        onReportDateChange={onReportDateChange}
                        onGenerateSummary={onGenerateSummary}
                        summaryLoading={summaryLoading}
                  />
            </Card>
      );
}

// Sub-components for DateRangeSelector
function DatePickerGroup({
      fromDate,
      toDate,
      onFromDateChange,
      onToDateChange,
}: {
      fromDate: string;
      toDate: string;
      onFromDateChange: (date: string) => void;
      onToDateChange: (date: string) => void;
}) {
      return (
            <div className="flex items-center gap-3 ml-auto flex-wrap">
                  <div className="flex items-center gap-2">
                        <Calendar fontSize={24} className="text-ink-muted" />
                        <label className="text-xs text-ink-muted font-body">
                              From
                        </label>
                        <Input
                              type="date"
                              suffix={<Calendar fontSize={24} />}
                              value={fromDate}
                              onChange={(v: any) => onFromDateChange(v)}
                        />
                  </div>
                  <div className="flex items-center gap-2">
                        <label className="text-xs text-ink-muted font-body">
                              To
                        </label>
                        <Input
                              type="date"
                              suffix={<Calendar fontSize={24} />}
                              value={toDate}
                              onChange={(v: any) => onToDateChange(v)}
                        />
                  </div>
            </div>
      );
}

function GenerateButton({
      onClick,
      loading,
      disabled,
}: {
      onClick: () => void;
      loading: boolean;
      disabled: boolean;
}) {
      return (
            <Button
                  variant="accent"
                  className="h-[42px]"
                  onClick={onClick}
                  icon={
                        <span>
                              {loading ? (
                                    <Loader2
                                          size={20}
                                          className="animate-spin"
                                    />
                              ) : (
                                    <RefreshCw
                                          size={20}
                                    />
                              )}
                        </span>
                  }
                  iconPosition="left"
            >
                  <div className="flex flex-row items-center justify-center gap-2 w-full relative h-full">
                        <div>
                              <span>
                                    {loading
                                          ? 'Generating…'
                                          : 'Generate Report'}
                              </span>
                        </div>
                  </div>
            </Button>
      );
}

function SummaryReportSection({
      reportDate,
      onReportDateChange,
      onGenerateSummary,
      summaryLoading,
}: {
      reportDate: string;
      onReportDateChange: (date: string) => void;
      onGenerateSummary: (type: ReportType) => void;
      summaryLoading: boolean;
}) {
      return (
            <>
                  <div className="flex w-full relative flex-wrap gap-4 items-center my-4">
                        <div>
                              <span>Summary Report</span>
                        </div>
                        <div className="flex items-center gap-2">
                              <Input
                                    type="date"
                                    suffix={<Calendar fontSize={24} />}
                                    value={reportDate}
                                    onChange={(v: any) => onReportDateChange(v)}
                              />
                        </div>
                        <div>
                              <Button
                                    variant="accent"
                                    className="h-[42px]"
                                    onClick={() => onGenerateSummary('summary')}
                                    icon={
                                          <span>
                                                {summaryLoading ? (
                                                      <Loader2
                                                            size={20}
                                                            className="animate-spin"
                                                      />
                                                ) : (
                                                      <RefreshCw
                                                            size={20}
                                                      />
                                                )}
                                          </span>
                                    }
                                    iconPosition="left"
                              >
                                    <div className="flex flex-row items-center justify-center gap-2 w-full relative h-full">
                                          <div>
                                                <span>
                                                      {summaryLoading
                                                            ? 'Generating…'
                                                            : 'Generate Summary Report'}
                                                </span>
                                          </div>
                                    </div>
                              </Button>
                        </div>
                  </div>

                  <div className="flex w-full relative flex-wrap gap-4 items-center my-4">
                        <div>
                              <span>Sales Report</span>
                        </div>
                        <div className="flex items-center gap-2">
                              <Input
                                    type="date"
                                    suffix={<Calendar fontSize={24} />}
                                    value={reportDate}
                                    onChange={(v: any) => onReportDateChange(v)}
                              />
                        </div>
                        <div>
                              <Button
                                    variant="accent"
                                    className="h-[42px]"
                                    onClick={() => onGenerateSummary('sales')}
                                    icon={
                                          <span>
                                                {summaryLoading ? (
                                                      <Loader2
                                                            size={20}
                                                            className="animate-spin"
                                                      />
                                                ) : (
                                                      <RefreshCw
                                                            size={20}
                                                      />
                                                )}
                                          </span>
                                    }
                                    iconPosition="left"
                              >
                                    <div className="flex flex-row items-center justify-center gap-2 w-full relative h-full">
                                          <div>
                                                <span>
                                                      {summaryLoading
                                                            ? 'Generating…'
                                                            : 'Generate Sales Report'}
                                                </span>
                                          </div>
                                    </div>
                              </Button>
                        </div>
                  </div>
            </>
      );
}
