import { attachProbe, createStage, expectClose } from '@xihan-ui/testing/position'
import { describe, expect, it } from 'vitest'
import { createPositionEngine } from '../../src/index'

/**
 * RTL 页面里的落点。浮层不搬家，就地留在作者 DOM 里，会继承到 direction: rtl。
 * 引擎给的 x 从视口左缘量起，写进 left 才落在算出来的地方。
 */

/** 浮层尺寸按两个典型族取：tooltip 一条窄浮层，select 一张下拉面板。 */
const CASES = [
  { name: 'tooltip', width: 160, height: 32 },
  { name: 'select', width: 240, height: 180 },
]

describe('rTL：引擎坐标与物理左缘', () => {
  for (const { name, width, height } of CASES) {
    it(`${name}：positioner 的物理左缘等于引擎给的 x`, async () => {
      const stage = createStage()
      stage.root.dir = 'rtl'
      try {
        const anchor = stage.putAnchor(300, 200, 200, 40)
        const floating = stage.putFloating(width, height)
        const probe = attachProbe(createPositionEngine(), anchor, floating, {
          placement: 'bottom-start',
          offset: 8,
          strategy: 'fixed',
          dir: 'rtl',
        })
        await probe.settle()

        expectClose(floating.getBoundingClientRect().left, probe.last().x, `${name} 的物理左缘应等于引擎给的 x`)
        probe.stop()
      }
      finally {
        stage.cleanup()
      }
    })

    it(`${name}：同一个 x 写进 inset-inline-start 会落到别处`, async () => {
      const stage = createStage()
      stage.root.dir = 'rtl'
      try {
        const anchor = stage.putAnchor(300, 200, 200, 40)
        const floating = stage.putFloating(width, height)
        const probe = attachProbe(createPositionEngine(), anchor, floating, {
          placement: 'bottom-start',
          offset: 8,
          strategy: 'fixed',
          dir: 'rtl',
        })
        await probe.settle()

        const x = probe.last().x
        const mirrored = stage.putFloating(width, height)
        mirrored.style.position = 'fixed'
        mirrored.style.removeProperty('left')
        mirrored.style.setProperty('inset-inline-start', `${x}px`)

        expect(Math.abs(mirrored.getBoundingClientRect().left - x)).toBeGreaterThan(1)
        probe.stop()
      }
      finally {
        stage.cleanup()
      }
    })
  }
})
