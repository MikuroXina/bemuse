import gulp from 'gulp'
import { startVitest } from 'vitest/node'

gulp.task('test', async function (_done) {
  await startVitest('test', [], {
    watch: false,
  })
})
