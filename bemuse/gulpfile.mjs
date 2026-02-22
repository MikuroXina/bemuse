import './node-environment.mjs'

import glob from 'glob'
import gulp from 'gulp'
import undertaker from 'undertaker-forward-reference'

gulp.registry(undertaker())
await Promise.all(glob.sync('./tasks/*.js').map((file) => import(file)))
