

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

export type Report = Record<string, any>

export type LineDatum = {
      label: string;
      value: number;
}
export interface QueryResult {
      columns: string[]
      rows: Record<string, unknown>[]
      rowCount: number
      executionMs: number,
      chartData?: {
            type: 'line'
            data: LineDatum[]
      }
}

export interface AIResponse {
      type: 'query' | 'suggestions' | 'error'
      sql?: string
      explanation?: string
      suggestions?: { label: string; query: string }[]
      error?: string,

      chart?: {
            type: 'line'
            title: string
            x: string   // column name for label
            y: string   // column name for value
      }

}

export interface HistoryItem {
      query: string
      timestamp: Date
}

export interface Suggestion {
      label: string
      query: string
}

export type SuggestionsStatus = 'idle' | 'loading' | 'done' | 'error'
