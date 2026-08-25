import type { App } from 'vue'
import { DIAGNOSTIC_CODES, reportDiagnostic } from '@xihan-ui/kernel'

/**
 * 把命令式服务的宿主应用挂上去，挂不起来也不连累调用方。
 *
 * 这几个服务是从路由守卫、请求拦截器这类地方懒建的——那些位置抛异常，
 * 后果不是「提示没弹出来」而是整次导航失败、整站白屏，而报错指向的是浮层部件，
 * 与真正的原因隔着十万八千里。一条轻提示、一根进度条都不该有这个权力。
 *
 * 挂不起来时发一条诊断并交回 false，由调用方退化成空操作：
 * 用户看不到提示，但页面照常能用——这是这两者之间正确的取舍。
 */
export function mountServiceHost(app: App, holder: HTMLElement, service: string): boolean {
  try {
    app.mount(holder)
    return true
  }
  catch (error) {
    reportDiagnostic({
      code: DIAGNOSTIC_CODES.warn,
      level: 'warn',
      message:
        `[xh] ${service} 的宿主没挂起来，这个服务本次退化成空操作。`
        + '常见原因是同一份组件模块被加载成了两份（链到工作区的库重建产物后，'
        + 'dev server 的模块图会新旧混杂），重启 dev server 即可。',
      detail: { service, error },
    })
    try {
      app.unmount()
    }
    catch {
      // 挂都没挂上，卸载失败无所谓
    }
    holder.remove()
    return false
  }
}
