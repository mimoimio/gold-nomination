// src/components/ReportClaim.tsx
import { useState } from 'react';
import pb from '../lib/pocketbase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ReportClaim() {
    const [deceasedNric, setDeceasedNric] = useState("");
    const [reporterName, setReporterName] = useState("");
    const [reporterContact, setReporterContact] = useState("");
    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append('deceased_nric', deceasedNric);
            formData.append('reporter_name', reporterName);
            formData.append('reporter_contact', reporterContact);
            formData.append('status', 'Pending Verification');

            if (certificateFile) {
                formData.append('death_certificate', certificateFile);
            }

            // Submitting to the new public Demise Reports collection
            await pb.collection('demise_reports').create(formData);
            setIsSuccess(true);

        } catch (error) {
            console.error("Failed to submit demise report:", error);
            setError("Gagal menghantar laporan kematian. Sila cuba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="max-w-2xl mx-auto p-6 mt-10 text-center animate-in fade-in zoom-in duration-500">
                <Card className="border-primary bg-primary/5">
                    <CardContent className="p-8 space-y-4">
                        <h2 className="text-2xl font-bold text-primary">Laporan Kematian Dihantar</h2>
                        <p className="text-muted-foreground">
                            Sijil kematian telah dihantar kepada KAB Gold untuk pengesahan.
                            Selepas disahkan, Wasi yang dilantik boleh meneruskan proses tuntutan aset.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 mt-10">
            <Card className="border-border shadow-sm">
                <CardHeader className="bg-destructive/5 border-b border-destructive/10">
                    <CardTitle className="text-2xl text-destructive flex items-center gap-2">
                        Lapor Kematian Pemegang Akaun
                    </CardTitle>
                    <CardDescription>
                        Borang ini terbuka kepada awam. Muat naik sijil kematian rasmi untuk memaklumkan KAB Gold.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="nric">No. Kad Pengenalan Pemegang Akaun</Label>
                            <Input
                                id="nric"
                                required
                                placeholder="e.g. 500101-14-5555"
                                value={deceasedNric}
                                onChange={(e) => setDeceasedNric(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="reporter">Nama Penuh Pelapor</Label>
                                <Input
                                    id="reporter"
                                    required
                                    placeholder="e.g. Ahmad Faizal"
                                    value={reporterName}
                                    onChange={(e) => setReporterName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact">No. Telefon Pelapor</Label>
                                <Input
                                    id="contact"
                                    required
                                    placeholder="e.g. 012-3456789"
                                    value={reporterContact}
                                    onChange={(e) => setReporterContact(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 border-t border-border pt-4">
                            <Label htmlFor="certificate">Muat Naik Sijil Kematian (PDF/Imej)</Label>
                            <Input
                                id="certificate"
                                type="file"
                                required
                                accept=".pdf,image/*"
                                onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                                className="cursor-pointer"
                            />
                            <p className="text-xs text-muted-foreground">
                                Must be a clear, legible copy of the official document from the National Registration Department.
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-destructive/10 text-destructive border border-destructive/30 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <Button type="submit" variant="destructive" className="w-full" disabled={isLoading}>
                            {isLoading ? "Menghantar Laporan..." : "Hantar Laporan Kematian"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}