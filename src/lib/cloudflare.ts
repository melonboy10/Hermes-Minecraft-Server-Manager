import { dev } from '$app/environment';
import { env as privateENV } from '$env/dynamic/private';
import { env as publicENV } from '$env/dynamic/public';
import { ResultAsync, err, ok, type Result } from 'neverthrow';
import { CustomError } from './types';

export async function addCloudflareRecords(subdomain: string, port: number): Promise<Result<{ cname: string; srv: string }, CustomError>> {
  if (dev) return ok({ cname: '<DEV>', srv: '<DEV>' });

  const createCNAMEResult = await ResultAsync.fromPromise<{ result: { id: string }; success: true }, CustomError>(
    fetch(`https://api.cloudflare.com/client/v4/zones/${privateENV.CLOUDFLARE_ZONE_ID}/dns_records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${privateENV.CLOUDFLARE_TOKEN}`
      },
      body: JSON.stringify({
        name: `${subdomain}.servers`,
        content: `${publicENV.PUBLIC_ROOT_DOMAIN}`,
        proxied: false,
        type: 'CNAME',
        comment: 'Created by Hermes Minecraft Server Manager',
        ttl: 3600
      })
    }).then((r) => r.json()),
    () => new CustomError('Failed to create the Cloudflare CNAME record.')
  );
  if (createCNAMEResult.isErr()) return err(createCNAMEResult.error);

  const createSRVResult = await ResultAsync.fromPromise<{ result: { id: string }; success: true }, CustomError>(
    fetch(`https://api.cloudflare.com/client/v4/zones/${privateENV.CLOUDFLARE_ZONE_ID}/dns_records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${privateENV.CLOUDFLARE_TOKEN}`
      },
      body: JSON.stringify({
        type: 'SRV',
        data: {
          service: '_minecraft',
          proto: '_tcp',
          name: `${subdomain}.${publicENV.PUBLIC_ROOT_DOMAIN}`,
          priority: 0,
          weight: 5,
          port,
          target: `${subdomain}.${publicENV.PUBLIC_ROOT_DOMAIN}`
        },
        proxied: false,
        comment: 'Created by Hermes Minecraft Server Manager',
        ttl: 3600
      })
    }).then((r) => r.json()),
    () => new CustomError('Failed to create SRV record for server')
  );
  if (createSRVResult.isErr()) return err(createSRVResult.error);

  return ok({
    cname: createCNAMEResult.value.result.id,
    srv: createSRVResult.value.result.id
  });
}

export async function removeCloudflareRecords(cnameID: string, srvID: string): Promise<Result<void, CustomError>> {
  if (dev) return ok(undefined);

  const deleteCNAMEResult = await ResultAsync.fromPromise(
    fetch(`https://api.cloudflare.com/client/v4/zones/${privateENV.CLOUDFLARE_ZONE_ID}/dns_records/${cnameID}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${privateENV.CLOUDFLARE_TOKEN}`
      }
    }),
    () => new CustomError('Failed to delete the CNAME record from Cloudflare')
  );
  if (deleteCNAMEResult.isErr()) return err(deleteCNAMEResult.error);

  const deleteSRVResult = await ResultAsync.fromPromise(
    fetch(`https://api.cloudflare.com/client/v4/zones/${privateENV.CLOUDFLARE_ZONE_ID}/dns_records/${srvID}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${privateENV.CLOUDFLARE_TOKEN}`
      }
    }),
    () => new CustomError('Failed to delete the SRV record from Cloudflare')
  );
  return deleteSRVResult.map(() => undefined);
}
