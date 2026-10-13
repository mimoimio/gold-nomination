// src/components/wasiyyah/Step5Tugasan.tsx
import type { WasiyyahState } from '../../types/wasiyyah';
import ConsentFooter from './ConsentFooter';
import { Info } from "lucide-react";

interface Props {
    data: WasiyyahState;
    setFormData: React.Dispatch<React.SetStateAction<WasiyyahState>>;
}

const DUTIES_MAP = [
    { key: 'hold_HibahEmas', label: 'Memegang Hibah Emas untuk benefisiari Pewasiat' },
    { key: 'apply_probate', label: 'Membuat permohonan Geran Probet / Surat Kuasa Mentadbir di Mahkamah Tinggi' },
    { key: 'update_info', label: 'Mengumpul dan mengemaskinikan maklumat waris, harta dan hutang' },
    { key: 'pay_debts', label: 'Membayar kos pengurusan jenazah dan hutang' },
    { key: 'faraid_distribution', label: 'Pengagihan harta mengikut hukum Faraid bagi lebihan harta pusaka' },
    { key: 'child_guardian', label: 'Menjadi Penjaga dan Pemegang Amanah kepada anak bawah umur' },
] as const;

export default function Step5Tugasan({ data, setFormData }: Props) {

    const toggleDuty = (dutyKey: keyof WasiyyahState['duties'], wasiIndex: number) => {
        const currentArray = data.duties[dutyKey];
        const newArray = currentArray.includes(wasiIndex)
            ? currentArray.filter(i => i !== wasiIndex)
            : [...currentArray, wasiIndex];

        setFormData({
            ...data,
            duties: { ...data.duties, [dutyKey]: newArray }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">5. Tugasan Wasi</h2>
                    <p className="text-sm text-muted-foreground mt-1">Agihkan tanggungjawab kepada Wasi yang dilantik.</p>
                </div>
                <details className="text-sm text-primary cursor-pointer relative group">
                    <summary className="flex items-center space-x-1 font-medium hover:underline">
                        <Info className="h-4 w-4" />
                        <span>Tanggungjawab Wasi</span>
                    </summary>
                    <div className="absolute right-0 mt-2 w-72 bg-popover border border-border rounded-md shadow-md p-4 text-popover-foreground z-10">
                        <p className="font-bold mb-2">Amanah & Tindakan Sivil:</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Wasi tertakluk kepada tanggungjawab fidusiari. Jika berlakunya pecah amanah atau penyelewengan, Wasi boleh dikenakan tindakan sivil atau dituduh di bawah Kanun Keseksaan.
                        </p>
                    </div>
                </details>
            </div>

            <div className="overflow-x-auto border border-border rounded-md">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground">
                        <tr>
                            <th className="p-4 font-semibold">Senarai Tugas</th>
                            {data.wasi_list.map((_, idx) => (
                                <th key={idx} className="p-4 text-center font-semibold border-l border-border min-w-[100px]">
                                    Wasi {idx + 1}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {DUTIES_MAP.map((duty) => (
                            <tr key={duty.key} className="hover:bg-accent/50 transition-colors">
                                <td className="p-4 text-foreground">{duty.label}</td>
                                {data.wasi_list.map((_, wasiIndex) => (
                                    <td key={wasiIndex} className="p-4 text-center border-l border-border">
                                        <label className="cursor-pointer inline-flex items-center justify-center p-2 rounded hover:bg-accent">
                                            <input
                                                type="checkbox"
                                                className="h-5 w-5 rounded-sm border-primary text-primary focus:ring-primary accent-primary cursor-pointer"
                                                checked={(data.duties[duty.key as keyof WasiyyahState['duties']]).includes(wasiIndex)}
                                                onChange={() => toggleDuty(duty.key as keyof WasiyyahState['duties'], wasiIndex)}
                                            />
                                        </label>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ConsentFooter />
        </div>
    );
}