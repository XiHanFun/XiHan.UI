// 组件解剖（Anatomy）：把组件拆成具名 part，产出 data-scope/data-part 属性与选择器。
import { DATA_PART, DATA_SCOPE } from './constants'

export interface AnatomyPart {
  readonly attrs: Readonly<Record<string, string>>
  /** CSS 属性选择器。 */
  readonly selector: string
}

export interface Anatomy<T extends string> {
  readonly name: string
  readonly parts: readonly T[]
  /** 展开为 { [part]: { attrs, selector } }。 */
  build: () => Readonly<Record<T, AnatomyPart>>
}

/**
 * 创建组件解剖。
 * @example createAnatomy('dialog', ['trigger', 'content']).build().content.attrs
 */
export function createAnatomy<T extends string>(name: string, parts: readonly T[]): Anatomy<T> {
  const build = (): Readonly<Record<T, AnatomyPart>> => {
    const out = {} as Record<T, AnatomyPart>
    for (const part of parts) {
      out[part] = {
        attrs: { [DATA_SCOPE]: name, [DATA_PART]: part },
        selector: `[${DATA_SCOPE}="${name}"][${DATA_PART}="${part}"]`,
      }
    }
    return out
  }
  return { name, parts, build }
}
