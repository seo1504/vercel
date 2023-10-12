import chalk from 'chalk';

import Client from '../client';
import { Output } from '../output';
import stamp from '../output/stamp';
import { STORAGE_API_PATH } from '../../commands/store';

type CreateBlobResponse = {
  store: {
    id: string;
    name: string;
    rwToken: string;
  };
};

export async function createBlobStore(options: {
  name: string;
  client: Client;

  output: Output;
}) {
  const { client, name, output } = options;

  const pullStamp = stamp();

  output.spinner('Creating Blob store');

  const {
    store: { rwToken, id },
  } = await client.fetch<CreateBlobResponse>(
    `${STORAGE_API_PATH}/stores/blob`,
    { method: 'POST', body: { name } }
  );

  output.success(
    `Created blob store ${chalk.bold(name)} ${chalk.gray(pullStamp())}`
  );

  return {
    id,
    env: {
      BLOB_READ_WRITE_TOKEN: rwToken,
    },
  };
}
