import type { NotificationSchema } from '../src/notification'
import { DATA_INERT_EXEMPT, normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { describe, expect, it } from 'vitest'
import { connectNotification, notificationMachine } from '../src/notification'

type Props = NotificationSchema['props']

function makeNotification(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(notificationMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    api: () => connectNotification(service, normalizeProps),
    stop: () => runtime.stop(),
  }
}

describe('notification 的 inert 豁免标记', () => {
  it('root 与 group 都带 data-xh-inert-exempt', () => {
    const t = makeNotification({ defaultItems: [{ id: 'a' }] })
    try {
      const api = t.api()
      expect(api.getRootProps()[DATA_INERT_EXEMPT]).toBe('')
      expect(api.getGroupProps()[DATA_INERT_EXEMPT]).toBe('')
      // 属性名写错过一次（defaultToasts），队列恒空时这条用例其实什么都没验
      expect(api.count).toBe(1)
    }
    finally {
      t.stop()
    }
  })
})
