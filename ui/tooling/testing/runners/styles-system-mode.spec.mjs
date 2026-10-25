// 皮肤里深色专属规则的系统档（packages/design/styles/build/system-mode.mjs）：
//   - 每条带 [data-theme='dark'] 的规则紧跟一份 @media (prefers-color-scheme: dark) 副本，选择器换成 system；
//   - 选择器列表只挑带 dark 的几支；@layer / @media 块里的规则一样照抄；注释与字符串里的括号不打乱扫描；
//   - 两份扁平入口与按需子路径里，深色规则与系统档副本一一对上。
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { systemModeVariants } from '../../../packages/design/styles/build/system-mode.mjs'

const STYLES = fileURLToPath(new URL('../../../packages/design/styles/', import.meta.url))
const DARK_RULE = /\[data-theme='dark'\][^{}]*\{/g
const SYSTEM_RULE = /@media \(prefers-color-scheme: dark\)\s*\{[^{}]*\[data-theme='system'\][^{}]*\{/g

describe('系统档副本的拼法', () => {
  it('没有深色规则时原样返回', () => {
    const css = '@layer xihan.components {\n  [data-tone] { color: red; }\n}\n'
    expect(systemModeVariants(css)).toBe(css)
  })

  it('深色规则紧跟一份 @media 副本，层里的规则照样转', () => {
    const css = `@layer xihan.components {\n  /* 深色 { 下 } */\n  :is([data-theme='dark'] *, [data-theme='dark'])[data-tone='brand'] {\n    --x: 1;\n  }\n}\n`
    const out = systemModeVariants(css)
    expect(out).toContain(`:is([data-theme='dark'] *, [data-theme='dark'])[data-tone='brand'] {\n    --x: 1;\n  }\n  @media (prefers-color-scheme: dark) {\n    :is([data-theme='system'] *, [data-theme='system'])[data-tone='brand'] {`)
    expect(out.match(/--x: 1;/g)).toHaveLength(2)
    expect(out.startsWith('@layer xihan.components {\n  /* 深色 { 下 } */\n')).toBe(true)
  })

  it('选择器列表只挑带 dark 的几支；字符串里的括号不算', () => {
    const out = systemModeVariants(`.a, [data-theme='dark'] .b, :is(.c, [data-theme='dark']) .d { content: '{'; }`)
    const media = out.slice(out.indexOf('@media'))
    expect(media).toContain(`[data-theme='system'] .b,\n  :is(.c, [data-theme='system']) .d {`)
    expect(media).not.toContain('.a,')
    expect(media).toContain(`content: '{';`)
  })
})

describe('产物里的系统档', () => {
  const count = (css, re) => css.match(re)?.length ?? 0

  it.each(['index.css', 'index.unlayered.css'])('%s：深色规则与系统档副本一一对上', (file) => {
    const css = readFileSync(join(STYLES, file), 'utf8')
    expect(count(css, DARK_RULE)).toBeGreaterThan(0)
    expect(count(css, SYSTEM_RULE)).toBe(count(css, DARK_RULE))
  })

  it('按需子路径同样带系统档', () => {
    for (const dir of ['css', 'family']) {
      for (const name of readdirSync(join(STYLES, 'dist', dir)).filter(n => n.endsWith('.css'))) {
        const css = readFileSync(join(STYLES, 'dist', dir, name), 'utf8')
        const dark = count(css, /\[data-theme='dark'\][^{}]*\{/g)
        const system = count(css, /@media \(prefers-color-scheme: ?dark\)\s*\{[^{}]*\[data-theme='system'\][^{}]*\{/g)
        expect(system, `dist/${dir}/${name}`).toBe(dark)
      }
    }
  })
})
