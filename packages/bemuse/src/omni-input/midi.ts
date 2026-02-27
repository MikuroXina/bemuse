import { Subject } from '@bemuse/utils/subject'

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
      listener: ((evt: MIDIMessageEvent) => void) | null,
      options?: boolean | AddEventListenerOptions
    ): void
    removeEventListener(
      type: 'midimessage',
      listener: ((evt: MIDIMessageEvent) => void) | null,
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

function requestMIDIAccess() {
  if (!navigator.requestMIDIAccess) {
    return Promise.reject(new Error('MIDI is not supported'))
  }
  return navigator.requestMIDIAccess()
}

export function getMidiStream(): Subject<MIDIMessageEvent> {
  const subject = new Subject<MIDIMessageEvent>()
  void (async () => {
    let access: MIDIAccess
    try {
      access = await requestMIDIAccess()
    } catch {
      return
    }
    for (const inputPort of (
      access.inputs as Map<string, MIDIInput>
    ).values()) {
      inputPort.addEventListener('midimessage', (event) => {
        subject.dispatch(event)
      })
    }
  })()
  return subject
}

export default getMidiStream
