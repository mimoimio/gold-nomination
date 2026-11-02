import fs from 'node:fs';
import PocketBase from 'pocketbase';

const url = process.env.PB_URL || 'https://gold-nomination.pockethost.io';
const email = process.env.PB_SUPERUSER_EMAIL || 'admin@wasiemas.test';
const password = process.env.PB_SUPERUSER_PASSWORD;
if (!password) throw new Error('Set PB_SUPERUSER_PASSWORD before running the backup script.');

const pb = new PocketBase(url);
await pb.collection('_superusers').authWithPassword(email, password);

const collections = await pb.collections.getFullList();
const backup = {
    createdAt: new Date().toISOString(),
    url,
    collections: [],
};

for (const collection of collections.filter((item) => !item.name.startsWith('_'))) {
    let records = [];
    try {
        records = await pb.collection(collection.name).getFullList();
    } catch (error) {
        console.warn(`Could not export ${collection.name}:`, error.status);
    }
    backup.collections.push({ config: collection, records });
    console.log(`${collection.name}: ${records.length}`);
}

const stamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
const file = `C:\\Users\\User\\AppData\\Local\\Temp\\opencode\\wasiemas-remote-backup-${stamp}.json`;
fs.writeFileSync(file, JSON.stringify(backup, null, 2));
console.log(`Backup written: ${file}`);
