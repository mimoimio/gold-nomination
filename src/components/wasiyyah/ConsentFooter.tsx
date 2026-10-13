// src/components/wasiyyah/ConsentFooter.tsx
import { useState } from 'react';
import { Label } from "@/components/ui/label";

export default function ConsentFooter() {
    const [checked1, setChecked1] = useState(false);
    const [checked2, setChecked2] = useState(false);

    return (
        <div className="mt-8 border-t border-border pt-6 space-y-4">
            <div className="flex items-start space-x-3">
                <input
                    type="checkbox"
                    id="consent1"
                    className="mt-1 h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 accent-primary cursor-pointer"
                    checked={checked1}
                    onChange={(e) => setChecked1(e.target.checked)}
                />
                <Label htmlFor="consent1" className="text-sm font-normal text-muted-foreground leading-snug cursor-pointer">
                    Saya telah membaca dengan teliti dan memahami Terma dan Syarat di atas.
                </Label>
            </div>
            <div className="flex items-start space-x-3">
                <input
                    type="checkbox"
                    id="consent2"
                    className="mt-1 h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 accent-primary cursor-pointer"
                    checked={checked2}
                    onChange={(e) => setChecked2(e.target.checked)}
                />
                <Label htmlFor="consent2" className="text-sm font-normal text-muted-foreground leading-snug cursor-pointer">
                    Saya mengaku bahawa maklumat di atas adalah benar dan diberikan secara sukarela.
                </Label>
            </div>
        </div>
    );
}