import PocketBase from 'pocketbase';
import { jsPDF } from 'jspdf';

const url = process.env.PB_URL || 'http://127.0.0.1:8090';
const email = process.env.PB_SUPERUSER_EMAIL || 'admin@wasiemas.test';
const password = process.env.PB_SUPERUSER_PASSWORD;
if (!password) throw new Error('Set PB_SUPERUSER_PASSWORD before running the seed script.');

const pb = new PocketBase(url);
await pb.collection('_superusers').authWithPassword(email, password);

if (process.env.RESET_ALL === 'true') {
    for (const collection of ['wasi_claims', 'demise_reports', 'wasiemas']) {
        const records = await pb.collection(collection).getFullList();
        for (const record of records) {
            await pb.collection(collection).delete(record.id);
        }
    }
    const allUsers = await pb.collection('users').getFullList();
    for (const user of allUsers) {
        await pb.collection('users').delete(user.id);
    }
    console.log('Reset all application records and users.');
}

const accounts = {
    pewasiatA: {
        email: 'pewasiat.a@wasiemas.test',
        password: 'PewasiatDemo123!',
        full_name: 'Ahmad Zaha',
        nric_number: '840510-14-5566',
        role: 'pewasiat',
        total_gold_balance: 0,
        phone: '012-1000001',
        address: 'No. 1, Jalan Demo, 50000 Kuala Lumpur',
    },
    pewasiatB: {
        email: 'pewasiat.b@wasiemas.test',
        password: 'PewasiatDemo123!',
        full_name: 'Siti Aminah',
        nric_number: '850620-10-6622',
        role: 'pewasiat',
        total_gold_balance: 150.5,
        phone: '012-1000002',
        address: 'No. 2, Jalan Demo, 50000 Kuala Lumpur',
    },
    wasi: {
        email: 'wasi@wasiemas.test',
        password: 'WasiDemo123!',
        full_name: 'Siti Aishah',
        nric_number: '900101-10-1234',
        role: 'wasi',
        total_gold_balance: 0,
        phone: '012-2000001',
        address: 'No. 3, Jalan Demo, 50000 Kuala Lumpur',
    },
    admin: {
        email: 'admin.kab@wasiemas.test',
        password: 'AdminDemo123!',
        full_name: 'KAB Gold Admin',
        nric_number: '800101-10-1111',
        role: 'admin',
        total_gold_balance: 0,
        phone: '012-3000001',
        address: 'KAB Gold HQ, Kuala Lumpur',
    },
};

const demoEmails = Object.values(accounts).map((item) => item.email);
const demoNrics = Object.values(accounts).map((item) => item.nric_number);

const wasiyyahData = (pewasiat, warisPrefix) => ({
    pewasiat: {
        release_type: 'Wasi Emas',
        use_yusuf_advisory: false,
    },
    wasi_list: [
        {
            name: accounts.wasi.full_name,
            nric: accounts.wasi.nric_number,
            phone: accounts.wasi.phone,
            email: accounts.wasi.email,
            address: accounts.wasi.address,
            relationship: 'Sibling',
        },
    ],
    wasi_execution: 'Serentak',
    aset: {
        uncang_emas: true,
        other_assets: false,
    },
    waris_list: [
        {
            name: `${warisPrefix} Waris 1`,
            nric: '950101-10-1111',
            relationship: 'Anak Lelaki / Perempuan',
            address: 'No. 4, Jalan Waris, 50000 Kuala Lumpur',
            email: 'waris1@example.com',
            phone: '012-1111111',
        },
        {
            name: `${warisPrefix} Waris 2`,
            nric: '960202-10-2222',
            relationship: 'Anak Lelaki / Perempuan',
            address: 'No. 5, Jalan Waris, 50000 Kuala Lumpur',
            email: 'waris2@example.com',
            phone: '012-2222222',
        },
    ],
    duties: {
        hold_HibahEmas: [0],
        apply_probate: [0],
        update_info: [0],
        pay_debts: [0],
        faraid_distribution: [0],
        child_guardian: [],
    },
    saksi_list: [
        {
            name: 'Saksi Lelaki 1',
            nric: '880101-10-3333',
            address: 'No. 6, Jalan Saksi, 50000 Kuala Lumpur',
        },
        {
            name: 'Saksi Lelaki 2',
            nric: '880202-10-4444',
            address: 'No. 7, Jalan Saksi, 50000 Kuala Lumpur',
        },
    ],
});

const makePdf = (label) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('KAB Gold - Local Demo Document', 20, 24);
    doc.setFontSize(12);
    doc.text(label, 20, 38);
    doc.text('This file is seeded for local prototype testing only.', 20, 50);
    const buffer = doc.output('arraybuffer');
    return new Blob([buffer], { type: 'application/pdf' });
};

const deleteIfExists = async (collection, filters) => {
    const records = new Map();
    for (const filter of filters) {
        const items = await pb.collection(collection).getFullList({ filter });
        for (const item of items) {
            records.set(item.id, item);
        }
    }
    for (const item of records.values()) {
        await pb.collection(collection).delete(item.id);
    }
};

const existingUsers = [];
for (const demoEmail of demoEmails) {
    try {
        const user = await pb.collection('users').getFirstListItem(`email = '${demoEmail}'`);
        existingUsers.push(user);
    } catch {
        // no existing demo user
    }
}

const existingWasiemas = new Map();
for (const filter of [
    ...demoNrics.map((nric) => `pewasiat_nric = '${nric}'`),
    ...existingUsers.map((user) => `pewasiat_id = '${user.id}'`),
]) {
    const items = await pb.collection('wasiemas').getFullList({ filter });
    for (const item of items) {
        existingWasiemas.set(item.id, item);
    }
}

