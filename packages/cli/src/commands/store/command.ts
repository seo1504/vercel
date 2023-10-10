import { Command } from '../help';
import { packageName } from '../../util/pkg-name';

export const storeCommand: Command = {
  name: 'env',
  description: 'Interact with stores.',
  arguments: [
    {
      name: 'command',
      required: false,
    },
  ],
  subcommands: [
    {
      name: 'create',
      description: 'Create a new store',
      arguments: [],
      options: [],
      examples: [],
    },
  ],
  options: [
    {
      name: 'environment',
      description:
        'Set the Environment (development, preview, production) when pulling Environment Variables',
      shorthand: null,
      type: 'boolean',
      deprecated: false,
      multi: false,
    },
    {
      name: 'yes',
      description: 'Skip the confirmation prompt when removing an alias',
      shorthand: 'y',
      type: 'boolean',
      deprecated: false,
      multi: false,
    },
  ],
  examples: [
    {
      name: 'Create a new store',
      value: [`${packageName} store create`],
    },
  ],
};
