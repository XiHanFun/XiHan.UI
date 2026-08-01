// 门禁：键盘落在文本输入上的组件，必须挡住输入法组合态。
//
// 规格层的 KeyboardRow 只有 keys/when/does 三维，「组合中」这个条件进不去，
// 所以新加一个吃 Enter 的组件时没有任何东西提醒作者。这条按源码形状拦住。
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = join(import.meta.dirname, '../src')

/** 键盘处理器不落在文本输入上，组合态不会发生在这里。 */
const EXEMPT: Record<string, string> = {
  'carousel': 'onKeyDown 开头就用 isEditableTarget 把可编辑目标整个放行',
  'file-upload': 'onKeyDown 挂在 dropzone 的 div 上，只接 Enter / Space',
  'transfer': 'onKeyDown 挂在 list 上；search 与 list 在解剖里是兄弟节点，按键不冒泡过去，且 search 只有 onInput',
}

function connectFiles(): { name: string, source: string }[] {
  return readdirSync(SRC, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map((d) => {
      const file = join(SRC, d.name, `${d.name}.connect.ts`)
      try {
        return { name: d.name, source: readFileSync(file, 'utf8') }
      }
      catch {
        return null
      }
    })
    .filter((x): x is { name: string, source: string } => x != null)
}

const TEXT_INPUT = /HTMLInputElement|HTMLTextAreaElement|contentEditable|contenteditable/

const needsGuard = connectFiles().filter(f => f.source.includes('onKeyDown') && TEXT_INPUT.test(f.source))

describe('输入法组合态守卫', () => {
  it('识别出了需要守卫的组件', () => {
    expect(needsGuard.length).toBeGreaterThan(5)
  })

  for (const { name, source } of needsGuard) {
    const reason = EXEMPT[name]
    it(reason ? `${name} 已豁免：${reason}` : `${name} 挡住了组合态`, () => {
      expect(source.includes('isComposing')).toBe(reason == null)
    })
  }

  it('豁免表里没有失效条目', () => {
    const present = new Set(needsGuard.map(f => f.name))
    expect(Object.keys(EXEMPT).filter(n => !present.has(n))).toEqual([])
  })
})
