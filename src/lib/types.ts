export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: string;
  user_id: string;
  title: string | null;
  status: "em_andamento" | "concluido";
  identifier_label: string | null;
  identifier_value: string | null;
  sector: string | null;
  brand_type: string | null;
  current_stage: string | null;
  synthesis: InterviewSynthesis | null;
  created_at: string;
  updated_at: string;
}

export interface InterviewSynthesis {
  brand_key?: Record<string, string>;
  positioning_statement?: string;
  variations?: {
    precise?: string;
    bold?: string;
    premium?: string;
  };
  uvp?: string;
  decisions?: Record<string, string>;
  continuity_summary?: Record<string, string>;
}

export interface InterviewMessage {
  id: string;
  interview_id: string;
  role: "user" | "model";
  content: string;
  created_at: string;
}

export interface BatchJob {
  id: string;
  user_id: string;
  title: string | null;
  prompt: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}

export interface BatchItem {
  id: string;
  batch_job_id: string;
  row_index: number;
  question: string;
  answer: string;
  processed_answer: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
}
