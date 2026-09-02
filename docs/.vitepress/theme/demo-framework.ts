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

const STORAGE_KEY = "xh-demo-framework";

// 预渲染读不到 localStorage，首屏一律用默认值，挂载后再校正
export function restoreDemoFramework(): void {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && demoFrameworks.some((framework) => framework.id === saved)) {
    demoFramework.value = saved;
  }
}

export function setDemoFramework(id: string): void {
  demoFramework.value = id;
  localStorage.setItem(STORAGE_KEY, id);
}
