// src/components/wasiyyah/Step7Finale.tsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../../lib/pocketbase';
import { useAuth } from '../../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Printer, UploadCloud, CheckCircle2, FileText, Loader2 } from "lucide-react";
import type { WasiyyahState } from '../../types/wasiyyah';
import { buildWasiyyahPdf } from '../../lib/wasiyyahPdf';

interface Step7Props {
    formData: WasiyyahState;
}
// bug: click print button immediately show pdf,
// the alert confirmation also download separately and opens the pdf
export default function Step7Finale({ formData }: Step7Props) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleGeneratePDF = () => {
        setIsGenerating(true);
        const printWindow = window.open('', '_blank');

        try {
            const doc = buildWasiyyahPdf(formData, {
                full_name: user?.full_name,
                nric_number: user?.nric_number,
                email: user?.email,
            });

            doc.save(`Wasiyyah_${user?.nric_number?.trim() || 'Draf'}_${new Date().toISOString().slice(0, 10)}.pdf`);

            const blobUrl = URL.createObjectURL(doc.output('blob'));
            if (printWindow) {
                printWindow.location.href = blobUrl;
            } else {
                window.open(blobUrl, '_blank');
            }
            window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);

            alert("PDF Wasiyyah telah dijana dan dimuat turun. Sila cetak, tandatangan di hadapan saksi, kemudian muat naik di Langkah 2.");
        } catch (error) {
            printWindow?.close();
            console.error("PDF generation failed", error);
            alert("Gagal menjana PDF Wasiyyah. Sila cuba lagi.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Handle File Selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type !== "application/pdf") {
                alert("Please upload a valid PDF document.");
                return;
            }
            setSelectedFile(file);
        }
    };

    // ACTION 2: Upload and Finalize to PocketBase
    const handleUploadAndSubmit = async () => {
        if (!selectedFile) {
            alert("Please select the signed PDF document to upload.");
            return;
        }

        if (!user) {
            alert("Session expired. Please log in again.");
            navigate('/login');
            return;
        }

        setIsUploading(true);
        try {
            // Package the data and the physical file using FormData for PocketBase
            const pbFormData = new FormData();
            pbFormData.append('pewasiat_id', user.id);
            pbFormData.append('pewasiat_nric', user.nric_number);
            pbFormData.append('wasiyyah_data', JSON.stringify(formData));
            pbFormData.append('status', 'Pending Verification');
            pbFormData.append('fee_deducted', 'false');
            pbFormData.append('signed_document_pdf', selectedFile);

            console.log("Submitting to PocketBase 'wasiemas' collection...");
            await pb.collection('wasiemas').create(pbFormData);

            alert("Wasi Emas berjaya dihantar! Firma guaman akan mengesahkan dokumen.");
            navigate('/dashboard');

        } catch (error) {
            console.error("Submission failed:", error);
            alert("Gagal menghantar Wasi Emas. Sila semak sambungan PocketBase dan peraturan akses.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8" />
            </div>

            <h2 className="text-3xl font-bold text-foreground">Maklumat Lengkap!</h2>
            <p className="text-muted-foreground max-w-full mx-auto">
                Untuk memenuhi syarat perundangan Akta Perdagangan Elektronik 2006, dokumen ini tidak boleh ditandatangani secara digital.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-left">
                {/* Action 1: Print */}
                <div className="border border-border rounded-lg p-6 bg-card flex flex-col h-full">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-primary/20 p-2 rounded">
                            <Printer className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg">Langkah 1: Cetak</h3>
                    </div>
                    <p className="text-sm text-muted-foreground flex-grow mb-6">
                        Jana dokumen PDF rasmi Wasiyyah anda. Anda perlu mencetaknya dan menandatangani dokumen tersebut secara fizikal di hadapan saksi.
                    </p>
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleGeneratePDF}
                        disabled={isGenerating || isUploading}
                    >
                        {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FileText className="mr-2 h-5 w-5" />}
                        {isGenerating ? "Menjana PDF..." : "Jana & Cetak Wasi Emas"}
                    </Button>
                </div>

                {/* Action 2: Upload */}
                <div className="border border-border rounded-lg p-6 bg-card flex flex-col h-full">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-primary/20 p-2 rounded">
                            <UploadCloud className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg">Langkah 2: Muat Naik</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Selepas ditandatangani, muat naik salinan dokumen yang telah disahkan ke dalam sistem untuk semakan Admin (Maker-Checker).
                    </p>

                    <label className={`flex-grow border-2 border-dashed rounded-md transition-colors flex flex-col items-center justify-center cursor-pointer p-6 mb-4 ${selectedFile ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/50'}`}>
                        <UploadCloud className={`h-8 w-8 mb-2 ${selectedFile ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`text-sm font-medium ${selectedFile ? 'text-primary' : 'text-muted-foreground'}`}>
                            {selectedFile ? selectedFile.name : "Klik untuk muat naik (PDF)"}
                        </span>
                        <input
                            type="file"
                            className="hidden"
                            accept=".pdf"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                    </label>

                    <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="lg"
                        onClick={handleUploadAndSubmit}
                        disabled={!selectedFile || isUploading || isGenerating}
                    >
                        {isUploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                        {isUploading ? "Memuat Naik..." : "Hantar Wasi Emas"}
                    </Button>
                </div>
            </div>
        </div>
    );
}