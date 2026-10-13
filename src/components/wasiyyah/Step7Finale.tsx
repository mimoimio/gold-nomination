// src/components/wasiyyah/Step7Finale.tsx
import { Button } from "@/components/ui/button";
import { Printer, UploadCloud, CheckCircle2, FileText } from "lucide-react";

export default function Step7Finale() {
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
                    <Button className="w-full" size="lg">
                        <FileText className="mr-2 h-5 w-5" /> Jana & Cetak Wasiyyah
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

                    <label className="flex-grow border-2 border-dashed border-border rounded-md hover:bg-accent/50 transition-colors flex flex-col items-center justify-center cursor-pointer p-6">
                        <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium text-primary">Klik untuk muat naik (PDF)</span>
                        <input type="file" className="hidden" accept=".pdf" />
                    </label>
                </div>
            </div>
        </div>
    );
}