import meow, { type AnyFlags, type Result } from 'meow'

import { index } from './indexer.js'
import { packIntoBemuse } from './packer.js'
import * as Server from './server.js'

interface Command {
  name: string
  handle(cli: Result<AnyFlags>): Promise<void>
}

const commands: Command[] = [
  {
    name: 'index',
    handle(cli) {
      const indexCli = meow('Index BMS files in current directory', {
        importMeta: import.meta,
        flags: {
          recursive: {
            type: 'boolean',
            shortFlag: 'r',
            default: false,
          },
        },
        argv: cli.input,
      })
      const recursive = indexCli.flags.recursive
      return index('.', { recursive })
    },
  },
  {
    name: 'pack',
    handle(cli) {
      const packCli = meow('Packs sounds and BGAs into assets folder', {
        importMeta: import.meta,
        input: {
          type: 'string',
          isRequired: true,
        },
        argv: cli.input,
      })
      const dir = packCli.input[0]
      if (!dir) {
        throw new Error('Please specify the directory!')
      }

      return packIntoBemuse(dir)
    },
  },
  {
    name: 'server',
    handle(cli) {
      const packCli = meow(
        'Serves a Bemuse server (no indexing or conversion)',
        {
          importMeta: import.meta,
          input: {
            type: 'string',
            isRequired: true,
          },
          flags: {
            port: {
              type: 'number',
              shortFlag: 'p',
              default: 3456,
            },
          },
          argv: cli.input,
        }
      )
      const dir = packCli.input[0]
      if (!dir) {
        throw new Error('Please specify the directory!')
      }

      return Server.start(dir, packCli.flags.port)
    },
  },
]

async function main(): Promise<void> {
  const args = meow({
    importMeta: import.meta,
    commands: commands.map(({ name }) => name),
  })
  const targetCommand = args.command
  for (const command of commands) {
    if (command.name === targetCommand) {
      return await command.handle(args)
    }
  }
  if (targetCommand) {
    console.error('Error: Unrecognized command.')
  } else {
    console.error('This is bemuse-tools v' + args.pkg.version)
  }
  args.showHelp()
  return
}

main().catch(console.error)
