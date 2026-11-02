import { useEffect, useMemo, useState } from 'react';
import pb from '../lib/pocketbase';
import type { WasiemasRecord } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
    'Pending Verification': 'Menunggu Pengesahan',
    'Processing LHDN': 'Proses LHDN',
    Active: 'Aktif',
    Revoked: 'Dibatalkan',
};

const monthKey = (value?: string) => {
    if (!value) return 'Tiada Tarikh';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Tiada Tarikh';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export default function AdminReports() {
    const [records, setRecords] = useState<WasiemasRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const items = await pb.collection('wasiemas').getFullList({
                    sort: '-created',
                    expand: 'pewasiat_id',
                });
                setRecords(items as unknown as WasiemasRecord[]);
            } catch (err) {
                console.error('Failed to load reports', err);
                setError('Gagal memuatkan laporan Wasi Emas.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecords();
    }, []);

    const statusCounts = useMemo(() => {
        return records.reduce<Record<string, number>>((counts, record) => {
            counts[record.status] = (counts[record.status] ?? 0) + 1;
            return counts;
        }, {});
    }, [records]);

    const monthlyActivations = useMemo(() => {
        const months = new Map<string, number>();
        records
            .filter((record) => record.status === 'Active')
            .forEach((record) => {
                const key = monthKey(record.activated_at ?? record.updated ?? record.created);
                months.set(key, (months.get(key) ?? 0) + 1);
            });
        return [...months.entries()].sort((a, b) => b[0].localeCompare(a[0]));
    }, [records]);

    const exportCsv = () => {
        const header = ['ID', 'Pewasiat', 'NRIC', 'Status', 'Tarikh Aktif', 'Fi Ditolak'];
        const rows = records.map((record) => [
            record.id,
            record.expand?.pewasiat_id?.full_name ?? '',
            record.pewasiat_nric ?? record.expand?.pewasiat_id?.nric_number ?? '',
            STATUS_LABELS[record.status] ?? record.status,
            record.activated_at ?? '',
            record.fee_deducted ? 'Ya' : 'Tidak',
        ]);
        const csv = [header, ...rows]
            .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
            .join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `laporan-wasi-emas-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Memuatkan laporan...
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-center text-destructive">{error}</div>;
    }

    const total = records.length;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Laporan Wasi Emas</h1>
                    <p className="text-muted-foreground mt-2">
                        Ringkasan status, pengaktifan bulanan, dan eksport untuk tujuan fi serta rekod KAB Gold.
                    </p>
                </div>
                <Button onClick={exportCsv} className="gap-2">
                    <Download className="h-4 w-4" />
                    Eksport CSV
                </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-5">
                        <p className="text-sm text-muted-foreground">Jumlah</p>
                        <p className="text-3xl font-bold mt-1">{total}</p>
                    </CardContent>
                </Card>
                {Object.entries(STATUS_LABELS).map(([status, label]) => (
                    <Card key={status}>
                        <CardContent className="p-5">
                            <p className="text-sm text-muted-foreground">{label}</p>
                            <p className="text-3xl font-bold mt-1">{statusCounts[status] ?? 0}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5 text-primary" />
                        Pengaktifan Bulanan
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {monthlyActivations.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">Tiada Wasi Emas aktif lagi.</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/30 text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="p-4">Bulan</th>
                                    <th className="p-4 text-right">Bilangan Aktif</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {monthlyActivations.map(([month, count]) => (
                                    <tr key={month}>
                                        <td className="p-4 font-medium">{month}</td>
                                        <td className="p-4 text-right font-bold">{count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Senarai Wasi Emas</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/30 text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="p-4">ID</th>
                                    <th className="p-4">Pewasiat</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Tarikh Aktif</th>
                                    <th className="p-4 text-right">Fi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {records.map((record) => (
                                    <tr key={record.id}>
                                        <td className="p-4 font-mono text-xs">{record.id}</td>
                                        <td className="p-4">
                                            <p className="font-medium">{record.expand?.pewasiat_id?.full_name ?? '-'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {record.pewasiat_nric ?? record.expand?.pewasiat_id?.nric_number ?? '-'}
                                            </p>
                                        </td>
                                        <td className="p-4">{STATUS_LABELS[record.status] ?? record.status}</td>
                                        <td className="p-4">
                                            {record.activated_at
                                                ? new Date(record.activated_at).toLocaleDateString('ms-MY')
                                                : '-'}
                                        </td>
                                        <td className="p-4 text-right">{record.fee_deducted ? 'Selesai' : 'Belum'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
