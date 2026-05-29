// src/types/database.ts

export interface UserRecord {
    id: string;
    email: string;
    full_name: string;
    nric_number: string;
    total_gold_balance: number;
    verified: boolean;
    role: 'investor' | 'admin';
    created?: string;
    updated?: string;
}

export interface NominationRecord {
    id: string;
    user_id: string; // Relation to UserRecord
    nominee_name: string;
    nominee_nric: string;
    relationship: 'Spouse' | 'Child' | 'Parent' | 'Sibling' | 'Other';
    allocation_percentage: number;
    role_type: 'Hibah' | 'Pentadbir';
    status: 'Pending' | 'Active' | 'Revoked';
    created?: string;
    updated?: string;
    expand?: {
        user_id?: UserRecord;
    };
}

export interface ClaimRecord {
    id: string;
    deceased_user_id: string; // Relation to UserRecord
    reporter_name: string;
    death_certificate: string; // PocketBase filename string
    status: 'Pending' | 'Approved' | 'Rejected' | 'Manual Intervention';
    audit_log?: string; // Stores the permanent Shariah execution distribution log
    created?: string;
    updated?: string;
    expand?: {
        deceased_user_id?: UserRecord;
    };
}