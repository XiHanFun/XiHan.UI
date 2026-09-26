// 墨色域的构建：比例按对比度等价求解，域同时是主题边界，auto 块受相对颜色语法探针守卫。
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { equivalentAlpha, parseOklch } from '../build/ink.mjs'

const css = readFileSync(join(import.meta.dirname, '../tokens.css'), 'utf8')

describe('equivalentAlpha', () => {
  const white = [1, 1, 1]
  const black = [0, 0, 0]

  it('令牌与面同色时比例为 0，令牌就是墨色时比例为 1', () => {
    expect(equivalentAlpha(white, white, black)).toBe(0)
    expect(equivalentAlpha(black, white, black)).toBe(1)
  })

  it('浅色面上 neutral 200 等价于黑墨约 10%', () => {
    const alpha = equivalentAlpha(parseOklch('oklch(0.922 0.002 258)'), white, black)
    expect(alpha).toBeGreaterThan(0.095)
    expect(alpha).toBeLessThan(0.11)
  })

  it('只接受不透明的 oklch 字面量', () => {
    expect(() => parseOklch('oklch(0 0 0 / 0.5)')).toThrow(/不透明的 oklch/)
    expect(() => parseOklch('var(--xh-color-neutral-200)')).toThrow(/不透明的 oklch/)
  })
})

describe('tokens.css 里的墨色域', () => {
  it('dark / light 域挂在浅色 / 深色取值块与材质边界上', () => {
    expect(css).toContain(`:where(:root), :where([data-theme='light']), :where([data-xh-ink='dark']) {`)
    expect(css).toContain(`:where([data-theme='dark']), :where([data-xh-ink='light']) {`)
    expect(css).toContain(`:where(:root), :where([data-theme]), :where([data-xh-ink]), :where([data-xh-ink-surface] > *) {`)
  })

  it('库自有彩色面的内容按 auto 成域，减少透明与强制色一并命中它们', () => {
    // 域落在面的直接子元素上，不落在面自己身上：面的底色取自被域改写的令牌，落在自身会成环
    expect(css).toContain(`:where([data-xh-ink='auto']), :where([data-xh-ink-surface] > *) {`)
    expect(css).not.toMatch(/\[data-xh-ink-surface\](?! > \*)/)
    expect(css).toContain(`:where([data-transparency='reduce'] [data-xh-ink-surface] > *)`)
    const forced = css.slice(css.indexOf('@media (forced-colors: active)'))
    expect(forced.slice(0, forced.indexOf('{', forced.indexOf('{') + 1))).toContain(':where([data-xh-ink-surface] > *)')
  })

  it('缺省面同样用墨色：主题块写墨色本身与按比例透明的中性装饰，参与对比度路由的只换缺省分支', () => {
    const lightAt = css.indexOf(`:where(:root), :where([data-theme='light']), :where([data-xh-ink='dark']) {`)
    const light = css.slice(lightAt, css.indexOf('\n  }', lightAt))
    expect(light).toContain('--xh-ink: oklch(0 0 0);')
    expect(light).toContain('--xh-bg-subtle: color-mix(in oklab, var(--xh-ink) 4.3%, transparent);')
    expect(light).toContain('--xh-_contrast-default-border-default: color-mix(in oklab, var(--xh-ink) 10.2%, transparent);')
    // 高对比分支仍取实色
    expect(light).toMatch(/--xh-_contrast-more-border-default: var\(--xh-color-neutral-\d+\);/)
    const darkAt = css.indexOf(`:where([data-theme='dark']), :where([data-xh-ink='light']) {`)
    const dark = css.slice(darkAt, css.indexOf('\n  }', darkAt))
    expect(dark).toContain('--xh-ink: oklch(1 0 0);')
    // 深色档比例按最深的页面底 / 画布定，缺省面上比原中性色略重
    expect(dark).toContain('--xh-_contrast-default-border-default: color-mix(in oklab, var(--xh-ink) 22%, transparent);')
  })

  it('dark / light 域排在主题块与对比度块之后，只多改正文、焦点环与品牌', () => {
    // 行首的独立块，不是浅色取值块选择器里的同名分支
    const inkAt = css.indexOf(`\n  :where([data-xh-ink='dark']) {`)
    expect(inkAt).toBeGreaterThan(css.indexOf(`:where([data-contrast='more']) {`))
    const block = css.slice(inkAt, css.indexOf('}', inkAt))
    expect(block).toContain('--xh-fg-default: var(--xh-ink);')
    expect(block).toContain('--xh-bg-brand: var(--xh-ink);')
    // 中性装饰由主题块给出，域块不再重复；置灰字属于文字，只在域里换成墨色
    expect(block).not.toContain('--xh-border-default:')
    expect(block).not.toContain('--xh-ink:')
    expect(block).toContain('--xh-fg-disabled: color-mix(in oklab, var(--xh-ink) 37%, transparent);')
  })

  it('缺省面上置灰字保持实色；淡底各有一支叠在缺省面上的不透明档', () => {
    const lightAt = css.indexOf(`:where(:root), :where([data-theme='light']), :where([data-xh-ink='dark']) {`)
    const light = css.slice(lightAt, css.indexOf('\n  }', lightAt))
    expect(light).toMatch(/--xh-fg-disabled: var\(--xh-color-neutral-\d+\);/)
    for (const [name, alpha] of [['subtle', '4.3%'], ['subtle-hover', '10.2%'], ['subtle-active', '16.9%'], ['muted', '4.3%']])
      expect(light).toContain(`--xh-bg-${name}-opaque: color-mix(in srgb, var(--xh-ink) ${alpha}, var(--xh-bg-surface));`)
  })

  it('auto 块整体落在相对颜色语法的探针里，底色缺省时取外层主题的面', () => {
    const supportsAt = css.indexOf('@supports (color: color(from red srgb-linear')
    const autoAt = css.indexOf(`:where([data-xh-ink='auto'])`)
    expect(supportsAt).toBeGreaterThan(-1)
    expect(autoAt).toBeGreaterThan(supportsAt)
    const autoBlock = css.slice(autoAt, css.indexOf('\n    }', autoAt))
    const inkLine = autoBlock.split('\n').find(line => line.trim().startsWith('--xh-ink:'))
    expect(inkLine).toContain('var(--xh-ink-surface, var(--xh-bg-surface))')
  })

  it('auto 域不是主题边界，引用了墨色令牌的主题声明在墨色取值之前重声明', () => {
    const autoAt = css.indexOf(`:where([data-xh-ink='auto'])`)
    const autoBlock = css.slice(autoAt, css.indexOf('\n    }', autoAt))
    const inkAt = autoBlock.indexOf('--xh-ink:')
    for (const name of ['--xh-border-control:', '--xh-border-control-focus:', '--xh-fg-scrollbar-thumb:']) {
      expect(autoBlock.indexOf(name), name).toBeGreaterThan(-1)
      expect(autoBlock.indexOf(name), name).toBeLessThan(inkAt)
    }
  })
})
