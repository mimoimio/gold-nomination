import PocketBase from 'pocketbase';

const url = process.env.PB_URL || 'http://127.0.0.1:8090';
const admin = new PocketBase(url);
await admin.collection('users').authWithPassword('admin.kab@wasiemas.test', 'AdminDemo123!');
console.log('admin role:', admin.authStore.record?.role);

for (const collection of ['users', 'wasiemas', 'wasi_claims', 'demise_reports']) {
    const records = await admin.collection(collection).getFullList();
    console.log(`${collection}: ${records.length}`);
}

const checks = [
    ['pending death reports', 'demise_reports', 'status = "Pending Verification"'],
    ['pending legal', 'wasiemas', 'status = "Pending Verification"'],
    ['active wasiemas', 'wasiemas', 'status = "Active"'],
    ['pending claims', 'wasi_claims', 'status = "Pending Review"'],
    ['pending fees', 'wasiemas', 'status = "Active" && fee_deducted = false'],
];

for (const [label, collection, filter] of checks) {
    const result = await admin.collection(collection).getList(1, 1, { filter });
    console.log(`${label}: ${result.totalItems}`);
}

const anonymous = new PocketBase(url);
console.log('anonymous users:', (await anonymous.collection('users').getFullList()).length);

const wasi = new PocketBase(url);
await wasi.collection('users').authWithPassword('wasi@wasiemas.test', 'WasiDemo123!');
console.log('wasi wasiemas:', (await wasi.collection('wasiemas').getFullList()).length);
console.log('wasi claims:', (await wasi.collection('wasi_claims').getFullList()).length);
