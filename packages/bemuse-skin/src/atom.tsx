import { createElement, type ReactNode } from 'react'

export type InputDevice = 'keyboard' | 'touch'
export type PanelPosition = 'bottom' | 'top'

export interface SkinProps {
  children: ReactNode
  width: string
  height: string
  'data-main-input-device': InputDevice
  'data-info-panel-position': PanelPosition
  'data-display-mode'?: 'touch3d'
}

export function Skin({ children, ...props }: SkinProps) {
  return createElement('skin', props, children)
}

export type Animatable = 'x' | 'y' | 'alpha' | 'scale-x' | 'scale-y'
export type AnimatableProps = Partial<Record<Animatable, string>>

export type BlendMode = 'normal' | 'screen'
export type EaseFunction = 'linear' | 'quadIn' | 'quadOut'

export interface KeyframeProps extends AnimatableProps {
  t: string
  ease?: EaseFunction
}

export function Keyframe(props: KeyframeProps) {
  return createElement('keyframe', props)
}

export interface AnimationProps {
  children: ReactNode
  on?: string
}

export function Animation({ children, on }: AnimationProps) {
  return createElement('animation', { on }, children)
}

export interface SpriteProps extends AnimatableProps {
  children?: ReactNode
  image: string
  frame?: string
  width?: string
  height?: string
  visible?: string
  blend?: BlendMode
  t?: string
  ref?: string
}

export function Sprite({ children, ...props }: SpriteProps) {
  return createElement('sprite', props, children)
}

export type TextAlignment = 'left' | 'center' | 'right'

export interface TextProps extends AnimatableProps {
  text: string
  data?: string
  'font-family': string
  'font-size': string
  'font-weight'?: string
  'font-src'?: string
  align?: TextAlignment
  blend?: BlendMode
}

export function Text(props: TextProps) {
  return createElement('text', props)
}

export interface ObjectProps {
  children: ReactNode
  key: string
  pool: `${number}`
}

export function Object({ children, ...props }: ObjectProps) {
  return createElement('object', props, children)
}

export function Defs({ children }: { children: ReactNode }) {
  return createElement('defs', {}, children)
}

export interface IfProps {
  children: ReactNode
  key: string
  value: string
}

export function If({ children, ...props }: IfProps) {
  return createElement('if', props, children)
}

export type Rect = `${number}x${number}+${number}+${number}`

export interface GroupProps extends AnimatableProps {
  mask?: Rect
  t?: string
  children: ReactNode
}

export function Group({ children, ...props }: GroupProps) {
  return createElement('group', props, children)
}
