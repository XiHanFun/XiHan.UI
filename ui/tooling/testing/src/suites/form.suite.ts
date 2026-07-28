import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { formAnatomy, formKeyboard } from '@xihan-ui/headless'

// 表单没有对应的 APG 模式页：它是一堆原生表单控件加一层编排。
// 可核对的规格是 HTML 的表单提交算法（提交为何一律要 preventDefault）
// 与 APG 的 alert 模式（错误摘要为何是 role=alert）。
const HTML_SUBMIT = 'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission'
const APG_ALERT = 'https://www.w3.org/WAI/ARIA/apg/patterns/alert/'

const sel = (part: string): string => `[data-scope="form"][data-part="${part}"]`

function query(doc: Document, part: string, index = 0): HTMLElement {
  const el = doc.querySelectorAll<HTMLElement>(sel(part))[index]
  if (!el)
    throw new Error(`找不到 ${part}[${index}] 部件`)
  return el
}

/** 校验函数由用例给：两个适配器拿到的是同一个函数对象，判定因此完全一致。 */
function requireBoth(): Record<string, string> {
  // 键序刻意与文档序相反：焦点该按屏幕上的先后走，不是按这里 return 的顺序
  return { password: '密码至少 8 位', email: '邮箱格式不正确' }
}

function requirePasswordOnly(): Record<string, string> {
  return { password: '密码至少 8 位' }
}

function allPass(): Record<string, string> {
  return {}
}

function requireEmail(values: Record<string, unknown>): Record<string, string> {
  return { email: values.email ? '' : '邮箱不能为空' }
}

