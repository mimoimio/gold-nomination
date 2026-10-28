// src/components/AdminClaimsDashboard.tsx
import { useEffect, useState } from 'react';
import pb from '../lib/pocketbase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, FileSearch, Send, AlertTriangle } from "lucide-react";
import type { DemiseReportRecord, WasiClaimRecord } from '@/types/database';

export default function AdminClaimsDashboard() {
    const [demiseReports, setDemiseReports] = useState<DemiseReportRecord[]>([]);
    const [wasiClaims, setWasiClaims] = useState<WasiClaimRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Demise Reports (Open Public Reporting)
                const reports = await pb.collection('demise_reports').getFullList({
                    filter: `status = "Pending Verification"`,
                    sort: '-created',
                });

                // 2. Fetch Wasi Claims (Secured Admin Claims)
                const claims = await pb.collection('wasi_claims').getFullList({
                    filter: `status = "Pending Review"`,
                    expand: 'wasi_id,demise_report_id,wasiemas_id.pewasiat_id',
                    sort: '-created',
                });

                setDemiseReports(reports as unknown as DemiseReportRecord[]);
                setWasiClaims(claims as unknown as WasiClaimRecord[]);
            } catch (error) {
                console.warn("Collections not ready. Loading 3:00 PM Demo Data...");
                // Fallback Mock Data for the 3:00 PM Presentation Demo
                setDemiseReports([{
                    id: "REP-999", deceased_nric: "840510-14-5566", reporter_name: "Ali Bin Abu", reporter_contact: "012-3456789", death_certificate: "cert_840510.pdf", status: "Pending Verification"
                }]);

                setWasiClaims([{
                    id: "CLM-888", wasi_id: "WASI-001", demise_report_id: "REP-998", wasiemas_id: "WEMAS-123", status: "Pending Review",
                    expand: {
                        wasi_id: { id: "WASI-001", full_name: "Siti Aishah", email: "siti@example.com", nric_number: "900101-10-1234", role: "wasi", total_gold_balance: 0, verified: true },
                        wasiemas_id: { id: "WEMAS-123", pewasiat_id: "PEW-001", wasiyyah_data: {} as any, signed_document_pdf: "doc.pdf", status: "Active" },
                    }
                } as any]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleVerifyReport = async (reportId: string) => {
        if (!confirm("Verify this death certificate as authentic?")) return;
        try {
            await pb.collection('demise_reports').update(reportId, { status: 'Verified' });
            setDemiseReports(demiseReports.filter(r => r.id !== reportId));
            alert("Death Certificate Verified. The appointed Wasi can now submit their claim.");
        } catch (error) {
            alert("Verification simulated for demo.");
            setDemiseReports(demiseReports.filter(r => r.id !== reportId));
        }
    };

    const handleReleaseAndNotify = async (claimId: string) => {
        if (!confirm("WARNING: This will release the assets to the Wasi and auto-notify all Waris via email/SMS. Proceed?")) return;
        try {
            await pb.collection('wasi_claims').update(claimId, { status: 'Approved & Released' });
            setWasiClaims(wasiClaims.filter(c => c.id !== claimId));
            alert("Success! Assets released to Wasi. Notification dispatch triggered to all Faraid Waris.");
        } catch (error) {
            alert("Release & Notification simulated for demo.");
            setWasiClaims(wasiClaims.filter(c => c.id !== claimId));
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading Admin Data...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 mt-4">

            <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Admin Command Center</h2>
                <p className="text-muted-foreground">Manage public demise reports, verify documents, and securely execute Wasi claims.</p>
            </div>

            {/* STEP 1: VERIFY DEATH REPORTS */}
            <Card className="border-border shadow-sm">
                <CardHeader className="bg-muted/30 border-b border-border pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Step 1: Pending Death Reports (Public)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {demiseReports.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No pending death reports.</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/10 text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="p-4">Report ID</th>
                                    <th className="p-4">Deceased NRIC</th>
                                    <th className="p-4">Reported By</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {demiseReports.map((report) => (
                                    <tr key={report.id} className="hover:bg-accent/30 transition-colors">
                                        <td className="p-4 font-medium">{report.id}</td>
                                        <td className="p-4 text-destructive font-bold">{report.deceased_nric}</td>
                                        <td className="p-4">{report.reporter_name} <br /><span className="text-xs text-muted-foreground">{report.reporter_contact}</span></td>
                                        <td className="p-4 text-right space-x-2">
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <FileText className="w-4 h-4" /> View Cert
                                            </Button>
                                            <Button size="sm" onClick={() => handleVerifyReport(report.id)} className="gap-2 bg-amber-600 hover:bg-amber-700">
                                                <FileSearch className="w-4 h-4" /> Verify
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

            {/* STEP 2: RELEASE & NOTIFY */}
            <Card className="border-primary/20 shadow-sm ring-1 ring-primary/10">
                <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg text-primary">
                        <CheckCircle className="w-5 h-5" />
                        Step 2: Authenticated Wasi Claims
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {wasiClaims.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No pending Wasi claims ready for release.</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-primary/5 text-muted-foreground border-b border-primary/10">
                                <tr>
                                    <th className="p-4">Claim ID</th>
                                    <th className="p-4">Authorized Wasi</th>
                                    <th className="p-4">Wasiemas Reference</th>
                                    <th className="p-4 text-right">Execution Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {wasiClaims.map((claim) => (
                                    <tr key={claim.id} className="hover:bg-primary/5 transition-colors">
                                        <td className="p-4 font-medium">{claim.id}</td>
                                        <td className="p-4 font-bold text-foreground">
                                            {claim.expand?.wasi_id?.full_name} <br />
                                            <span className="text-xs font-normal text-muted-foreground">IC: {claim.expand?.wasi_id?.nric_number}</span>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="outline" className="border-primary text-primary">
                                                {claim.wasiemas_id}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => handleReleaseAndNotify(claim.id)}
                                                className="gap-2 bg-primary hover:bg-primary/90"
                                            >
                                                <Send className="w-4 h-4" /> Release & Auto-Notify Waris
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