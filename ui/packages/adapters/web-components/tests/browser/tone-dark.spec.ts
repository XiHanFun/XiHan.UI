// 语气层里有两族的控件边界在深色态要换一档（css/tone.css 的 warning 与 neutral）。
// 那两条规则连同热力图的 gray 都写成 :is([data-theme='dark'] *, [data-theme='dark'])：
// data-theme 写在语气容器自己身上还是写在祖先上都算。
// 计算值只有真浏览器给得出，jsdom 不做 var() 代换。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 与 css/tone.css 的四条 --xh-_tone-border-control 规则逐条对上。 */
const BORDER_CONTROL: Record<string, { light: string, dark: string }> = {
  warning: { light: 'oklch(0.62 0.15 70)', dark: 'oklch(0.705 0.16 70)' },
  neutral: { light: 'oklch(0.439 0.006 258)', dark: 'oklch(0.52 0.006 258)' },
}

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

/** 造一个两层的盒子，深色标记按 where 落在外层或内层自己身上。 */
function mount(tone: string, where: 'ancestor' | 'none' | 'self'): HTMLElement {
  host = document.createElement('div')
  const inner = document.createElement('div')
  inner.dataset.tone = tone
  if (where === 'self')
    inner.dataset.theme = 'dark'
  if (where === 'ancestor')
    host.dataset.theme = 'dark'
  host.append(inner)
  document.body.append(host)
  return inner
}

function borderControl(el: HTMLElement): string {
  return getComputedStyle(el).getPropertyValue('--xh-_tone-border-control').trim()
}

describe('语气层的深色覆盖：写在自己身上也算', () => {
  for (const [tone, expected] of Object.entries(BORDER_CONTROL)) {
    it(`${tone}：不写深色标记时走浅色那一档`, () => {
      expect(borderControl(mount(tone, 'none'))).toBe(expected.light)
    })

    it(`${tone}：深色标记在祖先上`, () => {
      expect(borderControl(mount(tone, 'ancestor'))).toBe(expected.dark)
    })

    it(`${tone}：深色标记在语气容器自己身上`, () => {
      expect(borderControl(mount(tone, 'self'))).toBe(expected.dark)
    })
  }
})
