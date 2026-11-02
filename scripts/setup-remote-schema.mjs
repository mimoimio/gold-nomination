import PocketBase from 'pocketbase';

const url = process.env.PB_URL || 'https://gold-nomination.pockethost.io';
const email = process.env.PB_SUPERUSER_EMAIL || 'admin@wasiemas.test';
const password = process.env.PB_SUPERUSER_PASSWORD;
if (!password) throw new Error('Set PB_SUPERUSER_PASSWORD before running the schema script.');

const pb = new PocketBase(url);
await pb.collection('_superusers').authWithPassword(email, password);

const existing = await pb.collections.getFullList();
const find = (name) => existing.find((collection) => collection.name === name);
const users = find('users');
const wasiemas = find('wasiemas');
const wasiClaims = find('wasi_claims');
const demise = find('demise_reports');

if (!users) throw new Error('users collection is missing');

const field = (name, type, options = {}) => ({ name, type, ...options });
const relation = (collectionId, options = {}) =>
    field('', 'relation', {
        collectionId,
        cascadeDelete: false,
        minSelect: 0,
        maxSelect: 1,
        ...options,
    });

const wasiemasFields = [
    relation(users.id, { name: 'pewasiat_id', required: true, minSelect: 1 }),
    field('pewasiat_nric', 'text', { required: false, min: 0, max: 0, pattern: '', autogeneratePattern: '' }),
    relation(users.id, { name: 'wasi_ids', required: false, maxSelect: 3 }),
    field('wasiyyah_data', 'json', { required: true, maxSize: 0 }),
    field('signed_document_pdf', 'file', {
        required: true,
        maxSelect: 1,
        maxSize: 20971520,
        mimeTypes: ['application/pdf'],
        protected: true,
        thumbs: null,
    }),
    field('final_lhdn_pdf', 'file', {
        required: false,
        maxSelect: 1,
        maxSize: 20971520,
        mimeTypes: ['application/pdf'],
        protected: true,
        thumbs: null,
    }),
    field('status', 'select', {
        required: true,
        maxSelect: 1,
        values: ['Pending Verification', 'Processing LHDN', 'Active', 'Revoked'],
    }),
    field('fee_deducted', 'bool', { required: false }),
    field('fee_amount', 'number', { required: false, min: 0, max: null, onlyInt: false }),
    field('fee_deducted_at', 'date', { required: false }),
    relation(users.id, { name: 'fee_deducted_by', required: false }),
    field('activated_at', 'date', { required: false }),
    field('notification_log', 'json', { required: false, maxSize: 0 }),
    field('created', 'autodate', { onCreate: true, onUpdate: false }),
    field('updated', 'autodate', { onCreate: true, onUpdate: true }),
];

const wasiClaimsFields = [
    relation(users.id, { name: 'wasi_id', required: true, minSelect: 1 }),
    relation(demise?.id, { name: 'demise_report_id', required: true, minSelect: 1 }),
    relation(wasiemas?.id, { name: 'wasiemas_id', required: true, minSelect: 1 }),
    field('status', 'select', {
        required: true,
        maxSelect: 1,
        values: ['Pending Review', 'Approved & Released', 'Rejected'],
    }),
    field('preverified_at', 'date', { required: false }),
    field('physical_verified_at', 'date', { required: false }),
    relation(users.id, { name: 'physical_verified_by', required: false }),
    field('physical_verification_notes', 'text', { required: false, min: 0, max: 0, pattern: '', autogeneratePattern: '' }),
    field('audit_log', 'text', { required: false, min: 0, max: 0, pattern: '', autogeneratePattern: '' }),
    field('notification_log', 'json', { required: false, maxSize: 0 }),
    field('created', 'autodate', { onCreate: true, onUpdate: false }),
    field('updated', 'autodate', { onCreate: true, onUpdate: true }),
];

const demiseFields = [
    field('deceased_nric', 'text', { required: false, min: 0, max: 0, pattern: '', autogeneratePattern: '' }),
    relation(wasiemas?.id, { name: 'wasiemas_id', required: false }),
    relation(users.id, { name: 'wasi_id', required: false }),
    field('reporter_name', 'text', { required: false, min: 0, max: 0, pattern: '', autogeneratePattern: '' }),
    field('reporter_contact', 'text', { required: false, min: 0, max: 0, pattern: '', autogeneratePattern: '' }),
    field('death_certificate', 'file', {
        required: false,
        maxSelect: 1,
        maxSize: 20971520,
        mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        protected: true,
        thumbs: null,
    }),
    field('wasi_ic', 'file', {
        required: false,
        maxSelect: 1,
        maxSize: 20971520,
        mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        protected: true,
        thumbs: null,
    }),
    field('status', 'select', {
        required: false,
        maxSelect: 1,
        values: ['Pending Verification', 'Verified', 'Rejected'],
    }),
    field('verified_at', 'date', { required: false }),
    relation(users.id, { name: 'verified_by', required: false }),
    field('verification_notes', 'text', { required: false, min: 0, max: 0, pattern: '', autogeneratePattern: '' }),
    field('created', 'autodate', { onCreate: true, onUpdate: false }),
    field('updated', 'autodate', { onCreate: true, onUpdate: true }),
];

