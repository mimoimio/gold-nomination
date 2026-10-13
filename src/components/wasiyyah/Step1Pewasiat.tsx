// src/components/wasiyyah/Step1Pewasiat.tsx
import type { WasiyyahState } from '../../types/wasiyyah';
import ConsentFooter from './ConsentFooter';
import { useAuth } from '../../context/AuthContext';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info, Briefcase, Gift, Building, Scale, ShieldX } from "lucide-react";

interface Props {
    data: WasiyyahState;
    setFormData: React.Dispatch<React.SetStateAction<WasiyyahState>>;
}

export default function Step1Pewasiat({ data, setFormData }: Props) {
    const { user } = useAuth();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">1. Maklumat Pewasiat</h2>
                    <p className="text-sm text-muted-foreground mt-1">Sila isi maklumat Pewasiat dan tetapkan jenis pelepasan aset.</p>
                </div>
                <details className="text-sm text-primary cursor-pointer relative group">
                    <summary className="flex items-center space-x-1 font-medium hover:underline">
                        <Info className="h-4 w-4" />
                        <span>Syarat Pewasiat</span>
                    </summary>
                    <div className="absolute right-0 mt-2 w-72 bg-popover border border-border rounded-md shadow-md p-4 text-popover-foreground z-10">
                        <p className="font-bold mb-2">Syarat Kelayakan:</p>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
                            <li>18 tahun ke atas & Aqil baligh</li>
                            <li>Sempurna akal fikiran</li>
                            <li>Tiada paksaan (sukarela)</li>
                            <li>Pemilik mutlak aset</li>
                        </ul>
                    </div>
                </details>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="pewasiat-name">Nama Penuh (Mengikut Kad Pengenalan)</Label>
                    <Input id="pewasiat-name" disabled value={user?.full_name || ''} className="bg-muted text-muted-foreground" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="pewasiat-nric">No. Kad Pengenalan</Label>
                    <Input id="pewasiat-nric" disabled value={user?.nric_number || ''} className="bg-muted text-muted-foreground" />
                </div>
            </div>

            {/* Asset Release Type using Shadcn RadioGroup Card Style */}
            <div className="space-y-3 pt-4 border-t border-border">
                <Label className="text-base font-semibold text-foreground">Cara Pelepasan Aset</Label>
                <RadioGroup
                    value={data.pewasiat.release_type}
                    onValueChange={(v: "Wasi Emas" | "Hibah Emas" | "Waqf") => setFormData({
                        ...data,
                        pewasiat: {
                            ...data.pewasiat,
                            release_type: v
                        }
                    })}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    {/* Wasi Emas Card */}
                    <div>
                        <RadioGroupItem value="Wasi Emas" id="Wasi Emas" className="peer sr-only" />
                        <Label htmlFor="Wasi Emas" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary cursor-pointer transition-all">
                            <Briefcase className="mb-3 h-6 w-6" />
                            <span className="font-bold">Wasi Emas</span>
                        </Label>
                    </div>
                    {/* Hibah Emas Card */}
                    <div>
                        <RadioGroupItem value="Hibah Emas" id="Hibah Emas" className="peer sr-only" />
                        <Label htmlFor="Hibah Emas" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary cursor-pointer transition-all">
                            <Gift className="mb-3 h-6 w-6" />
                            <span className="font-bold">Hibah Emas</span>
                        </Label>
                    </div>
                    {/* Waqf Card */}
                    <div>
                        <RadioGroupItem value="Waqf" id="waqf" className="peer sr-only" />
                        <Label htmlFor="waqf" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary cursor-pointer transition-all">
                            <Building className="mb-3 h-6 w-6" />
                            <span className="font-bold">Waqf</span>
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            {/* Yusuf Advisory Toggle */}
            <div className="space-y-3 pt-4 border-t border-border">
                <Label className="text-base font-semibold text-foreground">Lantik Peguam Penasihat Pusaka (Yusuf Advisory)?</Label>
                <RadioGroup
                    value={data.pewasiat.use_yusuf_advisory ? "yes" : "no"}
                    onValueChange={(v) => setFormData({ ...data, pewasiat: { ...data.pewasiat, use_yusuf_advisory: v === "yes" } })}
                    className="grid grid-cols-2 gap-4 md:max-w-md"
                >
                    <div>
                        <RadioGroupItem value="yes" id="adv-yes" className="peer sr-only" />
                        <Label htmlFor="adv-yes" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary cursor-pointer transition-all">
                            <Scale className="mb-2 h-5 w-5" />
                            <span className="font-semibold">Ya</span>
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="no" id="adv-no" className="peer sr-only" />
                        <Label htmlFor="adv-no" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary cursor-pointer transition-all">
                            <ShieldX className="mb-2 h-5 w-5" />
                            <span className="font-semibold">Tidak</span>
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            <ConsentFooter />
        </div>
    );
}