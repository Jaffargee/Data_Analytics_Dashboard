

export type QueryResponse = {
      type: "query" | "suggestions" | "error";
      query?: {
            sql: string;
            explanation: string;
      };
      response?: {
            summary: string;
            insights: string[];
            details: string;
            recommendations: string[];
      };
      data?: {
            columns: string[];
            rows: any[][];
            row_count: number;
      };
      meta?: {
            executed_at: string;
            execution_time_ms: number;
            row_count: number;
      };
      suggestions?: {
            label: string;
            query: string;
      }[];
      error?: string;
};

export interface QueryResult {
      columns: string[]
      rows: Record<string, unknown>[]
      rowCount: number
      executionMs: number
}

export type Report = Record<string, any>