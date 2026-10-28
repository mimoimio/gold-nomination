// src/components/wasiyyah/Step4Waris.tsx
import type { WasiyyahState } from '../../types/wasiyyah';
import ConsentFooter from './ConsentFooter';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, Plus, Trash2, Users } from "lucide-react";

interface Props {
    data: WasiyyahState;
    setFormData: React.Dispatch<React.SetStateAction<WasiyyahState>>;
}

export default function Step4Waris({ data, setFormData }: Props) {

    const addWaris = () => {
        setFormData({
            ...data,
            // Added email and phone to initialization[cite: 2]
            waris_list: [...data.waris_list, { name: '', nric: '', relationship: '', address: '', email: '', phone: '' }]
        });
    };

    const removeWaris = (indexToRemove: number) => {
        setFormData({
            ...data,
            waris_list: data.waris_list.filter((_, index) => index !== indexToRemove)
        });
    };

    const updateWaris = (index: number, field: string, value: string) => {
        const newList = [...data.waris_list];
        newList[index] = { ...newList[index], [field]: value };
        setFormData({ ...data, waris_list: newList });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">4. Maklumat Waris (Faraid)</h2>
                    <p className="text-sm text-muted-foreground mt-1">Senaraikan waris-waris Faraid anda untuk rujukan Wasi.</p>
                </div>

                {/* Massive Faraid Explanation Table hidden safely in a details tag */}
                <details className="text-sm text-primary cursor-pointer relative group">
                    <summary className="flex items-center space-x-1 font-medium hover:underline">
                        <Info className="h-4 w-4" />
                        <span>Kategori Waris</span>
                    </summary>
                    <div className="absolute right-0 mt-2 w-[320px] md:w-[450px] bg-popover border border-border rounded-md shadow-xl p-4 text-popover-foreground z-10 max-h-[60vh] overflow-y-auto">
                        <p className="font-bold mb-3 text-sm border-b border-border pb-2">Jadual Kategori Waris Faraid</p>

                        <div className="space-y-4 text-xs">
                            <div>
                                <p className="font-semibold text-primary">Waris Utama</p>
                                <p className="text-muted-foreground mb-1">Keutamaan tertinggi; tidak dikecualikan oleh waris lain.</p>
                                <ul className="list-disc pl-4 text-foreground">
                                    <li>Suami / Isteri</li>
                                    <li>Ibu / Bapa</li>
                                    <li>Anak Lelaki / Anak Perempuan</li>
                                </ul>
                            </div>

                            <div>
                                <p className="font-semibold text-primary">Waris Ganti</p>
                                <p className="text-muted-foreground mb-1">Mengambil alih jika Waris Utama tiada.</p>
                                <ul className="list-disc pl-4 text-foreground">
                                    <li>Datuk / Nenek</li>
                                    <li>Cucu Lelaki / Cucu Perempuan</li>
                                    <li>Cicit Lelaki / Cicit Perempuan</li>
                                </ul>
                            </div>

                            <div>
                                <p className="font-semibold text-primary">Waris Kedua</p>
                                <p className="text-muted-foreground mb-1">Mewarisi jika tiada keturunan lelaki atau bapa.</p>
                                <ul className="list-disc pl-4 text-foreground">
                                    <li>Adik-beradik (Seibu sebapa / Sebapa / Seibu)</li>
                                    <li>Anak Saudara Lelaki</li>
                                    <li>Bapa Saudara & Sepupu Lelaki</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </details>
            </div>

            {data.waris_list.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed border-border rounded-lg bg-accent/30">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                    <p className="text-muted-foreground mb-4">Tiada waris disenaraikan lagi.</p>
                    <Button onClick={addWaris} variant="secondary">
                        <Plus className="h-4 w-4 mr-2" /> Mula Tambah Waris
                    </Button>
                </div>
            ) : (
                <div className="space-y-6">
                    {data.waris_list.map((waris, index) => (
                        <div key={index} className="p-5 border border-border rounded-md bg-accent/30 relative">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-foreground">Waris {index + 1}</h3>
                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => removeWaris(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nama Penuh (Mengikut Kad Pengenalan)</Label>
                                    <Input value={waris.name} onChange={(e) => updateWaris(index, 'name', e.target.value)} placeholder="Nama Waris" />
                                </div>
                                <div className="space-y-2">
                                    <Label>No. Kad Pengenalan</Label>
                                    <Input value={waris.nric} onChange={(e) => updateWaris(index, 'nric', e.target.value)} placeholder="No. KP Waris" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Hubungan</Label>
                                    <Select value={waris.relationship} onValueChange={(val) => updateWaris(index, 'relationship', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Kategori Faraid" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Suami / Isteri">Suami / Isteri (Waris Utama)</SelectItem>
                                            <SelectItem value="Ibu / Bapa">Ibu / Bapa (Waris Utama)</SelectItem>
                                            <SelectItem value="Anak Lelaki / Perempuan">Anak (Waris Utama)</SelectItem>
                                            <SelectItem value="Cucu / Cicit">Cucu / Cicit (Waris Ganti)</SelectItem>
                                            <SelectItem value="Adik-beradik">Adik-beradik (Waris Kedua)</SelectItem>
                                            <SelectItem value="Lain-lain">Lain-lain Kategori Sah</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* New Phone Field */}
                                <div className="space-y-2">
                                    <Label>No. Telefon Semasa</Label>
                                    <Input type="tel" value={waris.phone} onChange={(e) => updateWaris(index, 'phone', e.target.value)} placeholder="Contoh: 012-3456789" />
                                </div>
                                {/* New Email Field (Spans full width on small screens, half on md) */}
                                <div className="space-y-2">
                                    <Label>Alamat Emel</Label>
                                    <Input type="email" value={waris.email} onChange={(e) => updateWaris(index, 'email', e.target.value)} placeholder="emel.waris@gmail.com" />
                                </div>
                                {/* Address Field (Spans full width) */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Alamat Surat-Menyurat</Label>
                                    <Input value={waris.address} onChange={(e) => updateWaris(index, 'address', e.target.value)} placeholder="Alamat Penuh" />
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button onClick={addWaris} variant="outline" className="w-full border-dashed border-2 flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Tambah Waris Seterusnya
                    </Button>
                </div>
            )}

            <ConsentFooter />
        </div>
    );
}