import pb from './pocketbase';

export const openProtectedFile = async (record: object, filename?: string) => {
    if (!filename) return;
    const token = await pb.files.getToken();
    const fileRecord = record as unknown as Record<string, string | undefined>;
    const url = pb.files.getURL(fileRecord, filename, { token });
    window.open(url, '_blank');
};
