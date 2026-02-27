export function performSideEffects(sideEffectStream) {
  const subscription = sideEffectStream.subscribe((f) => f())
  return {
    dispose: () => subscription.unsubscribe(),
  }
}

export default performSideEffects
