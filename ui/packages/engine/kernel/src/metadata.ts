import { version } from '../package.json'
// 框架元数据:名称、版本、版权与运行时信息的单一事实源。
//
// 版本从 package.json 派生(库包锁步同版,kernel 的版本就是整套库的版本,改版本只改
// package.json 一处),运行时信息(dev/prod 模式、SSR、适配器宿主)由调用方登记。
// getSummary() / getDetails() 返回格式化文本,print 版只在 dev 出声,生产静默。
import { reportDiagnostic } from './diagnostics/channel'
import { DIAGNOSTIC_CODES } from './diagnostics/codes'
import { isSSR } from './guards'
import { isDev } from './utils/dev'

export interface VersionInfo {
  /** 完整版本号,如 '1.0.0-alpha.2'。 */
  version: string
  major: number
  minor: number
  patch: number
  /** 预发布标识,如 'alpha.2';正式版为 null。 */
  prerelease: string | null
}

/** 把 '1.0.0-alpha.2' 拆成数字与预发布标识;拆不动时退成 0.0.0。 */
function parseVersion(raw: string): VersionInfo {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/.exec(raw)
  if (!m)
    return { version: raw, major: 0, minor: 0, patch: 0, prerelease: null }
  return {
    version: raw,
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    prerelease: m[4] ?? null,
  }
}

/** 框架版本:从 kernel 的 package.json 派生,库包锁步同版下即整套库的版本。 */
export const XIHAN_UI_VERSION: Readonly<VersionInfo> = parseVersion(version)

/** 框架元数据:静态常量集中维护,展示与消费都从这一份读。 */
export const XIHAN_UI_METADATA = Object.freeze({
  /** 框架名称 */
  name: 'XiHan.UI',
  /** 框架显示名称 */
  displayName: '曦寒视图组件',
  /** 框架版本(字符串形态,与 XIHAN_UI_VERSION.version 同源) */
  version: XIHAN_UI_VERSION.version,
  /** 框架主要版本 */
  majorVersion: XIHAN_UI_VERSION.major,
  /** 框架次要版本 */
  minorVersion: XIHAN_UI_VERSION.minor,
  /** 框架修订版本 */
  patchVersion: XIHAN_UI_VERSION.patch,
  /** 框架预发布标识 */
  prerelease: XIHAN_UI_VERSION.prerelease,
  /** 框架描述 */
  description: '快速、轻量、高效、用心的框架无关跨端组件库。',
  /** 框架版权信息 */
  copyright: 'Copyright (c) 2021-Present XiHanFun and contributors.',
  /** 框架作者 */
  author: 'XiHanFun and contributors',
  /** 框架组织 */
  organization: 'XiHanFun',
  /** 框架组织网址 */
  organizationUrl: 'https://github.com/XiHanFun',
  /** 框架仓库地址 */
  repositoryUrl: 'https://github.com/XiHanFun/XiHan.UI',
  /** 框架文档地址 */
  documentationUrl: 'https://ui.docs.xihanfun.com',
  /** 框架许可证 */
  license: 'MIT',
  /** 框架许可证地址 */
  licenseUrl: 'https://github.com/XiHanFun/XiHan.UI/blob/main/LICENSE',
  /** 框架关键词 */
  keywords: Object.freeze([
    'vue',
    'web-components',
    'design-system',
    'headless-ui',
    'framework-agnostic',
    'components',
    'typescript',
    'xihan',
    'xihanfun',
  ]),
  /** 框架支持的平台(浏览器引擎,硬底线见 docs/guide/versioning.md) */
  supportedPlatforms: Object.freeze(['Chrome', 'Edge', 'Firefox', 'Safari']),
  /** 框架提供的渲染适配器 */
  adapters: Object.freeze(['vue', 'web-components']),
  /** 曦寒标志 */
  logo: [
    '   _  __ ______  _____    _   __',
    '  | |/ //  _/ / / /   |  / | / /',
    '  |   / / // /_/ / /| | /  |/ /',
    ' /   |_/ // __  / ___ |/ /|  /',
    '/_/|_/___/_/ /_/_/  |_/_/ |_/',
  ].join('\n'),
  /** 曦寒寄语 */
  sendWord: [
    '碧落降恩承淑颜，共挚崎缘挽曦寒。',
    '迁般故事终成忆，谨此葳蕤换思短。',
    '              —— 致她',
  ].join('\n'),
}) as Readonly<{
  name: string
  displayName: string
  version: string
  majorVersion: number
  minorVersion: number
  patchVersion: number
  prerelease: string | null
  description: string
  copyright: string
  author: string
  organization: string
  organizationUrl: string
  repositoryUrl: string
  documentationUrl: string
  license: string
  licenseUrl: string
  keywords: readonly string[]
  supportedPlatforms: readonly string[]
  adapters: readonly string[]
  logo: string
  sendWord: string
}>

export interface RuntimeHostInfo {
  /** 适配器名(vue / web-components)。 */
  name: string
  /** 适配器版本。 */
  version: string
}

