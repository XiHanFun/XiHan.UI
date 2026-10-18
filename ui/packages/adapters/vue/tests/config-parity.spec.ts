// @vitest-environment jsdom
import { enUS } from '@xihan-ui/headless/locale'
import { allSuites, runConfigParity } from '@xihan-ui/testing'
import { afterEach, describe, it } from 'vitest'
import surface from '../../../../tooling/public-surface.json'
import { createVueHarness } from './harness'

afterEach(() => {
  document.body.innerHTML = ''
})

runConfigParity(createVueHarness(), allSuites, { describe, it }, {
  props: surface.componentProps,
  translations: enUS.translations,
})
