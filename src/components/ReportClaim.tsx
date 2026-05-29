// src/components/ReportClaim.tsx
import { useState } from 'react';
import pb from '../lib/pocketbase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ReportClaim() {
    const [deceasedNric, setDeceasedNric] = useState("");
    const [reporterName, setReporterName] = useState("");
    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // STEP 1: Find the deceased user by their NRIC
            const users = await pb.collection('users').getFullList({
                filter: `nric_number = "${deceasedNric}"`,
            });

            if (users.length === 0) {
                throw new Error("No account found with that NRIC number.");
            }

            const deceasedUserId = users[0].id;

            // STEP 2: Prepare the FormData for the file upload
            const formData = new FormData();
            formData.append('deceased_user_id', deceasedUserId);
            formData.append('reporter_name', reporterName);
            formData.append('status', 'Pending');

            if (certificateFile) {
                formData.append('death_certificate', certificateFile);
            }

            // STEP 3: Submit to the claims collection
            await pb.collection('claims').create(formData);

            setIsSuccess(true);

        } catch (err: any) {
            console.error("Submission failed:", err);
            setError(err.message || "Failed to submit claim. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="max-w-2xl mx-auto p-6 mt-10 text-center">
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-8 space-y-4">
                        <h2 className="text-2xl font-bold text-green-800">Claim Submitted Successfully</h2>
                        <p className="text-green-700">
                            The death certificate has been forwarded to our Shariah compliance team for verification.
                            If active nominations exist, the gold distribution will be executed shortly.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 mt-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Report Account Holder Demise</CardTitle>
                    <CardDescription>
                        Upload an official death certificate to initiate the asset distribution or Faraid process.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="nric">Deceased Account Holder NRIC</Label>
                            <Input
                                id="nric"
                                required
                                placeholder="e.g. 500101-14-5555"
                                value={deceasedNric}
                                onChange={(e) => setDeceasedNric(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reporter">Your Full Name (Claimant)</Label>
                            <Input
                                id="reporter"
                                required
                                placeholder="e.g. Ahmad Faizal"
                                value={reporterName}
                                onChange={(e) => setReporterName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="certificate">Upload Death Certificate (PDF/Image)</Label>
                            <Input
                                id="certificate"
                                type="file"
                                required
                                accept=".pdf,image/*"
                                onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Must be a clear, legible copy of the official document.
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-destructive/10 text-destructive border border-destructive/30 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Submitting Claim..." : "Submit Claim for Verification"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}