import chalk from 'chalk';
import Client from '../../util/client';
import {
  getEnvTargetPlaceholder,
  isValidEnvTarget,
} from '../../util/env/env-target';
import getArgs from '../../util/get-args';
import getInvalidSubcommand from '../../util/get-invalid-subcommand';
import getSubcommand from '../../util/get-subcommand';
import handleError from '../../util/handle-error';
import { help } from '../help';
import { getCommandName } from '../../util/pkg-name';
import { getLinkedProject } from '../../util/projects/link';

import create from './create';
import { storeCommand } from './command';

const COMMAND_CONFIG = {
  create: ['create'],
};

export default async function main(client: Client) {
  let argv;

  try {
    argv = getArgs(client.argv.slice(2), {
      '--yes': Boolean,
      '-y': '--yes',
      '--environment': String,
      '--git-branch': String,
    });
  } catch (error) {
    handleError(error);
    return 1;
  }

  if (argv['--help']) {
    client.output.print(help(storeCommand, { columns: client.stderr.columns }));
    return 2;
  }

  const subArgs = argv._.slice(1);
  const { subcommand } = getSubcommand(subArgs, COMMAND_CONFIG);
  const { cwd, output, config } = client;

  const environment = argv['--environment']?.toLowerCase() || 'development';

  if (!isValidEnvTarget(environment)) {
    output.error(
      `Invalid environment \`${chalk.cyan(
        environment
      )}\`. Valid options: ${getEnvTargetPlaceholder()}`
    );
    return 1;
  }

  const link = await getLinkedProject(client, cwd);
  if (link.status === 'error') {
    return link.exitCode;
  }

  if (link.status === 'not_linked') {
    output.error(
      `Your codebase isn’t linked to a project on Vercel. Run ${getCommandName(
        'link'
      )} to begin.`
    );
    return 1;
  }

  const { org } = link;
  config.currentTeam = org.type === 'team' ? org.id : undefined;

  switch (subcommand) {
    case 'create':
      return create({
        opts: argv,
        environment,
        client,
        link,
        output,
      });
    default:
      output.error(getInvalidSubcommand(COMMAND_CONFIG));
      client.output.print(
        help(storeCommand, { columns: client.stderr.columns })
      );
      return 2;
  }
}
