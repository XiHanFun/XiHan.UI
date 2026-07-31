import { runPositionEngine } from '@xihan-ui/testing/position'
import { describe, it } from 'vitest'
import { createPositionEngine } from '../../src/index'

runPositionEngine(createPositionEngine(), { describe, it }, '自研')
