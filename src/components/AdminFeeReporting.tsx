import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../lib/pocketbase';
import { useAuth } from '../context/AuthContext';
import type { WasiemasRecord } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileBarChart, Loader2, Receipt, Wallet } from 'lucide-react';

const formatDate = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('ms-MY');
};

export default function AdminFeeReporting() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeRegistrations, setActiveRegistrations] = useState<WasiemasRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const records = await pb.collection('wasiemas').getFullList({
                    filter: `status = "Active" && fee_deducted = false`,
                    expand: 'pewasiat_id',
                    sort: '-updated',
                });
                setActiveRegistrations(records as unknown as WasiemasRecord[]);
            } catch (err) {
                console.error('Failed to load fee reporting', err);
                setError('Gagal memuatkan senarai potongan yuran.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRegistrations();
    }, []);

    const handleMarkDeducted = async (record: WasiemasRecord) => {
        if (!window.confirm(`Tandakan fi untuk ${record.expand?.pewasiat_id?.full_name ?? record.id} sebagai telah ditolak?`)) {
            return;
        }

        setProcessingId(record.id);
        try {
            await pb.collection('wasiemas').update(record.id, {
                fee_deducted: true,
                fee_deducted_at: new Date().toISOString(),
                fee_deducted_by: user?.id,
            });
            setActiveRegistrations((current) => current.filter((item) => item.id !== record.id));
            alert('Fi ditandakan sebagai telah ditolak. Rekod dikemas kini untuk laporan KAB Gold.');
        } catch (err) {
            console.error('Failed to mark fee deducted', err);
            alert('Gagal mengemas kini statusyuran');
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Memuatkan laporanyuran..
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-center text-destructive">{error}</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Potongan Yuran Wasi Emas</h1>
                    <p className="text-muted-foreground mt-2">
                        Senarai Wasi Emas aktif yang belum ditolakyuran KAB Gold boleh menggunakan laporan bulanan untuk
                        proses potongan dalam sistem mereka.
                    </p>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => navigate('/admin/reports')}>
                    <FileBarChart className="h-4 w-4" />
                    Laporan Bulanan
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-5">
                        <p className="text-sm text-muted-foreground">Menunggu Potongan</p>
                        <p className="text-3xl font-bold mt-1">{activeRegistrations.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5">
                        <p className="text-sm text-muted-foreground">Jumlah Anggaran Fi</p>
                        <p className="text-3xl font-bold mt-1">
                            {activeRegistrations.reduce((sum, record) => sum + (record.fee_amount ?? 0), 0) > 0
                                ? `RM ${activeRegistrations
                                    .reduce((sum, record) => sum + (record.fee_amount ?? 0), 0)
                                    .toFixed(2)}`
                                : 'Belum ditetapkan'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5">
                        <p className="text-sm text-muted-foreground">Kaedah</p>
                        <p className="text-lg font-semibold mt-1">Laporan / Potongan Manual</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border shadow-sm">
                <CardHeader className="bg-muted/30 border-b border-border pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Wallet className="h-5 w-5 text-yellow-600" />
                        Wasi Emas Aktif Menunggu Fi
                    </CardTitle>
                    <CardDescription>
                        Rekod ini telah diaktifkan oleh firma guaman dan belum ditandakan sebagai telah ditolakyuran
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {activeRegistrations.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">Tiada potongan yuran tertunggak.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/10 text-muted-foreground border-b border-border">
                                    <tr>
                                        <th className="p-4">Wasi Emas ID</th>
                                        <th className="p-4">Pewasiat</th>
                                        <th className="p-4">Tarikh Aktif</th>
                                        <th className="p-4">Fi</th>
                                        <th className="p-4 text-right">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {activeRegistrations.map((record) => (
                                        <tr key={record.id} className="hover:bg-accent/30 transition-colors">
                                            <td className="p-4 font-mono text-xs">{record.id}</td>
                                            <td className="p-4">
                                                <p className="font-bold">{record.expand?.pewasiat_id?.full_name ?? '-'}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    IC: {record.pewasiat_nric ?? record.expand?.pewasiat_id?.nric_number ?? '-'}
                                                </p>
                                            </td>
                                            <td className="p-4">{formatDate(record.activated_at ?? record.updated)}</td>
                                            <td className="p-4">
                                                {record.fee_amount
                                                    ? `RM ${record.fee_amount.toFixed(2)}`
                                                    : 'Belum ditetapkan'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleMarkDeducted(record)}
                                                    disabled={processingId === record.id}
                                                    className="gap-2 bg-yellow-600 hover:bg-yellow-700"
                                                >
                                                    {processingId === record.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Receipt className="h-4 w-4" />
                                                    )}
                                                    Tanda Fi Ditolak
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
