// src/components/Header.tsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import pb from '../lib/pocketbase';

// shadcn components
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LogOut, User, Coins, Menu } from "lucide-react";

export default function Header() {
    const { user, isValid } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // State to control the mobile menu so it closes automatically when a link is clicked
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleLogout = () => {
        pb.authStore.clear();
        setIsMobileOpen(false);
        navigate('/login');
    };

    // Helper for Desktop Links
    const getLinkStyle = (path: string) => {
        const isActive = location.pathname === path;
        return `text-sm font-medium transition-colors hover:text-yellow-600 ${isActive ? "text-yellow-600 border-b-2 border-yellow-600 pb-1" : "text-muted-foreground"
            }`;
    };

    // Helper for Mobile Links
    const getMobileLinkStyle = (path: string) => {
        const isActive = location.pathname === path;
        return `block px-4 py-3 text-lg font-medium rounded-md transition-colors ${isActive ? "bg-yellow-50 text-yellow-700" : "text-foreground hover:bg-muted"
            }`;
    };

    // The Navigation Links Payload (separated to avoid duplicating code)
    const renderNavLinks = (isMobile = false) => {
        if (!isValid || !user) return null;

        const linkClass = isMobile ? getMobileLinkStyle : getLinkStyle;
        const closeMenu = () => isMobile && setIsMobileOpen(false);

        if (user.role === 'admin') {
            return (
                <>
                    <Link to="/admin/approvals" className={linkClass('/admin/approvals')} onClick={closeMenu}>
                        KYC Approvals
                    </Link>
                    <Link to="/admin/claims" className={linkClass('/admin/claims')} onClick={closeMenu}>
                        Death Claims
                    </Link>
                </>
            );
        }

        return (
            <>
                <Link to="/dashboard" className={linkClass('/dashboard')} onClick={closeMenu}>
                    Overview
                </Link>
                <Link to="/manage" className={linkClass('/manage')} onClick={closeMenu}>
                    Manage Beneficiaries
                </Link>
                <Link to="/user/claim" className={linkClass('/user/claim')} onClick={closeMenu}>
                    Report Demise
                </Link>
            </>
        );
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm">
            <div className="max-w-5xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">

                <div className="flex items-center gap-3">
                    {/* Mobile Hamburger Menu (Hidden on md and larger) */}
                    {isValid && user && (
                        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden -ml-2">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Toggle navigation menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-70 sm:w-[320px]">
                                <SheetHeader className="text-left mb-6">
                                    <SheetTitle className="flex items-center gap-2">
                                        <div className="bg-yellow-600 p-1.5 rounded-lg">
                                            <Coins className="h-4 w-4 text-white" />
                                        </div>
                                        <span>Nomination Portal</span>
                                    </SheetTitle>
                                </SheetHeader>
                                <nav className="flex flex-col space-y-1 mt-4">
                                    {renderNavLinks(true)}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    )}

                    {/* Branding */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="bg-yellow-600 p-2 rounded-lg hidden md:block">
                            <Coins className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-lg">
                            Gold Trading <span className="text-yellow-600 hidden sm:inline-block">Nomination</span>
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation (Hidden on small screens) */}
                <nav className="hidden md:flex items-center gap-6">
                    {renderNavLinks(false)}
                </nav>

                {/* User Profile Menu (Stays on the right for both mobile and desktop) */}
                {isValid && user && (
                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 md:h-10 md:w-10 rounded-full">
                                    <Avatar className="h-9 w-9 md:h-10 md:w-10 border-2 border-yellow-200">
                                        <AvatarFallback className="bg-yellow-50 text-yellow-700 font-semibold">
                                            {user.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.full_name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {pb.authStore.model?.email}
                                        </p>
                                        <p className="text-xs font-bold text-yellow-600 mt-1 capitalize">
                                            Role: {user.role}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}

            </div>
        </header>
    );
}