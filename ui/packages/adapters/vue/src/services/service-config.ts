// 命令式服务共用的配置源。三个服务各自 createApp 到自建容器，接不到组件树里的
// provideXhConfig，只能自己往宿主里 provide 一份；这里把那段收在一处。
// 源收成 shallowRef 是为了运行期能换：传 ref/getter 的跟着应用切语言，
// 没有响应式源的用句柄上的 setConfig 命令式推。
import type { MaybeRefOrGetter } from 'vue'
import type { XhConfig } from '../config/config'
import { shallowRef, toValue } from 'vue'
import { provideXhConfig } from '../config/config'

export interface ServiceConfigSource {
  /** 在宿主组件的 setup 里调一次。 */
  provide: () => void
  /** 换一份配置源；下一帧起服务子树读新值。 */
  set: (next: MaybeRefOrGetter<XhConfig> | undefined) => void
}

export function createServiceConfig(initial?: MaybeRefOrGetter<XhConfig>): ServiceConfigSource {
  // 源本身可能就是个 ref，直接放进 shallowRef 会被解包成只读，故套一层盒子
  const box = shallowRef<{ src: MaybeRefOrGetter<XhConfig> | undefined }>({ src: initial })
  return {
    provide: () => provideXhConfig(() => toValue(box.value.src) ?? {}),
    set: (next) => {
      box.value = { src: next }
    },
  }
}