const wasiemasIds = [...existingWasiemas.keys()];
const existingReports = new Map();
for (const filter of [
    ...demoNrics.map((nric) => `deceased_nric = '${nric}'`),
    ...wasiemasIds.map((id) => `wasiemas_id = '${id}'`),
]) {
    const items = await pb.collection('demise_reports').getFullList({ filter });
    for (const item of items) {
        existingReports.set(item.id, item);
    }
}

await deleteIfExists('wasi_claims', [
    ...existingUsers.map((user) => `wasi_id = '${user.id}'`),
    ...wasiemasIds.map((id) => `wasiemas_id = '${id}'`),
]);
await deleteIfExists('demise_reports', [
    ...demoNrics.map((nric) => `deceased_nric = '${nric}'`),
    ...wasiemasIds.map((id) => `wasiemas_id = '${id}'`),
    ...existingReports.keys().map((id) => `id = '${id}'`),
]);
await deleteIfExists('wasiemas', [
    ...demoNrics.map((nric) => `pewasiat_nric = '${nric}'`),
    ...existingUsers.map((user) => `pewasiat_id = '${user.id}'`),
]);
for (const user of existingUsers) {
    await pb.collection('users').delete(user.id);
}

const createUser = (account) =>
    pb.collection('users').create({
        email: account.email,
        password: account.password,
        passwordConfirm: account.password,
        full_name: account.full_name,
        nric_number: account.nric_number,
        role: account.role,
        total_gold_balance: account.total_gold_balance,
        phone: account.phone,
        address: account.address,
        emailVisibility: true,
        verified: true,
    });

const pewasiatA = await createUser(accounts.pewasiatA);
const pewasiatB = await createUser(accounts.pewasiatB);
const wasiUser = await createUser(accounts.wasi);
const adminUser = await createUser(accounts.admin);

const createWasiemas = async (pewasiat, status, warisPrefix, includeFinal) => {
    const formData = new FormData();
    formData.append('pewasiat_id', pewasiat.id);
    formData.append('pewasiat_nric', pewasiat.nric_number);
    formData.append('wasi_ids', wasiUser.id);
    formData.append('wasiyyah_data', JSON.stringify(wasiyyahData(pewasiat, warisPrefix)));
    formData.append('status', status);
    formData.append('fee_deducted', 'false');
    formData.append('signed_document_pdf', makePdf(`Signed Wasi Emas - ${pewasiat.full_name}`), 'signed_wasiemas.pdf');
    if (includeFinal) {
        formData.append('activated_at', new Date().toISOString());
        formData.append('fee_amount', '100');
        formData.append('final_lhdn_pdf', makePdf(`Final LHDN Stamped Wasi Emas - ${pewasiat.full_name}`), 'final_lhdn.pdf');
    }
    return pb.collection('wasiemas').create(formData);
};

const wasiemasPending = await createWasiemas(pewasiatA, 'Pending Verification', 'Ahmad', false);
const wasiemasActive = await createWasiemas(pewasiatB, 'Active', 'Siti', true);

const createDeathReport = async (pewasiat, status, wasiemasId, includeWasi) => {
    const formData = new FormData();
    formData.append('deceased_nric', pewasiat.nric_number);
    formData.append('reporter_name', 'Waris Demo');
    formData.append('reporter_contact', '012-9999999');
    formData.append('status', status);
    formData.append('death_certificate', makePdf(`Death Certificate - ${pewasiat.full_name}`), 'death_certificate.pdf');
    if (wasiemasId) {
        formData.append('wasiemas_id', wasiemasId);
    }
    if (includeWasi) {
        formData.append('wasi_id', wasiUser.id);
        formData.append('wasi_ic', makePdf(`Wasi IC Copy - ${wasiUser.full_name}`), 'wasi_ic.pdf');
        formData.append('verified_at', new Date().toISOString());
        formData.append('verified_by', adminUser.id);
        formData.append('verification_notes', 'Seeded verified report for admin release demo.');
    }
    return pb.collection('demise_reports').create(formData);
};

const demisePending = await createDeathReport(pewasiatA, 'Pending Verification', null, false);
const demiseVerified = await createDeathReport(pewasiatB, 'Verified', wasiemasActive.id, true);

const claim = await pb.collection('wasi_claims').create({
    wasi_id: wasiUser.id,
    demise_report_id: demiseVerified.id,
    wasiemas_id: wasiemasActive.id,
    status: 'Pending Review',
    preverified_at: new Date().toISOString(),
    audit_log: 'Seed: claim submitted online. Physical IC verification pending at KAB Gold HQ.',
    notification_log: [],
});

console.log('Seed complete.');
console.log(JSON.stringify({
    superuser: { email, password },
    accounts: {
        pewasiatA: { email: accounts.pewasiatA.email, password: accounts.pewasiatA.password, id: pewasiatA.id },
        pewasiatB: { email: accounts.pewasiatB.email, password: accounts.pewasiatB.password, id: pewasiatB.id },
        wasi: { email: accounts.wasi.email, password: accounts.wasi.password, id: wasiUser.id },
        admin: { email: accounts.admin.email, password: accounts.admin.password, id: adminUser.id },
    },
    records: {
        wasiemasPending: wasiemasPending.id,
        wasiemasActive: wasiemasActive.id,
        demisePending: demisePending.id,
        demiseVerified: demiseVerified.id,
        claim: claim.id,
    },
}, null, 2));

const createdWasiemas = await pb.collection('wasiemas').getOne(wasiemasActive.id);
console.log('wasiyyah_data type:', typeof createdWasiemas.wasiyyah_data);
console.log('wasi_ids:', createdWasiemas.wasi_ids);