const userFields = [
    field('id', 'text', { required: true, primaryKey: true, system: true, autogeneratePattern: '[a-z0-9]{15}', min: 15, max: 15, pattern: '^[a-z0-9]+$' }),
    field('password', 'password', { required: true, system: true, hidden: true, min: 8, max: 0, cost: 0 }),
    field('tokenKey', 'text', { required: true, system: true, hidden: true, min: 30, max: 60, autogeneratePattern: '[a-zA-Z0-9]{50}' }),
    field('email', 'email', { required: true, system: true, onlyDomains: null, exceptDomains: null }),
    field('emailVisibility', 'bool', { required: false, system: true }),
    field('verified', 'bool', { required: false, system: true }),
    field('full_name', 'text', { required: false, min: 0, max: 255, pattern: '', autogeneratePattern: '' }),
    field('avatar', 'file', {
        required: false,
        maxSelect: 1,
        maxSize: 0,
        mimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp'],
        protected: false,
        thumbs: null,
    }),
    field('nric_number', 'text', { required: false, min: 0, max: 0, pattern: '', autogeneratePattern: '' }),
    field('total_gold_balance', 'number', { required: false, min: 0, max: null, onlyInt: false }),
    field('role', 'select', { required: false, maxSelect: 1, values: ['admin', 'pewasiat', 'wasi'] }),
    field('phone', 'text', { required: false, min: 0, max: 0, pattern: '', autogeneratePattern: '' }),
    field('address', 'text', { required: false, min: 0, max: 0, pattern: '', autogeneratePattern: '' }),
    field('created', 'autodate', { onCreate: true, onUpdate: false }),
    field('updated', 'autodate', { onCreate: true, onUpdate: true }),
];

const mergeFields = (currentFields, desiredFields) => {
    const current = new Map(currentFields.map((item) => [item.name, item]));
    const desiredNames = new Set(desiredFields.map((item) => item.name));
    const merged = desiredFields.map((desired) => {
        const existingField = current.get(desired.name);
        return existingField ? { ...existingField, ...desired, id: existingField.id } : desired;
    });
    const extras = currentFields.filter((item) => !desiredNames.has(item.name));
    return [...merged, ...extras];
};

const mergeIndexes = (currentIndexes, desiredIndexes) => {
    const indexes = [...(currentIndexes || [])];
    for (const sql of desiredIndexes) {
        const name = sql.match(/`([^`]+)`/)?.[1];
        if (name && !indexes.some((index) => index.includes(name))) {
            indexes.push(sql);
        }
    }
    return indexes;
};

const updateCollection = async (collection, { fields, rules, indexes }) => {
    return pb.collections.update(collection.id, {
        ...collection,
        fields: mergeFields(collection.fields, fields),
        ...rules,
        indexes: mergeIndexes(collection.indexes, indexes),
    });
};

const updatedUsers = await updateCollection(users, {
    fields: userFields,
    rules: {
        listRule: "id = @request.auth.id || @request.auth.role = 'admin'",
        viewRule: "id = @request.auth.id || @request.auth.role = 'admin'",
        createRule: "@request.body.role = 'pewasiat' && @request.body.total_gold_balance = 0",
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
    },
    indexes: ['CREATE INDEX `idx_users_nric_number` ON `users` (`nric_number`)'],
});
console.log('Updated users:', updatedUsers.id);

if (!wasiemas) throw new Error('wasiemas collection is missing');

const updatedWasiemas = await updateCollection(wasiemas, {
    fields: wasiemasFields,
    rules: {
        listRule: "pewasiat_id = @request.auth.id || @request.auth.role = 'admin' || wasi_ids ~ @request.auth.id",
        viewRule: "pewasiat_id = @request.auth.id || @request.auth.role = 'admin' || wasi_ids ~ @request.auth.id",
        createRule: "@request.auth.role = 'pewasiat' && @request.body.pewasiat_id = @request.auth.id && @request.body.status = 'Pending Verification'",
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
    },
    indexes: [
        'CREATE INDEX `idx_wasiemas_pewasiat_id` ON `wasiemas` (`pewasiat_id`)',
        'CREATE INDEX `idx_wasiemas_pewasiat_nric` ON `wasiemas` (`pewasiat_nric`)',
        'CREATE INDEX `idx_wasiemas_status` ON `wasiemas` (`status`)',
    ],
});
console.log('Updated wasiemas:', updatedWasiemas.id);

if (!wasiClaims) throw new Error('wasi_claims collection is missing');

const updatedWasiClaims = await updateCollection(wasiClaims, {
    fields: wasiClaimsFields,
    rules: {
        listRule: "wasi_id = @request.auth.id || @request.auth.role = 'admin'",
        viewRule: "wasi_id = @request.auth.id || @request.auth.role = 'admin'",
        createRule: "@request.auth.role = 'wasi' && @request.body.wasi_id = @request.auth.id && @request.body.status = 'Pending Review'",
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
    },
    indexes: [
        'CREATE INDEX `idx_wasi_claims_wasi_id` ON `wasi_claims` (`wasi_id`)',
        'CREATE INDEX `idx_wasi_claims_wasiemas_id` ON `wasi_claims` (`wasiemas_id`)',
        'CREATE INDEX `idx_wasi_claims_status` ON `wasi_claims` (`status`)',
    ],
});
console.log('Updated wasi_claims:', updatedWasiClaims.id);

if (!demise) throw new Error('demise_reports collection is missing');

const updatedDemise = await updateCollection(demise, {
    fields: demiseFields,
    rules: {
        listRule: "@request.auth.role = 'admin'",
        viewRule: "@request.auth.role = 'admin'",
        createRule: "@request.body.status = 'Pending Verification'",
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
    },
    indexes: [
        'CREATE INDEX `idx_demise_reports_deceased_nric` ON `demise_reports` (`deceased_nric`)',
        'CREATE INDEX `idx_demise_reports_status` ON `demise_reports` (`status`)',
        'CREATE INDEX `idx_demise_reports_wasiemas_id` ON `demise_reports` (`wasiemas_id`)',
    ],
});
console.log('Updated demise_reports:', updatedDemise.id);

console.log('Remote schema setup complete.');
