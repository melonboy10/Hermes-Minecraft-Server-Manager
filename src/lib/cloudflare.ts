import { dev } from '$app/environment';
import { env as privateENV } from '$env/dynamic/private';
import { env as publicENV } from '$env/dynamic/public';
import { ResultAsync, err, ok, type Result } from 'neverthrow';
import { CustomError } from './types';

export async function addCloudflareRecords(subdomain: string, port: number): Promise<Result<{ cname: string; srv: string }, CustomError>> {
  if (dev) return ok({ cname: '<DEV>', srv: '<DEV>' });

  const createCNAMEResult: Result<{ result: { id: string }; success: true }, CustomError> = await fetch(`https://api.cloudflare.com/client/v4/zones/${privateENV.CLOUDFLARE_ZONE_ID}/dns_records`, {
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
  })
    .then((r) => r.json())
    .then(ok)
    .catch((e) => err(new CustomError('Failed to create the Cloudflare CNAME record.', e)));
  if (createCNAMEResult.isErr()) return err(createCNAMEResult.error);

  const createSRVResult: Result<{ result: { id: string }; success: true }, CustomError> = await fetch(`https://api.cloudflare.com/client/v4/zones/${privateENV.CLOUDFLARE_ZONE_ID}/dns_records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${privateENV.CLOUDFLARE_TOKEN}`
    },
    body: JSON.stringify({
      type: 'SRV',
      name: `_minecraft._tcp.${subdomain}.${publicENV.PUBLIC_ROOT_DOMAIN}`,
      data: {
        priority: 0,
        weight: 5,
        port,
        target: `${subdomain}.${publicENV.PUBLIC_ROOT_DOMAIN}`
      },
      proxied: false,
      comment: 'Created by Hermes Minecraft Server Manager',
      ttl: 3600
    })
  })
    .then((r) => r.json())
    .then(ok)
    .catch((e) => err(new CustomError('Failed to create SRV record for server', e)));

  if (createSRVResult.isErr()) {
    await removeCloudflareCNAMERecord(createCNAMEResult.value.result.id);
    return err(createSRVResult.error);
  }

  return ok({
    cname: createCNAMEResult.value.result.id,
    srv: createSRVResult.value.result.id
  });
}

export async function removeCloudflareCNAMERecord(cnameID: string): Promise<Result<void, CustomError>> {
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
  return deleteCNAMEResult.map(() => undefined);
}
export async function removeCloudflareSRVRecord(srvID: string): Promise<Result<void, CustomError>> {
  if (dev) return ok(undefined);

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

export async function removeCloudflareRecords(cnameID: string, srvID: string): Promise<Result<void, CustomError>> {
  if (dev) return ok(undefined);

  const deleteCNAMEResult = await removeCloudflareCNAMERecord(cnameID);
  if (deleteCNAMEResult.isErr()) return err(deleteCNAMEResult.error);

  const deleteSRVResult = await removeCloudflareSRVRecord(srvID);
  if (deleteSRVResult.isErr()) return err(deleteSRVResult.error);

  return ok(undefined);
}
