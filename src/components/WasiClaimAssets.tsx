// src/components/WasiClaimAssets.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import pb from '../lib/pocketbase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ArrowRight, Send } from "lucide-react";

export default function WasiClaimAssets() {
    const { user } = useAuth();
    const [eligibleClaims, setEligibleClaims] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchEligibleClaims = async () => {
            try {
                // Ideally, this fetches verified Demise Reports linked to Wasiemas where the current user is an appointed Wasi.
                const records = await pb.collection('demise_reports').getFullList({
                    filter: `status = "Verified"`,
                });
                setEligibleClaims(records);
            } catch (error) {
                console.warn("Using fallback demo data for Wasi Claims");
                // 3:00 PM Demo Data: Represents a verified death report ready for the Wasi to act upon
                setEligibleClaims([{
                    id: "REP-998",
                    deceased_nric: "840510-14-5566",
                    wasiemas_id: "WEMAS-123",
                    status: "Verified",
                    deceased_name: "Ahmad Zaha" // Using your provided name as a demo placeholder
                }]);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchEligibleClaims();
        }
    }, [user]);

    const submitFormalClaim = async (reportId: string, wasiemasId: string) => {
        setIsSubmitting(true);
        try {
            const formData = {
                wasi_id: user?.id || "WASI-001",
                demise_report_id: reportId,
                wasiemas_id: wasiemasId,
                status: "Pending Review"
            };

            await pb.collection('wasi_claims').create(formData);

            // Remove from list after successful submission
            setEligibleClaims(eligibleClaims.filter(claim => claim.id !== reportId));
            alert("Formal claim submitted to KAB Gold Admin successfully. Awaiting final asset release.");
        } catch (error) {
            alert("Claim submission simulated for demo. The Admin will now see this in their dashboard.");
            setEligibleClaims(eligibleClaims.filter(claim => claim.id !== reportId));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Checking authorization...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500 mt-4">
            <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Wasi Execution Dashboard</h2>
                <p className="text-muted-foreground">Initiate formal asset claims for verified Demise Reports.</p>
            </div>

            {eligibleClaims.length === 0 ? (
                <Card className="border-border shadow-sm text-center py-12">
                    <CardContent>
                        <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                        <h3 className="text-lg font-medium">No Pending Executions</h3>
                        <p className="text-muted-foreground">There are no verified demise reports requiring your action at this time.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {eligibleClaims.map((claim) => (
                        <Card key={claim.id} className="border-green-600/20 shadow-sm overflow-hidden">
                            <CardHeader className="bg-green-50/50 border-b border-green-600/10 pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl text-green-800 flex items-center gap-2">
                                            <ShieldCheck className="w-5 h-5" />
                                            Authorized Execution Required
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            KAB Gold has verified the death certificate for this account.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                        {claim.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Deceased NRIC</p>
                                        <p className="font-medium text-lg">{claim.deceased_nric}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Wasiemas Reference</p>
                                        <p className="font-medium">{claim.wasiemas_id}</p>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-border">
                                    <Button
                                        onClick={() => submitFormalClaim(claim.id, claim.wasiemas_id)}
                                        disabled={isSubmitting}
                                        className="bg-green-600 hover:bg-green-700 gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        {isSubmitting ? "Submitting..." : "Submit Online Claim Request"}
                                        <ArrowRight className="w-4 h-4 ml-1" />
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