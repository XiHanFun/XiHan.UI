const n=`// 多文件 | parseUnifiedPatch 把一份多文件补丁拆成每个文件一份模型；逐份放进折叠面板，标题栏写路径与增删数，差异视图不再写头部，表格直接以路径为名
import type { ReactNode } from "react";
import { diffStats, parseUnifiedPatch } from "@xihan-ui/headless";
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
  XhDiffViewBody,
  XhDiffViewRoot,
  XhDiffViewViewport,
} from "@xihan-ui/react";

const patch = \`diff --git a/src/client.ts b/src/client.ts
--- a/src/client.ts
+++ b/src/client.ts
@@ -1,3 +1,4 @@
 export function createClient(base: string) {
-  return fetchJson(base, { timeout: 5000 })
+  const headers = { accept: "application/json" }
+  return fetchJson(base, { timeout: 30000, headers })
 }
diff --git a/src/retry.ts b/src/retry.ts
--- a/src/retry.ts
+++ b/src/retry.ts
@@ -1,4 +1,4 @@
-export const MAX_RETRIES = 3
+export const MAX_RETRIES = 5
 export function shouldRetry(status: number) {
   return status >= 500
 }
\`;

// git 的补丁路径带 a/ b/ 前缀，展示与作表格名字时去掉
const files = parseUnifiedPatch(patch).map((model) => {
  const path = (model.newPath ?? model.oldPath ?? "").replace(/^[ab]\\//, "");
  return { path, model: { ...model, oldPath: path, newPath: path }, stats: diffStats(model) };
});
const added = files.reduce((sum, file) => sum + file.stats.added, 0);
const removed = files.reduce((sum, file) => sum + file.stats.removed, 0);

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "8px", inlineSize: "100%" }}>
      <span>{\`\${files.length} 个文件，+\${added} −\${removed}\`}</span>
      <XhAccordionRoot multiple defaultValue={files.map(file => file.path)}>
        {files.map(file => (
          <XhAccordionItem key={file.path} value={file.path}>
            <XhAccordionHeader>
              <XhAccordionTrigger>
                <span>{file.path}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>{\`+\${file.stats.added} −\${file.stats.removed}\`}</span>
                  <XhAccordionIndicator />
                </span>
              </XhAccordionTrigger>
            </XhAccordionHeader>
            <XhAccordionContent>
              <XhDiffViewRoot model={file.model}>
                <XhDiffViewViewport>
                  <XhDiffViewBody />
                </XhDiffViewViewport>
              </XhDiffViewRoot>
            </XhAccordionContent>
          </XhAccordionItem>
        ))}
      </XhAccordionRoot>
    </div>
  );
}
`;export{n as default};
