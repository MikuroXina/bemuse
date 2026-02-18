import gulp from 'gulp'
import { startVitest } from 'vitest/node'

gulp.task('test', async function () {
  await startVitest('test', [], {
    watch: false,
  })
})
