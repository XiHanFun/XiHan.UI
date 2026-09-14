import { describe, expect, it } from 'vitest'
// 只从管线出口进：判据按「输入这段 SVG，产出的 IconNode[] 里不得出现 X」写，
// 换一套实现这些用例仍然有效。
import { svgToIconRecord } from '../build/index.mjs'

/** 包一层根 <svg>，正文原样放进去。 */
function wrap(body: string, rootAttrs = 'viewBox="0 0 24 24"'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" ${rootAttrs}>${body}</svg>`
}

function build(body: string, rootAttrs?: string) {
  return svgToIconRecord(wrap(body, rootAttrs), 'sample').record
}

/** 拍平记录里的全部节点。 */
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

/** 记录里全部属性键值对，含根上的呈现属性。 */
function allAttrs(record: any): [string, string][] {
  const out: [string, string][] = Object.entries(record.attrs ?? {})
  for (const node of allNodes(record))
    out.push(...Object.entries(node.attrs ?? {}) as [string, string][])
  return out
}

function tags(record: any): string[] {
  return allNodes(record).map(n => n.tag)
}

/** 整条记录序列化后的文本，用来断言「某段文字根本没进产物」。 */
function dump(record: any): string {
  return JSON.stringify(record)
}

describe('w1 script', () => {
  it('含 <script> 的源被拒，且产出里没有 script 节点也没有脚本正文', () => {
    const source = wrap('<path d="M0 0"/><script>alert(1)</script>')
    expect(() => svgToIconRecord(source, 'sample')).toThrow()

    const survived = wrap('<path d="M0 0"/>')
    const record = svgToIconRecord(survived, 'sample').record
    expect(tags(record)).not.toContain('script')
    expect(dump(record)).not.toContain('alert')
  })
})

describe('w2 style', () => {
  it('含 <style> 的源被拒，CDATA 包裹的变体同样被拒', () => {
    expect(() => build('<style>.a{fill:red}</style>')).toThrow()
    expect(() => build('<style><![CDATA[.a{fill:red}]]></style>')).toThrow()
    expect(tags(build('<path d="M0 0"/>'))).not.toContain('style')
  })
})

describe('w3 foreignObject', () => {
  it('含 <foreignObject> 的源被拒；产出里只会出现白名单里的标签', () => {
    expect(() => build('<foreignObject><div/></foreignObject>')).toThrow()

    const allowed = new Set([
      'path',
      'circle',
      'ellipse',
      'rect',
      'line',
      'polyline',
      'polygon',
      'g',
      'defs',
      'clipPath',
      'mask',
      'linearGradient',
      'radialGradient',
      'stop',
    ])
    const record = build('<g><defs><clipPath id="c"><rect x="0" y="0" width="4" height="4"/></clipPath></defs><path d="M0 0" clip-path="url(#c)"/></g>')
    for (const tag of tags(record))
      expect(allowed.has(tag), tag).toBe(true)
  })
})

describe('w4 动画', () => {
  it('animate / animateTransform / animateMotion / set 逐个被拒', () => {
    for (const tag of ['animate', 'animateTransform', 'animateMotion', 'set'])
      expect(() => build(`<path d="M0 0"><${tag}/></path>`), tag).toThrow()

    expect(tags(build('<path d="M0 0"/>'))).toEqual(['path'])
  })
})

describe('w5 外部引用与文本类标签', () => {
  it('image / use / symbol / filter / pattern / marker / text / tspan 逐个被拒', () => {
    const bodies = [
      '<image href="x.png"/>',
      '<use href="#x"/>',
      '<symbol><path d="M0 0"/></symbol>',
      '<filter><path d="M0 0"/></filter>',
      '<pattern><path d="M0 0"/></pattern>',
      '<marker><path d="M0 0"/></marker>',
      '<text>abc</text>',
      '<tspan>abc</tspan>',
    ]
    for (const body of bodies)
      expect(() => build(body), body).toThrow()
  })
})

