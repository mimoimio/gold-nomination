import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../lib/pocketbase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertTriangle,
    BadgeCheck,
    FileSearch,
    HandCoins,
    ShieldCheck,
    Users,
} from 'lucide-react';

interface OverviewCounts {
    pendingDeathReports: number;
    pendingLegal: number;
    activeWasiemas: number;
    pendingClaims: number;
    pendingFees: number;
    totalUsers: number;
}

const initialCounts: OverviewCounts = {
    pendingDeathReports: 0,
    pendingLegal: 0,
    activeWasiemas: 0,
    pendingClaims: 0,
    pendingFees: 0,
    totalUsers: 0,
};

export default function AdminOverview() {
    const navigate = useNavigate();
    const [counts, setCounts] = useState<OverviewCounts>(initialCounts);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [reports, legal, active, claims, fees, users] = await Promise.all([
                    pb.collection('demise_reports').getList(1, 1, {
                        filter: `status = "Pending Verification"`,
                    }),
                    pb.collection('wasiemas').getList(1, 1, {
                        filter: `status = "Pending Verification"`,
                    }),
                    pb.collection('wasiemas').getList(1, 1, {
                        filter: `status = "Active"`,
                    }),
                    pb.collection('wasi_claims').getList(1, 1, {
                        filter: `status = "Pending Review"`,
                    }),
                    pb.collection('wasiemas').getList(1, 1, {
                        filter: `status = "Active" && fee_deducted = false`,
                    }),
                    pb.collection('users').getList(1, 1),
                ]);

                setCounts({
                    pendingDeathReports: reports.totalItems,
                    pendingLegal: legal.totalItems,
                    activeWasiemas: active.totalItems,
                    pendingClaims: claims.totalItems,
                    pendingFees: fees.totalItems,
                    totalUsers: users.totalItems,
                });
            } catch (err) {
                console.error('Failed to load admin overview', err);
                setError('Gagal memuatkan ringkasan admin.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCounts();
    }, []);

    const cards = [
        {
            title: 'Laporan Kematian',
            value: counts.pendingDeathReports,
            description: 'Menunggu pengesahan sijil kematian.',
            icon: AlertTriangle,
            path: '/admin/claims',
            tone: 'text-amber-600',
        },
        {
            title: 'Pengesahan Undang-Undang',
            value: counts.pendingLegal,
            description: 'Wasi Emas menunggu semakan dan cap LHDN.',
            icon: FileSearch,
            path: '/admin/legal-verification',
            tone: 'text-blue-600',
        },
        {
            title: 'Wasi Emas Aktif',
            value: counts.activeWasiemas,
            description: 'Dokumen aktif dalam simpanan KAB Gold.',
            icon: ShieldCheck,
            path: '/admin/reports',
            tone: 'text-emerald-600',
        },
        {
            title: 'Tuntutan Wasi',
            value: counts.pendingClaims,
            description: 'Menunggu pengesahan fizikal dan pelepasan aset.',
            icon: BadgeCheck,
            path: '/admin/claims',
            tone: 'text-violet-600',
        },
        {
            title: 'Potongan Yuran',
            value: counts.pendingFees,
            description: 'Wasi Emas aktif yang belum ditolak yuran.',
            icon: HandCoins,
            path: '/admin/fee-reporting',
            tone: 'text-yellow-600',
        },
        {
            title: 'Pengguna Berdaftar',
            value: counts.totalUsers,
            description: 'Jumlah akaun dalam sistem.',
            icon: Users,
            path: '/admin/maintenance',
            tone: 'text-slate-600',
        },
    ];

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Memuatkan papan pemuka admin...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-destructive">{error}</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Papan Pemuka Admin</h1>
                <p className="text-muted-foreground mt-2">
                    Ringkasan operasi Wasi Emas, pengesahan kematian, pelepasan aset, dan potongan yuran.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Card key={card.title} className="border-border shadow-sm">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <CardTitle className="text-base">{card.title}</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                                    </div>
                                    <Icon className={`h-6 w-6 shrink-0 ${card.tone}`} />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-4xl font-bold text-foreground">{card.value}</p>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => navigate(card.path)}
                                >
                                    Buka
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
