import chalk from 'chalk';

import { ProjectLinked } from '@vercel-internals/types';

import Client from '../client';
import { Output } from '../output';
import { STORAGE_API_PATH } from '../../commands/store';
import confirm from '../input/confirm';
import { getCommandName } from '../pkg-name';

export async function linkStore(options: {
  name: string;
  storeId: string;
  client: Client;
  link: ProjectLinked;
  output: Output;
}) {
  const {
    client,
    name,
    storeId,
    output,
    link: { project, org },
  } = options;

  const shouldLink = await confirm(
    client,
    `Should the ${chalk.bold(name)} store be linked to the ${chalk.bold(
      project.name
    )} project?`,
    true
  );

  if (!shouldLink) {
    return false;
  }

  try {
    output.spinner('Linking store');

    await client.fetch(`${STORAGE_API_PATH}/stores/${storeId}/connections`, {
      accountId: org.id,
      method: 'POST',
      body: {
        projectId: project.id,
        envVarEnvironments: ['production', 'preview', 'development'],
      },
    });
  } catch {
    return false;
  }

  output.success(
    `Linked blob store ${chalk.bold(name)} to project ${chalk.bold(
      project.name
    )}\n`
  );

  output.print(
    `Run ${getCommandName('env pull')} to download the new env variables.`
  );

  return true;
}
