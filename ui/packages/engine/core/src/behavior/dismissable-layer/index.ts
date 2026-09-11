import type { Disposable } from '../../kernel'
import type { DismissLayerOptions } from './types'
import { registerDismissLayer } from './hub'

export type { DismissLayerOptions, DismissReason } from './types'

export function createDismissLayer(options: DismissLayerOptions): Disposable {
  return registerDismissLayer(options)
}
