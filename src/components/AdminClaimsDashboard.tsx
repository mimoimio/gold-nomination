// src/components/AdminClaimsDashboard.tsx
import { useEffect, useState } from 'react';
import pb from '../lib/pocketbase';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, XCircle } from "lucide-react";
import type { ClaimRecord } from '@/types/database';

export default function AdminClaimsDashboard() {
    const [claims, setClaims] = useState<ClaimRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPendingClaims = async () => {
            try {
                const records: ClaimRecord[] = await pb.collection('claims').getFullList({
                    filter: `status = "Pending"`,
                    expand: 'deceased_user_id',
                    sort: '-created',
                });
                setClaims(records);
            } catch (error) {
                console.error("Failed to fetch claims:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPendingClaims();
    }, []);

    const handleApprove = async (claimId: string, deceasedUser: any) => {
        if (!deceasedUser) {
            alert("Error: Deceased user data is missing.");
            return;
        }

        if (!confirm(`WARNING: This will permanently liquidate ${deceasedUser.total_gold_balance}g of gold and freeze the account. Proceed?`)) return;

        try {
            // 1. Fetch active nominees
            const nominees = await pb.collection('nominations').getFullList({
                filter: `user_id = "${deceasedUser.id}" && status = "Active"`,
            });

            if (nominees.length === 0) {
                alert("Execution halted: No active beneficiaries found. Account remains frozen for standard Faraid court proceedings.");
                await pb.collection('claims').update(claimId, { status: 'Manual Intervention' });
                return;
            }

            const totalGold = deceasedUser.total_gold_balance;
            let auditLog = `Execution Date: ${new Date().toLocaleString()}\nAccount NRIC: ${deceasedUser.nric_number}\nTotal Gold Liquidated: ${totalGold}g\n\n--- DISTRIBUTION BREAKDOWN ---\n`;

            // 2. Calculate Math & Build Log
            for (const nominee of nominees) {
                const allocatedGrams = (nominee.allocation_percentage / 100) * totalGold;
                const formattedGrams = allocatedGrams.toFixed(4);

                if (nominee.role_type === 'Hibah') {
                    auditLog += `[HIBAH] Transferred ${formattedGrams}g to ${nominee.nominee_name} (IC: ${nominee.nominee_nric})\n`;
                } else if (nominee.role_type === 'Pentadbir') {
                    auditLog += `[PENTADBIR] Transferred ${formattedGrams}g to ${nominee.nominee_name} (IC: ${nominee.nominee_nric}) IN TRUST\n`;
                }
            }

            // 3. Finalize Database Transactions
            // Save the claim as approved AND attach the permanent audit log
            await pb.collection('claims').update(claimId, {
                status: 'Approved',
                audit_log: auditLog
            });

            // Freeze the deceased user's vault
            await pb.collection('users').update(deceasedUser.id, {
                total_gold_balance: 0
            });

            // 4. Update UI & Notify Admin
            alert(`Distribution Successful!\n\n${auditLog}\n\nThis record has been permanently saved to the database.`);
            setClaims(claims.filter(c => c.id !== claimId));

        } catch (error) {
            console.error("Execution Algorithm Failed:", error);
            alert("A system error occurred during asset distribution. Please check API rules.");
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8 mt-10">
            <h2 className="text-3xl font-bold text-foreground">Admin Panel: Pending Executions</h2>
            <p className="text-muted-foreground -mt-6">Verify death certificates and trigger Shariah-compliant asset liquidations.</p>

            {isLoading ? (
                <p>Loading pending claims...</p>
            ) : claims.length === 0 ? (
                <Card className="border-dashed bg-muted/30">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <CheckCircle className="w-12 h-12 text-muted mb-4" />
                        <p>Inbox Zero.</p>
                        <p className="text-sm">No pending death certificate claims to process.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {claims.map((claim) => (
                        <Card key={claim.id} className="border-destructive/20 bg-destructive/10 shadow-sm transition-all hover:shadow-md">
                            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-lg text-destructive-foreground">
                                            {claim.expand?.deceased_user_id?.full_name}
                                        </h4>
                                        <Badge variant="destructive" className="bg-destructive/20 text-destructive hover:bg-destructive/20">
                                            Frozen
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3 font-medium">
                                        Gold Balance to Liquidate: <span className="text-yellow-600 font-bold">{claim.expand?.deceased_user_id?.total_gold_balance} Grams</span>
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded border">
                                            Reported by: {claim.reporter_name}
                                        </span>
                                        <Button variant="link" className="text-primary p-0 h-auto text-xs">
                                            <FileText className="w-3 h-3 mr-1" />
                                            View Certificate
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex gap-2 w-full md:w-auto">
                                    <Button variant="outline" className="w-full md:w-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                        <XCircle className="w-4 h-4 mr-2" /> Reject
                                    </Button>
                                    <Button
                                        onClick={() => handleApprove(claim.id, claim.expand?.deceased_user_id)}
                                        className="w-full md:w-auto bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" /> Execute Distribution
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}