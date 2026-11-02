import { useEffect, useMemo, useState } from 'react';
import pb from '../lib/pocketbase';
import { useAuth } from '../context/AuthContext';
import type { DemiseReportRecord, WasiClaimRecord, WasiemasRecord } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertTriangle,
    CheckCircle,
    Eye,
    FileSearch,
    FileText,
    Loader2,
    Mail,
    Send,
    ShieldCheck,
    XCircle,
} from 'lucide-react';
import { emailService } from '@/lib/emailService';
import { openProtectedFile } from '@/lib/files';
import {
    findWasiemasForReport,
    getWarisList,
    parseWasiyyahData,
    type NotificationEntry,
} from '@/lib/wasiemas';

const formatDate = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('ms-MY');
};

export default function AdminClaimsDashboard() {
    const { user } = useAuth();
    const [demiseReports, setDemiseReports] = useState<DemiseReportRecord[]>([]);
    const [wasiClaims, setWasiClaims] = useState<WasiClaimRecord[]>([]);
    const [wasiemasList, setWasiemasList] = useState<WasiemasRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [notificationLog, setNotificationLog] = useState<NotificationEntry[]>([]);
    const [notificationTitle, setNotificationTitle] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [reports, claims, wasiemas] = await Promise.all([
                    pb.collection('demise_reports').getFullList({
                        filter: `status = "Pending Verification"`,
                        sort: '-created',
                        expand: 'wasiemas_id,wasi_id',
                    }),
                    pb.collection('wasi_claims').getFullList({
                        filter: `status = "Pending Review"`,
                        sort: '-created',
                        expand: 'wasi_id,demise_report_id,wasiemas_id,wasiemas_id.pewasiat_id',
                    }),
                    pb.collection('wasiemas').getFullList({
                        sort: '-created',
                        expand: 'pewasiat_id,wasi_ids',
                    }),
                ]);

                setDemiseReports(reports as unknown as DemiseReportRecord[]);
                setWasiClaims(claims as unknown as WasiClaimRecord[]);
                setWasiemasList(wasiemas as unknown as WasiemasRecord[]);
            } catch (err) {
                console.error('Failed to load admin claims', err);
                setError('Gagal memuatkan data admin. Sila semak sambungan PocketBase tempatan.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const matchedReports = useMemo(() => {
        return demiseReports.map((report) => {
            const matched = findWasiemasForReport(wasiemasList, report.deceased_nric);
            const data = parseWasiyyahData(matched?.wasiyyah_data);
            const wasi = data?.wasi_list?.[0];
            const linkedWasi = matched?.expand?.wasi_ids?.[0];
            return {
                report,
                matched,
                pewasiatName: matched?.expand?.pewasiat_id?.full_name ?? '-',
                wasiName: wasi?.name ?? linkedWasi?.full_name ?? '-',
                wasiNric: wasi?.nric ?? linkedWasi?.nric_number ?? '-',
                wasiEmail: wasi?.email ?? linkedWasi?.email ?? '-',
                wasiemasStatus: matched?.status ?? 'Tiada padanan',
            };
        });
    }, [demiseReports, wasiemasList]);

    const openFile = (record: DemiseReportRecord, field: string) => {
        void openProtectedFile(record, field);
    };

    const handleVerifyReport = async (report: DemiseReportRecord) => {
        const matched = findWasiemasForReport(wasiemasList, report.deceased_nric);
        const notes = window.prompt('Catatan pengesahan sijil kematian:', 'Sijil kematian disahkan.');
        if (notes === null) return;

        setProcessingId(report.id);
        try {
            const payload: Record<string, unknown> = {
                status: 'Verified',
                verified_at: new Date().toISOString(),
                verified_by: user?.id,
                verification_notes: notes,
            };
            if (matched) {
                payload.wasiemas_id = matched.id;
                if (matched.wasi_ids?.[0]) {
                    payload.wasi_id = matched.wasi_ids[0];
                }
            }
            await pb.collection('demise_reports').update(report.id, payload);
            setDemiseReports((current) => current.filter((item) => item.id !== report.id));
            alert('Sijil kematian disahkan. Wasi yang dilantik boleh meneruskan tuntutan.');
        } catch (err) {
            console.error('Verify report failed', err);
            alert('Gagal mengesahkan sijil kematian.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleRejectReport = async (report: DemiseReportRecord) => {
        const notes = window.prompt('Sebab penolakan / pemulangan laporan:', 'Dokumen tidak lengkap.');
        if (notes === null) return;

        setProcessingId(report.id);
        try {
            await pb.collection('demise_reports').update(report.id, {
                status: 'Rejected',
                verified_at: new Date().toISOString(),
                verified_by: user?.id,
                verification_notes: notes,
            });
            setDemiseReports((current) => current.filter((item) => item.id !== report.id));
            alert('Laporan kematian ditolak / dipulangkan.');
        } catch (err) {
            console.error('Reject report failed', err);
            alert('Gagal menolak laporan kematian.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReleaseClaim = async (claim: WasiClaimRecord) => {
        const notes = window.prompt(
            'Pengesahan fizikal IC Wasi. Masukkan catatan pegawai:',
            'IC fizikal disahkan di KAB Gold HQ.'
        );
        if (notes === null) return;

        const wasiemas = claim.expand?.wasiemas_id;
        const wasi = claim.expand?.wasi_id;
        const wasiyyahData = parseWasiyyahData(wasiemas?.wasiyyah_data);
        const warisList = getWarisList(wasiyyahData);
        const pewasiatName = wasiemas?.expand?.pewasiat_id?.full_name ?? 'Pewasiat';

        if (!wasi) {
            alert('Rekod Wasi tidak lengkap. Sila semak hubungan tuntutan.');
            return;
        }

        const appointedWasi = (wasiyyahData?.wasi_list ?? []).find(
            (item) =>
                (item.nric && item.nric === wasi.nric_number) ||
                (item.email && item.email.toLowerCase() === wasi.email.toLowerCase())
        );
        if (!appointedWasi) {
            alert('Wasi ini tidak sepadan dengan senarai Wasi yang dilantik dalam Wasi Emas.');
            return;
        }

        setProcessingId(claim.id);
        try {
            const entries = await emailService.sendWarisNotifications(
                warisList.map((waris) => ({
                    name: waris.name,
                    email: waris.email,
                    phone: waris.phone,
                })),
                {
                    full_name: wasi.full_name,
                    email: wasi.email,
                    phone: wasi.phone,
                },
                pewasiatName
            );

            const auditEntry = [
                claim.audit_log ?? '',
                `[${new Date().toISOString()}] Pengesahan fizikal IC oleh ${user?.full_name ?? 'Admin'}.`,
                `Aset dilepaskan kepada ${wasi.full_name} (${wasi.nric_number}).`,
                `Notifikasi waris: ${entries.length} saluran.`,
                `Catatan: ${notes}`,
            ]
                .filter(Boolean)
                .join('\n');

            await pb.collection('wasi_claims').update(claim.id, {
                status: 'Approved & Released',
                physical_verified_at: new Date().toISOString(),
                physical_verified_by: user?.id,
                physical_verification_notes: notes,
                audit_log: auditEntry,
                notification_log: entries,
            });

            setWasiClaims((current) => current.filter((item) => item.id !== claim.id));
            setNotificationLog(entries);
            setNotificationTitle(`Notifikasi waris untuk ${pewasiatName}`);
            alert('Aset dilepaskan kepada Wasi. Notifikasi waris telah direkodkan.');
        } catch (err) {
            console.error('Release claim failed', err);
            alert('Gagal merekodkan pelepasan aset.');
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Memuatkan data admin...
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-center text-destructive">{error}</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Pusat Kawalan Admin</h1>
                <p className="text-muted-foreground mt-2">
                    Sahkan laporan kematian, padankan dengan Wasi Emas, dan lepaskan aset selepas pengesahan fizikal.
                </p>
            </div>

            <Card className="border-border shadow-sm">
                <CardHeader className="bg-muted/30 border-b border-border pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        Langkah 1: Laporan Kematian Awam
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {matchedReports.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">Tiada laporan kematian menunggu pengesahan.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/10 text-muted-foreground border-b border-border">
                                    <tr>
                                        <th className="p-4">Laporan</th>
                                        <th className="p-4">Wasi Emas Sepadan</th>
                                        <th className="p-4">Wasi Dilantik</th>
                                        <th className="p-4 text-right">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {matchedReports.map(({ report, matched, pewasiatName, wasiName, wasiNric, wasiEmail, wasiemasStatus }) => (
                                        <tr key={report.id} className="hover:bg-accent/30 transition-colors align-top">
                                            <td className="p-4">
                                                <p className="font-semibold text-destructive">{report.deceased_nric}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {report.reporter_name} · {report.reporter_contact}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">{formatDate(report.created)}</p>
                                            </td>
                                            <td className="p-4">
                                                {matched ? (
                                                    <div className="space-y-1">
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            {matched.id}
                                                        </Badge>
                                                        <p className="text-xs text-muted-foreground">Pewasiat: {pewasiatName}</p>
                                                        <p className="text-xs text-muted-foreground">{wasiemasStatus}</p>
                                                    </div>
                                                ) : (
                                                    <Badge variant="destructive">Tiada padanan</Badge>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <p className="font-medium">{wasiName}</p>
                                                <p className="text-xs text-muted-foreground">{wasiNric}</p>
                                                <p className="text-xs text-muted-foreground">{wasiEmail}</p>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-2"
                                                        onClick={() => openFile(report, report.death_certificate)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        Sijil
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="gap-2 bg-amber-600 hover:bg-amber-700"
                                                        disabled={processingId === report.id}
                                                        onClick={() => handleVerifyReport(report)}
                                                    >
                                                        {processingId === report.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <FileSearch className="h-4 w-4" />
                                                        )}
                                                        Sahkan
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-2 text-destructive"
                                                        disabled={processingId === report.id}
                                                        onClick={() => handleRejectReport(report)}
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                        Tolak
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-sm ring-1 ring-primary/10">
                <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg text-primary">
                        <ShieldCheck className="h-5 w-5" />
                        Langkah 2: Tuntutan Wasi & Pelepasan Aset
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {wasiClaims.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            Tiada tuntutan Wasi menunggu pengesahan fizikal.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-primary/5 text-muted-foreground border-b border-primary/10">
                                    <tr>
                                        <th className="p-4">Wasi</th>
                                        <th className="p-4">Rujukan</th>
                                        <th className="p-4">Pengesahan</th>
                                        <th className="p-4 text-right">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {wasiClaims.map((claim) => {
                                        const report = claim.expand?.demise_report_id;
                                        const wasiemas = claim.expand?.wasiemas_id;
                                        const wasi = claim.expand?.wasi_id;
                                        return (
                                            <tr key={claim.id} className="hover:bg-primary/5 transition-colors align-top">
                                                <td className="p-4">
                                                    <p className="font-bold">{wasi?.full_name ?? '-'}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        IC: {wasi?.nric_number ?? '-'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{wasi?.email ?? '-'}</p>
                                                </td>
                                                <td className="p-4">
                                                    <p className="font-mono text-xs">{claim.id}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Wasi Emas: {wasiemas?.id ?? '-'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Pewasiat: {wasiemas?.expand?.pewasiat_id?.full_name ?? '-'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Kematian: {report?.deceased_nric ?? '-'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Pra-sahkan: {formatDate(claim.preverified_at)}
                                                    </p>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant="destructive" className="animate-pulse">
                                                        IC Fizikal Diperlukan
                                                    </Badge>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {report?.death_certificate && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="gap-1"
                                                                onClick={() => openFile(report, report.death_certificate)}
                                                            >
                                                                <FileText className="h-3 w-3" />
                                                                Sijil
                                                            </Button>
                                                        )}
                                                        {report?.wasi_ic && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="gap-1"
                                                                onClick={() => openFile(report, report.wasi_ic ?? '')}
                                                            >
                                                                <Eye className="h-3 w-3" />
                                                                IC Wasi
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex justify-end">
                                                        <Button
                                                            size="sm"
                                                            className="gap-2 bg-primary hover:bg-primary/90"
                                                            disabled={processingId === claim.id}
                                                            onClick={() => handleReleaseClaim(claim)}
                                                        >
                                                            {processingId === claim.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Send className="h-4 w-4" />
                                                            )}
                                                            Sahkan IC & Lepaskan
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

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
                                <li key={`${entry.recipient}-${entry.channel}-${index}`} className="p-4 flex items-start justify-between gap-4">
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

            <div className="text-xs text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Notifikasi dipaparkan sebagai log prototaip. Sambungan emel/SMS sebenar boleh dimasukkan kemudian.
            </div>
        </div>
    );
}
