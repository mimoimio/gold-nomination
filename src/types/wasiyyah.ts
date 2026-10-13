// src/types/wasiyyah.ts

export interface WasiyyahState {
    // Step 1: Pewasiat[cite: 4]
    pewasiat: {
        release_type: 'Wasi Emas' | 'Hibah Emas' | 'Waqf' | '';
        use_yusuf_advisory: boolean;
    };

    // Step 2: Wasi (Up to 3 slots)[cite: 4]
    wasi_list: Array<{
        name: string;
        nric: string;
        phone: string;
        email: string;
        address: string;
        relationship: string;
    }>;
    wasi_execution: 'Serentak' | 'Berturutan' | '';

    // Step 3: Aset[cite: 4]
    aset: {
        uncang_emas: boolean; // Will be hardcoded to true
        other_assets: boolean;
    };

    // Step 4: Waris[cite: 4]
    waris_list: Array<{
        name: string;
        nric: string;
        relationship: string;
        address: string;
    }>;

    // Step 5: Tugasan Wasi (Matrix mapping duties to Wasi indexes)[cite: 4]
    duties: {
        hold_HibahEmas: number[]; // e.g., [0, 1] means Wasi 1 and 2
        apply_probate: number[];
        update_info: number[];
        pay_debts: number[];
        faraid_distribution: number[];
        child_guardian: number[];
    };

    // Step 6: Saksi (Up to 4 slots)[cite: 4]
    saksi_list: Array<{
        name: string;
        nric: string;
        address: string;
    }>;
}