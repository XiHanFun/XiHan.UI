import { runPositionEngine } from '@xihan-ui/testing/position'
import { describe, it } from 'vitest'
import { createFloatingUiPositionEngine } from '../../src/index'

runPositionEngine(createFloatingUiPositionEngine(), { describe, it }, 'floating-ui')
