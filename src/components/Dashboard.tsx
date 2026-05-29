// src/components/Dashboard.tsx
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 mt-10">
            <h1 className="text-3xl font-bold">Welcome back, {user?.full_name}</h1>
            <p className="text-muted-foreground">This is your main dashboard overview.</p>

            {/* Quick link to the manage page */}
            <Button onClick={() => navigate('/manage')}>
                Manage Beneficiaries
            </Button>
        </div>
    );
}