import type { Bindings } from '../settings/bindings'

export type InboundEnv = Pick<Bindings, 'DB' | 'RAW' | 'JOBS'>
