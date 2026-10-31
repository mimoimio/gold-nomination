// src/lib/emailService.ts

/**
 * Utility to handle automated email dispatches for the Wasiemas workflow.
 * For the prototype, this simulates network requests and logs the email templates.
 */

interface UserProfile {
    full_name: string;
    email: string;
    nric_number?: string;
}

interface WarisProfile {
    name: string;
    email: string;
    phone: string;
}

export const emailService = {
    /**
     * Phase 1: Sent when the Legal Firm uploads the LHDN stamped Wasiemas document.
     */
    async sendActivationEmails(pewasiat: UserProfile, wasiList: UserProfile[], wasiemasId: string) {
        console.log("=== [EMAIL SERVICE: ACTIVATION PHASE] ===");

        // 1. Email to Pewasiat
        console.log(`[SENDING TO PEWASIAT] -> ${pewasiat.email}`);
        console.log(`Subject: Wasiemas Teraktif (ID: ${wasiemasId})`);
        console.log(`Body: Salam ${pewasiat.full_name}, dokumen Wasiemas anda telah disahkan dan dicop LHDN. Ia kini aktif dan selamat disimpan dalam awan KAB Gold.`);

        // 2. Email to all appointed Wasi
        wasiList.forEach(wasi => {
            console.log(`[SENDING TO WASI] -> ${wasi.email}`);
            console.log(`Subject: Pelantikan Wasi (ID: ${wasiemasId})`);
            console.log(`Body: Salam ${wasi.full_name}, anda telah dilantik sebagai Wasi (Pemegang Amanah) oleh ${pewasiat.full_name}. Sila simpan emel ini. Jika berlaku kematian, anda boleh membuat laporan dan tuntutan melalui portal KAB Gold.`);
        });

        console.log("=========================================");
        return Promise.resolve(true);
    },

    /**
     * Phase 2: Sent when the KAB Gold Admin physically verifies the Wasi and releases the gold.
     */
    async sendWarisNotifications(warisList: WarisProfile[], wasi: UserProfile, pewasiatName: string) {
        console.log("=== [EMAIL SERVICE: EXECUTION PHASE] ===");

        warisList.forEach(waris => {
            console.log(`[SENDING TO WARIS] -> ${waris.email} / SMS: ${waris.phone}`);
            console.log(`Subject: Makluman Pelaksanaan Wasiemas - ${pewasiatName}`);
            console.log(`Body: Salam ${waris.name}, dimaklumkan bahawa uncang emas peninggalan arwah ${pewasiatName} telah diserahkan kepada Wasi yang dilantik, iaitu ${wasi.full_name}, untuk ditadbir dan diagihkan. Sila berhubung dengan Wasi untuk urusan agihan harta.`);
        });

        console.log("=========================================");
        return Promise.resolve(true);
    }
};