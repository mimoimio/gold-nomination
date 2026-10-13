// src/components/wasiyyah/Step6Saksi.tsx
import type { WasiyyahState } from '../../types/wasiyyah';
import ConsentFooter from './ConsentFooter';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info, Plus, Trash2, UserCheck } from "lucide-react";

interface Props {
    data: WasiyyahState;
    setFormData: React.Dispatch<React.SetStateAction<WasiyyahState>>;
}

export default function Step6Saksi({ data, setFormData }: Props) {

    const addSaksi = () => {
        if (data.saksi_list.length < 4) {
            setFormData({
                ...data,
                saksi_list: [...data.saksi_list, { name: '', nric: '', address: '' }]
            });
        }
    };

    const removeSaksi = (indexToRemove: number) => {
        setFormData({
            ...data,
            saksi_list: data.saksi_list.filter((_, index) => index !== indexToRemove)
        });
    };

    const updateSaksi = (index: number, field: string, value: string) => {
        const newList = [...data.saksi_list];
        newList[index] = { ...newList[index], [field]: value };
        setFormData({ ...data, saksi_list: newList });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">6. Maklumat Saksi</h2>
                    <p className="text-sm text-muted-foreground mt-1">Lantik saksi bagi tujuan pengesahan (Maksimum 4 orang)[cite: 4].</p>
                </div>
                <details className="text-sm text-primary cursor-pointer relative group">
                    <summary className="flex items-center space-x-1 font-medium hover:underline">
                        <Info className="h-4 w-4" />
                        <span>Syarat Saksi</span>
                    </summary>
                    <div className="absolute right-0 mt-2 w-72 bg-popover border border-border rounded-md shadow-md p-4 text-popover-foreground z-10">
                        <p className="font-bold mb-2">Keperluan Saksi[cite: 4]:</p>
                        <p className="text-xs text-muted-foreground mb-2">Dokumen mesti ditandatangani di hadapan 2 saksi lelaki ATAU 1 lelaki dan 2 perempuan.</p>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
                            <li>Beragama Islam & Aqil baligh</li>
                            <li>Sempurna akal fikiran</li>
                            <li>Bukan waris atau Wasi</li>
                        </ul>
                    </div>
                </details>
            </div>

            <div className="space-y-6">
                {data.saksi_list.map((saksi, index) => (
                    <div key={index} className="p-5 border border-border rounded-md bg-accent/30 relative">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-foreground flex items-center">
                                <UserCheck className="h-4 w-4 mr-2 text-primary" /> Saksi {index + 1}
                            </h3>
                            {index > 1 && ( // Only allow deletion if more than 2 saksi exist
                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => removeSaksi(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nama Penuh (Mengikut Kad Pengenalan)</Label>
                                <Input value={saksi.name} onChange={(e) => updateSaksi(index, 'name', e.target.value)} placeholder="Nama Saksi" />
                            </div>
                            <div className="space-y-2">
                                <Label>No. Kad Pengenalan</Label>
                                <Input value={saksi.nric} onChange={(e) => updateSaksi(index, 'nric', e.target.value)} placeholder="No. KP Saksi" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Alamat Surat-Menyurat</Label>
                                <Input value={saksi.address} onChange={(e) => updateSaksi(index, 'address', e.target.value)} placeholder="Alamat Penuh" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {data.saksi_list.length < 4 && (
                <Button onClick={addSaksi} variant="outline" className="w-full border-dashed border-2 flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Tambah Saksi Tambahan
                </Button>
            )}

            <ConsentFooter />
        </div>
    );
}