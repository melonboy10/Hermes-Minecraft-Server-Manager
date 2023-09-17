// src/hooks.server.js
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import PocketBase from 'pocketbase';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  event.locals.pb = new PocketBase(dev ? 'http://127.0.0.1:8090' : 'http://0.0.0.0:8090');
  event.locals.pb.autoCancellation(false);
  try {
    console.log(`Authenticating with PocketBase using email: ${env.POCKETBASE_INTERNAL_ADMIN_EMAIL} password: ${env.POCKETBASE_INTERNAL_ADMIN_PASSWORD}`);
    event.locals.pb.admins.authWithPassword(env.POCKETBASE_INTERNAL_ADMIN_EMAIL, env.POCKETBASE_INTERNAL_ADMIN_PASSWORD);
  } catch (e) {
    console.log('Failed to authenticate with PocketBase (thats not good)');
  }

  const response = await resolve(event);
  return response;
}
