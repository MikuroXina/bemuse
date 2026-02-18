import gulp from 'gulp'
import { startVitest } from 'vitest/node'

gulp.task('test', async function (_done) {
  const vitest = await startVitest('test', {
    watch: false,
  })
  await vitest.close()
})
