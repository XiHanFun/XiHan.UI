import type { ToasterSchema } from '../src/toaster'
import { DATA_INERT_EXEMPT, normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { describe, expect, it } from 'vitest'
import { connectToaster, toasterMachine } from '../src/toaster'

type Props = ToasterSchema['props']

function makeToaster(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(toasterMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    api: () => connectToaster(service, normalizeProps),
    stop: () => runtime.stop(),
  }
}

describe('toaster 的 inert 豁免标记', () => {
  it('root 与 group 都带 data-xh-inert-exempt', () => {
    const t = makeToaster({ defaultToasts: [{ id: 'a' }] })
    try {
      const api = t.api()
      expect(api.getRootProps()[DATA_INERT_EXEMPT]).toBe('')
      expect(api.getGroupProps()[DATA_INERT_EXEMPT]).toBe('')
    }
    finally {
      t.stop()
    }
  })
})
