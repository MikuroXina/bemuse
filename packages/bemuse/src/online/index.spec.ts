import { assert, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import Online from './index.js'
import OnlineService from './scoreboard-system/online-service.js'

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

class StubStorage implements Storage {
  map = new Map<string, string>()
  get length() {
    return this.map.size
  }
  clear() {
    this.map.clear()
  }
  key(index: number): string | null {
    throw new Error('unimplemented key with: ' + index)
  }
  getItem(key: string): string | null {
    return this.map.get(key) ?? null
  }
  setItem(key: string, value: string) {
    this.map.set(key, value)
  }
  removeItem(key: string) {
    this.map.delete(key)
  }
}

const storage = new StubStorage()

function createOnline() {
  return new Online(new OnlineService({ fake: true, storage }))
}

interface AccountInfo {
  username: string
  password: string
  email: string
}

function createAccountInfo(): AccountInfo {
  return {
    username: uid(),
    password: 'wow_bemuse_test',
    email: 'test+' + uid() + '@bemuse.ninja',
  }
}

describe('Online', function () {
  vi.setConfig({ testTimeout: 20000 })

  describe('signup', function () {
    let online: Online
    let info: AccountInfo
    beforeAll(function () {
      online = createOnline()
    })
    beforeAll(function () {
      info = createAccountInfo()
    })
    it('should succeed', async () => {
      await online.signUp(info)
    })
    it('should not allow duplicate signup', async () => {
      await expect(online.signUp(info)).rejects.toThrowError()
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
      const info = createAccountInfo()

      await online.signUp(info)

      const user = online.getCurrentUser()
      expect(user!.username).to.equal(info.username)
    })
  })

  describe('with an active user', function () {
    let online: Online
    const info = createAccountInfo()
    beforeAll(function () {
      online = createOnline()
      return online.signUp(info)
    })
    beforeEach(function () {
      return online.logIn(info)
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
    const user1 = createAccountInfo()
    const user2 = createAccountInfo()

    let lastRecordedAt: Date | undefined
    // sign up...
    await online.signUp(user1)

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
    expect(record3.playerName).to.equal(user1.username)

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
    await online.signUp(user2)

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
    const user1 = createAccountInfo()
    const user2 = createAccountInfo()

    // sign up user1...
    await online.signUp(user1)

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
    await online.signUp(user2)

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