describe('w6 事件属性', () => {
  it('任意 on 前缀属性被拒，含大小写混写', () => {
    const names = ['onclick', 'onload', 'onbegin', 'onmouseover', 'onfocusin', 'OnClick', 'ONLOAD']
    for (const name of names)
      expect(() => build(`<path d="M0 0" ${name}="alert(1)"/>`), name).toThrow()
  })

  it('产出里按不区分大小写匹配 on 前缀的键个数为 0', () => {
    const record = build('<g opacity="0.5"><path d="M0 0" stroke-linecap="round"/></g>')
    const hits = allAttrs(record).filter(([key]) => /^on/i.test(key.trim()))
    expect(hits).toEqual([])
  })
})

describe('w7 内联样式', () => {
  it('任意 style 属性被拒，产出里没有 style 键', () => {
    expect(() => build('<path d="M0 0" style="fill:url(http://x)"/>')).toThrow()
    expect(() => build('<path d="M0 0" style="fill:red"/>')).toThrow()
    expect(() => build('<g style=""><path d="M0 0"/></g>')).toThrow()

    const record = build('<path d="M0 0" fill="none"/>')
    expect(allAttrs(record).map(([key]) => key)).not.toContain('style')
  })
})

describe('w8 外链与命名空间前缀', () => {
  it('href / xlink:href / 任意 xlink:* / 子节点上的 xmlns:xlink 被拒', () => {
    expect(() => build('<path d="M0 0" href="#x"/>')).toThrow()
    expect(() => build('<path d="M0 0" xlink:href="#x"/>')).toThrow()
    expect(() => build('<path d="M0 0" xlink:title="x"/>')).toThrow()
    expect(() => build('<g xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M0 0"/></g>')).toThrow()
  })

  it('产出里没有 href 键，也没有任何含冒号的键', () => {
    const record = build('<path d="M0 0" stroke-width="2"/>')
    const keys = allAttrs(record).map(([key]) => key)
    expect(keys).not.toContain('href')
    expect(keys.filter(k => k.includes(':'))).toEqual([])
  })
})

describe('w9 data-*', () => {
  it('任意 data-* 被拒；产出里以 data- 开头的键个数为 0', () => {
    expect(() => build('<path d="M0 0" data-foo="1"/>')).toThrow()
    expect(() => build('<path d="M0 0" data-xh-part="glyph"/>')).toThrow()
    expect(() => build('<path d="M0 0" DATA-Foo="1"/>')).toThrow()

    const record = build('<g><path d="M0 0"/><circle cx="1" cy="1" r="1"/></g>')
    const hits = allAttrs(record).filter(([key]) => key.toLowerCase().startsWith('data-'))
    expect(hits.length).toBe(0)
  })
})

describe('w10 命名与样式类属性', () => {
  it('class / role / aria-* / tabindex / xmlns 在子节点上一律被拒', () => {
    for (const attr of ['class="a"', 'role="img"', 'aria-label="x"', 'aria-hidden="true"', 'tabindex="0"', 'xmlns="http://www.w3.org/2000/svg"'])
      expect(() => build(`<path d="M0 0" ${attr}/>`), attr).toThrow()
  })

  it('根上的 class / role 同样被拒；根上的 xmlns 只是被丢掉，不进产出', () => {
    expect(() => build('<path d="M0 0"/>', 'viewBox="0 0 24 24" class="a"')).toThrow()
    expect(() => build('<path d="M0 0"/>', 'viewBox="0 0 24 24" role="img"')).toThrow()

    const record = build('<path d="M0 0"/>')
    const keys = allAttrs(record).map(([key]) => key)
    for (const banned of ['class', 'role', 'tabindex', 'xmlns'])
      expect(keys).not.toContain(banned)
    expect(keys.filter(k => k.toLowerCase().startsWith('aria-'))).toEqual([])
  })
})

