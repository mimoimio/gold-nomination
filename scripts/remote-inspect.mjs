import PocketBase from 'pocketbase';

const password = process.env.PB_SUPERUSER_PASSWORD;
if (!password) throw new Error('Set PB_SUPERUSER_PASSWORD before running the inspect script.');
const pb = new PocketBase(process.env.PB_URL || 'https://gold-nomination.pockethost.io');
await pb.collection('_superusers').authWithPassword(process.env.PB_SUPERUSER_EMAIL || 'admin@wasiemas.test', password);

const collections = await pb.collections.getFullList();
for (const collection of collections.filter((item) => !item.name.startsWith('_'))) {
    console.log(`\n=== ${collection.name} (${collection.id}) ===`);
    console.log('rules:', JSON.stringify({
        list: collection.listRule,
        view: collection.viewRule,
        create: collection.createRule,
        update: collection.updateRule,
        delete: collection.deleteRule,
    }));
    console.log('fields:', collection.fields.map((field) => `${field.name}:${field.type}`).join(', '));
    const status = collection.fields.find((field) => field.name === 'status');
    if (status) console.log('status values:', status.values);
    const files = collection.fields.filter((field) => field.type === 'file');
    if (files.length > 0) {
        console.log('file protection:', files.map((field) => `${field.name}:${field.protected}`).join(', '));
    }
    console.log('indexes:', collection.indexes);
    try {
        const records = await pb.collection(collection.name).getFullList({ fields: 'id' });
        console.log('records:', records.length);
    } catch (error) {
        console.log('records: error', error.status);
    }
}
