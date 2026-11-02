import type { WasiemasRecord, UserRecord } from '../types/database';
import type { WasiyyahState } from '../types/wasiyyah';

export interface NotificationEntry {
    channel: 'email' | 'sms';
    recipient: string;
    subject?: string;
    sent_at: string;
}

export const parseWasiyyahData = (value: WasiemasRecord['wasiyyah_data'] | string | null | undefined): WasiyyahState | null => {
    if (!value) return null;
    if (typeof value === 'string') {
        try {
            return JSON.parse(value) as WasiyyahState;
        } catch {
            return null;
        }
    }
    return value;
};

export const getWasiList = (data: WasiyyahState | null) =>
    (data?.wasi_list ?? []).filter((wasi) => wasi.name.trim() !== '');

export const getWarisList = (data: WasiyyahState | null) =>
    (data?.waris_list ?? []).filter((waris) => waris.name.trim() !== '');

export const getPrimaryWasi = (data: WasiyyahState | null) => getWasiList(data)[0] ?? null;

export const findWasiemasForReport = (
    reports: WasiemasRecord[],
    deceasedNric: string
): WasiemasRecord | null => {
    const normalized = deceasedNric.trim();
    if (!normalized) return null;
    return (
        reports.find((record) => record.pewasiat_nric === normalized) ??
        reports.find((record) => record.expand?.pewasiat_id?.nric_number === normalized) ??
        null
    );
};

export const toWasiProfile = (wasi: WasiyyahState['wasi_list'][number]) => ({
    full_name: wasi.name,
    email: wasi.email,
});

export const getWasiUsers = (record: WasiemasRecord | null | undefined): UserRecord[] => {
    if (!record?.expand?.wasi_ids) return [];
    return record.expand.wasi_ids;
};
