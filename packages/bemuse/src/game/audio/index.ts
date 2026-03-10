import type { Sample, SamplingMaster } from '@bemuse/sampling-master/index.js'

import type Game from '../game.js'
import type Player from '../player.js'
import type GameState from '../state/index.js'
import PlayerAudio from './player-audio.js'

export class GameAudio {
  private readonly _master: SamplingMaster
  private readonly _context: BaseAudioContext
  private readonly _players: Map<Player, PlayerAudio>

  constructor({
    game,
    samples,
    master,
  }: {
    game: Game
    samples: Record<string, Sample>
    master: SamplingMaster
  }) {
    const volume = game.options.soundVolume
    this._master = master
    this._context = master.audioContext
    this._players = new Map(
      game.players.map((player) => [
        player,
        new PlayerAudio({ player, samples, master, volume }),
      ])
    )
  }

  destroy() {
    this._master.destroy()
  }

  unmute() {
    this._master.unmute()
  }

  get context() {
    return this._context
  }

  update(t: number, state: GameState) {
    for (const [player, playerAudio] of this._players) {
      playerAudio.update(t, state.player(player))
    }
  }
}

export default GameAudio
