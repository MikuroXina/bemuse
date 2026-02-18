import gulp from 'gulp'
import merge from 'merge-stream'
import { resolve } from 'node:path'

import routes from '../config/routes.js'

gulp.task('dist', function () {
  const streams = routes.map((route) => {
    return gulp
      .src(route.src + '/**/*')
      .pipe(gulp.dest(resolve('dist', ...route.dest)))
  })
  return merge(...streams)
})
