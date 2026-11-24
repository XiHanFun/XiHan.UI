// 浏览器缺省外观统一在基线层（css/reset.css）收：这里守两件事——
// 基线层里那几条规则的写法立得住；皮肤与配方不再各收各的。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const STYLES = join(import.meta.dirname, '..', '..', '..', 'packages/design/styles')

/** 浏览器塞进表单控件里的自带界面：只许基线层认得这些伪元素。 */
const NATIVE_CHROME = ['::-webkit-search-cancel-button', '::-webkit-search-decoration', '::-ms-reveal', '::-ms-clear']

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

describe('浏览器缺省外观的基线', () => {
  it('表单控件里自带的按钮在基线层收掉，且各自成条：并成一组会被不认识其中一个伪元素的浏览器整条丢掉', async () => {
    const css = stripComments(await readFile(join(STYLES, 'css/reset.css'), 'utf8'))
    for (const pseudo of ['::-webkit-search-cancel-button', '::-ms-reveal']) {
      const rule = new RegExp(`(^|\\})\\s*:where\\(\\[data-scope\\]\\)${pseudo.replace(/[-:]/g, '\\$&')}\\s*\\{\\s*display:\\s*none;\\s*\\}`)
      expect(css, pseudo).toMatch(rule)
    }
  })

  it('库节点的缺省外观一条规则收齐：外边距、内衬、描边、圆角、底、字色、字体与原生外观', async () => {
    const css = stripComments(await readFile(join(STYLES, 'css/reset.css'), 'utf8'))
    const start = css.indexOf(':where([data-scope]) {\n    margin: 0;')
    expect(start).toBeGreaterThan(-1)
    const block = css.slice(start, css.indexOf('}', start))
    for (const declaration of ['margin: 0;', 'padding: 0;', 'border: 0;', 'border-radius: 0;', 'background: none;', 'color: inherit;', 'font: inherit;', 'letter-spacing: inherit;', 'appearance: none;'])
      expect(block, declaration).toContain(declaration)
  })

  it('基线层不收投影：公共聚焦层的内侧间隔线是同档的 box-shadow，无层产物里排在基线之前，再写一条就按源序压掉它', async () => {
    const css = stripComments(await readFile(join(STYLES, 'css/reset.css'), 'utf8'))
    expect(css).not.toMatch(/box-shadow\s*:/)
  })

  it('皮肤与配方不各收各的：浏览器自带界面的伪元素只出现在基线层', async () => {
    const offenders = []
    for (const dir of ['css', 'family', 'build']) {
      for (const file of await readdir(join(STYLES, dir))) {
        if (dir === 'css' && file === 'reset.css')
          continue
        if (!/\.(?:css|mjs)$/.test(file))
          continue
        const text = stripComments(await readFile(join(STYLES, dir, file), 'utf8')).replace(/\/\/.*$/gm, '')
        for (const pseudo of NATIVE_CHROME) {
          if (text.includes(pseudo))
            offenders.push(`${dir}/${file} 里写了 ${pseudo}`)
        }
      }
    }
    expect(offenders).toEqual([])
  })
})
