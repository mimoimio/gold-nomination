// src/components/AdminApprovals.tsx
import { useEffect, useState } from 'react';
import pb from '../lib/pocketbase';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ShieldAlert, User, Scale, Gift } from "lucide-react";

export default function AdminApprovals() {
    const [pendingNominations, setPendingNominations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPendingNominations = async () => {
            try {
                // Fetch all nominations that are pending, and expand to get the investor's details
                const records = await pb.collection('nominations').getFullList({
                    filter: `status = "Pending"`,
                    expand: 'user_id',
                    sort: '-created',
                });
                setPendingNominations(records);
            } catch (error) {
                console.error("Failed to fetch pending nominations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPendingNominations();
    }, []);

    const handleAction = async (id: string, action: 'Active' | 'Rejected') => {
        try {
            // Update the status in the database
            await pb.collection('nominations').update(id, { status: action });

            // Remove the card from the UI
            setPendingNominations(pendingNominations.filter(nom => nom.id !== id));

            alert(`Nomination successfully marked as ${action}.`);
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update status. Please check your permissions.");
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8 mt-10">
            <div>
                <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
                    <ShieldAlert className="text-yellow-600 h-8 w-8" /> KYC Approvals
                </h2>
                <p className="text-muted-foreground mt-1">Review and activate new beneficiary requests from investors.</p>
            </div>

            {isLoading ? (
                <p>Loading pending requests...</p>
            ) : pendingNominations.length === 0 ? (
                <Card className="border-dashed bg-muted/30">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <CheckCircle className="w-12 h-12 text-muted mb-4" />
                        <p>All caught up!</p>
                        <p className="text-sm">No new nominations require KYC verification.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {pendingNominations.map((nom) => (
                        <Card key={nom.id} className="border-yellow-200 bg-yellow-50/30">
                            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">

                                {/* Investor Data (The Donor) */}
                                <div className="space-y-1 md:w-1/3">
                                    <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Investor (Donor)</p>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <p className="font-medium">{nom.expand?.user_id?.full_name}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground ml-6">IC: {nom.expand?.user_id?.nric_number}</p>
                                </div>

                                {/* Divider for mobile / Arrow for desktop */}
                                <div className="hidden md:block text-muted">➔</div>
                                <hr className="md:hidden border-yellow-200" />

                                {/* Nominee Data (The Receiver) */}
                                <div className="space-y-1 md:w-1/3">
                                    <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Requested Beneficiary</p>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-foreground">{nom.nominee_name}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                        <span>IC: {nom.nominee_nric}</span>
                                        <span>•</span>
                                        <span>{nom.relationship}</span>
                                    </div>
                                </div>

                                {/* Shariah Role & Actions */}
                                <div className="flex flex-col items-end gap-3 md:w-1/3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold">{nom.allocation_percentage}%</span>
                                        <Badge variant="outline" className={
                                            nom.role_type === 'Hibah'
                                                ? "bg-accent/10 text-accent-foreground border-accent/30"
                                                : "bg-primary/10 text-primary border-primary/30"
                                        }>
                                            {nom.role_type === 'Hibah' ? <Gift className="w-3 h-3 mr-1" /> : <Scale className="w-3 h-3 mr-1" />}
                                            {nom.role_type}
                                        </Badge>
                                    </div>
                                    <div className="flex gap-2 w-full justify-end">
                                        <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => handleAction(nom.id, 'Rejected')}>
                                            <XCircle className="w-4 h-4" />
                                        </Button>
                                        <Button className="bg-yellow-600 hover:bg-yellow-700" onClick={() => handleAction(nom.id, 'Active')}>
                                            <CheckCircle className="w-4 h-4 mr-2" /> Activate
                                        </Button>
                                    </div>
                                </div>

                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}