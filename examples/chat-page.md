来源：https://ui.docs.xihanfun.com/examples/chat-page

# 对话页

一条助手回复里同时摆着思考过程、工具调用、流式正文、代码块与批准闸门，外面是消息流与提示输入框。

```vue
<script setup lang="ts">
import type { ApprovalScope, MarkdownBlock } from "@xihan-ui/headless";
import { createStreamRenderer } from "@xihan-ui/markdown";
import {
  XhApprovalApproveTrigger,
  XhApprovalDenyTrigger,
  XhApprovalDescription,
  XhApprovalFooter,
  XhApprovalGroup,
  XhApprovalItem,
  XhApprovalItemIndicator,
  XhApprovalItemText,
  XhApprovalLiveRegion,
  XhApprovalResult,
  XhApprovalRoot,
  XhApprovalTitle,
  XhAvatarFallback,
  XhAvatarRoot,
  XhCodeViewCode,
  XhCodeViewFilename,
  XhCodeViewHeader,
  XhCodeViewLangLabel,
  XhCodeViewPre,
  XhCodeViewRoot,
  XhMarkdownStreamContent,
  XhMarkdownStreamRoot,
  XhMessageFeedItem,
  XhMessageFeedItemLabel,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedScrollToEndTrigger,
  XhMessageFeedViewport,
  XhPromptInputInput,
  XhPromptInputRoot,
  XhPromptInputSubmitTrigger,
  XhReasoningContent,
  XhReasoningIndicator,
  XhReasoningLabel,
  XhReasoningRoot,
  XhReasoningTrigger,
  XhTagLabel,
  XhTagRoot,
  XhToolCallContent,
  XhToolCallIndicator,
  XhToolCallLabel,
  XhToolCallOutput,
  XhToolCallRoot,
  XhToolCallStatus,
  XhToolCallTrigger,
} from "@xihan-ui/vue";
import { ref, shallowRef } from "vue";

const answer = `按你给的约束，改动落在**一个文件**里：

