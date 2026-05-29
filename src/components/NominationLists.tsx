// src/components/NominationList.tsx
import { useEffect, useState } from 'react';
import pb from '../lib/pocketbase';
import { useAuth } from '../context/AuthContext';
import type { NominationRecord } from '../types/database';

// shadcn/ui components
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit, MoreVertical, PlusCircle, ShieldCheck, Trash2, User as UserIcon } from "lucide-react";
import AddNomineeModal from './AddNomineeModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import EditNomineeModal from './EditNomineeModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

export default function NominationList() {
    const { user, isValid } = useAuth();
    const [nominations, setNominations] = useState<NominationRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nomineeToEdit, setNomineeToEdit] = useState<NominationRecord | null>(null);
    const [nomineeToDelete, setNomineeToDelete] = useState<string | null>(null);

    useEffect(() => {
        const fetchNominations = async () => {
            if (!isValid || !user) return;

            try {
                // Fetch the user's specific nominees from PocketBase
                const records = await pb.collection('nominations').getFullList<NominationRecord>({
                    filter: `user_id = "${user.id}"`,
                    sort: '-created',
                });
                setNominations(records);
            } catch (error) {
                console.error("Failed to fetch records:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNominations();
    }, [user, isValid]);

    // Calculate total allocated percentage
    const totalAllocated = nominations.reduce((sum, nom) => sum + nom.allocation_percentage, 0);
    const maxAvailable = 100 - totalAllocated; // Calculate remaining percentage

    const handleAddNominee = async (newNomineeData: any) => {
        try {
            // Add the currently logged-in user's ID to the payload
            const dataToSubmit = {
                ...newNomineeData,
                user_id: user?.id
            };

            // Save to PocketBase
            const record: NominationRecord = await pb.collection('nominations').create(dataToSubmit);

            // Update the local UI state so the new card appears immediately
            setNominations([record, ...nominations]);
            setIsModalOpen(false); // Close the modal

        } catch (error) {
            console.error("Failed to save nominee:", error);
            alert("Error saving beneficiary. Please try again.");
        }
    };

    // Edit Handler
    const handleUpdateNominee = async (id: string, updatedData: any) => {
        try {
            const record: NominationRecord = await pb.collection('nominations').update(id, updatedData);
            setNominations(nominations.map(nom => nom.id === id ? record : nom));
            setNomineeToEdit(null); // Close modal
        } catch (error) {
            console.error("Failed to update nominee:", error);
            alert("Error updating beneficiary.");
        }
    };
    // Delete Handler
    const confirmDelete = async () => {
        if (!nomineeToDelete) return;
        try {
            await pb.collection('nominations').delete(nomineeToDelete);
            setNominations(nominations.filter(nom => nom.id !== nomineeToDelete));
        } catch (error) {
            console.error("Failed to delete nominee:", error);
            alert("Error deleting beneficiary.");
        } finally {
            setNomineeToDelete(null); // Close dialog
        }
    };

    if (!isValid || !user) return null; // Let the ProtectedRoute handle redirect

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* 1. Account Summary Card */}
            <Card className="bg-muted/30 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between ">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <h2 className="text-2xl font-bold ">{user.full_name}</h2>
                                {user.verified && (
                                    <Badge variant="secondary" >
                                        <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">NRIC: {user.nric_number}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">Total Gold Balance</p>
                            <p className="text-3xl font-bold text-primary">
                                {user.total_gold_balance.toFixed(2)} <span className="text-lg text-muted-foreground">Grams</span>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Nominations Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-semibold">Your Beneficiaries</h3>
                        <p className="text-sm text-muted-foreground">
                            Total Allocated: {totalAllocated}% / 100%
                        </p>
                    </div>
                    <div className="flex items-center justify-between">
                        <Button
                            className="bg-yellow-600 hover:bg-yellow-700"
                            onClick={() => setIsModalOpen(true)}
                            disabled={totalAllocated >= 100} // Disable if they already allocated 100%
                        >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Add Nominee
                        </Button>
                    </div>
                </div>

                {/* Progress bar showing total allocation */}
                <Progress value={totalAllocated} className="h-2 mb-6" />

                {/* 3. Nominee Cards List */}
                {isLoading ? (
                    <p className="text-muted-foreground text-center py-8">Loading beneficiaries...</p>
                ) : nominations.length === 0 ? (
                    <Card className="border-dashed shadow-none">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <UserIcon className="w-12 h-12 mb-4 opacity-50" />
                            <p>No beneficiaries added yet.</p>
                            <p className="text-sm">Click "Add Nominee" to secure your assets.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {nominations.map((nom) => (
                            <Card key={nom.id} className="overflow-hidden shadow-sm">
                                <CardContent className="p-0">
                                    <div className="flex items-center justify-between p-4 sm:p-6">

                                        {/* Nominee Info */}
                                        <div className="flex items-start gap-4 w-full">
                                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                <UserIcon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div className='w-full'>
                                                <h4 className="text-left font-semibold">{nom.nominee_name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm text-muted-foreground">{nom.relationship}</span>
                                                    <span className="text-muted-foreground">•</span>
                                                    <span className="text-sm text-muted-foreground">{nom.nominee_nric}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Legal Role & Allocation */}
                                        <div className="flex items-center gap-6">
                                            {/* Shariah Role Badge */}
                                            <div className="text-right">
                                                <Badge variant={nom.role_type === 'Hibah' ? "default" : "secondary"}>
                                                    {nom.role_type}
                                                </Badge>
                                            </div>

                                            {/* Percentage */}
                                            <div className="text-right min-w-[80px]">
                                                <p className="text-2xl font-bold">{nom.allocation_percentage}%</p>
                                            </div>

                                            {/* Status Dot */}
                                            <div className="flex items-center justify-end min-w-[80px]">
                                                <div className={`flex items-center gap-2 text-sm font-medium ${nom.status === 'Active' ? 'text-green-600' : 'text-orange-500'
                                                    }`}>
                                                    <span className={`w-2 h-2 rounded-full ${nom.status === 'Active' ? 'bg-green-500' : 'bg-orange-500'}`} />
                                                    {nom.status}
                                                </div>
                                            </div>
                                            {/* Actions Menu (The New Part) */}
                                            <div className="flex items-center gap-4 min-w-[120px] justify-end">

                                                {/* Action Dropdown */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setNomineeToEdit(nom)} className="cursor-pointer">
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setNomineeToDelete(nom.id)} className="cursor-pointer text-destructive focus:text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                <AddNomineeModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleAddNominee}
                    maxAllocation={maxAvailable} // Pass down the remaining percentage
                />
                <EditNomineeModal
                    isOpen={!!nomineeToEdit}
                    nominee={nomineeToEdit}
                    onClose={() => setNomineeToEdit(null)}
                    onSubmit={handleUpdateNominee}
                    availableAllocation={maxAvailable}
                />

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={!!nomineeToDelete} onOpenChange={(open) => !open && setNomineeToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently remove the beneficiary from your estate planning records.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                Delete Beneficiary
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}