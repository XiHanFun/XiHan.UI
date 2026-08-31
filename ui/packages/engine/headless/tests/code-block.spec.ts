// @vitest-environment jsdom
import type { CodeBlockApi, CodeBlockProps } from '../src/code-block'
import { normalizeProps } from '@xihan-ui/kernel'
import { describe, expect, it } from 'vitest'
// 直接从组件目录导入，不经包主入口
import { CODE_BLOCK_FALLBACK_LANG, codeBlockAnatomy, codeBlockMeta, connectCodeBlock, countCodeLines } from '../src/code-block'

type Dict = Record<string, unknown>

/** 用给定 props 调一次连接层，返回其 API。 */
function api(props: Partial<CodeBlockProps> = {}): CodeBlockApi {
  return connectCodeBlock({ code: '', ...props }, normalizeProps)
}

describe('countCodeLines', () => {
  it('空块也占一行：0 行会让预估高度塌成 0，块一吐字就往下顶一次', () => {
    expect(countCodeLines('')).toBe(1)
  })

  it('没有换行就是一行', () => {
    expect(countCodeLines('const a = 1')).toBe(1)
  })

  it('按换行切，段数即行数', () => {
    expect(countCodeLines('a\nb\nc')).toBe(3)
  })

  it('结尾那个换行后面是一整行真实存在的空行，编辑器也是这么数的', () => {
    expect(countCodeLines('a\n')).toBe(2)
    expect(countCodeLines('\n')).toBe(2)
    expect(countCodeLines('a\n\n')).toBe(3)
  })
})

describe('语言标注', () => {
  it('没给就落 plaintext', () => {
    expect(api().lang).toBe(CODE_BLOCK_FALLBACK_LANG)
    expect(CODE_BLOCK_FALLBACK_LANG).toBe('plaintext')
  })

  it('空串与纯空白同样落 plaintext：围栏刚吐出 ``` 那一瞬就是这种样子', () => {
    expect(api({ lang: '' }).lang).toBe('plaintext')
    expect(api({ lang: '   ' }).lang).toBe('plaintext')
  })

  it('给了就原样用，前后空白削掉', () => {
    expect(api({ lang: 'ts' }).lang).toBe('ts')
    expect(api({ lang: '  ts  ' }).lang).toBe('ts')
  })

  it('root 与 code 两层都带 data-lang：皮肤取外层，将来的高亮层取内层', () => {
    const a = api({ lang: 'ts' })
    expect((a.getRootProps() as Dict)['data-lang']).toBe('ts')
    expect((a.getCodeProps() as Dict)['data-lang']).toBe('ts')
  })
})

describe('连接层结构与标注', () => {
  it('四个 part 都带 anatomy 标记', () => {
    const a = api()
    const pairs: Array<[Dict, string]> = [
      [a.getRootProps() as Dict, 'root'],
      [a.getLangLabelProps() as Dict, 'lang-label'],
      [a.getPreProps() as Dict, 'pre'],
      [a.getCodeProps() as Dict, 'code'],
    ]
    for (const [props, part] of pairs) {
      expect(props['data-scope']).toBe('code-block')
      expect(props['data-part']).toBe(part)
    }
  })

  it('pre 恒占一个 Tab 位：横向溢出的代码只有指针够得着滚动条，键盘用户得先落得进来', () => {
    expect((api().getPreProps() as Dict).tabindex).toBe(0)
    expect((api({ complete: true, lang: 'ts' }).getPreProps() as Dict).tabindex).toBe(0)
  })

  it('pre 上一个事件处理器都不挂：方向键的横向滚动归浏览器', () => {
    const handlers = Object.keys(api().getPreProps() as Dict).filter(key => /^on[A-Z]/.test(key))
    expect(handlers).toEqual([])
  })

  it('lang-label 恒对读屏隐藏：语言名代码里已经写着，再念一遍只是噪音', () => {
    expect((api().getLangLabelProps() as Dict)['aria-hidden']).toBe(true)
    expect((api({ lang: 'ts' }).getLangLabelProps() as Dict)['aria-hidden']).toBe(true)
  })

  it('未闭合时不出 data-complete，闭合后出空串', () => {
    expect((api().getRootProps() as Dict)['data-complete']).toBeUndefined()
    expect((api({ complete: false }).getRootProps() as Dict)['data-complete']).toBeUndefined()

    const done = api({ complete: true })
    expect((done.getRootProps() as Dict)['data-complete']).toBe('')
    // pre 上同样带一份
    expect((done.getPreProps() as Dict)['data-complete']).toBe('')
  })
})

describe('高度预估', () => {
  it('min-block-size 按行数长，行高走令牌', () => {
    const style = (code: string): Dict => (api({ code }).getPreProps() as Dict).style as Dict
    expect(style('')).toEqual({ minBlockSize: 'calc(var(--xh-code-block-line-height, var(--xh-text-code-leading)) * 1)' })
    expect(style('a\nb\nc')).toEqual({ minBlockSize: 'calc(var(--xh-code-block-line-height, var(--xh-text-code-leading)) * 3)' })
  })

  it('lineCount 与 min-block-size 同源：两处各算一遍迟早会对不上', () => {
    const a = api({ code: 'a\nb\nc\nd' })
    expect(a.lineCount).toBe(4)
    expect(((a.getPreProps() as Dict).style as Dict).minBlockSize).toContain('* 4')
  })

  it('写的是 inline style 而不是 CSS 自定义属性：WC 那侧铺属性走 Object.assign(node.style)，写不进 --* 变量', () => {
    const style = (api().getPreProps() as Dict).style as Dict
    expect(Object.keys(style)).toEqual(['minBlockSize'])
  })
})

describe('codeBlockMeta', () => {
  it('必备 part 都在 anatomy 里', () => {
    const declared = new Set<string>(codeBlockAnatomy.parts)
    expect(codeBlockMeta.requiredParts.filter(p => !declared.has(p))).toEqual([])
  })
})
