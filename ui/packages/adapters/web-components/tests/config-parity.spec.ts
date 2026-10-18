// @vitest-environment jsdom
import { enUS } from '@xihan-ui/headless/locale'
import { runConfigParity } from '@xihan-ui/testing'
import { afterEach, describe, it } from 'vitest'
import surface from '../../../../tooling/public-surface.json'
import { createWcHarness } from './harness'
import { wcSuites } from './suites'

afterEach(() => {
  document.body.innerHTML = ''
})

runConfigParity(createWcHarness(), wcSuites, { describe, it }, {
  props: surface.componentProps,
  translations: enUS.translations,
})
