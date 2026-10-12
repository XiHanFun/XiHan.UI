// 字段族组件的 WC 宿主不占一层盒子：皮肤给宿主声明 display: contents，作者写的 root 直接参与排布、
// 按控件宽（--xh-control-w）铺满，与 Vue / React 直接渲染 root 一致。此前放进表格格子（flex）里，
// 宿主按内容定宽，字段只剩几十像素宽。宿主规则写在皮肤里，作者给宿主写的 display 照层叠胜出。
// 名单对账：根节点按 --xh-control-w 定宽的皮肤，都要在同一份皮肤里给宿主声明 contents，新加的字段组件漏了即报。
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SKINS = join(__dirname, '../../../design/styles/css')
const ELEMENTS = join(__dirname, '../src/elements')
const SIZED_BY_CONTROL_W = /^\s+inline-size: var\(--xh-[a-z-]+, var\(--xh-control-w\)\)/m

function skins(test: (source: string, name: string) => boolean): string[] {
  return readdirSync(SKINS)
    .filter(file => file.endsWith('.css'))
    .map(file => file.replace(/\.css$/, ''))
    .filter(name => test(readFileSync(join(SKINS, `${name}.css`), 'utf8'), name))
    .sort()
}

describe('字段族的 WC 宿主', () => {
  it('按控件宽定宽的皮肤都给宿主声明了 contents', () => {
    const sized = skins(source => SIZED_BY_CONTROL_W.test(source))
    const hosts = skins((source, name) => source.includes(`:where(xh-${name}:not([hidden])) {\n    display: contents;`))
    expect(sized.length).toBeGreaterThan(0)
    expect(hosts).toEqual(sized)
  })

  it('声明了宿主规则的皮肤都有对应的元素', () => {
    const hosts = skins((source, name) => source.includes(`:where(xh-${name}:not([hidden]))`))
    expect(hosts.filter(name => !existsSync(join(ELEMENTS, `${name}.ts`)))).toEqual([])
  })
})
