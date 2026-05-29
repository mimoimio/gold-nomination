// src/components/AddNomineeModal.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Gift, Scale } from "lucide-react";

interface AddNomineeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    maxAllocation: number;
}

export default function AddNomineeModal({ isOpen, onClose, onSubmit, maxAllocation }: AddNomineeModalProps) {
    const [name, setName] = useState("");
    const [nric, setNric] = useState("");
    const [relationship, setRelationship] = useState("");
    const [allocation, setAllocation] = useState("");
    const [roleType, setRoleType] = useState<"Hibah" | "Pentadbir">("Hibah");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        onSubmit({
            nominee_name: name,
            nominee_nric: nric,
            relationship: relationship,
            allocation_percentage: Number(allocation),
            role_type: roleType,
            status: 'Pending'
        });

        setName("");
        setNric("");
        setRelationship("");
        setAllocation("");
        setRoleType("Hibah");
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            {/* Removed bg-white, letting shadcn's DialogContent handle the background/foreground automatically */}
            <DialogContent className="sm:max-w-150">
                <DialogHeader>
                    {/* Swapped text-foreground for text-foreground */}
                    <DialogTitle className="text-2xl font-bold text-foreground">Add New Beneficiary</DialogTitle>
                    <DialogDescription>
                        Register a new nominee and declare their legal role for asset distribution.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name (as per IC)</Label>
                            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ahmad Faizal" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nric">NRIC Number</Label>
                            <Input id="nric" required value={nric} onChange={(e) => setNric(e.target.value)} placeholder="e.g. 900101-14-5555" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Relationship</Label>
                            <Select required value={relationship} onValueChange={setRelationship}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Spouse">Spouse</SelectItem>
                                    <SelectItem value="Child">Child</SelectItem>
                                    <SelectItem value="Parent">Parent</SelectItem>
                                    <SelectItem value="Sibling">Sibling</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="allocation">Allocation (%)</Label>
                            <Input
                                id="allocation"
                                type="number"
                                required
                                min="1"
                                max={maxAllocation}
                                value={allocation}
                                onChange={(e) => setAllocation(e.target.value)}
                                placeholder={`Max: ${maxAllocation}%`}
                            />
                            {/* Swapped text-muted-foreground for text-muted-foreground */}
                            <p className="text-xs text-muted-foreground">Available to allocate: {maxAllocation}%</p>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        {/* Swapped text-foreground for text-foreground */}
                        <Label className="text-base font-semibold text-foreground">Declare Shariah Legal Role</Label>
                        <RadioGroup value={roleType} onValueChange={(v: "Hibah" | "Pentadbir") => setRoleType(v)} className="grid grid-cols-2 gap-4">

                            {/* Hibah Card - Updated to use semantic theme colors (primary and accent) */}
                            <div>
                                <RadioGroupItem value="Hibah" id="hibah" className="peer sr-only" />
                                <Label
                                    htmlFor="hibah"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                                >
                                    <Gift className="mb-3 h-6 w-6" />
                                    <span className="font-bold">Hibah (Absolute Gift)</span>
                                    <span className="mt-2 text-xs text-center text-muted-foreground font-normal">
                                        Nominee receives this portion entirely for themselves.
                                    </span>
                                </Label>
                            </div>

                            {/* Pentadbir Card - Updated to use semantic theme colors (primary and accent) */}
                            <div>
                                <RadioGroupItem value="Pentadbir" id="pentadbir" className="peer sr-only" />
                                <Label
                                    htmlFor="pentadbir"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                                >
                                    <Scale className="mb-3 h-6 w-6" />
                                    <span className="font-bold">Pentadbir (Administrator)</span>
                                    <span className="mt-2 text-xs text-center text-muted-foreground font-normal">
                                        Nominee must distribute this portion to heirs via Faraid.
                                    </span>
                                </Label>
                            </div>

                        </RadioGroup>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        {/* Changed to standard primary button so it uses your configured theme color */}
                        <Button type="submit">Save Beneficiary</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}