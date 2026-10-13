import PocketBase from 'pocketbase';
const pb = new PocketBase('http://localhost:8090');


console.log(await pb.collection('users').getFullList())