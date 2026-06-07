export interface ExamSeason {
    id: number;
    name: string;
    code: string;
    description: string | null;
    exam_mode: string;
    combo_settings: Record<string, any> | null;
    starts_at: string | null;
    ends_at: string | null;
    logout_grace_minutes: number;
    status: string;
    allow_result_review: boolean;
    created_at: string;
    updated_at: string;
}

export interface Subject {
    id: number;
    exam_season_id: number;
    name: string;
    code: string;
    duration_minutes: number;
    questions_per_page: number;
    total_questions_to_display?: number;
    pass_mark: number;
    instructions?: string;
    allocation_criteria?: Record<string, string>;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Candidate {
    id: number;
    file_no: string;
    name: string;
    telephone: string;
    email?: string;
    gender?: string;
    department?: string;
    level?: string;
    photo?: string;
    exam_season_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface QuestionOption {
    id: number;
    question_id: number;
    option_label: string; // A, B, C, D
    option_text: string;
    is_correct: boolean;
}

export interface Question {
    id: number;
    subject_id: number;
    question_text: string;
    question_type: string;
    image_path?: string;
    marks: number;
    options?: QuestionOption[]; // Injected via relations
}

export interface CandidateExamSession {
    id: number;
    candidate_id: number;
    subject_id: number;
    status: 'pending' | 'active' | 'completed';
    started_at?: string;
    expires_at?: string;
    completed_at?: string;
    question_order?: number[];
    score?: number;
    passed?: boolean;
}

export interface DeviceSession {
    id: number;
    candidate_id: number;
    device_fingerprint: string;
    ip_address: string;
    user_agent: string;
    last_active_at: string;
    is_locked: boolean;
}
