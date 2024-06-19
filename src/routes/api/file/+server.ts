// http://0.0.0.0:8090/api/files/80olb9b23s3qall/70of1w247c4k8h2/17cae35fbcbb5cfdc23894dd33b9da0bad0f03c2_6dMTIrIIyy.webp

import { serverPB } from '$lib/database/index.js';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  const queryParameters = url.searchParams;

  const collectionID = queryParameters.get('collectionID') || queryParameters.get('collection') || queryParameters.get('cid');
  const recordID = queryParameters.get('recordID') || queryParameters.get('id') || queryParameters.get('rid');
  const filename = queryParameters.get('filename') || queryParameters.get('file') || queryParameters.get('name');
  const download = !!queryParameters.get('download');

  if (!filename || !recordID || !collectionID) error(400, (!filename ? 'filename, ' : '') + (!recordID ? 'recordID, ' : '') + (!collectionID ? 'collectionID, ' : '') + 'are required');

  const fileURL = await serverPB.files.getUrl({ id: recordID, collectionId: collectionID, collectionName: '' }, filename);
  const imageResponse = await fetch(fileURL);
  if (!imageResponse.ok) error(imageResponse.status, imageResponse.statusText);

  return new Response(
    await imageResponse.arrayBuffer(),
    download
      ? undefined
      : {
          headers: {
            'content-type': 'image/webp'
          }
        }
  );
}
