// src/components/Signup.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import pb from '../lib/pocketbase';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins, Loader2 } from "lucide-react";

export default function Signup() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        full_name: "",
        nric_number: "",
        email: "",
        password: "",
        passwordConfirm: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (formData.password !== formData.passwordConfirm) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        try {
            // 1. Create the user in PocketBase
            const userData = {
                ...formData,
                role: 'investor', // Force the role so they can't make themselves an admin
                total_gold_balance: 0, // New users start with 0g
                emailVisibility: true,
            };

            await pb.collection('users').create(userData);

            // 2. Automatically log them in after successful creation
            await pb.collection('users').authWithPassword(formData.email, formData.password);

            // 3. Redirect to their new dashboard
            navigate('/dashboard');
        } catch (err: any) {
            console.error("Signup failed:", err);
            setError(err.response?.message || "Failed to create account. Email or NRIC may already be in use.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-3 items-center text-center">
                    <div className="bg-yellow-600 p-3 rounded-xl inline-block mb-2">
                        <Coins className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
                    <CardDescription>
                        Register as an investor to start managing your digital gold and succession planning.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name (As per IC)</Label>
                            <Input
                                id="full_name"
                                required
                                placeholder="e.g. Ahmad Faizal"
                                value={formData.full_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nric_number">NRIC Number</Label>
                            <Input
                                id="nric_number"
                                required
                                placeholder="e.g. 900101-14-5555"
                                value={formData.nric_number}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="passwordConfirm">Confirm Password</Label>
                                <Input
                                    id="passwordConfirm"
                                    type="password"
                                    required
                                    value={formData.passwordConfirm}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm text-center">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
                                </>
                            ) : "Sign Up"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4 mt-2">
                    <p className="text-sm text-muted-foreground">
                        Already have an account? <Link to="/login" className="text-yellow-600 font-semibold hover:underline">Log in</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}