export const formSuite: ConformanceSuite = {
  component: 'form',
  anatomy: formAnatomy,
  keyboard: formKeyboard,
  // root 必须是原生 <form>：回车的隐式提交与 type=submit 按钮都长在它身上。
  // 摘要条目写成原生 <a>，字段名由作者用 value 属性自报（与集合条目同一套写法）。
  // 刻意不用 name：那是原生表单控件的属性，会进归一化快照——
  // WC 侧它留在 DOM 上、Vue 侧被声明成 prop 而不落进 DOM，两个适配器当场分叉。
  fixture: {
    part: 'root',
    tag: 'form',
    children: [
      {
        part: 'error-summary',
        children: [
          { part: 'error-summary-item', tag: 'a', attrs: { value: 'email' }, text: '邮箱格式不正确' },
          { part: 'error-summary-item', tag: 'a', attrs: { value: 'password' }, text: '密码至少 8 位' },
        ],
      },
      { part: 'field-group', attrs: { value: 'email' }, children: [{ tag: 'input' }] },
      { part: 'field-group', attrs: { value: 'password' }, children: [{ tag: 'input' }] },
      { part: 'submit-trigger', tag: 'button', text: '提交' },
      { part: 'reset-trigger', tag: 'button', text: '重置' },
    ],
  },
  cases: [
    {
      name: '默认：摘要收起、字段容器带 id 与 -1 停靠位、两颗按钮各自是原生 submit / reset',
      spec: { apg: HTML_SUBMIT },
      initial: {
        order: [
          'root',
          'error-summary',
          'error-summary-item[0]',
          'error-summary-item[1]',
          'field-group[0]',
          'field-group[1]',
          'submit-trigger',
          'reset-trigger',
        ],
        counts: { 'root': 1, 'error-summary': 1, 'error-summary-item': 2, 'field-group': 2, 'submit-trigger': 1, 'reset-trigger': 1 },
        parts: {
          'root': {
            'data-state': 'idle',
            'data-invalid': null,
            'data-disabled': null,
            'data-readonly': null,
          },
          'error-summary': {
            'role': 'alert',
            'hidden': '',
            'data-count': '0',
            'data-state': 'idle',
          },
          'error-summary-item[0]': {
            'data-name': 'email',
            'data-invalid': null,
            'hidden': '',
          },
          'error-summary-item[1]': {
            'data-name': 'password',
            'hidden': '',
          },
          'field-group[0]': {
            'id': '@self',
            'data-name': 'email',
            'data-invalid': null,
            // 容器里的控件全禁用时，焦点至少落得到这块区域上
            'tabindex': '-1',
            // 容器不是控件，不该冒充 role=group（没有名字的分组对读屏只是噪音）
            'role': null,
          },
          'field-group[1]': {
            'id': '@self',
            'data-name': 'password',
          },
          'submit-trigger': {
            type: 'submit',
            disabled: null,
          },
          'reset-trigger': {
            type: 'reset',
            disabled: null,
          },
        },
      },
      steps: [
        {
          kind: 'raw',
          // href 不进归一化快照（它不是 IDREF 属性），只能直读 DOM 比对字面量。
          // 两头对不上的话，摘要里的链接会指向一个不存在的锚点——点了什么都不会发生
          why: '摘要链接的 href 必须正好指向对应字段容器的 id',
          run: ({ doc }: RawStepContext) => {
            for (const [i, field] of ['email', 'password'].entries()) {
              const href = query(doc, 'error-summary-item', i).getAttribute('href')
              const id = query(doc, 'field-group', i).getAttribute('id')
              if (href !== `#${id}`)
                throw new Error(`${field} 的摘要链接指错了：href=${href}，字段容器 id=${id}`)
            }
          },
        },
      ],
    },
    {
      name: '提交失败：摘要显形并报出条数，焦点落到文档序里第一个出错的字段',
      spec: { apg: APG_ALERT },
      props: { validate: requireBoth },
      steps: [
        {
          kind: 'click',
          part: 'submit-trigger',
          expect: {
            parts: {
              'root': {
                'data-state': 'invalid',
                'data-invalid': '',
              },
              'error-summary': {
                'hidden': null,
                'data-count': '2',
                'data-state': 'invalid',
              },
              'error-summary-item[0]': {
                'hidden': null,
                'data-invalid': '',
              },
              'error-summary-item[1]': { hidden: null },
              'field-group[0]': { 'data-invalid': '' },
              'field-group[1]': { 'data-invalid': '' },
            },
            // 校验函数把 password 写在前面，屏幕上却是 email 在上面：
            // 焦点必须按文档序走，否则用户会被拽到页面下方再自己往回找
            activeElement: { part: 'field-group[0]', exact: false },
          },
        },
      ],
    },
    {
      name: '只有下面那个字段出错：焦点越过没出错的字段，摘要里也只露出那一条',
      spec: { apg: APG_ALERT },
      props: { validate: requirePasswordOnly },
      steps: [
        {
          kind: 'click',
          part: 'submit-trigger',
          expect: {
            parts: {
              'error-summary': { 'data-count': '1', 'hidden': null },
              'error-summary-item[0]': { hidden: '' },
              'error-summary-item[1]': { hidden: null },
              'field-group[0]': { 'data-invalid': null },
              'field-group[1]': { 'data-invalid': '' },
            },
            activeElement: { part: 'field-group[1]', exact: false },
          },
        },
      ],
    },
    {
      name: '校验通过：摘要不显形、状态留在 idle、焦点不动',
      spec: { apg: HTML_SUBMIT },
      props: { validate: allPass },
      steps: [
        {
          kind: 'click',
          part: 'submit-trigger',
          expect: {
            parts: {
              'root': {
                'data-state': 'idle',
                'data-invalid': null,
              },
              'error-summary': { hidden: '' },
            },
            // 通过就不该搬焦点：用户点的是提交键，焦点就留在提交键上
            activeElement: 'submit-trigger',
          },
        },
      ],
    },
    {
      name: '点摘要里的一条：拦下锚点跳转，把焦点送进对应字段',
      spec: { apg: APG_ALERT },
      props: { validate: requireBoth },
      steps: [
        {
          kind: 'click',
          part: 'submit-trigger',
          expect: { activeElement: { part: 'field-group[0]', exact: false } },
        },
        {
          kind: 'raw',
          // 合成事件默认 cancelable=false，在它身上 preventDefault 是空操作——
          // 不显式打开的话这条断言永远为真
          why: '锚点跳转必须被拦下：它只滚动不搬焦点，还会往历史里塞一条哈希记录',
          run: async ({ doc, flush }: RawStepContext) => {
            const item = query(doc, 'error-summary-item', 1)
            item.focus()
            const click = new MouseEvent('click', { bubbles: true, cancelable: true })
            if (item.dispatchEvent(click))
              throw new Error('摘要条目没拦下默认的锚点跳转')
            await flush()
          },
          expect: {
            // 焦点从第一个字段挪到了这一条指向的第二个字段
            activeElement: { part: 'field-group[1]', exact: false },
          },
        },
      ],
    },
    {
      name: 'blur 模式：字段失焦即校验，且只标红这一个字段',
      spec: { apg: HTML_SUBMIT },
      props: { validateOn: 'blur', validate: requireEmail },
      steps: [
        { kind: 'focus', part: 'field-group[0]' },
        {
          kind: 'blur',
          expect: {
            parts: {
              'field-group[0]': { 'data-invalid': '' },
              // 用户还没填到 password，不该顺手把它也标红
              'field-group[1]': { 'data-invalid': null },
              // 还没提交过，摘要不显形
              'error-summary': { hidden: '' },
              'root': { 'data-state': 'idle' },
            },
          },
        },
      ],
    },
    {
      name: 'disabled：提交事件仍被拦下，但校验与状态一概不动',
      spec: { apg: HTML_SUBMIT },
      props: { disabled: true, validate: requireBoth },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'submit-trigger': {
            'disabled': '',
            'data-disabled': '',
          },
          'reset-trigger': { disabled: '' },
        },
      },
      steps: [
        {
          kind: 'raw',
          // 禁用按钮上 el.click() 被激活行为短路，事件压根不派发——
          // 走 click 步骤等于什么都没测。直接对着 <form> 派一条 submit 才碰得到守卫
          why: '禁用时的提交只能直接派 submit 事件才验得到',
          run: async ({ doc, flush }: RawStepContext) => {
            const form = query(doc, 'root')
            const submitted = form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
            // 不拦的话，一个"禁用"的表单反而会把整页导航掉
            if (submitted)
              throw new Error('禁用状态下的 submit 没被 preventDefault')
            await flush()
          },
          expect: {
            parts: {
              'root': { 'data-state': 'idle', 'data-invalid': null },
              'error-summary': { 'hidden': '', 'data-count': '0' },
            },
          },
        },
      ],
    },
    {
      name: 'readOnly：重置键置灰（重置就是在写值），提交键照常可用',
      spec: { apg: HTML_SUBMIT },
      props: { readOnly: true },
      initial: {
        parts: {
          'root': { 'data-readonly': '', 'data-disabled': null },
          'submit-trigger': { disabled: null },
          'reset-trigger': {
            'disabled': '',
            'data-disabled': '',
          },
        },
      },
    },
    {
      name: '受控错误表：宿主把错误清空后摘要自己撤下去，不必等下一次提交',
      spec: { apg: APG_ALERT },
      props: { errors: { email: '邮箱格式不正确' }, validate: requireBoth },
      initial: {
        parts: {
          'error-summary': {
            'hidden': '',
            'data-count': '1',
          },
          'error-summary-item[0]': { hidden: null },
          'error-summary-item[1]': { hidden: '' },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'submit-trigger',
          expect: {
            parts: {
              // 受控：机器算出的两条错误只发了回调，表里还是宿主给的那一条
              'error-summary': { 'hidden': null, 'data-count': '1' },
              'root': { 'data-state': 'invalid' },
            },
          },
        },
        {
          kind: 'setProps',
          props: { errors: {} },
          expect: {
            parts: {
              'error-summary': { 'hidden': '', 'data-count': '0' },
              'error-summary-item[0]': { hidden: '' },
              'root': { 'data-invalid': null },
            },
          },
        },
      ],
    },
    {
      name: '宿主翻转 disabled：两颗按钮的原生禁用随之重算',
      spec: { apg: HTML_SUBMIT },
      initial: {
        parts: {
          'submit-trigger': { disabled: null },
          'reset-trigger': { disabled: null },
        },
      },
      steps: [
        {
          kind: 'setProps',
          props: { disabled: true },
          expect: {
            parts: {
              'root': { 'data-disabled': '' },
              'submit-trigger': { disabled: '' },
              'reset-trigger': { disabled: '' },
            },
          },
        },
        {
          kind: 'setProps',
          props: { disabled: false },
          expect: {
            parts: {
              'root': { 'data-disabled': null },
              'submit-trigger': { disabled: null },
              'reset-trigger': { disabled: null },
            },
          },
        },
      ],
    },
  ],
}