- 事件仍从内核发出，视图不新增状态
- 退场那一档交给动效令牌，组件里不写时长
`;

// 渲染器有状态，一个实例只喂同一条消息的全文
const renderer = createStreamRenderer();
const blocks = shallowRef<readonly MarkdownBlock[]>(
  renderer.render(answer, { ended: true }) as readonly MarkdownBlock[],
);

const patch = `export function onClose(reason: CloseReason) {
  if (reason === "escape") return restoreFocus()
  return dismiss()
}`;

const scopes: ApprovalScope[] = [
  { value: "read", label: "读 src/ 下的文件", required: true },
  { value: "write", label: "把这段改动写回去" },
];

const decision = ref("");
const asked = ref<string[]>([]);

// 提示输入框收下的话直接追加到问题列表，不接真实模型
function onSubmit({ value }: { value: string }): void {
  asked.value = [...asked.value, value];
}
</script>

<template>
  <div class="chat-page">
    <XhMessageFeedRoot :count="2 + asked.length" class="chat-page__feed">
      <XhMessageFeedViewport>
        <XhMessageFeedList>
          <XhMessageFeedItem item-id="q1" :item-index="0" item-role="user">
            <XhMessageFeedItemLabel>
              <span class="chat-page__who">
                <XhAvatarRoot size="sm">
                  <XhAvatarFallback>我</XhAvatarFallback>
                </XhAvatarRoot>
                我
              </span>
            </XhMessageFeedItemLabel>
            <p class="chat-page__text">关掉浮层时焦点要还给触发器，这条改动动了哪些地方？</p>
          </XhMessageFeedItem>

          <XhMessageFeedItem item-id="a1" :item-index="1" item-role="assistant">
            <XhMessageFeedItemLabel>
              <span class="chat-page__who">
                <XhAvatarRoot size="sm">
                  <XhAvatarFallback>曦</XhAvatarFallback>
                </XhAvatarRoot>
                助手
                <XhTagRoot size="sm" variant="subtle">
                  <XhTagLabel>已完成</XhTagLabel>
                </XhTagRoot>
              </span>
            </XhMessageFeedItemLabel>

            <div class="chat-page__answer">
              <!-- 想完了：给了起止时刻，名字位自己写成「想了几秒」 -->
              <XhReasoningRoot
                :start-time="0"
                :end-time="2400"
                :translations="{ label: '思考过程', thoughtFor: '想了 {seconds} 秒' }"
              >
                <XhReasoningTrigger>
                  <XhReasoningIndicator />
                  <XhReasoningLabel />
                </XhReasoningTrigger>
                <XhReasoningContent>
                  先确认约束：只读一次文件、不改公开面。再看还焦点这条走的是哪个通路。
                </XhReasoningContent>
              </XhReasoningRoot>

              <XhToolCallRoot phase="output-available">
                <XhToolCallTrigger>
                  <XhToolCallIndicator>&rsaquo;</XhToolCallIndicator>
                  <XhToolCallLabel>grep</XhToolCallLabel>
                  <XhToolCallStatus />
                </XhToolCallTrigger>
                <XhToolCallContent>
                  <XhToolCallOutput>命中 3 处：dialog、drawer、popover 各一处还焦点。</XhToolCallOutput>
                </XhToolCallContent>
              </XhToolCallRoot>

              <XhMarkdownStreamRoot :blocks="blocks">
                <XhMarkdownStreamContent />
              </XhMarkdownStreamRoot>

              <XhCodeViewRoot :code="patch" lang="typescript" filename="on-close.ts" complete>
                <XhCodeViewHeader>
                  <XhCodeViewFilename />
                  <XhCodeViewLangLabel />
                </XhCodeViewHeader>
                <XhCodeViewPre>
                  <XhCodeViewCode />
                </XhCodeViewPre>
              </XhCodeViewRoot>

              <!-- 闸门常驻在回复末尾：必选项没勾满就批不了 -->
              <XhApprovalRoot
                v-slot="{ status }"
                :scopes="scopes"
                tone="warning"
                @decision="decision = $event.decision === 'approved' ? '已批准' : '已拒绝'"
              >
                <XhApprovalTitle>要动你的工作区</XhApprovalTitle>
                <XhApprovalDescription>写回前先确认这两条范围。</XhApprovalDescription>
                <XhApprovalGroup>
                  <XhApprovalItem
                    v-for="scope in scopes"
                    :key="scope.value"
                    :scope-value="scope.value"
                    :scope-label="scope.label"
                    :scope-required="scope.required"
                  >
                    <XhApprovalItemIndicator :scope-value="scope.value" />
                    <XhApprovalItemText :scope-value="scope.value">{{ scope.label }}</XhApprovalItemText>
                  </XhApprovalItem>
                </XhApprovalGroup>
                <XhApprovalResult>{{ status === "approved" ? "已批准" : "已拒绝" }}</XhApprovalResult>
                <XhApprovalFooter>
                  <XhApprovalApproveTrigger>批准</XhApprovalApproveTrigger>
                  <XhApprovalDenyTrigger>拒绝</XhApprovalDenyTrigger>
                </XhApprovalFooter>
                <XhApprovalLiveRegion />
              </XhApprovalRoot>
            </div>
          </XhMessageFeedItem>

          <XhMessageFeedItem
            v-for="(question, index) in asked"
            :key="question"
            :item-id="`q${index + 2}`"
            :item-index="index + 2"
            item-role="user"
          >
            <XhMessageFeedItemLabel>
              <span class="chat-page__who">
                <XhAvatarRoot size="sm">
                  <XhAvatarFallback>我</XhAvatarFallback>
                </XhAvatarRoot>
                我
              </span>
            </XhMessageFeedItemLabel>
            <p class="chat-page__text">{{ question }}</p>
          </XhMessageFeedItem>
        </XhMessageFeedList>
      </XhMessageFeedViewport>
      <XhMessageFeedScrollToEndTrigger />
    </XhMessageFeedRoot>

    <XhPromptInputRoot :translations="{ input: '接着问点什么' }" @submit="onSubmit">
      <XhPromptInputInput rows="1" placeholder="接着问点什么…" />
      <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
    </XhPromptInputRoot>

    <p v-if="decision" class="chat-page__note">批准闸门：{{ decision }}</p>
  </div>
</template>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  gap: var(--xh-space-3);
  inline-size: 100%;
  block-size: 520px;
}

.chat-page__feed {
  flex: 1;
  min-block-size: 0;
}

.chat-page__who {
  display: inline-flex;
  align-items: center;
  gap: var(--xh-space-2);
}

.chat-page__text {
  margin: 0;
}

/* 一条回复里的五件东西竖着排，节奏由同一个间距档定 */
.chat-page__answer {
  display: flex;
  flex-direction: column;
  gap: var(--xh-space-3);
}

.chat-page__note {
  margin: 0;
  color: var(--xh-fg-muted);
  font-size: var(--xh-font-size-sm);
}
</style>
```

