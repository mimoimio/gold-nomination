// src/components/CreateWasiyyah.tsx
import { useState } from 'react';
import type { WasiyyahState } from '../types/wasiyyah';
import { Button } from "@/components/ui/button";
import Step1Pewasiat from './wasiyyah/Step1Pewasiat';
import Step2Wasi from './wasiyyah/Step2Wasi';
import Step3Aset from './wasiyyah/Step3Aset';
import Step4Waris from './wasiyyah/Step4Waris';
import Step5Tugasan from './wasiyyah/Step5Tugasan';
import Step6Saksi from './wasiyyah/Step6Saksi';
import Step7Finale from './wasiyyah/Step7Finale';

export default function CreateWasiyyah() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<WasiyyahState>({
        pewasiat: { release_type: '', use_yusuf_advisory: false },
        wasi_list: [{ name: '', nric: '', phone: '', email: '', address: '', relationship: '' }],
        wasi_execution: '',
        aset: { uncang_emas: true, other_assets: false },
        waris_list: [],
        duties: { hold_HibahEmas: [], apply_probate: [], update_info: [], pay_debts: [], faraid_distribution: [], child_guardian: [] },
        saksi_list: [{ name: '', nric: '', address: '' }, { name: '', nric: '', address: '' }]
    });

    const handleNext = () => {
        setStep((prev) => Math.min(prev + 1, 7));
    };

    const prevStep = () => setStep((prev) => prev - 1);

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2 text-foreground">Borang Pendaftaran Wasi Emas</h1>

                {/* Progress Bar */}
                <div className="w-full bg-secondary rounded-full h-2.5">
                    <div
                        className="bg-primary h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${(step / 7) * 100}%` }}
                    ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Langkah {step} daripada 7</p>
            </div>

            {/* Container Card */}
            <div className="bg-card text-card-foreground border border-border shadow-sm rounded-lg p-6 min-h-[400px]">
                {step === 1 && <Step1Pewasiat data={formData} setFormData={setFormData} />}
                {step === 2 && <Step2Wasi data={formData} setFormData={setFormData} />}
                {step === 3 && <Step3Aset data={formData} setFormData={setFormData} />}
                {step === 4 && <Step4Waris data={formData} setFormData={setFormData} />}
                {step === 5 && <Step5Tugasan data={formData} setFormData={setFormData} />}
                {step === 6 && <Step6Saksi data={formData} setFormData={setFormData} />}
                {step === 7 && <Step7Finale formData={formData} />}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
                <Button
                    variant="outline"
                    disabled={step === 1}
                    onClick={prevStep}
                >
                    Kembali
                </Button>

                {step < 7 && <Button onClick={handleNext}>Seterusnya</Button>}
            </div>
        </div>
    );
}