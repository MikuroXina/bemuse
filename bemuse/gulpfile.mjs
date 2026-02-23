import './node-environment.mjs'

import { globSync } from 'glob'
import gulp from 'gulp'
import undertaker from 'undertaker-forward-reference'

gulp.registry(undertaker())
const path = import.meta.resolve('./tasks/').replace('file://', '') + '*.js'
await Promise.all(globSync(path).map((file) => import(file)))
