// src/components/Login.tsx
import { useState } from 'react';
import pb from '../lib/pocketbase';
import { useNavigate, Link } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins, Loader2 } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // PocketBase handles the entire authentication flow
            await pb.collection('users').authWithPassword(email, password);

            // If successful, redirect the user to the main dashboard
            navigate('/dashboard');

        } catch (error) {
            console.error("Login failed:", error);
            setError('Emel atau kata laluan tidak sah. Sila cuba lagi.');
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
                    <CardTitle className="text-2xl font-bold">Log Masuk Akaun</CardTitle>
                    <CardDescription>
                        Portal Wasi Emas KAB Gold
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2 text-left">
                            <Label htmlFor="email">Alamat Emel</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 text-left">
                            <Label htmlFor="password">Kata Laluan</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm text-center">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sedang log masuk...
                                </>
                            ) : "Log Masuk"}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex justify-center border-t p-4 mt-2">
                    <p className="text-sm text-muted-foreground">
                        Belum ada akaun? <Link to="/signup" className="text-yellow-600 font-semibold hover:underline">Daftar</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}