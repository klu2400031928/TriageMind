export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Verdict = "AUTO_CLOSE" | "ESCALATE" | "NEEDS_HUMAN";
export type AnalystVerdict = "FALSE_POSITIVE" | "TRUE_POSITIVE" | "ESCALATE" | "AUTO_CLOSE" | "NEEDS_HUMAN";

export interface Alert {
  id: string;
  timestamp: string;
  source_ip?: string | null;
  source_port?: number | null;
  destination_ip?: string | null;
  destination_port?: number | null;
  hostname?: string | null;
  username?: string | null;
  asset?: string | null;
  environment?: string | null;
  severity: Severity;
  event_type: string;
  process?: string | null;
  tool?: string | null;
  aws_region?: string | null;
  cloudtrail_event?: string | null;
  description: string;
  triage?: {
    final_verdict: Verdict;
    confidence: number;
    memory_count: number;
    reasoning?: string;
  };
}

export interface MemoryMatch {
  id: string;
  text: string;
  relevance: number;
  verdict?: string | null;
  analyst?: string | null;
  date?: string | null;
  tags: string[];
}

export interface GuardrailResult {
  fired: string[];
  final_verdict: Verdict;
  overridden: boolean;
}

export interface TriageResult {
  alert_id: string;
  llm_verdict: Verdict;
  final_verdict: Verdict;
  confidence: number;
  severity: Severity;
  reasoning: string;
  key_evidence: string[];
  recommended_actions: string[];
  memory_matches: MemoryMatch[];
  memory_ids_used: string[];
  memory_summary: string[];
  guardrails: GuardrailResult;
  use_memory: boolean;
  pipeline_steps: string[];
}

export interface FeedbackRequest {
  alert_id: string;
  ai_verdict: string;
  analyst_verdict: AnalystVerdict;
  reason: string;
  analyst_name: string;
  notes?: string;
}

export interface FeedbackResponse {
  success: boolean;
  alert_id: string;
  override: boolean;
  memory_retained: boolean;
  operation_id?: string | null;
  message: string;
}

export interface LearningStats {
  alerts_processed: number;
  memory_matches: number;
  auto_triaged: number;
  human_reviews: number;
  escalated: number;
  analyst_overrides: number;
  auto_triage_rate: number;
  human_review_rate: number;
  memory_match_rate: number;
}
