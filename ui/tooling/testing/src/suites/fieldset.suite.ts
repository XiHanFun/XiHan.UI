import type { ConformanceSuite } from '../conformance/types'
import { fieldsetAnatomy, fieldsetKeyboard } from '@xihan-ui/headless'

const HTML_SPEC = 'https://html.spec.whatwg.org/multipage/form-elements.html#the-fieldset-element'
const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/'

/**
 * root 与 legend 必须落成原生 <fieldset> / <legend>：禁用连坐与"legend 即组名"都是浏览器给的，
 * 两个适配器渲出别的标签就静默失效，故 fixture 里把标签名写死，并用 raw 步骤直接核标签。
 * 说明与错误文案常挂，错误文案靠 hidden 显隐。
 */
export const fieldsetSuite: ConformanceSuite = {
  component: 'fieldset',
  anatomy: fieldsetAnatomy,
  keyboard: fieldsetKeyboard,
  fixture: {
    part: 'root',
    tag: 'fieldset',
    children: [
      { part: 'legend', tag: 'legend', text: '联系方式' },
      { tag: 'input', attrs: { 'type': 'email', 'aria-label': '邮箱' } },
      { part: 'helper-text', tag: 'p', text: '至少填写一种联系方式' },
      { part: 'error-text', tag: 'p', text: '请至少填写一种联系方式' },
    ],
  },
  cases: [
    {
      name: '默认：描述链只挂 helper-text，错误文案隐藏，root 上不落原生 disabled',
      spec: { apg: APG },
      initial: {
        order: ['root', 'legend', 'helper-text', 'error-text'],
        counts: { 'root': 1, 'legend': 1, 'helper-text': 1, 'error-text': 1 },
        parts: {
          'root': {
            'aria-describedby': '@part(helper-text)',
            'disabled': null,
            'data-disabled': null,
            'data-invalid': null,
            'data-required': null,
            // 无效与必填在 group 角色上不产出 ARIA，只走 data-*
            'aria-invalid': null,
            'aria-required': null,
            'aria-disabled': null,
          },
          'legend': { 'data-disabled': null },
          'helper-text': { 'id': '@self', 'data-disabled': null },
          'error-text': {
            role: 'alert',
            hidden: '',
          },
        },
      },
      steps: [
        {
          kind: 'raw',
          // 快照只采属性，采不到标签名；而这两个标签正是本组件全部原生行为的载体
          why: '禁用连坐与组名都挂在原生标签上，标签名不进归一化快照，只能直读 DOM',
          run: ({ doc }) => {
            const root = doc.querySelector('[data-scope="fieldset"][data-part="root"]')
            const legend = doc.querySelector('[data-scope="fieldset"][data-part="legend"]')
            if (root?.tagName.toLowerCase() !== 'fieldset')
              throw new Error(`root 不是原生 <fieldset>，实际是 <${root?.tagName.toLowerCase()}>：整组禁用不会连坐组内控件`)
            if (legend?.tagName.toLowerCase() !== 'legend')
              throw new Error(`legend 不是原生 <legend>，实际是 <${legend?.tagName.toLowerCase()}>：这一组没有名字`)
            if (root.firstElementChild !== legend)
              throw new Error('legend 不是 fieldset 的首个子节点：浏览器不把它当这一组的名字')
          },
        },
      ],
    },
    {
      name: 'invalid：描述链追加 error-text，错误文案显出，root 仍不产出 aria-invalid',
      spec: { apg: APG },
      props: { invalid: true },
      initial: {
        parts: {
          'root': {
            'aria-describedby': '@part(helper-text) @part(error-text)',
            'data-invalid': '',
            'aria-invalid': null,
          },
          'error-text': {
            role: 'alert',
            hidden: null,
          },
        },
      },
    },
    {
      name: 'required：root 同步 data-required，不产出 aria-required',
      spec: { apg: APG },
      props: { required: true },
      initial: {
        parts: {
          root: {
            'data-required': '',
            'aria-required': null,
          },
        },
      },
    },
    {
      name: 'disabled：root 落原生 disabled，legend 与 helper-text 同步 data-disabled',
      spec: { apg: HTML_SPEC },
      props: { disabled: true },
      initial: {
        parts: {
          'root': {
            'disabled': '',
            'data-disabled': '',
            // 原生 disabled 已进无障碍树，不再另发 aria-disabled
            'aria-disabled': null,
          },
          'legend': { 'data-disabled': '' },
          'helper-text': { 'data-disabled': '' },
        },
      },
    },
    {
      name: '宿主翻转 invalid：描述链与错误文案的显隐随之重算',
      spec: { apg: APG },
      initial: {
        parts: {
          'root': { 'aria-describedby': '@part(helper-text)' },
          'error-text': { hidden: '' },
        },
      },
      steps: [
        {
          kind: 'setProps',
          props: { invalid: true },
          expect: {
            parts: {
              'root': { 'aria-describedby': '@part(helper-text) @part(error-text)', 'data-invalid': '' },
              'error-text': { hidden: null },
            },
          },
        },
        {
          kind: 'setProps',
          props: { invalid: false },
          expect: {
            parts: {
              'root': { 'aria-describedby': '@part(helper-text)', 'data-invalid': null },
              'error-text': { hidden: '' },
            },
          },
        },
      ],
    },
    {
      name: '宿主翻转 disabled：原生 disabled 与 data-disabled 一起来一起走',
      spec: { apg: HTML_SPEC },
      initial: {
        parts: {
          root: { 'disabled': null, 'data-disabled': null },
        },
      },
      steps: [
        {
          kind: 'setProps',
          props: { disabled: true },
          expect: {
            parts: {
              root: { 'disabled': '', 'data-disabled': '' },
              legend: { 'data-disabled': '' },
            },
          },
        },
        {
          kind: 'setProps',
          props: { disabled: false },
          expect: {
            parts: {
              root: { 'disabled': null, 'data-disabled': null },
              legend: { 'data-disabled': null },
            },
          },
        },
      ],
    },
  ],
}
