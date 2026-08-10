import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { buildIconSet, exportNameOf, renderDeclaration, renderModule, renderTypes, TYPES_HEADER } from '../build/index.mjs'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SVG_DIR = join(ROOT, 'src', 'svg')
const CORE_ICON_TYPES = join(ROOT, '..', '..', 'engine', 'kernel', 'src', 'types', 'icon.ts')

/** 第一批要画的语义，来自组件库自用图标清单。少一个就有组件还在拿 Unicode 字符顶。 */
const EXPECTED = [
  'arrow-down',
  'arrow-left',
  'arrow-right',
  'arrow-up',
  'arrow-up-down',
  'check',
  'chevron-down',
  'chevron-left',
  'chevron-right',
  'chevron-up',
  'circle-check',
  'circle-info',
  'circle-x',
  'copy',
  'ellipsis',
  'image',
  'loader',
  'minus',
  'pencil',
  'pipette',
  'plus',
  'search',
  'send',
  'slash',
  'star',
  'triangle-alert',
  'upload',
  'user',
  'x',
]

let icons: any[]

beforeAll(async () => {
  icons = await buildIconSet(SVG_DIR)
})

function allNodes(record: any): any[] {
  const out: any[] = []
  const walk = (nodes: any[]) => {
    for (const node of nodes) {
      out.push(node)
      if (node.children)
        walk(node.children)
    }
  }
  walk(record.nodes)
  return out
}

function allAttrs(record: any): [string, string][] {
  const out: [string, string][] = Object.entries(record.attrs ?? {})
  for (const node of allNodes(record))
    out.push(...Object.entries(node.attrs ?? {}) as [string, string][])
  return out
}

describe('集合范围', () => {
  it('清单上的语义一个不少', () => {
    expect(icons.map(i => i.name).sort()).toEqual([...EXPECTED].sort())
  })

  it('每个图标都有图元，没有空壳', () => {
    for (const { name, record } of icons)
      expect(record.nodes.length, name).toBeGreaterThan(0)
  })

  it('导出名是 PascalCase + Icon 后缀，且互不重名', () => {
    const names = icons.map(i => i.exportName)
    expect(names).toContain('ArrowUpDownIcon')
    expect(exportNameOf('triangle-alert')).toBe('TriangleAlertIcon')
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('记录形状', () => {
  it('viewBox 恒为 0 0 24 24', () => {
    for (const { name, record } of icons)
      expect(record.viewBox, name).toBe('0 0 24 24')
  })

  it('记录上没有 width / height 字段，根属性里也没有这两个键', () => {
    for (const { name, record } of icons) {
      expect('width' in record, name).toBe(false)
      expect('height' in record, name).toBe(false)
      expect(Object.keys(record.attrs ?? {}), name).not.toContain('width')
      expect(Object.keys(record.attrs ?? {}), name).not.toContain('height')
    }
  })

  it('根呈现属性统一：描边成形、currentColor、粗细 2、round 端点与连接', () => {
    for (const { name, record } of icons) {
      expect(record.attrs, name).toEqual({
        'fill': 'none',
        'stroke': 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      })
    }
  })

  it('图元上不重复声明描边档位——粗细归根与皮肤', () => {
    for (const { name, record } of icons) {
      for (const node of allNodes(record))
        expect(Object.keys(node.attrs ?? {}), `${name}/${node.tag}`).not.toContain('stroke-width')
    }
  })
})

describe('渲染端不变式', () => {
  it('整集里以 data- 开头的属性键个数为 0', () => {
    const hits: string[] = []
    for (const { name, record } of icons) {
      for (const [key] of allAttrs(record)) {
        if (key.toLowerCase().startsWith('data-'))
          hits.push(`${name}:${key}`)
      }
    }
    expect(hits).toEqual([])
  })

  it('整集里没有 role / aria-* / class / style / href / on*', () => {
    const hits: string[] = []
    for (const { name, record } of icons) {
      for (const [key] of allAttrs(record)) {
        const lower = key.toLowerCase()
        if (lower === 'role' || lower.startsWith('aria-') || lower === 'class' || lower === 'style' || lower === 'href' || lower.startsWith('on'))
          hits.push(`${name}:${key}`)
      }
    }
    expect(hits).toEqual([])
  })

  it('整集里没有任何文本内容，节点只有 tag / attrs / children 三个键', () => {
    for (const { name, record } of icons) {
      for (const node of allNodes(record)) {
        for (const key of Object.keys(node))
          expect(['tag', 'attrs', 'children'], `${name}/${key}`).toContain(key)
      }
    }
  })

  it('整集的 id 收成数组后，长度等于去重后的长度', () => {
    const ids: string[] = []
    for (const { record } of icons) {
      for (const [key, value] of allAttrs(record)) {
        if (key === 'id')
          ids.push(value)
      }
    }
    expect(ids.length).toBe(new Set(ids).size)
  })
})

describe('产物', () => {
  it('运行期模块每个图标一个顶层 export const，没有别的语句', () => {
    const code = renderModule(icons)
    const statements = code.split('\n').filter(line => line.trim() !== '' && !line.startsWith('//'))
    expect(statements.length).toBe(icons.length)
    for (const line of statements)
      expect(line.startsWith('export const ')).toBe(true)
    expect(code).toContain('export const CheckIcon = {')
  })

  it('运行期模块里不出现管线的任何标识', () => {
    const code = renderModule(icons)
    for (const marker of ['parseSvg', 'svgToIconRecord', 'assertAttrName', 'assertAttrValue', 'classifyTag', 'transformPathData', 'planTransform'])
      expect(code, marker).not.toContain(marker)
  })

  it('类型声明为每个图标声明一条 IconRecord', () => {
    const dts = renderDeclaration(icons)
    for (const { exportName } of icons)
      expect(dts).toContain(`export declare const ${exportName}: IconRecord`)
  })

  it('类型副本是 kernel 那份逐字节原文，只在最前面多一行来源说明', async () => {
    const core = await readFile(CORE_ICON_TYPES, 'utf8')
    const copy = renderTypes(core)
    expect(copy.startsWith(`${TYPES_HEADER}\n`)).toBe(true)
    expect(copy.slice(TYPES_HEADER.length + 1)).toBe(core)
  })
})
