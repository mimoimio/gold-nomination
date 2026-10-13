// src/components/wasiyyah/Step2Wasi.tsx
import type { WasiyyahState } from '../../types/wasiyyah';
import ConsentFooter from './ConsentFooter';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info, Plus, Users, ArrowRightLeft } from "lucide-react";

interface Props {
    data: WasiyyahState;
    setFormData: React.Dispatch<React.SetStateAction<WasiyyahState>>;
}

export default function Step2Wasi({ data, setFormData }: Props) {

    const addWasi = () => {
        if (data.wasi_list.length < 3) {
            setFormData({
                ...data,
                wasi_list: [...data.wasi_list, { name: '', nric: '', phone: '', email: '', address: '', relationship: '' }]
            });
        }
    };

    const updateWasi = (index: number, field: string, value: string) => {
        const newList = [...data.wasi_list];
        newList[index] = { ...newList[index], [field]: value };
        setFormData({ ...data, wasi_list: newList });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">2. Maklumat Wasi</h2>
                    <p className="text-sm text-muted-foreground mt-1">Lantik sehingga tiga (3) orang pemegang amanah untuk pentadbiran harta.</p>
                </div>
                <details className="text-sm text-primary cursor-pointer relative group">
                    <summary className="flex items-center space-x-1 font-medium hover:underline">
                        <Info className="h-4 w-4" />
                        <span>Syarat Wasi</span>
                    </summary>
                    <div className="absolute right-0 mt-2 w-72 bg-popover border border-border rounded-md shadow-md p-4 text-popover-foreground z-10">
                        <p className="font-bold mb-2">Siapakah Wasi?</p>
                        <p className="text-xs text-muted-foreground mb-2">Penjaga Harta dan Pemegang Amanah. Wasi tidak mempunyai hak milik melainkan bahagian Faraidnya sendiri.</p>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
                            <li>Beragama Islam & 18 tahun ke atas</li>
                            <li>Sempurna akal fikiran</li>
                            <li>Jujur dan berintegriti ('Adil)</li>
                            <li>Tiada perselisihan dengan Pewasiat</li>
                        </ul>
                    </div>
                </details>
            </div>

            <div className="space-y-6">
                {data.wasi_list.map((wasi, index) => (
                    <div key={index} className="p-5 border border-border rounded-md bg-accent/30 relative">
                        <h3 className="font-bold text-foreground mb-4 flex items-center">
                            <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center mr-2">{index + 1}</span>
                            {index === 0 ? 'Wasi Utama (Wajib)' : `Wasi Gantian ${index}`}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nama Penuh (Mengikut Kad Pengenalan)</Label>
                                <Input value={wasi.name} onChange={(e) => updateWasi(index, 'name', e.target.value)} placeholder="e.g. Ahmad Faizal" />
                            </div>
                            <div className="space-y-2">
                                <Label>No. Kad Pengenalan</Label>
                                <Input value={wasi.nric} onChange={(e) => updateWasi(index, 'nric', e.target.value)} placeholder="e.g. 900101-14-5555" />
                            </div>
                            <div className="space-y-2">
                                <Label>No. Telefon</Label>
                                <Input value={wasi.phone} onChange={(e) => updateWasi(index, 'phone', e.target.value)} placeholder="e.g. 012-3456789" />
                            </div>
                            <div className="space-y-2">
                                <Label>Hubungan bersama Pewasiat</Label>
                                <Select value={wasi.relationship} onValueChange={(val) => updateWasi(index, 'relationship', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih hubungan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Spouse">Suami / Isteri</SelectItem>
                                        <SelectItem value="Child">Anak</SelectItem>
                                        <SelectItem value="Parent">Ibu / Bapa</SelectItem>
                                        <SelectItem value="Sibling">Adik-Beradik</SelectItem>
                                        <SelectItem value="Other">Lain-lain</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Alamat Surat-Menyurat</Label>
                                <Input value={wasi.address} onChange={(e) => updateWasi(index, 'address', e.target.value)} placeholder="Alamat penuh" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {data.wasi_list.length < 3 && (
                <Button onClick={addWasi} variant="outline" className="w-full border-dashed border-2 flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Tambah Wasi Gantian
                </Button>
            )}

            {/* Execution Type using Shadcn RadioGroup Card Style */}
            <div className="space-y-3 pt-6 border-t border-border">
                <Label className="text-base font-semibold text-foreground">Kaedah Pelaksanaan Tugas Wasi</Label>
                <RadioGroup
                    value={data.wasi_execution}
                    onValueChange={(v: "Serentak" | "Berturutan") => setFormData({ ...data, wasi_execution: v })}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <div>
                        <RadioGroupItem value="Serentak" id="exec-serentak" className="peer sr-only" />
                        <Label htmlFor="exec-serentak" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary cursor-pointer transition-all">
                            <Users className="mb-3 h-6 w-6" />
                            <span className="font-bold">Serentak (Bersama)</span>
                            <span className="mt-2 text-xs text-center text-muted-foreground font-normal">
                                Semua wasi berkongsi tanggungjawab pada masa yang sama.
                            </span>
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="Berturutan" id="exec-berturutan" className="peer sr-only" />
                        <Label htmlFor="exec-berturutan" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary cursor-pointer transition-all">
                            <ArrowRightLeft className="mb-3 h-6 w-6" />
                            <span className="font-bold">Berturutan (Ambil Alih)</span>
                            <span className="mt-2 text-xs text-center text-muted-foreground font-normal">
                                Wasi gantian akan ambil alih jika wasi sebelumnya tidak dapat bertugas.
                            </span>
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            <ConsentFooter />
        </div>
    );
}