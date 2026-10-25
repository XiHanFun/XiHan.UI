// 改过名的子路径：旧路径保留一个大版本。build（emit-entries.mjs）照新文件在 dist/css/ 下出一份带弃用说明的副本，
// package.json 的旧键指向它；check-style-entries 认这张表，旧键不算「指向不存在的源文件」。
// 到期（removeIn 那个大版本）整条删掉，连同 package.json 里的旧键。

/** 旧文件名 → 新文件名与弃用说明。都是 css/ 下的文件名。 */
export const DEPRECATED_SUBPATHS = {
  'undefined.css': {
    target: 'not-defined.css',
    removeIn: '6.0.0',
    reason: '文件名取自它选中的 :not(:defined)，旧名容易被当成生成器把 undefined 写进了文件名',
  },
}

/** 副本开头的那行注释：在 node_modules 或 devtools 里翻到旧路径的人一眼看到改去哪。 */
export function deprecationBanner(oldName) {
  const { target, removeIn, reason } = DEPRECATED_SUBPATHS[oldName]
  return `/* 已弃用：@xihan-ui/styles/${oldName} 改名为 @xihan-ui/styles/${target}（${reason}），旧路径 ${removeIn} 移除。内容与新路径相同。 */\n`
}