describe('w11 id', () => {
  it('没有 url(#id) 引用它时 id 不进产出', () => {
    const record = build('<g id="lonely"><path d="M0 0" id="also-lonely"/></g>')
    const keys = allAttrs(record).map(([key]) => key)
    expect(keys).not.toContain('id')
  })

  it('被引用的 id 留下，且重写成 xh-<图标名>-<序号>', () => {
    const record = svgToIconRecord(
      wrap('<defs><clipPath id="cut"><rect x="0" y="0" width="8" height="8"/></clipPath></defs><path d="M0 0" clip-path="url(#cut)"/>'),
      'demo',
    ).record
    const ids = allAttrs(record).filter(([key]) => key === 'id').map(([, value]) => value)
    expect(ids).toEqual(['xh-demo-0'])
    const refs = allAttrs(record).filter(([key]) => key === 'clip-path').map(([, value]) => value)
    expect(refs).toEqual(['url(#xh-demo-0)'])
  })

  it('引用了没定义的 id 时被拒', () => {
    expect(() => build('<path d="M0 0" clip-path="url(#missing)"/>')).toThrow()
  })

  it('同一条记录里重复定义同一个 id 时被拒', () => {
    expect(() => build('<g id="dup"/><g id="dup"/>')).toThrow()
  })
})

describe('w12 url()', () => {
  it('外链 / data: / 带引号 / 协议相对的 url() 逐个被拒', () => {
    expect(() => build('<path d="M0 0" fill="url(http://evil/x)"/>')).toThrow()
    expect(() => build('<path d="M0 0" fill="url(data:image/svg+xml,x)"/>')).toThrow()
    expect(() => build('<path d="M0 0" fill="url(\'#a\')"/>')).toThrow()
    expect(() => build('<path d="M0 0" clip-path="url(//evil)"/>')).toThrow()
    expect(() => build('<path d="M0 0" fill="url(#a"/>')).toThrow()
    expect(() => build('<path d="M0 0" fill="url (#a)"/>')).toThrow()
  })

  it('产出的任意属性值里，url( 之后必须紧跟 # 且闭合于第一个 )', () => {
    const record = svgToIconRecord(
      wrap('<defs><clipPath id="c"><rect x="0" y="0" width="8" height="8"/></clipPath></defs><g clip-path="url(#c)"><path d="M0 0"/></g>'),
      'demo',
    ).record
    for (const [, value] of allAttrs(record)) {
      let at = value.indexOf('url(')
      while (at >= 0) {
        expect(value[at + 4]).toBe('#')
        const close = value.indexOf(')', at)
        expect(close).toBeGreaterThan(at + 4)
        expect(value.slice(at + 5, close)).toMatch(/^[a-z_][\w.-]*$/i)
        at = value.indexOf('url(', close)
      }
    }
  })
})

describe('w13 脚本协议', () => {
  it('javascript: 的各种插字符写法逐个被拒', () => {
    expect(() => build('<path d="M0 0" fill="javascript:alert(1)"/>')).toThrow()
    expect(() => build('<path d="M0 0" fill="JaVaScRiPt:alert(1)"/>')).toThrow()
    expect(() => build('<path d="M0 0" fill="java\tscript:alert(1)"/>')).toThrow()
    expect(() => build('<path d="M0 0" fill="java\nscript:alert(1)"/>')).toThrow()
    // 用字符引用把冒号藏起来也不行
    expect(() => build('<path d="M0 0" fill="javascript&#58;alert(1)"/>')).toThrow()
  })

  it('产出的任意属性值去掉空白与控制字符并小写化后不含 javascript:', () => {
    const record = build('<path d="M0 0" fill="none" stroke="currentColor"/>')
    for (const [, value] of allAttrs(record)) {
      const collapsed = [...value].filter(ch => ch.codePointAt(0)! > 32 && ch.codePointAt(0) !== 127).join('').toLowerCase()
      expect(collapsed).not.toContain('javascript:')
    }
  })
})

