import PocketBase from 'pocketbase';

// Connect to your local PocketBase instance (default port is 8090)
// When you deploy, you will change this to your live production URL
const pb = new PocketBase('https://gold-nomination.pockethost.io/');

// Optional: You can globally disable auto-cancellation if you have overlapping requests
pb.autoCancellation(false);

export default pb;