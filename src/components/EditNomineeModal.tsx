import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Gift, Scale } from "lucide-react";
import type { NominationRecord } from "../types/database";
interface EditNomineeModalProps {
    nominee: NominationRecord | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (id: string, data: any) => void;
    availableAllocation: number;
}

export default function EditNomineeModal({ nominee, isOpen, onClose, onSubmit, availableAllocation }: EditNomineeModalProps) {
    const [name, setName] = useState("");
    const [nric, setNric] = useState("");
    const [relationship, setRelationship] = useState("");
    const [allocation, setAllocation] = useState("");
    const [roleType, setRoleType] = useState<"Hibah" | "Pentadbir">("Hibah");

    // When the modal opens or the nominee changes, pre-fill the form
    useEffect(() => {
        if (nominee) {
            setName(nominee.nominee_name);
            setNric(nominee.nominee_nric);
            setRelationship(nominee.relationship);
            setAllocation(nominee.allocation_percentage.toString());
            setRoleType(nominee.role_type);
        }
    }, [nominee, isOpen]);

    // The maximum they can allocate is the remaining unallocated pool PLUS what they already had
    const maxAllowed = nominee ? availableAllocation + nominee.allocation_percentage : availableAllocation;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nominee) return;

        onSubmit(nominee.id, {
            nominee_name: name,
            nominee_nric: nric,
            relationship: relationship,
            allocation_percentage: Number(allocation),
            role_type: roleType,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-foreground">Edit Beneficiary</DialogTitle>
                    <DialogDescription>
                        Update the details or legal role for {nominee?.nominee_name}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    {/* Basic Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Full Name (as per IC)</Label>
                            <Input id="edit-name" required value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-nric">NRIC Number</Label>
                            <Input id="edit-nric" required value={nric} onChange={(e) => setNric(e.target.value)} />
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
                            <Label htmlFor="edit-allocation">Allocation (%)</Label>
                            <Input
                                id="edit-allocation"
                                type="number"
                                required
                                min="1"
                                max={maxAllowed}
                                value={allocation}
                                onChange={(e) => setAllocation(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Available to allocate: {maxAllowed}%</p>
                        </div>
                    </div>

                    {/* The Legal Framework Logic */}
                    <div className="space-y-3 pt-2">
                        <Label className="text-base font-semibold text-foreground">Declare Shariah Legal Role</Label>
                        <RadioGroup value={roleType} onValueChange={(v: "Hibah" | "Pentadbir") => setRoleType(v)} className="grid grid-cols-2 gap-4">
                            <div>
                                <RadioGroupItem value="Hibah" id="edit-hibah" className="peer sr-only" />
                                <Label
                                    htmlFor="edit-hibah"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                                >
                                    <Gift className="mb-3 h-6 w-6" />
                                    <span className="font-bold">Hibah (Absolute Gift)</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="Pentadbir" id="edit-pentadbir" className="peer sr-only" />
                                <Label
                                    htmlFor="edit-pentadbir"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                                >
                                    <Scale className="mb-3 h-6 w-6" />
                                    <span className="font-bold">Pentadbir (Administrator)</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Update Beneficiary</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}