describe('w14 连字符属性名逐字保留', () => {
  it('stroke-linecap / stroke-linejoin / stroke-width 不被截断，取值原样', () => {
    const record = build('<path d="M0 0" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>')
    const attrs = record.nodes[0]!.attrs!
    const keys = Object.keys(attrs)

    expect(keys).toContain('stroke-linecap')
    expect(keys).toContain('stroke-linejoin')
    expect(keys).toContain('stroke-width')
    expect(keys).not.toContain('linecap')
    expect(keys).not.toContain('linejoin')
    expect(attrs['stroke-width']).toBe('1.5')
    expect(attrs['stroke-linecap']).toBe('round')
  })

  it('其余连字符属性名同样逐字保留', () => {
    const record = build('<path d="M0 0" fill-rule="evenodd" clip-rule="evenodd" stroke-dasharray="4 2" stroke-dashoffset="1" stroke-miterlimit="4" stroke-opacity="0.5" fill-opacity="0.5" vector-effect="non-scaling-stroke"/>')
    const keys = Object.keys(record.nodes[0]!.attrs!)
    for (const expected of ['fill-rule', 'clip-rule', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-miterlimit', 'stroke-opacity', 'fill-opacity', 'vector-effect'])
      expect(keys, expected).toContain(expected)
  })

  it('根上的连字符呈现属性也逐字保留', () => {
    const record = build('<path d="M0 0"/>', 'viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"')
    expect(record.attrs).toEqual({
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    })
  })
})

describe('w15 文本', () => {
  it('<title> 被静默丢掉，正文不进产出，构建不报错', () => {
    const record = build('<title>删除</title><path d="M0 0"/>')
    expect(dump(record)).not.toContain('删除')
    expect(tags(record)).toEqual(['path'])
  })

  it('<desc> 同样静默丢掉', () => {
    const record = build('<desc>一段说明</desc><path d="M0 0"/>')
    expect(dump(record)).not.toContain('一段说明')
  })

  it('产出的任意节点没有文本内容', () => {
    const record = build('<title>x</title><g><path d="M0 0"/></g>')
    for (const node of allNodes(record))
      expect(Object.keys(node).every(k => k === 'tag' || k === 'attrs' || k === 'children')).toBe(true)
  })

  it('白名单标签里出现文本时被拒', () => {
    expect(() => build('<g>裸文本</g>')).toThrow()
  })
})

describe('w16 尺寸', () => {
  it('根上的 width / height 不进产出，viewBox 也不重复进 attrs', () => {
    const record = build('<path d="M0 0"/>', 'viewBox="0 0 24 24" width="24" height="24" fill="none"')
    expect(record.viewBox).toBe('0 0 24 24')
    expect('width' in (record as any)).toBe(false)
    expect('height' in (record as any)).toBe(false)
    expect(Object.keys(record.attrs ?? {})).toEqual(['fill'])
  })

  it('子节点上的 width / height 是几何，照常保留', () => {
    const record = build('<rect x="2" y="2" width="20" height="20" rx="4"/>')
    expect(record.nodes[0]!.attrs).toEqual({ x: '2', y: '2', width: '20', height: '20', rx: '4' })
  })

  it('子节点上的 viewBox 被拒', () => {
    expect(() => build('<g viewBox="0 0 16 16"><path d="M0 0"/></g>')).toThrow()
  })

  it('根上没有 viewBox 时被拒', () => {
    expect(() => svgToIconRecord('<svg><path d="M0 0"/></svg>', 'sample')).toThrow()
  })
})

describe('w17 viewBox 归一', () => {
  it('16 网格的源被换算到 0 0 24 24，几何数值按 1.5 倍缩放', () => {
    const record = svgToIconRecord(
      '<svg viewBox="0 0 16 16"><path d="M2 2L14 14"/><circle cx="8" cy="8" r="4"/><rect x="2" y="4" width="6" height="8"/></svg>',
      'sample',
    ).record

    expect(record.viewBox).toBe('0 0 24 24')
    expect(record.nodes[0]!.attrs!.d).toBe('M3 3 L21 21')
    expect(record.nodes[1]!.attrs).toEqual({ cx: '12', cy: '12', r: '6' })
    expect(record.nodes[2]!.attrs).toEqual({ x: '3', y: '6', width: '9', height: '12' })
  })

  it('带偏移的 viewBox 先平移再缩放', () => {
    const record = svgToIconRecord(
      '<svg viewBox="-8 -8 16 16"><path d="M-8 -8L8 8"/></svg>',
      'sample',
    ).record
    expect(record.nodes[0]!.attrs!.d).toBe('M0 0 L24 24')
  })

  it('相对命令只缩放不平移，弧的半径随缩放、标志位原样', () => {
    const record = svgToIconRecord(
      '<svg viewBox="0 0 12 12"><path d="M2 2l4 4a2 2 0 0 1 1 1h2v-2"/></svg>',
      'sample',
    ).record
    expect(record.nodes[0]!.attrs!.d).toBe('M4 4 l8 8 a4 4 0 0 1 2 2 h4 v-4')
  })

  it('points 按点对换算', () => {
    const record = svgToIconRecord(
      '<svg viewBox="0 0 12 12"><polygon points="0,0 6 0 6,6"/></svg>',
      'sample',
    ).record
    expect(record.nodes[0]!.attrs!.points).toBe('0 0 12 0 12 12')
  })

  it('根上的 stroke-width 随缩放走', () => {
    const record = svgToIconRecord(
      '<svg viewBox="0 0 12 12" stroke-width="1"><path d="M0 0"/></svg>',
      'sample',
    ).record
    expect(record.attrs).toEqual({ 'stroke-width': '2' })
  })

  it('非正方形 viewBox 被拒', () => {
    expect(() => svgToIconRecord('<svg viewBox="0 0 32 16"><path d="M0 0"/></svg>', 'sample')).toThrow()
  })

  it('要缩放又带 transform 的源被拒', () => {
    expect(() => svgToIconRecord('<svg viewBox="0 0 16 16"><g transform="translate(1 1)"><path d="M0 0"/></g></svg>', 'sample')).toThrow()
  })

  it('已经在 24 网格上的源，transform 照常保留', () => {
    const record = build('<g transform="rotate(45 12 12)"><path d="M0 0"/></g>')
    expect(record.nodes[0]!.attrs!.transform).toBe('rotate(45 12 12)')
  })
})

describe('w18 嵌套深度', () => {
  it('八层 <g> 原样保留，逐层的 tag 与 attrs 与输入一致', () => {
    let body = '<path d="M0 0"/>'
    for (let i = 8; i >= 1; i--)
      body = `<g opacity="0.${i}">${body}</g>`

    const record = build(body)
    let node: any = record.nodes[0]!
    for (let i = 1; i <= 8; i++) {
      expect(node.tag).toBe('g')
      expect(node.attrs).toEqual({ opacity: `0.${i}` })
      node = node.children[0]!
    }
    expect(node).toEqual({ tag: 'path', attrs: { d: 'M0 0' } })
  })
})

describe('w19 归一化', () => {
  it('单引号、空元素、注释、CDATA 壳的差异不影响节点树', () => {
    const a = build('<path d="M0 0"/><g></g>')
    const b = build('<!-- 说明 --><path d=\'M0 0\'/><g/>')
    expect(b).toEqual(a)
  })

  it('丢掉 XML 声明与 DOCTYPE', () => {
    const record = svgToIconRecord(
      '<?xml version="1.0"?><!DOCTYPE svg><svg viewBox="0 0 24 24"><path d="M0 0"/></svg>',
      'sample',
    ).record
    expect(record.nodes).toEqual([{ tag: 'path', attrs: { d: 'M0 0' } }])
  })

  it('空白文本被丢掉，节点树不变', () => {
    const compact = build('<path d="M0 0"/><path d="M1 1"/>')
    const spaced = build('\n  <path d="M0 0"/>\n  <path d="M1 1"/>\n')
    expect(spaced).toEqual(compact)
  })
})

describe('解析器本身', () => {
  it('无取值的属性、无引号的取值、不配对的收标签一律被拒', () => {
    expect(() => build('<path d="M0 0" fill/>')).toThrow()
    expect(() => build('<path d=M00/>')).toThrow()
    expect(() => svgToIconRecord('<svg viewBox="0 0 24 24"><g><path d="M0 0"/></svg>', 'sample')).toThrow()
    expect(() => svgToIconRecord('<svg viewBox="0 0 24 24"><g></defs></svg>', 'sample')).toThrow()
  })

  it('同一个节点上重复的属性名被拒', () => {
    expect(() => build('<path d="M0 0" fill="none" fill="red"/>')).toThrow()
  })

  it('图标名不是小写连字符分段时被拒', () => {
    expect(() => svgToIconRecord(wrap('<path d="M0 0"/>'), 'ArrowDown')).toThrow()
    expect(() => svgToIconRecord(wrap('<path d="M0 0"/>'), 'arrow_down')).toThrow()
  })

  it('没有任何图元的源被拒', () => {
    expect(() => svgToIconRecord('<svg viewBox="0 0 24 24"><title>空</title></svg>', 'sample')).toThrow()
  })
})
