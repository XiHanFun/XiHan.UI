import type { ConformanceSuite } from '../conformance/types'
import { colorSwatchAnatomy, colorSwatchKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/'

// 色块只有 root 一个部件：颜色、尺寸与角色都投影在它身上，家族配方据 data-xh-swatch 画面
export const colorSwatchSuite: ConformanceSuite = {
  component: 'color-swatch',
  anatomy: colorSwatchAnatomy,
  keyboard: colorSwatchKeyboard,
  fixture: { part: 'root', tag: 'span' },
  cases: [
    {
      name: '默认：给了颜色串就是一张图，名字念串本身，家族属性与颜色层一并落在 root 上',
      spec: { apg: `${APG}patterns/img/` },
      props: { value: '#e11d48' },
      initial: {
        order: ['root'],
        counts: { root: 1 },
        parts: {
          root: {
            'role': 'img',
            'aria-label': '#e11d48',
            'aria-hidden': null,
            'data-value': '#e11d48',
            'data-invalid': null,
            'data-xh-swatch': '',
            'data-xh-swatch-size': null,
          },
        },
      },
    },
    {
      name: 'label 优先当可及名字；尺寸同时打到组件轴与家族轴上',
      spec: { apg: `${APG}patterns/img/` },
      props: { value: 'rgb(255, 0, 0)', label: '品牌红', size: 'lg' },
      initial: {
        parts: {
          root: { 'aria-label': '品牌红', 'data-size': 'lg', 'data-xh-swatch-size': 'lg' },
        },
      },
    },
    {
      name: '解析不出的串标成无效：不画颜色、名字仍念作者写的串',
      spec: { apg: `${APG}patterns/img/` },
      props: { value: 'red' },
      initial: {
        parts: {
          root: { 'role': 'img', 'aria-label': 'red', 'data-invalid': '', 'data-value': 'red' },
        },
      },
    },
    {
      name: '既没 label 又没值：整块是装饰，不进可访问树',
      spec: { apg: `${APG}patterns/img/` },
      props: {},
      initial: {
        parts: {
          root: { 'role': null, 'aria-hidden': 'true', 'data-value': null, 'data-invalid': null },
        },
      },
    },
  ],
}
