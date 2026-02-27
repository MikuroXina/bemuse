import {
  catchError,
  concatMap,
  EMPTY,
  from,
  fromEvent,
  Observable,
  tap,
} from 'rxjs'
import type { EventListenerObject } from 'rxjs/internal/observable/fromEvent'

declare global {
  interface Navigator {
    requestMIDIAccess(options?: MIDIAccessOptions): Promise<MIDIAccess>
  }

  interface MIDIAccessOptions {
    sysex: boolean
    software: boolean
  }

  interface MIDIAccess {
    readonly inputs: MIDIInputMap
    readonly outputs: MIDIOutputMap
    onstatechange: // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((this: MIDIAccess, event: MIDIConnectionEvent) => any) | null
  }
  interface MIDIInput extends MIDIPort {
    type: 'input'

    addEventListener(
      type: 'midimessage',
      listener:
        | ((evt: MIDIMessageEvent) => void)
        | EventListenerObject<MIDIMessageEvent>
        | null,
      options?: boolean | AddEventListenerOptions
    ): void
    removeEventListener(
      type: 'midimessage',
      listener:
        | ((evt: MIDIMessageEvent) => void)
        | EventListenerObject<MIDIMessageEvent>
        | null,
      options?: EventListenerOptions | boolean
    ): void
  }
  interface MIDIOutput extends MIDIPort {
    type: 'output'
  }
  interface MIDIPort {
    readonly type: MIDIPortType
    readonly id: string
  }
  interface MIDIConnectEvent {
    readonly port: MIDIPort
  }

  interface MIDIMessageEvent {
    readonly data: Uint8Array<ArrayBuffer> | null
    readonly target: MIDIPort | null
  }
}

function observeMidiAccess(access: MIDIAccess) {
  return new Observable<MIDIPort>((subscriber) => {
    for (const port of (access.inputs as Map<string, MIDIInput>).values()) {
      subscriber.next(port)
    }
    for (const port of (access.outputs as Map<string, MIDIOutput>).values()) {
      subscriber.next(port)
    }
    access.onstatechange = (e) => {
      subscriber.next(e.port!)
    }
  })
}

function requestMIDIAccess() {
  if (!navigator.requestMIDIAccess) {
    return Promise.reject(new Error('MIDI is not supported'))
  }
  return navigator.requestMIDIAccess()
}

export function getMidiStream(): Observable<MIDIMessageEvent> {
  return from(requestMIDIAccess())
    .pipe(concatMap(observeMidiAccess))
    .pipe(
      catchError((e: Error) => {
        console.warn('MIDI Error:', e.stack)
        return EMPTY
      })
    )
    .pipe(concatMap(messageStreamForPort))
    .pipe(tap((message) => console.log('messageforport', message)))
}

function messageStreamForPort(port: MIDIPort): Observable<MIDIMessageEvent> {
  if (port.type !== 'input') return EMPTY
  return fromEvent<MIDIMessageEvent>(port as MIDIInput, 'midimessage')
}

export default getMidiStream
