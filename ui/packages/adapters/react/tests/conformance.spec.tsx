// @vitest-environment jsdom
import { runConformance, switchSuite } from '@xihan-ui/testing'
import { describe, it } from 'vitest'
import { createReactHarness } from './harness'

;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false

runConformance(createReactHarness(), [switchSuite], { describe, it }, {
  keyboardCoverageExempt: {},
})
