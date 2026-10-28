// src/types/wasiyyah.ts

export interface WasiyyahState {
    // Step 1: Pewasiat
    pewasiat: {
        release_type: 'Wasi Emas' | 'Hibah Emas' | 'Waqf' | '';
        use_yusuf_advisory: boolean;
    };

    // Step 2: Wasi (Up to 3 slots)
    wasi_list: Array<{
        name: string;
        nric: string;
        phone: string;
        email: string;
        address: string;
        relationship: string;
    }>;
    wasi_execution: 'Serentak' | 'Berturutan' | '';

    // Step 3: Aset
    aset: {
        uncang_emas: boolean;
        other_assets: boolean;
    };

    // Step 4: Waris (UPDATED WITH EMAIL & PHONE)
    waris_list: Array<{
        name: string;
        nric: string;
        relationship: string;
        address: string;
        email: string; // Added
        phone: string; // Added[cite: 2]
    }>;

    // Step 5: Tugasan Wasi 
    duties: {
        hold_HibahEmas: number[];
        apply_probate: number[];
        update_info: number[];
        pay_debts: number[];
        faraid_distribution: number[];
        child_guardian: number[];
    };

    // Step 6: Saksi 
    saksi_list: Array<{
        name: string;
        nric: string;
        address: string;
    }>;
}