let runtimeHost: RuntimeHostInfo | null = null

/** 适配器在启动时登记自己,getSummary / getDetails 据此报出运行时宿主。 */
export function registerRuntimeHost(name: string, version: string): void {
  runtimeHost = { name, version }
}

/**
 * 锁步版本一致性检查:全部库包同版本是硬承诺(见 docs/guide/versioning.md),混装会
 * 类型对不上甚至运行时挂掉。适配器 dev 启动时拿自身版本与 kernel 比对,不一致经
 * 诊断通道发一条 warn;版本信息归元数据管,所以与 Framework 一样住在这个模块里。
 */
export function checkLockstepVersion(name: string, version: string, kernelVersion: string): void {
  if (version === kernelVersion)
    return
  reportDiagnostic({
    code: DIAGNOSTIC_CODES.versionMismatch,
    level: 'warn',
    message: `${name} ${version} 与 kernel ${kernelVersion} 版本不一致——全部库包锁步发版,混装会类型对不上甚至运行时挂掉,请统一到同一版本`,
    detail: { name, version, kernelVersion },
  })
}

export function getRuntimeHost(): Readonly<RuntimeHostInfo> | null {
  return runtimeHost
}

/** 清掉宿主登记,测试之间用。 */
export function resetRuntimeHost(): void {
  runtimeHost = null
}

export interface RuntimeInfo {
  /** development / production,取 isDev()。 */
  mode: 'development' | 'production'
  /** 是否在无 DOM 的环境(SSR / 纯 Node)。 */
  ssr: boolean
  /** 适配器宿主;尚未登记时为 null。 */
  host: Readonly<RuntimeHostInfo> | null
}

/** 运行时信息:环境与宿主,每次调用现取。 */
export function getRuntimeInfo(): RuntimeInfo {
  return {
    mode: isDev() ? 'development' : 'production',
    ssr: isSSR(),
    host: runtimeHost,
  }
}

function hostLine(): string {
  if (runtimeHost === null)
    return '宿主:未登记(适配器尚未启动)'
  return `宿主:${runtimeHost.name} v${runtimeHost.version}`
}

/** 框架信息摘要:名称、版本、描述、寄语与宿主,一段话。 */
export function getMetadataSummary(): string {
  const m = XIHAN_UI_METADATA
  return [
    `${m.name} ${m.displayName} v${m.version}`,
    m.description,
    m.sendWord,
    '',
    hostLine(),
  ].join('\n')
}

/** 框架详细信息:摘要之外再补作者、组织、仓库、文档、许可证与环境。 */
export function getMetadataDetails(): string {
  const m = XIHAN_UI_METADATA
  const info = getRuntimeInfo()
  return [
    `${m.name} ${m.displayName} v${m.version}`,
    m.description,
    m.sendWord,
    `作者: ${m.author}`,
    `组织: ${m.organization} (${m.organizationUrl})`,
    `仓库: ${m.repositoryUrl}`,
    `文档: ${m.documentationUrl}`,
    `许可证: ${m.license} (${m.licenseUrl})`,
    '',
    hostLine(),
    `环境: ${info.mode} · ${info.ssr ? '服务端' : '客户端'}`,
  ].join('\n')
}

let autoPrint = true
let bannerPrinted = false

/**
 * 是否在适配器启动时自动打横幅(默认开)。关闭只影响之后的启动,不影响手动 print。
 * Framework 侧横幅印在应用构造上且无开关;UI 库落在每个消费方的浏览器控制台里,
 * 必须给一条能关的路。
 */
export function setMetadataAutoPrint(on: boolean): void {
  autoPrint = on
}

export function isMetadataAutoPrint(): boolean {
  return autoPrint
}

/** 清掉「已打过」记账,测试之间用。 */
export function resetMetadataBanner(): void {
  bannerPrinted = false
}

/**
 * 适配器启动时调用一次:与 XiHanApplicationBase 构造时印 Logo + GetSummary() 对齐——
 * 引用即打印,整个页面只打一次,生产静默。
 */
export function printMetadataBannerOnce(): void {
  if (!autoPrint || bannerPrinted)
    return
  bannerPrinted = true
  if (!isDev())
    return
  // 标志用品牌色,正文走 info;这是启动横幅,不是内部调试日志
  // eslint-disable-next-line no-console
  console.info(`%c${XIHAN_UI_METADATA.logo}`, 'color: #a78bfa')
  // eslint-disable-next-line no-console
  console.info(getMetadataSummary())
}

/** dev 里把摘要打到控制台,生产静默。 */
export function printMetadataSummary(): void {
  if (isDev())
    // 这是用户主动调用的信息横幅，不是内部调试日志；info 语义就是给它用的
    // eslint-disable-next-line no-console
    console.info(getMetadataSummary())
}

/** dev 里把详细信息打到控制台,生产静默。 */
export function printMetadataDetails(): void {
  if (isDev())
    // 同上：显式调用的信息输出
    // eslint-disable-next-line no-console
    console.info(getMetadataDetails())
}
