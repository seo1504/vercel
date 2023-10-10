import type { ProjectEnvTarget, ProjectLinked } from '@vercel-internals/types';
import Client from '../../util/client';
import { emoji, prependEmoji } from '../../util/emoji';

import { Output } from '../../util/output';
import list from '../../util/input/list';
import { createBlobStore } from '../../util/store/create-blob-store';

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

  try {
    if (storeType === 'blob') {
      await createBlobStore(client, link, output);
    }
  } catch (error) {
    console.log({ error });
    output.error(`${prependEmoji(`Internal error`, emoji('warning'))}\n`);

    return 1;
  }

  return 0;
}