```html
<div
  id="chat-page"
  style="
    display: flex;
    flex-direction: column;
    gap: var(--xh-space-3);
    inline-size: 100%;
    block-size: 520px;
  "
>
  <xh-message-feed id="chat-page-feed" count="2" style="flex: 1; min-block-size: 0">
    <!-- 宿主是消息流那一格，滚动发生在它里面：根节点得撑满这一格，视口才有可滚的余量 -->
    <div data-xh-part="root" style="block-size: 100%">
      <div data-xh-part="viewport">
        <div data-xh-part="list">
          <article data-xh-part="item" item-id="q1" item-index="0" item-role="user">
            <span data-xh-part="item-label">
              <span style="display: inline-flex; align-items: center; gap: var(--xh-space-2)">
                <xh-avatar size="sm">
                  <span data-xh-part="root">
                    <span data-xh-part="fallback">我</span>
                  </span>
                </xh-avatar>
                我
              </span>
            </span>
            <p style="margin: 0">关掉浮层时焦点要还给触发器，这条改动动了哪些地方？</p>
          </article>

          <article data-xh-part="item" item-id="a1" item-index="1" item-role="assistant">
            <span data-xh-part="item-label">
              <span style="display: inline-flex; align-items: center; gap: var(--xh-space-2)">
                <xh-avatar size="sm">
                  <span data-xh-part="root">
                    <span data-xh-part="fallback">曦</span>
                  </span>
                </xh-avatar>
                助手
                <xh-tag size="sm" variant="subtle">
                  <span data-xh-part="root">
                    <span data-xh-part="label">已完成</span>
                  </span>
                </xh-tag>
              </span>
            </span>

            <!-- 一条回复里的五件东西竖着排，节奏由同一个间距档定 -->
            <div style="display: flex; flex-direction: column; gap: var(--xh-space-3)">
              <!-- 想完了：给了起止时刻，名字位自己写成「想了几秒」 -->
              <xh-reasoning id="chat-page-reasoning" start-time="0" end-time="2400">
                <div data-xh-part="root">
                  <button data-xh-part="trigger">
                    <span data-xh-part="indicator"></span>
                    <span data-xh-part="label">思考过程</span>
                  </button>
                  <div data-xh-part="content">
                    先确认约束：只读一次文件、不改公开面。再看还焦点这条走的是哪个通路。
                  </div>
                </div>
              </xh-reasoning>

              <xh-tool-call phase="output-available">
                <div data-xh-part="root">
                  <button data-xh-part="trigger">
                    <span data-xh-part="indicator"></span>
                    <span data-xh-part="label">grep</span>
                    <span data-xh-part="status"></span>
                  </button>
                  <div data-xh-part="content">
                    <div data-xh-part="output">
                      命中 3 处：dialog、drawer、popover 各一处还焦点。
                    </div>
                  </div>
                </div>
              </xh-tool-call>

              <xh-markdown-stream id="chat-page-stream" style="inline-size: 100%">
                <div data-xh-part="root">
                  <div data-xh-part="content"></div>
                </div>
              </xh-markdown-stream>

              <xh-code-view
                id="chat-page-code"
                code-lang="typescript"
                filename="on-close.ts"
                complete
                style="inline-size: 100%"
              >
                <div data-xh-part="root">
                  <div data-xh-part="header">
                    <span data-xh-part="filename">on-close.ts</span>
                    <span data-xh-part="lang-label">typescript</span>
                  </div>
                  <!-- 行由元素铺；这里写的原文是 JS 到达之前的样子 -->
                  <pre data-xh-part="pre"><code data-xh-part="code">export function onClose(reason: CloseReason) {
  if (reason === "escape") return restoreFocus()
  return dismiss()
}</code></pre>
                </div>
              </xh-code-view>

              <!-- 闸门常驻在回复末尾：必选项没勾满就批不了 -->
              <xh-approval id="chat-page-approval" tone="warning">
                <div data-xh-part="root">
                  <h3 data-xh-part="title">要动你的工作区</h3>
                  <p data-xh-part="description">写回前先确认这两条范围。</p>
                  <div data-xh-part="group">
                    <div
                      data-xh-part="item"
                      scope-value="read"
                      scope-label="读 src/ 下的文件"
                      scope-required
                    >
                      <span data-xh-part="item-indicator" scope-value="read"></span>
                      <span data-xh-part="item-text" scope-value="read">读 src/ 下的文件</span>
                    </div>
                    <div data-xh-part="item" scope-value="write" scope-label="把这段改动写回去">
                      <span data-xh-part="item-indicator" scope-value="write"></span>
                      <span data-xh-part="item-text" scope-value="write">把这段改动写回去</span>
                    </div>
                  </div>
                  <!-- 升级前先自己收起：属性由连接层接管，判定落定后自动撤掉 -->
                  <div data-xh-part="result" hidden></div>
                  <div data-xh-part="footer">
                    <button data-xh-part="approve-trigger">批准</button>
                    <button data-xh-part="deny-trigger">拒绝</button>
                  </div>
                  <div data-xh-part="live-region"></div>
                </div>
              </xh-approval>
            </div>
          </article>
        </div>
      </div>
      <button data-xh-part="scroll-to-end-trigger">↓</button>
    </div>
  </xh-message-feed>

  <xh-prompt-input id="chat-page-input">
    <div data-xh-part="root">
      <textarea data-xh-part="input" rows="1" placeholder="接着问点什么…"></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-prompt-input>

  <p
    id="chat-page-note"
    hidden
    style="margin: 0; color: var(--xh-fg-muted); font-size: var(--xh-font-size-sm)"
  ></p>
</div>

<script type="module">
  const stage = document.getElementById("chat-page");
  const feed = stage.querySelector("#chat-page-feed");
  // 角色节点的 id 归元素所有（可及关系靠它接线），作者要认这些节点只能按部件名取
  const list = feed.querySelector('[data-xh-part="list"]');
  const reasoning = stage.querySelector("#chat-page-reasoning");
  const stream = stage.querySelector("#chat-page-stream");
  const codeView = stage.querySelector("#chat-page-code");
  const approval = stage.querySelector("#chat-page-approval");
  const result = approval.querySelector('[data-xh-part="result"]');
  const input = stage.querySelector("#chat-page-input");
  const note = stage.querySelector("#chat-page-note");

  // 文案是对象，只走 property；{seconds} 由元素代入
  reasoning.translations = { label: "思考过程", thoughtFor: "想了 {seconds} 秒" };
  // 状态文案由元素算好，作者把它写进名字位
  reasoning.querySelector('[data-xh-part="label"]').textContent = reasoning.statusText;

  // 正文是一串已渲好的块，只走 property；真实应用里这份数组来自
  // @xihan-ui/markdown 的 createStreamRenderer().render(全文)，这份示例没有打包器，直接写它的产出
  stream.blocks = [
    {
      key: "0:a",
      kind: "markdown",
      html: "<p>按你给的约束，改动落在<strong>一个文件</strong>里：</p>",
      complete: true,
    },
    {
      key: "1:b",
      kind: "markdown",
      html: "<ul>\n<li>事件仍从内核发出，视图不新增状态</li>\n<li>退场那一档交给动效令牌，组件里不写时长</li>\n</ul>",
      complete: true,
    },
  ];

  codeView.code = `export function onClose(reason: CloseReason) {
  if (reason === "escape") return restoreFocus()
  return dismiss()
}`;

  // 授权项是数组，只走 property
  approval.scopes = [
    { value: "read", label: "读 src/ 下的文件", required: true },
    { value: "write", label: "把这段改动写回去" },
  ];

  approval.addEventListener("decision", (event) => {
    const decided = event.detail.decision === "approved" ? "已批准" : "已拒绝";
    result.textContent = decided;
    note.textContent = `批准闸门：${decided}`;
    note.hidden = false;
  });

  input.translations = { input: "接着问点什么" };

  // 提示输入框收下的话直接追加成一条消息，不接真实模型
  let count = 2;
  input.addEventListener("submit", (event) => {
    const item = document.createElement("article");
    item.setAttribute("data-xh-part", "item");
    item.setAttribute("item-id", `q${count}`);
    item.setAttribute("item-index", String(count));
    item.setAttribute("item-role", "user");

    const label = document.createElement("span");
    label.setAttribute("data-xh-part", "item-label");
    label.innerHTML = `<span style="display: inline-flex; align-items: center; gap: var(--xh-space-2)">
      <xh-avatar size="sm"><span data-xh-part="root"><span data-xh-part="fallback">我</span></span></xh-avatar>
      我
    </span>`;
    const text = document.createElement("p");
    text.style.margin = "0";
    text.textContent = event.detail.value;

    item.append(label, text);
    list.append(item);
    count += 1;
    feed.setAttribute("count", String(count));
  });
</script>
```

