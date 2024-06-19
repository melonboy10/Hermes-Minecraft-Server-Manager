import { building, dev } from '$app/environment';
import { env as privateENV } from '$env/dynamic/private';
import PocketBase from 'pocketbase';
import type { TypedPocketBase } from './types';

const serverPB: TypedPocketBase = new PocketBase(dev ? 'http://127.0.0.1:8090' : 'http://0.0.0.0:8090');
if (!building) {
  serverPB.autoCancellation(false);
  try {
    console.log(`Authenticating with PocketBase using email: ${privateENV.POCKETBASE_INTERNAL_ADMIN_EMAIL} password: ${privateENV.POCKETBASE_INTERNAL_ADMIN_PASSWORD}`);
    await serverPB.admins.authWithPassword(privateENV.POCKETBASE_INTERNAL_ADMIN_EMAIL, privateENV.POCKETBASE_INTERNAL_ADMIN_PASSWORD);
    console.log('Authenticated with PocketBase');
  } catch (e) {
    console.log('Failed to authenticate with PocketBase (thats not good)');
  }
}
export { serverPB };

// export type HandledPBError = {
//   failReturn: (errorData: object) => ActionFailure<{ message: string } & unknown>;
// } & HttpError;

// export function handlePBError(pbError: ClientResponseError, from: string): never {
//   throw {
//     ...error(
//       pbError.status,
//       `${pbError.response?.message}\n${Object.values(pbError.response.data)
//         .map((e) => (e as { message: string }).message + '\n')
//         .toString()}(- ${from})`
//     ),
//     failReturn: (errorData: object) =>
//       fail(pbError.status, {
//         ...errorData,
//         message: `${pbError.response?.message}\n${Object.values(pbError.response.data)
//           .map((e) => (e as { message: string }).message + '\n')
//           .toString()}(- ${from})`
//       })
//   } as HandledPBError;
// }
