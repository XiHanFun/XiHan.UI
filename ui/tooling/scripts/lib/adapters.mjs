// 适配器名单与 React 的铺开进度：门禁按它决定该核谁、该放过谁。
//
// 三个适配器不是同一个成熟度：vue 与 web-components 是全量的，react 正在按批次铺开。
// 若干门禁此前把两个适配器写成路径常量，第三家不在常量里，循环压根不进入——
// 判据不是判红，是看不见。改成从这里取名单之后，react 只在已铺到的组件上受核，
// 没铺到的记在 react-coverage.json 里，随批次缩短。
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const COVERAGE = join(HERE, '..', 'react-coverage.json')

export const REACT_COMPONENTS_DIR = 'packages/adapters/react/src/components'
export const VUE_COMPONENTS_DIR = 'packages/adapters/vue/src/components'
export const WC_ELEMENTS_DIR = 'packages/adapters/web-components/src/elements'

/** 三个适配器的登记：key 是门禁里用的短名。 */
export const ADAPTERS = Object.freeze({
  vue: Object.freeze({ name: 'vue', label: 'Vue', root: 'packages/adapters/vue', components: VUE_COMPONENTS_DIR }),
  react: Object.freeze({ name: 'react', label: 'React', root: 'packages/adapters/react', components: REACT_COMPONENTS_DIR }),
  wc: Object.freeze({ name: 'wc', label: 'Web Components', root: 'packages/adapters/web-components', components: WC_ELEMENTS_DIR }),
})

/** react-coverage.json 的内容。 */
export async function readReactCoverage() {
  return JSON.parse(await readFile(COVERAGE, 'utf8'))
}

/** React 侧已经铺到的组件名集合。 */
export async function reactCovered() {
  return new Set((await readReactCoverage()).covered)
}

/** packages/adapters/react/src/components 下真实存在的组件目录。 */
export async function reactComponentDirs() {
  try {
    const entries = await readdir(REACT_COMPONENTS_DIR, { withFileTypes: true })
    return new Set(entries.filter(e => e.isDirectory()).map(e => e.name))
  }
  catch {
    return new Set()
  }
}

/** 供门禁打印进度用的一句话。 */
export function reactProgress(covered, total) {
  return `React 已铺 ${covered.size}/${total}`
}
