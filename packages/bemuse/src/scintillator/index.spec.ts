import type { Container, ParticleContainer, Sprite, Text } from 'pixi.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { load, type Scintillator } from './index.js'

const fixture = (file: string) =>
  new URL(`./test-fixtures/${file}`, import.meta.url).href.replace(
    'file://',
    ''
  )

describe('Scintillator', function () {
  describe('#load', function () {
    it('should load skin and return skin node', async function () {
      const actual = await load(fixture('bare.xml'))
      expect(actual.skin.width).to.equal(123)
      expect(actual.skin.height).to.equal(456)
      actual.app.destroy()
    })
    it('should reject if invalid', async () => {
      await expect(load(fixture('invalid_tag.xml'))).rejects.toThrow()
    })
  })

  describe('Expressions', function () {
    it('should be parsed and processed', async function () {
      const actual = await load(fixture('expr_basic.xml'))
      actual.stateSubject.dispatch({})
      const stage = actual.app.stage
      expect(stage.children[0].x).to.equal(6)
      expect(stage.children[0].y).to.equal(7)
      actual.app.destroy()
    })
    it('should support variables', async function () {
      const actual = await load(fixture('expr_variables.xml'))
      const stage = actual.app.stage

      actual.stateSubject.dispatch({ a: 4, b: 3 })
      expect(stage.children[0].x).to.equal(7)
      expect(stage.children[0].y).to.equal(12)

      actual.stateSubject.dispatch({ a: 10, b: 20 })
      expect(stage.children[0].x).to.equal(30)
      expect(stage.children[0].y).to.equal(200)

      actual.app.destroy()
    })
  })

  describe('SpriteNode', function () {
    it('should allow setting sprite frame', async function () {
      const actual = await load(fixture('sprite_attrs.xml'))
      const stage = actual.app.stage

      actual.stateSubject.dispatch({})
      const frame = (stage.children[0] as Sprite).texture.frame
      expect(frame.width).to.equal(10)
      expect(frame.height).to.equal(11)
      expect(frame.x).to.equal(12)
      expect(frame.y).to.equal(13)

      actual.app.destroy()
    })
    it('should allow setting visibility, width, height', async function () {
      const actual = await load(fixture('sprite_attrs.xml'))
      const stage = actual.app.stage

      actual.stateSubject.dispatch({})
      const sprite = stage.children[0]
      expect(sprite.width).to.equal(3)
      expect(sprite.height).to.equal(1)
      expect(sprite.visible).to.equal(false)

      actual.app.destroy()
    })
    it('should reject if blend mode is invalid', async () => {
      await expect(load(fixture('sprite_invalid_blend.xml'))).rejects.toThrow()
    })
  })

  describe('TextNode', function () {
    it('should display text', async function () {
      const actual = await load(fixture('text.xml'))
      const stage = actual.app.stage

      actual.stateSubject.dispatch({})
      const text = stage.children[0] as Text
      expect(text.text).to.equal('Hello world')

      actual.app.destroy()
    })
    it('should center text', async function () {
      const actual = await load(fixture('text_center.xml'))
      const stage = actual.app.stage

      actual.stateSubject.dispatch({})
      const text = stage.children[0]
      expect(text.x).to.be.lessThan(0)

      actual.app.destroy()
    })
    it('should support data interpolation', async function () {
      const actual = await load(fixture('text_interpolation.xml'))
      const stage = actual.app.stage

      actual.stateSubject.dispatch({ lol: 'wow' })
      const text = stage.children[0] as Text
      expect(text.text).to.equal('Hello world wow')

      actual.app.destroy()
    })
  })

  describe('IfNode', function () {
    let scintillator: Scintillator
    let stage: Container
    beforeEach(async function () {
      scintillator = await load(fixture('expr_if.xml'))
      stage = scintillator.app.stage
    })
    afterEach(function () {
      scintillator.app.destroy()
    })
    it('should display child when correct value', function () {
      scintillator.stateSubject.dispatch({ a: 'b' })
      expect(stage.children[0].children).to.have.length(1)
      scintillator.stateSubject.dispatch({ a: 'x' })
      expect(stage.children[0].children).to.have.length(0)
    })
  })

  describe('ObjectNode', function () {
    it('should display children', async function () {
      const actual = await load(fixture('expr_object.xml'))
      const stage = actual.app.stage
      const container = stage.children[0] as ParticleContainer

      actual.stateSubject.dispatch({ notes: [] })
      expect(container.particleChildren).to.have.length(0)

      actual.stateSubject.dispatch({ notes: [{ key: 'a', y: 20 }] })
      expect(container.particleChildren).to.have.length(1)

      actual.stateSubject.dispatch({
        notes: [
          { key: 'a', y: 20 },
          { key: 'b', y: 10 },
        ],
      })
      expect(container.particleChildren).to.have.length(2)

      actual.stateSubject.dispatch({ notes: [{ key: 'b', y: 10 }] })
      expect(container.particleChildren).to.have.length(1)

      actual.app.destroy()
    })
    it('should update same array with content changed', async function () {
      const actual = await load(fixture('expr_object.xml'))
      const stage = actual.app.stage
      const container = stage.children[0] as ParticleContainer
      const notes: { key: string; y: number }[] = []

      actual.stateSubject.dispatch({ notes })
      expect(container.particleChildren).to.have.length(0)

      notes.push({ key: 'a', y: 20 })
      actual.stateSubject.dispatch({ notes })
      expect(container.particleChildren).to.have.length(1)

      actual.app.destroy()
    })
    it('should let children get value from item', async function () {
      const actual = await load(fixture('expr_object_var.xml'))
      const stage = actual.app.stage
      const container = stage.children[0] as ParticleContainer

      actual.stateSubject.dispatch({ notes: [] })
      actual.stateSubject.dispatch({ notes: [{ key: 'a', y: 20 }] })
      expect(container.particleChildren[0].y).to.equal(20)

      actual.stateSubject.dispatch({
        notes: [
          { key: 'a', y: 20 },
          { key: 'b', y: 10 },
        ],
      })
      expect(container.particleChildren[0].y).to.equal(20)

      actual.stateSubject.dispatch({ notes: [{ key: 'b', y: 10 }] })
      expect(container.particleChildren[0].y).to.equal(10)

      actual.app.destroy()
    })
  })

  describe('GroupNode', function () {
    it('should allow masking', async function () {
      const actual = await load(fixture('group_mask.xml'))
      const stage = actual.app.stage
      const mask = stage.children[0].mask
      expect(mask).not.to.equal(null)
      actual.app.destroy()
    })
  })

  describe('AnimationNode', function () {
    it('should allow animations', async function () {
      const actual = await load(fixture('animation.xml'))
      const group = actual.app.stage.children[0]

      actual.stateSubject.dispatch({ t: 0 })
      expect(group.x).to.equal(10)
      expect(group.y).to.equal(0)

      actual.stateSubject.dispatch({ t: 0.5 })
      expect(group.x).to.equal(15)
      expect(group.y).to.equal(1)

      actual.stateSubject.dispatch({ t: 1 })
      expect(group.x).to.equal(20)
      expect(group.y).to.equal(2)

      actual.app.destroy()
    })
    it('should allow animations on different events', async function () {
      const actual = await load(fixture('animation.xml'))
      const group = actual.app.stage.children[0]

      actual.stateSubject.dispatch({ t: 0.5, exitEvent: 0.5 })
      expect(group.x).to.equal(50)
      expect(group.y).to.equal(0)

      actual.stateSubject.dispatch({ t: 1, exitEvent: 0.5 })
      expect(group.x).to.equal(60)
      expect(group.y).to.equal(50)

      actual.stateSubject.dispatch({ t: 1.5, exitEvent: 0.5 })
      expect(group.x).to.equal(70)
      expect(group.y).to.equal(100)

      actual.app.destroy()
    })
    it('should allow animations on different value', async function () {
      const actual = await load(fixture('animation_timekey.xml'))
      const group = actual.app.stage.children[0]
      actual.stateSubject.dispatch({ t: 0, x: 0.5 })
      expect(group.x).to.equal(15)
    })
  })

  describe('defs', function () {
    it('should allow reuse of skin nodes', async function () {
      const actual = await load(fixture('defs.xml'))

      actual.stateSubject.dispatch({})
      const stage = actual.app.stage
      expect(stage.children[0].x).to.equal(6)
      expect(stage.children[0].y).to.equal(7)
      expect(stage.children[1].x).to.equal(6)
      expect(stage.children[1].y).to.equal(7)

      actual.app.destroy()
    })
  })
})
