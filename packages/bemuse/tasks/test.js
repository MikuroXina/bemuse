import gulp from 'gulp'
import { startVitest } from 'vitest/node'

gulp.task('test', async function () {
  const measureCoverage = !!process.env.BEMUSE_COV
  await startVitest('test', [], {
    watch: false,
    coverage: {
      enabled: measureCoverage,
    },
  })
})
