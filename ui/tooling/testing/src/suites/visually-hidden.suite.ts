import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { visuallyHiddenAnatomy, visuallyHiddenKeyboard } from '@xihan-ui/headless'

// 出处：用 CSS 把一段文字从屏幕上藏起来、留给读屏（C7）；页首放一条直达正文的跳转链接（G1）。
const HIDDEN_TEXT = 'https://www.w3.org/WAI/WCAG22/Techniques/css/C7'
const SKIP_LINK = 'https://www.w3.org/WAI/WCAG22/Techniques/general/G1'

const ROOT = '[data-scope="visually-hidden"][data-part="root"]'

/** 跳转链接：作者放进根里的可聚焦元素，不是本组件的部件。 */
const LINK = { tag: 'a', attrs: { 'href': '#main', 'data-testid': 'skip-link' }, text: '跳到正文' } as const

/** 根里的文字原样留着：藏起来的内容读屏要照读，组件不改动、不替换。 */
function expectText(expected: string) {
  return ({ doc }: RawStepContext): void => {
    const got = doc.querySelector(ROOT)?.textContent
    if (got !== expected)
      throw new Error(`根里的文字是 ${JSON.stringify(got)}，期望 ${JSON.stringify(expected)}`)
  }
}

/** visually-hidden 的一致性套件：锁「只带身份、不摘读屏与焦点序、focusable 的开关落在哪」。 */
export const visuallyHiddenSuite: ConformanceSuite = {
  component: 'visually-hidden',
  anatomy: visuallyHiddenAnatomy,
  keyboard: visuallyHiddenKeyboard,
  fixture: { part: 'root', tag: 'span', children: [{ text: '删除' }] },
  cases: [
    {
      name: '缺省只带身份：不写 role / tabindex / aria-hidden / hidden / inert，内容读屏照读',
      spec: { apg: HIDDEN_TEXT },
      initial: {
        order: ['root'],
        counts: { root: 1 },
        parts: {
          root: {
            'role': null,
            'tabindex': null,
            'aria-hidden': null,
            'hidden': null,
            'inert': null,
            'data-focusable': null,
          },
        },
        activeElement: null,
        events: [],
      },
      steps: [{ kind: 'raw', why: '归一化快照不收文本，内容是否原样留着只能直接读 DOM', run: expectText('删除') }],
    },
    {
      name: 'focusable：开关落成 data-focusable，里面的链接照常进焦点序，聚焦不改根上任何属性',
      spec: { apg: SKIP_LINK },
      fixture: base => ({ ...base, children: [LINK] }),
      props: { focusable: true },
      initial: {
        parts: { root: { 'data-focusable': '', 'tabindex': null, 'aria-hidden': null } },
        activeElement: null,
      },
      steps: [
        {
          kind: 'raw',
          why: '可聚焦的是作者放进来的链接，不是部件，focus 步骤寻址不到它',
          run: ({ doc }) => {
            doc.querySelector<HTMLElement>('[data-testid="skip-link"]')!.focus()
          },
          // 显出全由皮肤按 :focus-within 做：聚焦前后根上的属性一条不变
          expect: {
            activeElement: { part: 'root', exact: false },
            parts: { root: { 'data-focusable': '', 'tabindex': null, 'aria-hidden': null } },
            events: [],
          },
        },
      ],
    },
    {
      name: 'focusable 由宿主撤掉：data-focusable 跟着摘掉，回到一直藏着',
      spec: { apg: SKIP_LINK },
      props: { focusable: true },
      initial: { parts: { root: { 'data-focusable': '' } } },
      steps: [
        { kind: 'setProps', props: { focusable: false }, expect: { parts: { root: { 'data-focusable': null } } } },
      ],
    },
    {
      name: '作者写的 id 留在根上：别处的 aria-describedby 指向这段说明',
      spec: { apg: HIDDEN_TEXT },
      fixture: base => ({ ...base, attrs: { id: 'visually-hidden-hint' }, children: [{ text: '按升序排列' }] }),
      initial: { parts: { root: { id: '@self' } } },
      steps: [{ kind: 'raw', why: '归一化快照不收文本，内容是否原样留着只能直接读 DOM', run: expectText('按升序排列') }],
    },
  ],
}