## 这一屏定了什么

- **一条消息是一个容器，里面爱放几件放几件。** [消息流](../components/message-feed)只管集合语义、粘底跟随与那一个播报区；气泡、头像、时间、回复内部的结构全由你写。
- **五件东西共用一个间距档。** 思考过程、工具调用、正文、代码块、闸门竖着排，彼此的空隙是同一个值——这一档不统一，一条回复就会看着像五张卡片拼起来的。
- **闸门不藏进折叠里。** [审批](../components/approval)常驻在回复末尾：必选范围没勾满就批不了，勾选与判定是原子的，不存在「已批准但范围还没同步」的窗口。
- **状态由数据说了算。** 思考过程给了起止时刻就自己显示「想了几秒」，[工具调用](../components/tool-call)按阶段换状态文案，[代码视图](../components/code-view)标了 `complete` 才放心着色——组件不猜，宿主给什么它显示什么。
- **发送键原位变停止。** [提示输入框](../components/prompt-input)在生成期间把提交键换成停止，输入框仍可编辑：用户还要能改下一句。

## 换成你的项目

- 正文走[流式 Markdown](../runtime/markdown)：渲染器是有状态的，一个实例只喂同一条消息的全文。
- 不分条、只往下追加的输出（构建日志、命令回显）用[日志](../components/log)，它和消息流一样粘底，但不承担会话语义。
- 消息条目上有 `data-role`，助手与用户两侧的排布差异按它写，不必给两套组件。
