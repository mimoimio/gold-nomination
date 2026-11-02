import PocketBase from 'pocketbase';

const pbUrl = import.meta.env.VITE_PB_URL ?? 'https://gold-nomination.pockethost.io';
const pb = new PocketBase(pbUrl);

pb.autoCancellation(false);

export default pb;