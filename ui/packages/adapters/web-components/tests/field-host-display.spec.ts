// @vitest-environment jsdom
// 字段族组件的宿主缺省 display: contents：宿主不再是外层 flex / grid 里多出来的一层盒子，
// 作者写的 root 直接参与排布、按控件宽（--xh-control-w）铺满，与 Vue / React 直接渲染 root 一致。
// 此前放进表格格子（flex）里，宿主按内容定宽，字段只剩几十像素宽。
// 名单与皮肤对账：根节点按 --xh-control-w 定宽的组件，WC 宿主都要声明 contents，新加的字段组件漏了即报。
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

const SKINS = join(__dirname, '../../../design/styles/css')
const ELEMENTS = join(__dirname, '../src/elements')
const SIZED_BY_CONTROL_W = /^\s+inline-size: var\(--xh-[a-z-]+, var\(--xh-control-w\)\)/m

/** 皮肤里按控件宽定宽的组件。 */
function controlSized(): string[] {
  return readdirSync(SKINS)
    .filter(file => file.endsWith('.css') && SIZED_BY_CONTROL_W.test(readFileSync(join(SKINS, file), 'utf8')))
    .map(file => file.replace(/\.css$/, ''))
    .sort()
}

/** WC 元素里声明了宿主 display: contents 的组件。 */
function contentsHosts(): string[] {
  return readdirSync(ELEMENTS)
    .filter(file => file.endsWith('.ts') && /static override hostDisplay = 'contents'/.test(readFileSync(join(ELEMENTS, file), 'utf8')))
    .map(file => file.replace(/\.ts$/, ''))
    .sort()
}

describe('字段族的 WC 宿主', () => {
  it('按控件宽定宽的组件与宿主声明 contents 的元素一一对上', () => {
    const sized = controlSized()
    expect(sized.length).toBeGreaterThan(0)
    expect(contentsHosts()).toEqual(sized)
  })

  it('连上文档即写 display: contents；作者自己写了 display 就不动', () => {
    defineXhElements()
    const plain = document.createElement('xh-text-field')
    const authored = document.createElement('xh-text-field')
    authored.style.display = 'inline-block'
    document.body.append(plain, authored)
    expect(plain.style.display).toBe('contents')
    expect(authored.style.display).toBe('inline-block')
    plain.remove()
    authored.remove()
  })
})
