import PocketBase from 'pocketbase';

// Initialize PocketBase
const pb = new PocketBase('http://127.0.0.1:8090');

async function runTest() {
    console.log("=== STARTING DISTRIBUTION TEST ===\n");

    try {
        // 0. Authenticate as Admin (Superuser) to bypass API rules during the test
        console.log("[Auth] Authenticating as Admin...");
        await pb.collection('users').authWithPassword('mioradmin@test.com', "14141414");
        // await pb.admins.authWithPassword('admin@example.com', 'admin12345');
        console.log("[Auth] Admin authenticated.\n");

        // --- SETUP DUMMY DATA ---
        console.log("[Setup] Creating dummy deceased user and active nominees...");
        const deceasedUser = await pb.collection('users').create({
            email: `test_deceased_${Date.now()}@example.com`,
            password: 'password123',
            passwordConfirm: 'password123',
            full_name: 'Test Deceased User',
            nric_number: `TEST-${Date.now()}`,
            total_gold_balance: 150.5000,
            role: 'investor'
        });

        await pb.collection('nominations').create({
            user_id: deceasedUser.id,
            nominee_name: 'Hibah Receiver',
            nominee_nric: 'H-123',
            relationship: 'Spouse',
            allocation_percentage: 60,
            role_type: 'Hibah',
            status: 'Active'
        });

        await pb.collection('nominations').create({
            user_id: deceasedUser.id,
            nominee_name: 'Pentadbir Receiver',
            nominee_nric: 'P-123',
            relationship: 'Child',
            allocation_percentage: 40,
            role_type: 'Pentadbir',
            status: 'Active'
        });
        console.log(`[Setup] Created User ${deceasedUser.id} with 150.5g gold and 2 active nominees.\n`);


        // --- OPERATION 1: REPORT CLAIM (from ReportClaim.tsx) ---
        console.log("=== OP 1: SUBMITTING CLAIM ===");

        // Simulating the FormData payload
        const formData = new FormData();
        formData.append('deceased_user_id', deceasedUser.id);
        formData.append('reporter_name', 'Test Reporter (Script)');
        formData.append('status', 'Pending');

        // Simulating a dummy text file for the death certificate
        const dummyFile = new Blob(['dummy certificate content'], { type: 'text/plain' });
        formData.append('death_certificate', dummyFile, 'death_cert.txt');

        const claimRecord = await pb.collection('claims').create(formData);
        console.log(`[Claim] Submitted pending claim ID: ${claimRecord.id}\n`);


        // --- OPERATION 2: ADMIN EXECUTION (from AdminClaimsDashboard.tsx) ---
        console.log("=== OP 2: ADMIN EXECUTING DISTRIBUTION ===");

        // Simulate fetching the claim
        const claimToProcess = await pb.collection('claims').getOne(claimRecord.id, {
            expand: 'deceased_user_id'
        });

        const targetUser = claimToProcess.expand?.deceased_user_id;

        if (!targetUser) {
            throw new Error("Expanded deceased_user_id is missing!");
        }

        console.log(`[Admin] Processing claim for User: ${targetUser.id} | Gold to Distribute: ${targetUser.total_gold_balance}g`);

        // Fetch active nominees
        const nominees = await pb.collection('nominations').getFullList({
            filter: `user_id = "${targetUser.id}" && status = "Active"`,
        });

        console.log(`[Admin] Found ${nominees.length} active nominees.`);

        if (nominees.length === 0) {
            console.log("[Admin] Execution Halted: No active beneficiaries found.");
            await pb.collection('claims').update(claimToProcess.id, { status: 'Manual Intervention' });
            return;
        }

        const totalGold = targetUser.total_gold_balance;
        let auditLog = `Execution Log for Account ID: ${targetUser.id}\nTotal Gold: ${totalGold}g\n\n`;

        // The exact math loop
        for (const nominee of nominees) {
            const allocatedGrams = (nominee.allocation_percentage / 100) * totalGold;
            const formattedGrams = allocatedGrams.toFixed(4);

            if (nominee.role_type === 'Hibah') {
                auditLog += `[HIBAH] Transferred ${formattedGrams}g to ${nominee.nominee_name}\n`;
            } else if (nominee.role_type === 'Pentadbir') {
                auditLog += `[PENTADBIR] Transferred ${formattedGrams}g to ${nominee.nominee_name} IN TRUST\n`;
            }
        }

        // Finalize
        console.log("[Admin] Updating claim status to Approved...");
        await pb.collection('claims').update(claimToProcess.id, { status: 'Approved' });

        console.log("[Admin] Emptying deceased user's gold vault...");
        await pb.collection('users').update(targetUser.id, {
            total_gold_balance: 0
        });

        console.log("\n=== TEST COMPLETE. AUDIT LOG OUTPUT ===");
        console.log(auditLog);

        // Verify the user was emptied
        const verifyUser = await pb.collection('users').getOne(targetUser.id);
        console.log(`Verification: User ${targetUser.id} now has ${verifyUser.total_gold_balance}g gold.`);

    } catch (err: any) {
        console.error("\n[!] TEST FAILED [!]");
        console.error(err.originalError || err);
    }
}

runTest();