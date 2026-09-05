import type { ConformanceSuite, FixtureNode, StepWithExpect } from '../conformance/types'
import { stepsAnatomy, stepsKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/tabs/'

const COUNT = 3

/**
 * 三步 + 三块面板：面板全部常挂，靠 hidden 显隐。
 * 身份写在 item 上，trigger/indicator/title/description/separator 都从 item 继承；
 * 面板挂在 list 之外，够不到 item，因此自带 value。
 *
 * 接线提示：作者自报的禁用在这里写成 `disabled=''`（Vue 侧是组件 prop，不落 DOM）。
 * WC 侧接线时须像 tabs/accordion 那样包一层 authorDisabled 把它改写成 `aria-disabled='true'`
 * ——原生 disabled 会留在 DOM 里进快照（BASE_ATTRS 恒采集），与 Vue 侧分叉。
 */
function stepsTree(disabled?: number): FixtureNode {
  const items = Array.from({ length: COUNT }, (_, i): FixtureNode => {
    const attrs: Record<string, string> = { value: String(i) }
    if (i === disabled)
      attrs.disabled = ''
    return {
      part: 'item',
      attrs,
      children: [
        {
          part: 'trigger',
          tag: 'button',
          children: [
            { part: 'indicator', tag: 'span', text: String(i + 1) },
            { part: 'title', tag: 'span', text: `第 ${i + 1} 步` },
            { part: 'description', tag: 'span', text: `说明 ${i + 1}` },
          ],
        },
        { part: 'separator' },
      ],
    }
  })
  return {
    part: 'root',
    children: [
      { part: 'list', children: items },
      ...Array.from({ length: COUNT }, (_, i): FixtureNode => ({
        part: 'content',
        attrs: { value: String(i) },
        children: [{ text: `面板 ${i}` }],
      })),
    ],
  }
}

/**
 * roving tabindex 的实际规格：条目侧至多一个停靠点；焦点在组外时容器一并兜底
 * （锚点未必有对应条目——走到完成位、或 count 与渲染出的条目对不上时就没有），
 * 焦点在组内时容器让位，Tab 才能正常离开本组。
 */
function tabStops(inside: boolean): StepWithExpect {
  return {
    kind: 'raw',
    why: 'Tab 停靠点的数目是跨节点的计数，逐个部件的属性期望表达不了；jsdom 也不会真的移动焦点',
    run: ({ doc }) => {
      const items = [...doc.querySelectorAll<HTMLElement>('[data-scope="steps"][data-part="trigger"]')]
      const list = doc.querySelector<HTMLElement>('[data-scope="steps"][data-part="list"]')
      const stops = items.filter(el => el.getAttribute('tabindex') === '0')
      if (stops.length > 1)
        throw new Error(`条目侧有 ${stops.length} 个 Tab 停靠点，应当至多一个`)
      const containerStop = list?.getAttribute('tabindex') === '0'
      if (inside && containerStop)
        throw new Error('焦点已在组内，容器还占着 Tab 位：Tab 会被卡在本组门口')
      if (!inside && !containerStop)
        throw new Error('焦点在组外而容器没兜底：锚点一旦没有对应条目，整组就对键盘用户不可达')
      if (!inside && stops.length === 0 && !containerStop)
        throw new Error('整组一个 Tab 停靠点都没有——键盘再也进不来')
    },
  }
}

export const stepsSuite: ConformanceSuite = {
  component: 'steps',
  anatomy: stepsAnatomy,
  keyboard: stepsKeyboard,
  fixture: stepsTree(),
  cases: [
    {
      name: '初始停在第 0 步：三态铺满六个部件，面板只显当前那块',
      spec: { apg: APG },
      props: { count: COUNT },
      initial: {
        order: [
          'root',
          'list',
          'item[0]',
          'trigger[0]',
          'indicator[0]',
          'title[0]',
          'description[0]',
          'separator[0]',
          'item[1]',
          'trigger[1]',
          'indicator[1]',
          'title[1]',
          'description[1]',
          'separator[1]',
          'item[2]',
          'trigger[2]',
          'indicator[2]',
          'title[2]',
          'description[2]',
          'separator[2]',
          'content[0]',
          'content[1]',
          'content[2]',
        ],
        counts: { root: 1, list: 1, item: 3, trigger: 3, indicator: 3, title: 3, description: 3, separator: 3, content: 3 },
        parts: {
          'root': { 'data-orientation': 'horizontal', 'data-complete': null, 'data-empty': null, 'data-disabled': null },
          'list': { 'role': 'tablist', 'aria-orientation': 'horizontal', 'aria-disabled': 'false', 'tabindex': '0' },
          'item[0]': { 'data-state': 'current', 'data-orientation': 'horizontal', 'data-disabled': null },
          'trigger[0]': {
            'role': 'tab',
            'type': 'button',
            'aria-selected': 'true',
            'aria-current': 'step',
            'aria-disabled': 'false',
            'aria-posinset': '1',
            'aria-setsize': '3',
            'tabindex': '0',
            'data-state': 'current',
            'data-value': '0',
          },
          'trigger[1]': {
            'aria-selected': 'false',
            // aria-current 的默认值就是 "false"，省略即"不是当前项"
            'aria-current': null,
            'aria-posinset': '2',
            'tabindex': '-1',
            'data-state': 'incomplete',
            'data-value': '1',
          },
          'indicator[0]': { 'aria-hidden': 'true', 'data-state': 'current' },
          'title[1]': { 'data-state': 'incomplete' },
          'description[1]': { 'data-state': 'incomplete' },
          'separator[0]': { 'aria-hidden': 'true', 'data-state': 'current', 'data-orientation': 'horizontal' },
          'content[0]': { 'role': 'tabpanel', 'tabindex': '0', 'hidden': null, 'data-state': 'current' },
          'content[1]': { 'hidden': '', 'data-state': 'incomplete' },
        },
      },
      steps: [tabStops(false)],
    },
    {
      name: 'aria-controls / aria-labelledby 按下标逐对互指',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { count: COUNT },
      initial: {
        parts: {
          'trigger[0]': { 'id': '@self', 'aria-controls': '@part(content[0])' },
          'trigger[1]': { 'id': '@self', 'aria-controls': '@part(content[1])' },
          'trigger[2]': { 'id': '@self', 'aria-controls': '@part(content[2])' },
          'content[0]': { 'id': '@self', 'aria-labelledby': '@part(trigger[0])' },
          'content[2]': { 'id': '@self', 'aria-labelledby': '@part(trigger[2])' },
        },
      },
    },
    {
      name: '走到中间：前面的 completed、当前 current、后面的 incomplete',
      spec: { apg: APG },
      props: { count: COUNT, defaultValue: 1 },
      initial: {
        parts: {
          'item[0]': { 'data-state': 'completed' },
          'item[1]': { 'data-state': 'current' },
          'item[2]': { 'data-state': 'incomplete' },
          'trigger[0]': { 'aria-selected': 'false', 'aria-current': null, 'tabindex': '-1', 'data-state': 'completed' },
          'trigger[1]': { 'aria-selected': 'true', 'aria-current': 'step', 'tabindex': '0', 'data-state': 'current' },
          'content[0]': { hidden: '' },
          'content[1]': { hidden: null },
          'content[2]': { hidden: '' },
        },
      },
    },
    {
      // 走完最后一步后没有任何一步是 current，也没有条目认领 tabindex=0，容器须兜底
      name: '走到完成位：每一步都 completed，面板全收起，list 兜底进 Tab 序列',
      spec: { apg: APG },
      props: { count: COUNT, defaultValue: COUNT },
      initial: {
        parts: {
          'root': { 'data-complete': '' },
          'list': { tabindex: '0' },
          'item[2]': { 'data-state': 'completed' },
          'trigger[0]': { 'aria-selected': 'false', 'tabindex': '-1', 'data-state': 'completed' },
          'trigger[2]': { 'aria-selected': 'false', 'tabindex': '-1', 'data-state': 'completed' },
          'content[0]': { hidden: '' },
          'content[2]': { hidden: '' },
        },
      },
      steps: [tabStops(false)],
    },
    {
      // count 缺省是作者的漏写：步序被夹死在 0，读屏那边也不该听到"共 0 步"
      name: 'count 缺省：root 打 data-empty，trigger 不写 posinset/setsize',
      spec: { apg: APG },
      initial: {
        parts: {
          'root': { 'data-empty': '' },
          'trigger[0]': { 'aria-posinset': null, 'aria-setsize': null },
        },
      },
    },
    {
      name: '点 trigger 切步：面板随之显隐，焦点锚点跟到被点那一步',
      spec: { apg: APG },
      props: { count: COUNT },
      steps: [
        {
          kind: 'click',
          part: 'trigger[2]',
          expect: {
            activeElement: { part: 'trigger[2]', exact: true },
            parts: {
              'trigger[0]': { 'aria-selected': 'false', 'tabindex': '-1', 'data-state': 'completed' },
              'trigger[2]': { 'aria-selected': 'true', 'tabindex': '0', 'data-state': 'current' },
              'content[0]': { hidden: '' },
              'content[2]': { hidden: null },
            },
          },
        },
        tabStops(true),
      ],
    },
    {
      name: '焦点从组外落到容器：转投锚点那一步，落焦不等于切步，Enter 才切',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['steps.kbd.activate', 'steps.kbd.tab'],
      props: { count: COUNT, defaultValue: 1 },
      steps: [
        {
          kind: 'focus',
          part: 'list',
          expect: {
            activeElement: { part: 'trigger[1]', exact: true },
            parts: {
              'list': { tabindex: '-1' },
              'trigger[1]': { 'aria-selected': 'true', 'tabindex': '0' },
            },
          },
        },
        tabStops(true),
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            activeElement: { part: 'trigger[2]', exact: true },
            parts: {
              // 焦点走了，步序没动
              'trigger[1]': { 'aria-selected': 'true', 'tabindex': '-1', 'data-state': 'current' },
              'trigger[2]': { 'aria-selected': 'false', 'tabindex': '0', 'data-state': 'incomplete' },
              'content[1]': { hidden: null },
              'content[2]': { hidden: '' },
            },
          },
        },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            activeElement: { part: 'trigger[2]', exact: true },
            parts: {
              'trigger[1]': { 'aria-selected': 'false', 'data-state': 'completed' },
              'trigger[2]': { 'aria-selected': 'true', 'aria-current': 'step', 'data-state': 'current' },
              'content[1]': { hidden: '' },
              'content[2]': { hidden: null },
            },
          },
        },
      ],
    },
    {
      name: '方向键只搬焦点：ArrowRight/ArrowLeft 逐步走，两端不回绕',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['steps.kbd.next', 'steps.kbd.prev'],
      props: { count: COUNT },
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        {
          kind: 'key',
          key: 'ArrowLeft',
          // 首个再往前：不回绕到末个（步骤是一条有始有终的路径）
          expect: { activeElement: { part: 'trigger[0]', exact: true } },
        },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'trigger[1]', exact: true } } },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'trigger[2]', exact: true } } },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            activeElement: { part: 'trigger[2]', exact: true },
            // 一路走过来步序始终没动
            parts: { 'trigger[0]': { 'aria-selected': 'true' }, 'content[0]': { hidden: null } },
          },
        },
      ],
    },
    {
      name: 'Home/End 跳到首尾 trigger',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['steps.kbd.first', 'steps.kbd.last'],
      props: { count: COUNT, defaultValue: 1 },
      steps: [
        { kind: 'focus', part: 'trigger[1]' },
        { kind: 'key', key: 'End', expect: { activeElement: { part: 'trigger[2]', exact: true } } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: 'trigger[0]', exact: true } } },
      ],
    },
    {
      name: '横排里 ArrowDown 不归导航管：焦点与步序都不动',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { count: COUNT },
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: 'trigger[0]', exact: true },
            parts: { 'trigger[0]': { 'aria-selected': 'true', 'tabindex': '0' } },
          },
        },
      ],
    },
    {
      name: 'orientation=vertical：aria-orientation 跟随，ArrowDown 成为下一个',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['steps.kbd.next'],
      props: { count: COUNT, orientation: 'vertical' },
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: 'trigger[1]', exact: true },
            parts: {
              'list': { 'aria-orientation': 'vertical' },
              'root': { 'data-orientation': 'vertical' },
              'separator[0]': { 'data-orientation': 'vertical' },
            },
          },
        },
      ],
    },
    {
      name: '横排 + dir=rtl：ArrowRight 走上一个、ArrowLeft 走下一个',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['steps.kbd.prev', 'steps.kbd.next'],
      props: { count: COUNT, defaultValue: 1, dir: 'rtl' },
      steps: [
        { kind: 'focus', part: 'trigger[1]' },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'trigger[0]', exact: true } } },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'trigger[1]', exact: true } } },
      ],
    },
    {
      name: 'linear：没走到的那几步禁用、点不动，方向键也跳过它们',
      spec: { apg: APG },
      covers: ['steps.kbd.next'],
      props: { count: COUNT, linear: true },
      initial: {
        parts: {
          'trigger[0]': { 'aria-disabled': 'false', 'data-disabled': null },
          'trigger[1]': { 'aria-disabled': 'true', 'disabled': null, 'data-disabled': '' },
          'trigger[2]': { 'aria-disabled': 'true', 'data-disabled': '' },
          'item[2]': { 'data-disabled': '' },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'trigger[2]',
          expect: {
            parts: {
              // 步序纹丝不动；焦点倒是跟着点击走了（禁用条目仍可聚焦）
              'trigger[0]': { 'aria-selected': 'true', 'data-state': 'current' },
              'trigger[2]': { 'aria-selected': 'false', 'data-state': 'incomplete' },
              'content[0]': { hidden: null },
            },
          },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          // 后面全锁着，往前无处可去，焦点留在原地
          expect: { activeElement: { part: 'trigger[2]', exact: true } },
        },
      ],
    },
    {
      name: 'linear：走过的与当前这一步照常可点，回头看是允许的',
      spec: { apg: APG },
      props: { count: COUNT, linear: true, defaultValue: 2 },
      initial: {
        parts: {
          'trigger[0]': { 'aria-disabled': 'false' },
          'trigger[1]': { 'aria-disabled': 'false' },
          'trigger[2]': { 'aria-disabled': 'false' },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'trigger[0]',
          expect: {
            parts: {
              'trigger[0]': { 'aria-selected': 'true', 'data-state': 'current' },
              // 退回第 0 步之后，后面两步重新锁上
              'trigger[1]': { 'aria-disabled': 'true' },
              'content[0]': { hidden: null },
              'content[2]': { hidden: '' },
            },
          },
        },
      ],
    },
    {
      name: '作者自报禁用的那一步：aria-disabled 而非原生 disabled，点不动、方向键跳过',
      spec: { apg: APG },
      covers: ['steps.kbd.next'],
      fixture: () => stepsTree(1),
      props: { count: COUNT },
      initial: {
        parts: {
          'item[1]': { 'data-disabled': '' },
          'trigger[1]': { 'aria-disabled': 'true', 'data-state': 'incomplete' },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'trigger[1]',
          expect: { parts: { 'trigger[0]': { 'aria-selected': 'true' }, 'trigger[1]': { 'aria-selected': 'false' } } },
        },
        { kind: 'focus', part: 'trigger[0]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { activeElement: { part: 'trigger[2]', exact: true } },
        },
      ],
    },
    {
      name: '整组禁用：每一步都禁用、点不动，连一个 Tab 停靠点都不留',
      spec: { apg: APG },
      props: { count: COUNT, disabled: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          // 容器不可聚焦：整块脱出 Tab 序列
          'list': { 'tabindex': null, 'aria-disabled': 'true' },
          // trigger 是原生 button，不写 tabindex 照样可聚焦，必须显式给 -1
          'trigger[0]': { 'aria-disabled': 'true', 'tabindex': '-1', 'disabled': null },
          'trigger[1]': { 'aria-disabled': 'true', 'tabindex': '-1' },
          'trigger[2]': { 'aria-disabled': 'true', 'tabindex': '-1' },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'trigger[2]',
          expect: { parts: { 'trigger[0]': { 'aria-selected': 'true' }, 'content[0]': { hidden: null } } },
        },
      ],
    },
    {
      name: '受控 value：点击只发意图不自改 DOM，宿主写回 value 后才切换',
      spec: { adr: 'controlled-uncontrolled' },
      props: { count: COUNT, value: 0 },
      steps: [
        {
          kind: 'click',
          part: 'trigger[1]',
          expect: {
            parts: {
              // 步序没动，但焦点锚点跟到了被点那一步
              'trigger[0]': { 'aria-selected': 'true', 'tabindex': '-1' },
              'trigger[1]': { 'aria-selected': 'false', 'tabindex': '0' },
              'content[1]': { hidden: '' },
            },
          },
        },
        { kind: 'setProps', props: { value: 1 } },
        {
          kind: 'settle',
          until: { attr: { part: 'content[1]', name: 'hidden', value: null } },
          expect: {
            parts: {
              'trigger[0]': { 'aria-selected': 'false', 'data-state': 'completed' },
              'trigger[1]': { 'aria-selected': 'true', 'data-state': 'current' },
              'content[0]': { hidden: '' },
            },
          },
        },
      ],
    },
  ],
}
