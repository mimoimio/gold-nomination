import { useEffect, useState } from 'react';
import pb from '../lib/pocketbase';
import type { WasiemasRecord } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    CheckCircle,
    Clock,
    ExternalLink,
    FileSignature,
    Loader2,
    Mail,
    UploadCloud,
} from 'lucide-react';
import { emailService } from '@/lib/emailService';
import { openProtectedFile } from '@/lib/files';
import {
    getWarisList,
    getWasiList,
    parseWasiyyahData,
    type NotificationEntry,
} from '@/lib/wasiemas';

const formatDate = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('ms-MY');
};

export default function LegalFirmDashboard() {
    const [pendingDocuments, setPendingDocuments] = useState<WasiemasRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
    const [notificationLog, setNotificationLog] = useState<NotificationEntry[]>([]);
    const [notificationTitle, setNotificationTitle] = useState('');

    useEffect(() => {
        const fetchPendingDocuments = async () => {
            try {
                const records = await pb.collection('wasiemas').getFullList({
                    filter: `status = "Pending Verification" || status = "Processing LHDN"`,
                    expand: 'pewasiat_id,wasi_ids',
                    sort: '-created',
                });
                setPendingDocuments(records as unknown as WasiemasRecord[]);
            } catch (err) {
                console.error('Failed to load legal verification queue', err);
                setError('Gagal memuatkan baris gilir pengesahan undang-undang.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPendingDocuments();
    }, []);

    const handleTimestamp = async (record: WasiemasRecord) => {
        setProcessingId(record.id);
        try {
            await pb.collection('wasiemas').update(record.id, {
                status: 'Processing LHDN',
            });
            setPendingDocuments((current) =>
                current.map((item) => (item.id === record.id ? { ...item, status: 'Processing LHDN' } : item))
            );
            alert('Cap masa direkodkan. Dokumen kini menunggu pengecopan LHDN.');
        } catch (err) {
            console.error('Timestamp failed', err);
            alert('Gagal merekodkan cap masa.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleFinalUpload = async (record: WasiemasRecord) => {
        const file = selectedFiles[record.id];
        if (!file) {
            alert('Sila pilih dokumen LHDN yang telah dicop.');
            return;
        }

        const data = parseWasiyyahData(record.wasiyyah_data);
        const wasiList = getWasiList(data).map((wasi) => ({
            full_name: wasi.name,
            email: wasi.email,
            phone: wasi.phone,
        }));
        const pewasiat = record.expand?.pewasiat_id;

        setProcessingId(record.id);
        try {
            const entries = await emailService.sendActivationEmails(
                {
                    full_name: pewasiat?.full_name ?? 'Pewasiat',
                    email: pewasiat?.email ?? '',
                    phone: pewasiat?.phone,
                },
                wasiList,
                record.id
            );

            const formData = new FormData();
            formData.append('final_lhdn_pdf', file);
            formData.append('status', 'Active');
            formData.append('activated_at', new Date().toISOString());
            formData.append('notification_log', JSON.stringify(entries));

            await pb.collection('wasiemas').update(record.id, formData);

            setPendingDocuments((current) => current.filter((item) => item.id !== record.id));
            setNotificationLog(entries);
            setNotificationTitle(`Notifikasi pengaktifan ${record.id}`);
            alert('Dokumen LHDN dimuat naik. Wasi Emas kini aktif dan notifikasi telah direkodkan.');
        } catch (err) {
            console.error('Final LHDN upload failed', err);
            alert('Gagal memuat naik dokumen LHDN.');
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Memuatkan baris gilir pengesahan...
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-center text-destructive">{error}</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Pengesahan Firma Guaman</h1>
                <p className="text-muted-foreground mt-2">
                    Semak tandatangan saksi, rekod cap masa, dan muat naik dokumen yang telah dicop LHDN.
                </p>
            </div>

            {pendingDocuments.length === 0 ? (
                <Card className="border-border shadow-sm text-center py-12">
                    <CardContent>
                        <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                        <h3 className="text-lg font-medium">Baris Gilir Kosong</h3>
                        <p className="text-muted-foreground">
                            Tiada dokumen Wasi Emas menunggu pengesahan firma guaman.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {pendingDocuments.map((record) => {
                        const data = parseWasiyyahData(record.wasiyyah_data);
                        const wasiList = getWasiList(data);
                        const warisList = getWarisList(data);
                        const pewasiat = record.expand?.pewasiat_id;

                        return (
                            <Card key={record.id} className="border-primary/20 shadow-sm overflow-hidden">
                                <CardHeader className="bg-muted/30 border-b border-border pb-4">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                        <div>
                                            <CardTitle className="text-xl flex items-center gap-2">
                                                <FileSignature className="h-5 w-5 text-primary" />
                                                {pewasiat?.full_name ?? 'Pewasiat'}
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                NRIC: {record.pewasiat_nric ?? pewasiat?.nric_number ?? '-'} | Wasi Emas ID:{' '}
                                                {record.id}
                                            </CardDescription>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={
                                                record.status === 'Processing LHDN'
                                                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                                                    : 'bg-yellow-50 text-yellow-700 border-yellow-300'
                                            }
                                        >
                                            {record.status === 'Processing LHDN'
                                                ? 'Menunggu Cop LHDN'
                                                : 'Semakan Tandatangan'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Tarikh Dihantar</p>
                                            <p className="font-medium">{formatDate(record.created)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Wasi Dilantik</p>
                                            <p className="font-medium">
                                                {wasiList.length > 0
                                                    ? wasiList.map((wasi) => wasi.name).join(', ')
                                                    : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Bilangan Waris</p>
                                            <p className="font-medium">{warisList.length}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            variant="outline"
                                            className="gap-2"
                                            onClick={() => openProtectedFile(record, record.signed_document_pdf)}
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            Lihat Dokumen Ditandatangani
                                        </Button>
                                    </div>

                                    {record.status === 'Pending Verification' ? (
                                        <div className="flex justify-end pt-4 border-t border-border">
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleTimestamp(record)}
                                                disabled={processingId === record.id}
                                                className="gap-2"
                                            >
                                                {processingId === record.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Clock className="h-4 w-4" />
                                                )}
                                                Rekod Cap Masa
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 pt-4 border-t border-border">
                                            <label className="text-sm font-medium text-foreground">
                                                Muat naik dokumen LHDN yang telah dicop
                                            </label>
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
                                                onChange={(event) =>
                                                    setSelectedFiles((current) => ({
                                                        ...current,
                                                        [record.id]: event.target.files?.[0] ?? null,
                                                    }))
                                                }
                                            />
                                            <div className="flex justify-end">
                                                <Button
                                                    onClick={() => handleFinalUpload(record)}
                                                    disabled={
                                                        processingId === record.id || !selectedFiles[record.id]
                                                    }
                                                    className="gap-2 bg-primary hover:bg-primary/90"
                                                >
                                                    {processingId === record.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <UploadCloud className="h-4 w-4" />
                                                    )}
                                                    Muat Naik & Aktifkan
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {notificationLog.length > 0 && (
                <Card className="border-emerald-600/20 shadow-sm">
                    <CardHeader className="bg-emerald-50/50 border-b border-emerald-600/10 pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg text-emerald-800">
                            <Mail className="h-5 w-5" />
                            {notificationTitle}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ul className="divide-y divide-border">
                            {notificationLog.map((entry, index) => (
                                <li
                                    key={`${entry.recipient}-${entry.channel}-${index}`}
                                    className="p-4 flex items-start justify-between gap-4"
                                >
                                    <div>
                                        <p className="font-medium">{entry.recipient}</p>
                                        <p className="text-xs text-muted-foreground">{entry.subject}</p>
                                    </div>
                                    <Badge variant="outline" className="uppercase">
                                        {entry.channel}
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
