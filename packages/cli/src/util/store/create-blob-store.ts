import { ProjectLinked } from '@vercel-internals/types';

import chalk from 'chalk';
import Client from '../client';
import confirm from '../input/confirm';
import text from '../input/text';
import { Output } from '../output';
import stamp from '../output/stamp';

const API_STORE = '/v1/storage';

type CreateBlobResponse = {
  store: {
    id: string;
    name: string;
    rwToken: string;
  };
};

export async function createBlobStore(
  client: Client,
  { org, project }: ProjectLinked,
  output: Output
) {
  const nameInput = await text({
    label: 'Select a store name: ',
    validateValue: input => input.length > 5,
  });

  if (!nameInput) {
    output.log('No name input');
    return;
  }

  const pullStamp = stamp();

  output.spinner('Creating DB');

  const {
    store: { name, rwToken, id },
  } = await client.fetch<CreateBlobResponse>(`${API_STORE}/stores/blob`, {
    accountId: org.id,
    method: 'POST',
    body: { name: nameInput },
  });

  output.success(
    `Created blob store ${chalk.bold(name)} ${chalk.gray(pullStamp())}`
  );

  const link = await confirm(
    client,
    `Should the blob store ${chalk.bold(
      name
    )} be linked to the current project ${chalk.bold(project.name)}?`,
    true
  );

  if (link) {
    await client.fetch(`${API_STORE}/stores/${id}/blob`, {
      accountId: org.id,
      method: 'POST',
      body: { projectId: project.id },
    });

    output.success(
      `Linked blob store ${chalk.bold(name)} to project ${chalk.bold(
        project.name
      )}\n`
    );

    return;
  }

  output.print(
    `\nYou can link this project later in the Vercel dashboard and use this environment variable to access the store:\n${chalk.green(
      `BLOB_READ_WRITE_TOKEN="${rwToken}"\n`
    )}`
  );
}
