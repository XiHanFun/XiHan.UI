import type { RawStepContext } from '../../conformance/types'

/**
 * 断言某个部件的文本内容，等适配器提交、并给退场闸门留出落定的时间。
 *
 * 披露内容的挂卸看的是作者写的子节点在不在，归一化快照只收属性，不收子节点，只能直接读 DOM。
 * 卸载发生在退场闸门落下之后，闸门在无动画环境里也要走一轮回调，所以按次轮询而不是只读一次。
 */
export function expectPartText(scope: string, part: string, index: number, expected: string) {
  return async ({ doc, flush }: RawStepContext): Promise<void> => {
    let got: string | null = null
    for (let attempt = 0; attempt < 20; attempt++) {
      await flush()
      const el = doc.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="${part}"]`)[index]
      got = el?.textContent ?? null
      if (got === expected)
        return
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    throw new Error(`${scope} ${part}[${index}] 的文本是 ${JSON.stringify(got)}，期望 ${JSON.stringify(expected)}`)
  }
}
