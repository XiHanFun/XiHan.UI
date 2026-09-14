import type { ConformanceSuite } from '../conformance/types'
import { fieldAnatomy, fieldKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/'

/**
 * control 节点里放作者自己的输入控件：Field 只把属性合并上去，不替作者渲染 input。
 * 描述与错误文案常挂，错误文案靠 hidden 显隐。
 */
export const fieldSuite: ConformanceSuite = {
  component: 'field',
  anatomy: fieldAnatomy,
  keyboard: fieldKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'label', text: '邮箱' },
      { part: 'control', children: [{ tag: 'input' }] },
      { part: 'description', text: '用于接收通知' },
      { part: 'error-text', text: '邮箱格式不正确' },
    ],
  },
  cases: [
    {
      name: '默认：描述链只挂 description，label 的 for 指向 control，error-text 隐藏',
      spec: { apg: APG },
      initial: {
        order: ['root', 'label', 'control', 'description', 'error-text'],
        counts: { 'root': 1, 'label': 1, 'control': 1, 'description': 1, 'error-text': 1 },
        parts: {
          'root': {
            'data-invalid': null,
            'data-required': null,
            'data-disabled': null,
          },
          'label': {
            'for': '@part(control)',
            'data-disabled': null,
          },
          'control': {
            'id': '@self',
            'aria-labelledby': '@part(label)',
            'aria-describedby': '@part(description)',
            'aria-invalid': 'false',
            'aria-required': 'false',
            'data-invalid': null,
            'data-disabled': null,
          },
          'error-text': {
            'role': 'status',
            'aria-live': 'polite',
            'aria-atomic': 'true',
            'hidden': '',
          },
        },
      },
      steps: [
        {
          kind: 'raw',
          // 快照只比 for 两头对不对得上；label.control 走浏览器的关联算法，非它验不出真关联
          why: '名字关联是否真的成立，归一化快照看不见——for 走浏览器的关联算法，labelledby 要比对 id',
          run: ({ doc }) => {
            const label = doc.querySelector('[data-scope="field"][data-part="label"]')
            const control = doc.querySelector('[data-scope="field"][data-part="control"]')
            if (!label || !control)
              throw new Error('label 或 control 没渲染出来')
            // 两条路任意一条成立即可：for 只对可标注元素生效，作者把 control 标在 div 上时靠 labelledby
            const byFor = (label as HTMLLabelElement).control === control
            const byAria = control.getAttribute('aria-labelledby')
              ?.split(/s+/)
              .includes(label.id) ?? false
            if (!byFor && !byAria) {
              const tag = control.tagName.toLowerCase()
              throw new Error(`label 关联不到 control：control 是 <${tag}>，for 不生效且 aria-labelledby 没指过来`)
            }
          },
        },
      ],
    },
    {
      name: 'invalid：描述链追加 error-text，错误文案显出，aria-invalid 显式 true',
      spec: { apg: APG },
      props: { invalid: true },
      initial: {
        parts: {
          'root': { 'data-invalid': '' },
          'control': {
            'aria-labelledby': '@part(label)',
            'aria-describedby': '@part(description) @part(error-text)',
            'aria-invalid': 'true',
            'data-invalid': '',
          },
          'error-text': {
            // 排队播报不打断：一次提交失败会有多个字段同时翻转
            'role': 'status',
            'aria-live': 'polite',
            'hidden': null,
          },
        },
      },
    },
    {
      name: 'required：控件 aria-required 显式 true，root 同步 data-required',
      spec: { apg: APG },
      props: { required: true },
      initial: {
        parts: {
          root: { 'data-required': '' },
          control: {
            'aria-required': 'true',
            'aria-invalid': 'false',
          },
        },
      },
    },
    {
      // 快照把 id/for 都归一，验不出接管是否生效，必须直读 DOM 比对字面量
      name: '作者接管 controlId：控件真的用了作者给的 id，label 的 for 跟着指过去',
      spec: { apg: APG },
      props: { controlId: 'field-email' },
      initial: {
        parts: {
          label: { for: '@part(control)' },
          control: { id: '@self' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: 'id 的字面量不进归一化快照，只能直读 DOM',
          run: ({ doc }) => {
            const control = doc.querySelector('[data-scope="field"][data-part="control"]')
            const label = doc.querySelector('[data-scope="field"][data-part="label"]')
            const got = [control?.getAttribute('id'), label?.getAttribute('for')]
            if (JSON.stringify(got) !== JSON.stringify(['field-email', 'field-email']))
              throw new Error(`控件 id / label for 未采用作者给的值：实际 ${JSON.stringify(got)}`)
          },
        },
      ],
    },
    {
      name: 'disabled：root/label/control/description 同步 data-disabled，控件上不落原生 disabled',
      spec: { apg: APG },
      props: { disabled: true },
      initial: {
        parts: {
          root: { 'data-disabled': '' },
          label: { 'data-disabled': '' },
          control: {
            'data-disabled': '',
            'disabled': null,
          },
          description: { 'data-disabled': '' },
        },
      },
    },
    {
      name: '宿主翻转 invalid：描述链与错误文案的显隐随之重算',
      spec: { apg: APG },
      initial: {
        parts: {
          'control': {
            'aria-labelledby': '@part(label)',
            'aria-describedby': '@part(description)',
            'aria-invalid': 'false',
          },
          'error-text': { hidden: '' },
        },
      },
      steps: [
        {
          kind: 'setProps',
          props: { invalid: true },
          expect: {
            parts: {
              'control': {
                'aria-labelledby': '@part(label)',
                'aria-describedby': '@part(description) @part(error-text)',
                'aria-invalid': 'true',
              },
              'error-text': { hidden: null },
            },
          },
        },
        {
          kind: 'setProps',
          props: { invalid: false },
          expect: {
            parts: {
              'control': {
                'aria-labelledby': '@part(label)',
                'aria-describedby': '@part(description)',
                'aria-invalid': 'false',
              },
              'error-text': { hidden: '' },
            },
          },
        },
      ],
    },
  ],
}
