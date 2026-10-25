// 跟随系统明暗的纯 CSS 路径：data-theme='system' 不经 JS，浅色系统下落在浅色块，
// 深色系统下由紧随深色块的 @media (prefers-color-scheme: dark) 块接管。
//
// 矩阵快照（matrix.spec）跳过 @media 块，这里单独对账：系统深色块与显式深色块逐行相同，
// 落点排在浅色块之后（同为零特指度靠书写顺序压过它）、对比度与墨色域之前（那两支照常压过主题块）。
// 真实浏览器里的计算值由 vue 的 tests/browser/system-mode.spec.ts 核对。
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(join(import.meta.dirname, '..', 'tokens.css'), 'utf8')

const LIGHT = `:where(:root), :where([data-theme='light']), :where([data-theme='system']), :where([data-xh-ink='dark']) {`
const DARK = `:where([data-theme='dark']), :where([data-xh-ink='light']) {`
const MEDIA = '@media (prefers-color-scheme: dark) {'
const SYSTEM = `:where([data-theme='system']) {`

/** 从块头那一行之后取到配对的收尾行（缩进与块头相同的那个 }）。 */
function blockBody(head: string, from = 0): { body: string[], at: number } {
  const at = css.indexOf(head, from)
  expect(at, `tokens.css 里找不到 ${head}`).toBeGreaterThanOrEqual(0)
  const lineStart = css.lastIndexOf('\n', at) + 1
  const indent = css.slice(lineStart, at)
  const end = css.indexOf(`\n${indent}}`, at)
  return { body: css.slice(at + head.length, end).split('\n').filter(Boolean), at }
}

describe('data-theme=\'system\'', () => {
  it('浅色系统下与浅色块同一块：system 写在浅色块的选择器里', () => {
    expect(css).toContain(LIGHT)
  })

  it('深色系统下的取值与显式深色块逐行相同，color-scheme 一并翻成 dark', () => {
    const dark = blockBody(DARK)
    const media = css.indexOf(MEDIA)
    const system = blockBody(SYSTEM, media)
    expect(system.body.map(line => line.replace(/^ {2}/, ''))).toEqual(dark.body)
    expect(system.body[0]!.trim()).toBe('color-scheme: dark;')
  })

  it('排在浅色与深色块之后、对比度与墨色域之前', () => {
    const light = css.indexOf(LIGHT)
    const dark = css.indexOf(DARK)
    const media = css.indexOf(MEDIA)
    expect(light).toBeLessThan(dark)
    expect(dark).toBeLessThan(media)
    expect(media).toBeLessThan(css.indexOf(`:where([data-contrast='default']) {`))
    expect(media).toBeLessThan(css.indexOf(`[data-xh-ink='auto']`))
    expect(css.split(MEDIA)).toHaveLength(2)
  })
})
