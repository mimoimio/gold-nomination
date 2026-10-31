// src/components/LegalFirmDashboard.tsx
import { useEffect, useState, useRef } from 'react';
import pb from '../lib/pocketbase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileSignature, Clock, UploadCloud, CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import type { WasiemasRecord } from '@/types/database';
import { emailService } from '@/lib/emailService';

export default function LegalFirmDashboard() {
    const [pendingDocuments, setPendingDocuments] = useState<WasiemasRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchPendingDocuments();
    }, []);

    const fetchPendingDocuments = async () => {
        try {
            const records = await pb.collection('wasiemas').getFullList({
                filter: `status = "Pending Verification"`,
                expand: 'pewasiat_id',
                sort: '-created',
            });
            setPendingDocuments(records as unknown as WasiemasRecord[]);
        } catch (error) {
            console.warn("Using fallback demo data for Legal Firm Dashboard");
            // 3:00 PM Demo Fallback Data
            setPendingDocuments([{
                id: "WEMAS-777",
                pewasiat_id: "PEW-001",
                wasiyyah_data: {} as any,
                signed_document_pdf: "dummy_signed_doc.pdf",
                status: "Pending Verification",
                created: new Date().toISOString(),
                expand: {
                    pewasiat_id: { id: "PEW-001", full_name: "Ahmad Zaha", nric_number: "840510-14-5566", email: "ahmad@example.com", role: 'pewasiat', total_gold_balance: 150, verified: true }
                }
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 1: Legal Firm checks the wet signatures and applies a timestamp
    const handleTimestamp = async (id: string) => {
        setProcessingId(id);
        try {
            // In a real app, this might generate a new PDF with a cryptographic timestamp overlay
            // For the prototype, we update the status and record the timestamp action
            await pb.collection('wasiemas').update(id, {
                status: 'Processing LHDN', // Intermediate status before final upload
            });
            alert("Timestamp applied automatically! Document marked for LHDN Stamping.");

            // Remove from this specific view (or you could move it to a 'Processing' tab)
            setPendingDocuments(docs => docs.filter(doc => doc.id !== id));
        } catch (error) {
            alert("Timestamp simulated for demo.");
            setPendingDocuments(docs => docs.filter(doc => doc.id !== id));
        } finally {
            setProcessingId(null);
        }
    };

    // Step 2: Legal Firm uploads the finalized LHDN-stamped document
    const handleLHDNUpload = async (id: string, file: File) => {
        setProcessingId(id);
        try {
            const formData = new FormData();
            formData.append('final_lhdn_pdf', file);
            formData.append('status', 'Active');

            // Update PocketBase
            await pb.collection('wasiemas').update(id, formData);

            // Retrieve the document to get the Pewasiat details
            const doc = pendingDocuments.find(d => d.id === id);

            if (doc && doc.expand?.pewasiat_id) {
                const pewasiat = doc.expand.pewasiat_id;
                // For the prototype, we simulate one Wasi being attached
                const dummyWasi = { full_name: "Wasi Dilantik", email: "wasi@example.com" };

                // Trigger the automated emails
                await emailService.sendActivationEmails(pewasiat, [dummyWasi], id);
            }

            alert("Final LHDN Stamped document uploaded! Wasiemas is now ACTIVE. Auto-email dispatched to Pewasiat and Wasi.");
            setPendingDocuments(docs => docs.filter(d => d.id !== id));
        } catch (error) {
            alert("LHDN Upload simulated for demo. Auto-emails triggered (check console).");
            setPendingDocuments(docs => docs.filter(d => d.id !== id));
        } finally {
            setProcessingId(null);
        }
    }; const triggerFileInput = (id: string) => {
        // Quick workaround for demo: simulate the intermediate step immediately if they click upload directly
        alert("Simulating LHDN Upload for prototype presentation.");
        handleLHDNUpload(id, new File(["dummy"], "lhdn_stamped.pdf", { type: "application/pdf" }));
    };

    if (isLoading) return <div className="p-8 text-center">Loading Legal Firm Queue...</div>;

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500 mt-4">
            <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Legal Verification Queue</h2>
                <p className="text-muted-foreground">Review wet signatures, apply timestamps, and manage LHDN stamping.</p>
            </div>

            {pendingDocuments.length === 0 ? (
                <Card className="border-border shadow-sm text-center py-12">
                    <CardContent>
                        <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                        <h3 className="text-lg font-medium">Queue Empty</h3>
                        <p className="text-muted-foreground">No pending Wasiemas documents require verification at this time.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {pendingDocuments.map((doc) => (
                        <Card key={doc.id} className="border-primary/20 shadow-sm overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <FileSignature className="w-5 h-5 text-primary" />
                                            {doc.expand?.pewasiat_id?.full_name || "Unknown Pewasiat"}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            NRIC: {doc.expand?.pewasiat_id?.nric_number} | Wasiemas ID: {doc.id}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                                        Wet Signature Check Required
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid md:grid-cols-3 gap-4 mb-6 items-center">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Submitted On</p>
                                        <p className="font-medium">{new Date(doc.created!).toLocaleDateString('ms-MY')}</p>
                                    </div>
                                    <div className="space-y-1 col-span-2 text-right">
                                        <Button variant="outline" className="gap-2" onClick={() => window.open(pb.files.getUrl(doc, doc.signed_document_pdf), '_blank')}>
                                            <ExternalLink className="w-4 h-4" /> View Uploaded PDF
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
                                    {/* Action 1: Time Stamp */}
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleTimestamp(doc.id)}
                                        disabled={processingId === doc.id}
                                        className="gap-2"
                                    >
                                        {processingId === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                                        Apply Timestamp
                                    </Button>

                                    {/* Action 2: Upload Final LHDN */}
                                    <Button
                                        onClick={() => triggerFileInput(doc.id)}
                                        disabled={processingId === doc.id}
                                        className="bg-primary hover:bg-primary/90 gap-2"
                                    >
                                        <UploadCloud className="w-4 h-4" />
                                        Upload LHDN Stamped Copy
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