// 锁步版本一致性检查:17 个包同版本是硬承诺(见 docs/guide/versioning.md)。
//
// 混装版本的后果不是编译错误而是运行时硬故障:类型对不上、同一 xh- 标签被两个版本
// 注册直接抛错。WC 侧同一标签的版本冲突由注册表挡住(defineElement 抛错),但
// 「vue alpha.2 + kernel alpha.3」这种跨包组合包管理器不会拦——适配器在 dev 启动时
// 拿自己的版本号与 kernel 比对,不一致就经诊断通道发 warn。
import { reportDiagnostic } from './channel'
import { DIAGNOSTIC_CODES } from './codes'

/**
 * 消费方版本与 kernel 版本不一致时投递一条 warn。只在 dev 调用(生产通道默认静默)。
 */
export function checkLockstepVersion(name: string, version: string, kernelVersion: string): void {
  if (version === kernelVersion)
    return
  reportDiagnostic({
    code: DIAGNOSTIC_CODES.versionMismatch,
    level: 'warn',
    message: `${name} ${version} 与 kernel ${kernelVersion} 版本不一致——17 个包锁步发版，混装会类型对不上甚至运行时挂掉，请统一到同一版本`,
    detail: { name, version, kernelVersion },
  })
}
