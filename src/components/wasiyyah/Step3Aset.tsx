// src/components/wasiyyah/Step3Aset.tsx
import type { WasiyyahState } from '../../types/wasiyyah';
import ConsentFooter from './ConsentFooter';
import { Info, Coins, Landmark, AlertCircle } from "lucide-react";

interface Props {
    data: WasiyyahState;
    setFormData: React.Dispatch<React.SetStateAction<WasiyyahState>>;
}

export default function Step3Aset({ data, setFormData }: Props) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">3. Maklumat Aset</h2>
                    <p className="text-sm text-muted-foreground mt-1">Sila tanda aset yang ingin dimasukkan ke dalam pentadbiran ini.</p>
                </div>
                <details className="text-sm text-primary cursor-pointer relative group">
                    <summary className="flex items-center space-x-1 font-medium hover:underline">
                        <Info className="h-4 w-4" />
                        <span>Syarat Aset</span>
                    </summary>
                    <div className="absolute right-0 mt-2 w-72 bg-popover border border-border rounded-md shadow-md p-4 text-popover-foreground z-10">
                        <p className="font-bold mb-2">Syarat Uncang Emas:</p>
                        <p className="text-xs text-muted-foreground mb-3">Pewasiat wajib memiliki Uncang Emas lebih daripada 10 gram.</p>
                        <p className="font-bold mb-2">Aset mesti memenuhi kriteria:</p>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
                            <li>Halal di bawah Hukum Syarak</li>
                            <li>Dimiliki sepenuhnya oleh Pewasiat</li>
                            <li>Wujud semasa kematian Pewasiat</li>
                        </ul>
                    </div>
                </details>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Uncang Emas (Hardcoded as checked because it's the core system) */}
                <label className="flex flex-col items-center justify-between rounded-md border-2 border-primary bg-primary/5 p-6 cursor-not-allowed opacity-90 relative overflow-hidden">
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded-full font-bold">WAJIB</div>
                    <Coins className="mb-4 h-8 w-8 text-primary" />
                    <span className="font-bold text-foreground text-lg">Uncang Emas</span>
                    <span className="mt-2 text-xs text-center text-muted-foreground">
                        Aset emas mandatori di bawah platform KAB Gold (Min 10g).
                    </span>
                    <input type="checkbox" className="hidden" checked readOnly />
                </label>

                {/* Other Assets Toggle */}
                <label className={`flex flex-col items-center justify-between rounded-md border-2 p-6 cursor-pointer transition-all ${data.aset.other_assets ? 'border-primary bg-primary/10' : 'border-muted bg-transparent hover:bg-accent'}`}>
                    <Landmark className={`mb-4 h-8 w-8 ${data.aset.other_assets ? 'text-primary' : 'text-foreground'}`} />
                    <span className={`font-bold text-lg ${data.aset.other_assets ? 'text-primary' : 'text-foreground'}`}>Harta-harta Lain</span>
                    <span className="mt-2 text-xs text-center text-muted-foreground">
                        Cth: Hartanah, Kenderaan, Wang Tunai, Barang Kemas.
                    </span>
                    <input
                        type="checkbox"
                        className="hidden"
                        checked={data.aset.other_assets}
                        onChange={(e) => setFormData({ ...data, aset: { ...data.aset, other_assets: e.target.checked } })}
                    />
                </label>
            </div>

            {/* Conditional Legal Warning if Other Assets is selected */}
            {data.aset.other_assets && (
                <div className="flex items-start space-x-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-md text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="text-sm leading-relaxed">
                        <span className="font-bold block mb-1">Perhatian (Sistem Berasingan)</span>
                        Oleh kerana 'Harta-harta lain' ditanda, anda akan dibawa ke laman sesawang yang berasingan bagi tujuan 'Estate Planning' untuk menyenaraikan aset luaran. Maklumat ini tidak akan dikongsi dengan pihak KAB Gold.
                    </div>
                </div>
            )}

            <ConsentFooter />
        </div>
    );
}