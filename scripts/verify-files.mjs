import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');
await pb.collection('users').authWithPassword('admin@wasiemas.test', 'SuperDemo123!');
const token = await pb.files.getToken();

const report = await pb.collection('demise_reports').getFirstListItem("status = 'Pending Verification'");
const reportUrl = pb.files.getURL(report, report.death_certificate, { token });
console.log('death_certificate admin:', (await fetch(reportUrl)).status);
console.log('death_certificate anonymous:', (await fetch(reportUrl.split('?')[0])).status);

const wasiemas = await pb.collection('wasiemas').getFirstListItem("status = 'Active'");
for (const field of ['signed_document_pdf', 'final_lhdn_pdf']) {
    if (!wasiemas[field]) continue;
    const url = pb.files.getURL(wasiemas, wasiemas[field], { token });
    console.log(`${field} admin:`, (await fetch(url)).status);
    console.log(`${field} anonymous:`, (await fetch(url.split('?')[0])).status);
}
