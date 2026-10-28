import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FileText, AlertTriangle, Info } from "lucide-react";

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Overview Section */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.full_name}</h1>
                <div className="mt-4 flex gap-3 text-muted-foreground">
                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed">
                        <strong className="text-foreground">System Overview:</strong> This Wasiemas Management System secures your KAB Gold assets.
                        Use this dashboard to appoint an administrator (Wasi) who will safely manage and distribute your assets according to your legally bound document.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Create Wasiemas Section */}
                <div className="border border-border rounded-lg p-6 bg-card flex flex-col h-full shadow-sm hover:shadow-md transition-all">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-foreground">Create Wasiemas</h2>
                    <p className="text-sm text-muted-foreground flex-grow mb-6">
                        Lantik Wasi (pentadbir) dan jana dokumen perundangan rasmi anda untuk mentadbir aset emas KAB Gold anda.
                    </p>
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={() => navigate('/wasiyyah/create')}
                    >
                        Cipta Wasiemas
                    </Button>
                </div>

                {/* Report Demise Section[cite: 2] */}
                <div className="border border-border rounded-lg p-6 bg-card flex flex-col h-full shadow-sm hover:shadow-md transition-all">
                    <div className="bg-destructive/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-foreground">Report Demise</h2>
                    <p className="text-sm text-muted-foreground flex-grow mb-6">
                        Laporkan kematian pemegang akaun dan muat naik sijil kematian untuk semakan pihak pengurusan KAB Gold.
                    </p>
                    <Button
                        variant="outline"
                        className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                        size="lg"
                        onClick={() => navigate('/user/claim')}
                    >
                        Lapor Kematian
                    </Button>
                </div>
            </div>
        </div>
    );
}