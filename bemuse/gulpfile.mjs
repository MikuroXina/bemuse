import './node-environment.mjs'
import undertaker from 'undertaker-forward-reference'
import gulp from 'gulp'
import glob from 'glob'

gulp.registry(undertaker())
await Promise.all(glob.sync('./tasks/*.js').map((file) => import(file)))
