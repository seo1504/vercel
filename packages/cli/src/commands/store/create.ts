import type { ProjectEnvTarget, ProjectLinked } from '@vercel-internals/types';

import Client from '../../util/client';
import list from '../../util/input/list';
import text from '../../util/input/text';
import { Output } from '../../util/output';
import { createBlobStore } from '../../util/store/create-blob-store';
import { linkStore } from '../../util/store/link-store';

type Options = {
  '--debug': boolean;
  '--yes': boolean;
  '--git-branch': string;
};

type CreateOptions = {
  client: Client;
  link: ProjectLinked;
  environment: ProjectEnvTarget;
  opts: Partial<Options>;
  output: Output;
};

export default async function create({ client, link, output }: CreateOptions) {
  const storeType = await list(client, {
    choices: [
      {
        name: 'Blob - Fast object storage',
        value: 'blob',
        short: 'blob',
      },
      {
        name: 'KV - Durable Redis',
        value: 'kv',
        short: 'kv',
      },
      {
        name: 'Postgres - Serverless SQL',
        value: 'postgres',
        short: 'postgres',
      },
    ],
    message: 'What kind of store do you want to create?',
  });

  if (!storeType) {
    output.log('Canceled');
    return 0;
  }

  const name = await text({
    label: 'Select a store name: ',
    validateValue: input => input.length > 5,
  });

  if (!name) {
    output.log('No name input');
    return 0;
  }

  let storeId: string | undefined;
  let env: Record<string, string> | undefined;

  if (storeType === 'blob') {
    const result = await createBlobStore({ name, client, output });

    storeId = result.id;
    env = result.env;
  }

  if (!storeId || !env) {
    return;
  }

  const linked = await linkStore({ client, link, name, storeId, output });

  if (linked) {
    return 0;
  }

  output.print(
    `\nYou can link the store later in the Vercel dashboard or use this environment variables to access it:\n`
  );

  Object.entries(env).forEach(([key, value]) =>
    output.print(`${key}=${value}\n`)
  );

  return 0;
}
