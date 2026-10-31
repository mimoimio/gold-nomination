// src/components/AdminFeeReporting.tsx
import { useEffect, useState } from 'react';
import pb from '../lib/pocketbase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Wallet, Loader2 } from "lucide-react";

export default function AdminFeeReporting() {
    const [activeRegistrations, setActiveRegistrations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            // Fetch Wasiemas that are Active but fees haven't been marked as deducted
            // Note: You'll need to add a 'fee_deducted' boolean to your wasiemas collection in PocketBase
            const records = await pb.collection('wasiemas').getFullList({
                filter: `status = "Active" && fee_deducted = false`,
                expand: 'pewasiat_id',
                sort: '-updated',
            });
            setActiveRegistrations(records);
        } catch (error) {
            console.warn("Using fallback demo data for Fee Reporting");
            setActiveRegistrations([{
                id: "WEMAS-777",
                status: "Active",
                fee_deducted: false,
                updated: new Date().toISOString(),
                expand: { pewasiat_id: { full_name: "Ahmad Zaha", nric_number: "840510-14-5566" } }
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkDeducted = async (id: string) => {
        setProcessingId(id);
        try {
            await pb.collection('wasiemas').update(id, { fee_deducted: true });
            setActiveRegistrations(prev => prev.filter(reg => reg.id !== id));
            alert("Fee successfully marked as deducted from the user's gold vault.");
        } catch (error) {
            alert("Fee deduction simulated for demo.");
            setActiveRegistrations(prev => prev.filter(reg => reg.id !== id));
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading Fee Reports...</div>;

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500 mt-4">
            <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Fee Deduction Dashboard</h2>
                <p className="text-muted-foreground">KAB Gold portal to process Wasiemas registration fees from active uncang emas.</p>
            </div>

            <Card className="border-border shadow-sm">
                <CardHeader className="bg-muted/30 border-b border-border pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Wallet className="w-5 h-5 text-yellow-600" />
                        Pending Fee Deductions
                    </CardTitle>
                    <CardDescription>Activated Wasiemas documents awaiting fee deduction.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {activeRegistrations.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No pending fee deductions.</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/10 text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="p-4">Wasiemas ID</th>
                                    <th className="p-4">Pewasiat Details</th>
                                    <th className="p-4">Activation Date</th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {activeRegistrations.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-accent/30 transition-colors">
                                        <td className="p-4 font-medium">{reg.id}</td>
                                        <td className="p-4 font-bold">
                                            {reg.expand?.pewasiat_id?.full_name} <br />
                                            <span className="text-xs text-muted-foreground font-normal">IC: {reg.expand?.pewasiat_id?.nric_number}</span>
                                        </td>
                                        <td className="p-4">{new Date(reg.updated).toLocaleDateString('ms-MY')}</td>
                                        <td className="p-4 text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => handleMarkDeducted(reg.id)}
                                                disabled={processingId === reg.id}
                                                className="gap-2 bg-yellow-600 hover:bg-yellow-700"
                                            >
                                                {processingId === reg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
                                                Mark Fee Deducted
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}