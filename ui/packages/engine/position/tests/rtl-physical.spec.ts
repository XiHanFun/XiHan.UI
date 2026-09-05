import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { computePlacement } from '../src/compute'

/**
 * 引擎产出的 x 量的是距视口左缘，是物理坐标；y 量的是距视口上缘。
 * 消费它的浮层必须把这两个数写进物理属性 left / top：
 * 写进 inset-inline-start，RTL 元素上会解析成距右缘，整层浮层落到镜像位置。
 */

const HEADLESS = join(import.meta.dirname, '..', '..', 'headless', 'src')

/** 把引擎坐标写进内联样式的浮层族。定位不吃引擎坐标的 dialog / drawer / image-viewer 不在内。 */
const OVERLAYS = [
  'cascader',
  'color-picker',
  'combobox',
  'context-menu',
  'date-picker',
  'hover-card',
  'mention',
  'menu',
  'menubar',
  'popconfirm',
  'popover',
  'select',
  'side-nav',
  'time-picker',
  'tooltip',
  'tour',
  'tree-select',
]

/** 内联样式里把引擎坐标写进逻辑内边距的写法。 */
const LOGICAL_INSET_FED_BY_ENGINE = /inset(?:Inline|Block)(?:Start|End)\s*:[^\n]*(?:position|popoutPosition|spotlight)\?\./

/** positioner 把引擎坐标写进物理属性的写法。 */
const PHYSICAL_X = /left: `\$\{position\?\.x \?\? 0\}px`/
const PHYSICAL_Y = /top: `\$\{position\?\.y \?\? 0\}px`/

function connectSource(name: string): string {
  return readFileSync(join(HEADLESS, name, `${name}.connect.ts`), 'utf8')
}

describe('引擎坐标只落在物理属性上', () => {
  it('x 是距视口左缘：RTL 下 start 挪到锚点右缘，坐标本身仍从左缘量起', () => {
    const anchor = { x: 100, y: 100, width: 200, height: 40 }
    const base = {
      anchor,
      floating: { width: 80, height: 30 },
      clip: { top: 0, right: 1000, bottom: 1000, left: 0 },
      offset: 0,
      flip: false,
      shift: false,
      padding: 0,
    }
    const rtl = computePlacement({ ...base, placement: 'bottom-start', dir: 'rtl' })
    // 距左缘 220、距右缘 780：两者不等，写进哪种属性不是无所谓的
    expect(rtl.x).toBe(220)
    expect(base.clip.right - rtl.x).toBe(780)
  })

  for (const name of OVERLAYS) {
    it(`${name}：坐标不写进逻辑内边距`, () => {
      expect(connectSource(name)).not.toMatch(LOGICAL_INSET_FED_BY_ENGINE)
    })
  }

  for (const name of ['tooltip', 'select']) {
    it(`${name} 的 positioner 把 x / y 写进 left / top`, () => {
      const source = connectSource(name)
      expect(source).toMatch(PHYSICAL_X)
      expect(source).toMatch(PHYSICAL_Y)
    })
  }
})
