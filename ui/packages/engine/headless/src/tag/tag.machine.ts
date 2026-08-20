import type { TagSchema } from './tag.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<TagSchema>()

// 受控（open 给定）时用户事件只发意图、不自改状态，由 watch 派发 CONTROLLED.* 回写。
export const tagMachine = createMachine({
  name: 'tag',
  // 标签是内容流里常驻的一块，没给任何显隐声明就是显示
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen') ?? true) ? 'visible' : 'hidden'),
  watch: ({ track, prop, action }) => track([() => prop('open')], () => action(['syncOpen'])),
  states: {
    hidden: {
      on: {
        // 受控命中 → 只发意图；非受控 → 落 target 并一并通知
        'OPEN': [
          { guard: 'isOpenControlled', actions: ['invokeOnOpen'] },
          { target: 'visible', actions: ['invokeOnOpen'] },
        ],
        'CONTROLLED.VISIBLE': { target: 'visible' },
      },
    },
    visible: {
      on: {
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'hidden', actions: ['invokeOnClose'] },
        ],
        'CONTROLLED.HIDDEN': { target: 'hidden' },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
    },
    actions: {
      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop }) => prop('onOpenChange')?.({ open: false }),
      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制收起
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.VISIBLE' } : { type: 'CONTROLLED.HIDDEN' })
      },
    },
  },
})
