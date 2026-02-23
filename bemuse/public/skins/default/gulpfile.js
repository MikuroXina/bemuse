import fs from 'node:fs'

import gulp from 'gulp'
import yaml from 'js-yaml'
import pug from 'pug'

function createCompiler(template, globals) {
  return function compile(outName, localsToAdd) {
    const locals = Object.create(globals)
    for (const i in localsToAdd) locals[i] = localsToAdd[i]
    fs.writeFileSync(outName, template(locals))
  }
}

gulp.task('compile', function () {
  const globals = yaml.safeLoad(fs.readFileSync('skin_data.yml', 'utf8'))
  const template = pug.compileFile('skin_template.jade', { pretty: true })
  const compile = createCompiler(template, globals)
  compile('skin_screen.xml', { media: 'screen' })
  compile('skin_touch.xml', { media: 'touch' })
  compile('skin_touch3d.xml', { media: 'touch3d' })
})

const sources = ['**/*.jade', '**/*.yml']

gulp.task('watch', function () {
  gulp.watch(sources, ['compile'])
})

gulp.task('default', gulp.parallel('compile', 'watch'))
