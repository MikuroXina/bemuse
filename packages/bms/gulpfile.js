import { runCucumber } from '@cucumber/cucumber/api'
import childProcess from 'child_process'
import fs from 'fs'
import gulp from 'gulp'
import { startVitest } from 'vitest/node'

gulp.task('test:cucumber', cucumberTest)
gulp.task('test:vitest', vitestTest)
gulp.task('test', gulp.series('test:vitest', 'test:cucumber'))

gulp.task('bmspec:update', async function () {
  if (!fs.existsSync('bmspec')) {
    console.log('* Cloning bmspec...')
    childProcess.execSync(
      `git clone https://github.com/bemusic/bms-spec.git bmspec`,
      {
        stdio: 'inherit',
      }
    )
  } else {
    console.log('* Updating bmspec...')
    childProcess.execSync(`git pull`, {
      stdio: 'inherit',
      cwd: 'bmspec',
    })
  }
})

function vitestTest() {
  return startVitest('test', [], {
    coverage: {
      enabled: !!process.env.BMS_COV,
    },
  })
}

async function cucumberTest() {
  const runConfiguration = {
    sources: {
      defaultDialect: 'en',
      paths: ['bmspec/features/**/*.feature'],
      name: [],
      order: 'defined',
    },
    support: {
      importPaths: [
        'features/support/**/*.js',
        'features/step_definitions/**/*.js',
      ],
    },
    formats: {
      files: {},
      options: {},
      publish: false,
      stdout: 'progress',
    },
    runtime: {
      failFast: true,
      filterStacktraces: false,
      parallel: 3,
      retry: 2,
      strict: true,
      worldParameters: {},
    },
  }
  const { success } = await runCucumber(runConfiguration)
  if (!success) {
    throw new Error('cucumber test failed')
  }
}
