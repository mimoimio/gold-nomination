import { useState } from 'react';
import pb from '../lib/pocketbase';
import type { UserRecord } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Save, Users } from 'lucide-react';

interface EditableUser {
    full_name: string;
    email: string;
    phone: string;
    address: string;
}

const toEditable = (user: UserRecord): EditableUser => ({
    full_name: user.full_name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    address: user.address ?? '',
});

export default function AdminMaintenance() {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [drafts, setDrafts] = useState<Record<string, EditableUser>>({});
    const [isSearching, setIsSearching] = useState(false);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [error, setError] = useState('');

    const searchUsers = async (event?: React.FormEvent) => {
        event?.preventDefault();
        setIsSearching(true);
        setError('');
        try {
            const filter = query.trim()
                ? `full_name ~ "${query.trim()}" || nric_number ~ "${query.trim()}" || email ~ "${query.trim()}"`
                : '';
            const records = filter
                ? await pb.collection('users').getFullList({ filter, sort: '-created' })
                : await pb.collection('users').getList(1, 20, { sort: '-created' });
            const items = (Array.isArray(records) ? records : records.items) as unknown as UserRecord[];
            setUsers(items);
            setDrafts(Object.fromEntries(items.map((user) => [user.id, toEditable(user)])));
        } catch (err) {
            console.error('Failed to search users', err);
            setError('Gagal mencari pengguna.');
        } finally {
            setIsSearching(false);
        }
    };

    const updateDraft = (id: string, field: keyof EditableUser, value: string) => {
        setDrafts((current) => ({
            ...current,
            [id]: {
                ...current[id],
                [field]: value,
            },
        }));
    };

    const saveUser = async (user: UserRecord) => {
        const draft = drafts[user.id];
        if (!draft) return;

        setSavingId(user.id);
        try {
            const updated = await pb.collection('users').update(user.id, draft);
            setUsers((current) => current.map((item) => (item.id === user.id ? (updated as unknown as UserRecord) : item)));
            setDrafts((current) => ({ ...current, [user.id]: toEditable(updated as unknown as UserRecord) }));
            alert('Maklumat pengguna dikemas kini.');
        } catch (err) {
            console.error('Failed to update user', err);
            alert('Gagal mengemas kini maklumat pengguna.');
        } finally {
            setSavingId(null);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Penyelenggaraan Rekod</h1>
                <p className="text-muted-foreground mt-2">
                    Cari pengguna mengikut nama, NRIC, atau emel dan kemas kini maklumat hubungan.
                </p>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Search className="h-5 w-5 text-primary" />
                        Cari Pengguna
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={searchUsers} className="flex flex-col sm:flex-row gap-3">
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Nama, NRIC, atau emel"
                        />
                        <Button type="submit" disabled={isSearching} className="gap-2">
                            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            Cari
                        </Button>
                    </form>
                    {error && <p className="text-sm text-destructive mt-3">{error}</p>}
                </CardContent>
            </Card>

            {users.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <Users className="mx-auto h-10 w-10 mb-3 opacity-50" />
                        Tiada rekod dipaparkan. Cari pengguna atau tekan Cari untuk senarai terkini.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {users.map((user) => {
                        const draft = drafts[user.id];
                        if (!draft) return null;
                        return (
                            <Card key={user.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <CardTitle className="text-base">{user.full_name || user.email}</CardTitle>
                                        <Badge variant="outline" className="capitalize">
                                            {user.role}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">NRIC: {user.nric_number || '-'}</p>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label>Nama Penuh</Label>
                                        <Input
                                            value={draft.full_name}
                                            onChange={(event) => updateDraft(user.id, 'full_name', event.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Emel</Label>
                                        <Input
                                            value={draft.email}
                                            onChange={(event) => updateDraft(user.id, 'email', event.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>No. Telefon</Label>
                                        <Input
                                            value={draft.phone}
                                            onChange={(event) => updateDraft(user.id, 'phone', event.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Alamat</Label>
                                        <Input
                                            value={draft.address}
                                            onChange={(event) => updateDraft(user.id, 'address', event.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex justify-end">
                                        <Button
                                            onClick={() => saveUser(user)}
                                            disabled={savingId === user.id}
                                            className="gap-2"
                                        >
                                            {savingId === user.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Simpan
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
