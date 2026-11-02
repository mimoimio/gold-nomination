import type { NotificationEntry } from './wasiemas';

interface UserProfile {
    full_name: string;
    email: string;
    phone?: string;
    nric_number?: string;
}

interface WarisProfile {
    name: string;
    email: string;
    phone: string;
}

const notification = (
    channel: NotificationEntry['channel'],
    recipient: string,
    subject: string
): NotificationEntry => ({
    channel,
    recipient,
    subject,
    sent_at: new Date().toISOString(),
});

export const emailService = {
    async sendActivationEmails(
        pewasiat: UserProfile,
        wasiList: UserProfile[],
        wasiemasId: string
    ): Promise<NotificationEntry[]> {
        const entries: NotificationEntry[] = [];
        const pewasiatSubject = `Wasi Emas Teraktif (${wasiemasId})`;

        console.log('=== [EMAIL SERVICE: ACTIVATION PHASE] ===');
        if (pewasiat.email) {
            console.log(`[SENDING TO PEWASIAT] -> ${pewasiat.email}`);
            console.log(`Subject: ${pewasiatSubject}`);
            console.log(
                `Body: Salam ${pewasiat.full_name}, dokumen Wasi Emas anda telah disahkan dan dicop LHDN. Ia kini aktif dan selamat disimpan dalam awan KAB Gold.`
            );
            entries.push(notification('email', pewasiat.email, pewasiatSubject));
        }

        wasiList.forEach((wasi) => {
            if (!wasi.email) return;
            const subject = `Pelantikan Wasi (${wasiemasId})`;
            console.log(`[SENDING TO WASI] -> ${wasi.email}`);
            console.log(`Subject: ${subject}`);
            console.log(
                `Body: Salam ${wasi.full_name}, anda telah dilantik sebagai Wasi (Pemegang Amanah) oleh ${pewasiat.full_name}. Sila simpan emel ini. Jika berlaku kematian, anda boleh membuat laporan dan tuntutan melalui portal KAB Gold.`
            );
            entries.push(notification('email', wasi.email, subject));
        });

        console.log('=========================================');
        return entries;
    },

    async sendWarisNotifications(
        warisList: WarisProfile[],
        wasi: UserProfile,
        pewasiatName: string
    ): Promise<NotificationEntry[]> {
        const entries: NotificationEntry[] = [];
        const subject = `Makluman Pelaksanaan Wasi Emas - ${pewasiatName}`;

        console.log('=== [EMAIL SERVICE: EXECUTION PHASE] ===');
        warisList.forEach((waris) => {
            console.log(`[SENDING TO WARIS] -> ${waris.email} / SMS: ${waris.phone}`);
            console.log(`Subject: ${subject}`);
            console.log(
                `Body: Salam ${waris.name}, dimaklumkan bahawa uncang emas peninggalan arwah ${pewasiatName} telah diserahkan kepada Wasi yang dilantik, iaitu ${wasi.full_name}, untuk ditadbir dan diagihkan. Sila berhubung dengan Wasi untuk urusan agihan harta.`
            );
            if (waris.email) {
                entries.push(notification('email', waris.email, subject));
            }
            if (waris.phone) {
                entries.push(notification('sms', waris.phone, subject));
            }
        });

        console.log('=========================================');
        return entries;
    },
};
