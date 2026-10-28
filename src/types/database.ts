// src/types/database.ts

import type { WasiyyahState } from './wasiyyah';

export interface UserRecord {
    id: string;
    email: string;
    full_name: string;
    nric_number: string;
    total_gold_balance: number;
    verified: boolean;
    // Updated roles: 'investor' becomes 'pewasiat', 'wasi' is added for the administrators.
    role: 'pewasiat' | 'wasi' | 'admin';
    created?: string;
    updated?: string;
}

// Replaces the old NominationRecord. Stores the comprehensive 7-step wizard data.
export interface WasiemasRecord {
    id: string;
    pewasiat_id: string; // Relation to UserRecord (role: pewasiat)
    wasiyyah_data: WasiyyahState; // Stores the entire JSON payload from the 7-step form
    signed_document_pdf: string; // The uploaded physical document file name
    status: 'Pending Verification' | 'Active' | 'Revoked';
    created?: string;
    updated?: string;
    expand?: {
        pewasiat_id?: UserRecord;
    };
}

// Public/Open reporting table. Requires NO user login.
export interface DemiseReportRecord {
    id: string;
    deceased_nric: string; // Search key to locate the Pewasiat
    reporter_name: string;
    reporter_contact: string;
    death_certificate: string; // Uploaded file
    status: 'Pending Verification' | 'Verified' | 'Rejected'; // Admin updates this
    created?: string;
    updated?: string;
}

// Secured claiming table. Requires Wasi login.
export interface WasiClaimRecord {
    id: string;
    wasi_id: string; // Relation to UserRecord (role: wasi)
    demise_report_id: string; // Relation to the verified DemiseReportRecord
    wasiemas_id: string; // Relation to the governing WasiemasRecord
    status: 'Pending Review' | 'Approved & Released' | 'Rejected';
    audit_log?: string;
    created?: string;
    updated?: string;
    expand?: {
        wasi_id?: UserRecord;
        demise_report_id?: DemiseReportRecord;
        wasiemas_id?: WasiemasRecord;
    };
}