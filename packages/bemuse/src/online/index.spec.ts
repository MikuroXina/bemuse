import { assert, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import Online from './index.js'
import FakeOnlineService from './scoreboard-system/fake-online-service.js'
import type { ScoreboardClient } from './scoreboard-system/scoreboard-client.js'

const uid = (function () {
  const session = Math.floor(Math.random() * 65536).toString(16)
  let index = 0
  return function () {
    const random = Math.floor(Math.random() * 65536).toString(16)
    const time = Date.now().toString(16)
    return (
      'bemuse.' +
      time +
      '.' +
      session +
      '.' +
      random +
      '.' +
      (++index).toString(16)
    )
  }
})()

function createOnline(scoreboardClient?: ScoreboardClient) {
  return new Online(new FakeOnlineService(scoreboardClient))
}

describe('Online', function () {
  vi.setConfig({ testTimeout: 20000 })

  describe('signup', function () {
    let online: Online
    beforeAll(function () {
      online = createOnline()
    })
    it('should succeed', async () => {
      await online.logIn()
    })
  })

  describe('initially', function () {
    let online: Online
    beforeAll(async () => {
      await createOnline().logOut()
    })
    beforeEach(async () => {
      online = createOnline()
    })
    it('current user should be null', () => {
      expect(online.getCurrentUser()).toStrictEqual(null)
    })
  })

  describe('when signed up', function () {
    let online: Online
    beforeAll(function () {
      online = createOnline()
    })
    it('user should change to signed-up user', async function () {
      await online.logIn()

      const user = online.getCurrentUser()
      expect(user!.username).to.equal('Anonymous 1')
    })
  })

  describe('with an active user', function () {
    let online: Online
    beforeAll(function () {
      online = createOnline()
    })
    beforeEach(function () {
      return online.logIn()
    })
    it('when log out, the user should change back to null', async function () {
      await online.logOut()

      const user = online.getCurrentUser()

      assert(user === null)
    })
  })

  it('submitting high scores', async () => {
    const online = createOnline()
    const prefix = uid() + '_'

    let lastRecordedAt: Date | undefined
    // sign up...
    await online.logIn()

    // records data successfully
    const record1 = await online.submitScore({
      md5: prefix + 'song',
      playMode: 'BM',
      score: 123456,
      combo: 123,
      total: 456,
      count: [122, 1, 0, 0, 333],
      log: '',
    })

    expect(record1.playNumber).to.equal(1)
    expect(record1.playCount).to.equal(1)
    expect(record1.recordedAt).to.be.an.instanceof(Date)
    expect(record1.rank).to.equal(1)
    lastRecordedAt = record1.recordedAt

    // does not update if old score is better, but update play count
    const record2 = await online.submitScore({
      md5: prefix + 'song',
      playMode: 'BM',
      score: 123210,
      combo: 124,
      total: 456,
      count: [123, 1, 0, 0, 332],
      log: '',
    })
    expect(record2.score).to.equal(123456)
    expect(record2.combo).to.equal(123)
    expect(record2.playNumber).to.equal(1)
    expect(record2.playCount).to.equal(2)
    expect(record2.recordedAt).not.to.be.above(lastRecordedAt!)
    lastRecordedAt = record2.recordedAt

    // updates data if new score is better
    const record3 = await online.submitScore({
      md5: prefix + 'song',
      playMode: 'BM',
      score: 555555,
      combo: 456,
      total: 456,
      count: [456, 0, 0, 0, 0],
      log: '',
    })
    expect(record3.score).to.equal(555555)
    expect(record3.combo).to.equal(456)
    expect(record3.playNumber).to.equal(3)
    expect(record3.playCount).to.equal(3)
    expect(record3.recordedAt).to.be.above(lastRecordedAt!)
    expect(record3.playerName).to.equal('Anonymous 1')

    // different mode have different score board
    const record4 = await online.submitScore({
      md5: prefix + 'song',
      playMode: 'KB',
      score: 123210,
      combo: 124,
      total: 456,
      count: [123, 1, 0, 0, 332],
      log: '',
    })
    expect(record4.score).to.equal(123210)
    expect(record4.rank).to.equal(1)

    // as another user...
    await online.logOut()
    await online.logIn()

    // saves a separate data
    const record5 = await online.submitScore({
      md5: prefix + 'song',
      playMode: 'BM',
      score: 123210,
      combo: 124,
      total: 456,
      count: [123, 1, 0, 0, 332],
      log: '',
    })
    expect(record5.score).to.equal(123210)
    expect(record5.playNumber).to.equal(1)
    expect(record5.playCount).to.equal(1)
    expect(record5.rank).to.equal(2)
  })

  it('the scoreboard', async () => {
    const online = createOnline()
    await online.logOut()

    const prefix = uid() + '_'

    // sign up user1...
    await online.logIn()

    // submit score1...
    await online.submitScore({
      md5: prefix + 'song1',
      playMode: 'BM',
      score: 222222,
      combo: 456,
      total: 456,
      count: [0, 0, 456, 0, 0],
      log: '',
    })

    // sign up user2...
    await online.logOut()
    await online.logIn()

    // submit score2...
    await online.submitScore({
      md5: prefix + 'song1',
      playMode: 'BM',
      score: 555555,
      combo: 456,
      total: 456,
      count: [456, 0, 0, 0, 0],
      log: '',
    })

    // scoreboard should return the top score
    const result = await online.scoreboard({
      md5: prefix + 'song1',
      playMode: 'BM',
    })
    expect(result.data).to.have.length(2)
    expect(result.data[0].rank).to.eq(1)
    expect(result.data[1].rank).to.eq(2)

    // log out...
    await online.logOut()
  })

  vi.resetConfig()
})
