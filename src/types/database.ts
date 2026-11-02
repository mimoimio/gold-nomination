// src/types/database.ts

import type { WasiyyahState } from './wasiyyah';

export interface UserRecord {
    id: string;
    email: string;
    full_name: string;
    nric_number: string;
    total_gold_balance: number;
    verified: boolean;
    role: 'pewasiat' | 'wasi' | 'admin';
    phone?: string;
    address?: string;
    created?: string;
    updated?: string;
}

export interface WasiemasRecord {
    id: string;
    pewasiat_id: string;
    pewasiat_nric?: string;
    wasi_ids?: string[];
    wasiyyah_data: WasiyyahState;
    signed_document_pdf: string;
    final_lhdn_pdf?: string;
    status: 'Pending Verification' | 'Processing LHDN' | 'Active' | 'Revoked';
    fee_deducted?: boolean;
    fee_amount?: number;
    fee_deducted_at?: string;
    fee_deducted_by?: string;
    activated_at?: string;
    notification_log?: Array<{
        channel: 'email' | 'sms';
        recipient: string;
        subject?: string;
        sent_at: string;
    }>;
    created?: string;
    updated?: string;
    expand?: {
        pewasiat_id?: UserRecord;
        wasi_ids?: UserRecord[];
        fee_deducted_by?: UserRecord;
    };
}

export interface DemiseReportRecord {
    id: string;
    deceased_nric: string;
    reporter_name: string;
    reporter_contact: string;
    death_certificate: string;
    wasi_ic?: string;
    wasiemas_id?: string;
    wasi_id?: string;
    status: 'Pending Verification' | 'Verified' | 'Rejected';
    verified_at?: string;
    verified_by?: string;
    verification_notes?: string;
    created?: string;
    updated?: string;
    expand?: {
        wasiemas_id?: WasiemasRecord;
        wasi_id?: UserRecord;
        verified_by?: UserRecord;
    };
}

export interface WasiClaimRecord {
    id: string;
    wasi_id: string;
    demise_report_id: string;
    wasiemas_id: string;
    status: 'Pending Review' | 'Approved & Released' | 'Rejected';
    preverified_at?: string;
    physical_verified_at?: string;
    physical_verified_by?: string;
    physical_verification_notes?: string;
    audit_log?: string;
    notification_log?: Array<{
        channel: 'email' | 'sms';
        recipient: string;
        subject?: string;
        sent_at: string;
    }>;
    created?: string;
    updated?: string;
    expand?: {
        wasi_id?: UserRecord;
        demise_report_id?: DemiseReportRecord;
        wasiemas_id?: WasiemasRecord;
        physical_verified_by?: UserRecord;
    };
}
