const e=`<!-- 行评论 | commentable 在每行正文前给一颗评论钮，点它报出 comment-request；挂在 commentLines 里的行在代码下方铺出评论容器，内容由 comment 插槽写 -->
<script setup lang="ts">
import type { DiffViewCommentRequestDetails, DiffViewLineRef } from "@xihan-ui/headless";
import { computeTextDiff } from "@xihan-ui/headless";
import {
  XhButton,
  XhDiffViewBody,
  XhDiffViewHeader,
  XhDiffViewRoot,
  XhDiffViewSummary,
  XhDiffViewViewport,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const before = \`export function createClient(base: string) {
  return fetchJson(base, { timeout: 5000 })
}\`;
const after = \`export function createClient(base: string, token?: string) {
  const headers = token ? { authorization: token } : {}
  return fetchJson(base, { timeout: 30000, headers })
}\`;
const model = computeTextDiff(before, after);

const keyOf = (ref: DiffViewLineRef): string => \`\${ref.side}:\${ref.line}\`;

// 已有的评论，一行一条
const comments = ref(new Map([["new:3", "超时从 5 秒放到 30 秒，网关那边的超时也要一起改。"]]));
// 正在写的那一条
const draft = ref<DiffViewLineRef | null>(null);
const draftText = ref("");

const commentLines = computed<DiffViewLineRef[]>(() => {
  const lines = [...comments.value.keys()].map((key) => {
    const [side, line] = key.split(":");
    return { side: side as DiffViewLineRef["side"], line: Number(line) };
  });
  if (draft.value && !comments.value.has(keyOf(draft.value)))
    lines.push(draft.value);
  return lines;
});

function request(details: DiffViewCommentRequestDetails): void {
  draft.value = { side: details.side, line: details.line };
  draftText.value = comments.value.get(keyOf(details)) ?? "";
}

function save(): void {
  if (draft.value && draftText.value.trim() !== "")
    comments.value = new Map(comments.value).set(keyOf(draft.value), draftText.value.trim());
  draft.value = null;
}
<\/script>

<template>
  <XhDiffViewRoot :model="model" commentable :comment-lines="commentLines" @comment-request="request">
    <XhDiffViewHeader>
      <span>src/client.ts</span>
      <XhDiffViewSummary change="added" />
      <XhDiffViewSummary change="removed" />
    </XhDiffViewHeader>
    <XhDiffViewViewport>
      <XhDiffViewBody>
        <template #comment="{ side, line }">
          <div v-if="draft && keyOf(draft) === keyOf({ side, line })" style="display: grid; gap: 8px">
            <XhTextFieldRoot v-model:value="draftText">
              <XhTextFieldLabel>{{ side === "old" ? "旧" : "新" }}第 {{ line }} 行的评论</XhTextFieldLabel>
              <XhTextFieldControl>
                <XhTextFieldInput />
              </XhTextFieldControl>
            </XhTextFieldRoot>
            <div style="display: flex; gap: 8px">
              <XhButton size="sm" @click="save">保存</XhButton>
              <XhButton size="sm" variant="ghost" @click="draft = null">取消</XhButton>
            </div>
          </div>
          <template v-else>
            {{ comments.get(keyOf({ side, line })) }}
          </template>
        </template>
      </XhDiffViewBody>
    </XhDiffViewViewport>
  </XhDiffViewRoot>
</template>
`;export{e as default};
