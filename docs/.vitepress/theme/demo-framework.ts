import { ref } from "vue";
// 框架清单与生成器、门禁读同一份：id / 显示名 / 扩展名 / 语法高亮语言
import table from "../../../ui/scripts/demo-frameworks.json";

export interface DemoFramework {
  id: string;
  name: string;
  ext: string;
  lang: string;
}

/** 切换器列出的框架。 */
export const demoFrameworks: DemoFramework[] = table.frameworks;

/** 全站共用一份选择，所有示例跟着同一个值走。 */
export const demoFramework = ref(demoFrameworks[0].id);

// 不出某个框架版本的示例登记在同一份表里，两种粒度：
// 键是目录名、值是结论——整个目录的主语不是元素；
// 键是「目录/基名」、值是 { symbol, reason }——这一份的主语是个在那个框架里没有对应物的名字
type NotApplicable = string | { symbol: string; reason: string };
const notApplicable: Record<string, Record<string, NotApplicable>> = table.notApplicable;

/** 这份示例不出该框架的版本时给出结论；出的话返回 undefined。 */
export function demoNotApplicable(
  frameworkId: string,
  src: string,
): string | undefined {
  const entries = notApplicable[frameworkId];
  const entry = entries?.[src] ?? entries?.[src.split("/")[0]];
  return typeof entry === "string" ? entry : entry?.reason;
}

const STORAGE_KEY = "xh-demo-framework";

// 预渲染读不到 localStorage，首屏一律用默认值，挂载后再校正
export function restoreDemoFramework(): void {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && demoFrameworks.some(framework => framework.id === saved)) {
    demoFramework.value = saved;
  }
}

export function setDemoFramework(id: string): void {
  demoFramework.value = id;
  localStorage.setItem(STORAGE_KEY, id);
}
