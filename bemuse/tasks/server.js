import gulp from 'gulp'

import * as server from './support/dev-server/index.js'

gulp.task('server', function (_callback) {
  server.start()
})
