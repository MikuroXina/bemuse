import { promises } from 'node:fs'

import gulp from 'gulp'

gulp.task('pre-deploy', async () => {
  await promises.cp('../website/build/', 'dist/project/', {
    recursive: true,
  })

  const data = await promises.readFile('dist/index.html', 'utf-8')
  check('Index file size is less than 200 KB', () => data.length < 200e3)

  function check(title, condition) {
    if (condition()) {
      console.log('[OK!!]', title)
    } else {
      console.log('[FAIL]', title)
      throw new Error('Pre-deploy check error: ' + title)
    }
  }
})
