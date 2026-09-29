const e=`<!-- 消息动作条 | 每条消息下挂一条工具条：复制交给剪贴板；重新生成、编辑重发、切换分支、失败重试与截断续写各是会话容器 createThreadStore 上的一个方法，界面只照快照渲染 -->
<div style="display: grid; gap: 12px; inline-size: 100%">
  <xh-message-feed id="message-feed-actions">
    <div data-xh-part="root" style="block-size: 360px">
      <div data-xh-part="viewport">
        <div data-xh-part="list" id="message-feed-actions-list"></div>
        <span data-xh-part="pending-indicator"></span>
      </div>
    </div>
  </xh-message-feed>

  <div style="display: flex; flex-wrap: wrap; gap: 8px">
    <xh-button id="message-feed-actions-ask">
      <button data-xh-part="root">追问一句</button>
    </xh-button>
    <xh-button id="message-feed-actions-stop" variant="outline">
      <button data-xh-part="root">停止</button>
    </xh-button>
    <xh-button id="message-feed-actions-fail" variant="ghost">
      <button data-xh-part="root">让下一轮失败</button>
    </xh-button>
  </div>
</div>

<script type="module">
  import { asBlockKey, createThreadStore } from "@xihan-ui/chat-stream";
  import {
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CopyIcon,
    PencilIcon,
    PlayIcon,
    RefreshIcon,
    RotateRightIcon,
  } from "@xihan-ui/icons";

  function textOf(message) {
    return message.parts.map(part => (part.type === "text" ? part.text : "")).join("");
  }
  function errorOf(message) {
    return message.parts.map(part => (part.type === "error" ? part.errorText : "")).join("");
  }

  // 演示用的传输：按提问拼一段回复逐字吐出。接真实后端时换成 createHttpSseTransport，
  // 请求里的 trigger 与 messageId 告诉服务端这一轮是新提问、重新生成、重试、编辑还是续写
  const drafts = [
    q => \`关于「\${q}」：先确认范围，再列出依赖，最后逐项核对，每一步做完都留一条记录。\`,
    q => \`换个角度看「\${q}」：把不确定的部分先问清楚，其余照清单推进，卡住就回到第一步。\`,
    q => \`简短版：围绕「\${q}」，先做最小可行的那一步，再按反馈补齐。\`,
  ];
  // 每条回复本该写完的全文：续写从截断处接着吐
  const fullText = new Map([["a1", "发布前冻结改动、跑完回归，发布后盯住告警。"]]);
  let replies = 0;
  let failNext = false;

  function wait(ms, signal) {
    return new Promise((resolve) => {
      const timer = window.setTimeout(resolve, ms);
      // 取消时不抛：传输按约定自己收手，结束方式由会话容器记为 aborted
      signal.addEventListener("abort", () => {
        window.clearTimeout(timer);
        resolve();
      }, { once: true });
    });
  }

  const transport = {
    async* stream(request, signal) {
      await wait(400, signal);
      if (signal.aborted)
        return;
      if (failNext) {
        failNext = false;
        yield { kind: "error", errorText: "网络中断，这一轮没有完成。", receivedTime: Date.now() };
        return;
      }
      const last = request.messages[request.messages.length - 1];
      let text;
      if (request.trigger === "continue") {
        text = (fullText.get(last.id) ?? "").slice(textOf(last).length);
      }
      else {
        replies += 1;
        const id = \`reply-\${replies}\`;
        text = drafts[(replies - 1) % drafts.length](textOf(last));
        fullText.set(id, text);
        yield { kind: "message-start", messageId: id, role: "assistant", receivedTime: Date.now() };
      }
      const block = asBlockKey("text");
      yield { kind: "text-start", block, receivedTime: Date.now() };
      for (let i = 0; i < text.length; i += 2) {
        await wait(80, signal);
        if (signal.aborted)
          return;
        yield { kind: "text-delta", block, delta: text.slice(i, i + 2), receivedTime: Date.now() };
      }
      yield { kind: "text-end", block, receivedTime: Date.now() };
      yield { kind: "finish", receivedTime: Date.now() };
    },
  };

  const store = createThreadStore({
    transport,
    messages: [
      { id: "q1", role: "user", parts: [{ type: "text", text: "怎么准备一次发布？" }] },
      { id: "a1", role: "assistant", status: "complete", parts: [{ type: "text", text: "发布前冻结改动、跑完回归，发布后盯住告警。" }] },
    ],
  });

  const feed = document.getElementById("message-feed-actions");
  const list = document.getElementById("message-feed-actions-list");
  const ask = document.getElementById("message-feed-actions-ask");
  const stop = document.getElementById("message-feed-actions-stop");
  const fail = document.getElementById("message-feed-actions-fail");

  // 正在改写的那条提问：改写的那条留在原位，新写法成为同一位置上的另一个分支
  let editing = null;

  // 图标记录是对象，只能经 icon 属性交给元素，图元铺进 glyph 空壳
  function icon(record) {
    const el = document.createElement("xh-icon");
    el.innerHTML = '<svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>';
    el.icon = record;
    return el;
  }

  // 工具条条目：禁用写 aria-disabled，仍可聚焦、方向键照常走到，点击由这里拦下
  function item(value, content, onClick, disabled = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("data-xh-part", "item");
    button.setAttribute("value", value);
    if (disabled)
      button.setAttribute("aria-disabled", "true");
    button.append(...content);
    button.addEventListener("click", () => {
      if (button.getAttribute("aria-disabled") !== "true")
        onClick();
    });
    return button;
  }

  // 分支切换钮只有图标，名字写在 aria-label 上；左右箭头随书写方向翻转
  function branchItem(value, record, name, onClick, disabled) {
    const glyph = icon(record);
    glyph.firstElementChild.style.scale = "var(--xh-direction-sign) 1";
    const button = item(value, [glyph], onClick, disabled);
    button.setAttribute("aria-label", name);
    return button;
  }

  // 复制交给剪贴板元素，它自带复制钮与「已复制」回落。
  // 两个宿主各接各的角色节点：复制钮归剪贴板管，排在工具条前面，不进工具条的方向键序列
  function clipboard(text) {
    const el = document.createElement("xh-clipboard");
    el.setAttribute("value", text);
    el.setAttribute("size", "sm");
    el.setAttribute("variant", "ghost");
    el.innerHTML = '<div data-xh-part="root"><button data-xh-part="copy-trigger">'
      + '<span data-xh-part="indicator"></span><span data-xh-part="indicator" copied></span>'
      + "</button></div>";
    const [idle, copied] = el.querySelectorAll('[data-xh-part="indicator"]');
    idle.append(icon(CopyIcon), " 复制");
    copied.append(icon(CheckIcon), " 已复制");
    return el;
  }

  function editor(message) {
    const form = document.createElement("div");
    form.style.cssText = "display: grid; gap: 8px";
    form.innerHTML = \`<xh-text-field>
      <div data-xh-part="root">
        <label data-xh-part="label">改写这条提问</label>
        <div data-xh-part="control"><input data-xh-part="input" /></div>
      </div>
    </xh-text-field>
    <div style="display: flex; gap: 8px">
      <xh-button size="sm"><button data-xh-part="root">发送</button></xh-button>
      <xh-button size="sm" variant="ghost"><button data-xh-part="root">取消</button></xh-button>
    </div>\`;
    let draft = textOf(message);
    const field = form.querySelector("xh-text-field");
    field.setAttribute("default-value", draft);
    field.addEventListener("value-change", (event) => {
      draft = event.detail.value;
    });
    const [send, cancel] = form.querySelectorAll("xh-button");
    send.addEventListener("click", () => {
      editing = null;
      if (draft.trim() !== "")
        store.edit(message.id, draft.trim());
      render();
    });
    cancel.addEventListener("click", () => {
      editing = null;
      render();
    });
    return form;
  }

  function actions(message, { running, last, branch }) {
    const items = [];
    if (message.role === "assistant" && message.status !== "error")
      items.push(item("regenerate", [icon(RefreshIcon), " 重新生成"], () => store.regenerate(message.id), running));
    if (message.role === "user") {
      items.push(item("edit", [icon(PencilIcon), " 编辑"], () => {
        editing = message.id;
        render();
      }, running));
    }
    if (message.status === "error" && last)
      items.push(item("retry", [icon(RotateRightIcon), " 重试"], () => store.retry()));
    if (message.status === "aborted" && last)
      items.push(item("continue", [icon(PlayIcon), " 续写"], () => store.continue(message.id)));
    // 分支切换：同一位置上有几条候选，就能在它们之间来回换
    if ((branch?.count ?? 1) > 1) {
      const position = document.createElement("span");
      position.textContent = \`\${branch.index + 1} / \${branch.count}\`;
      items.push(
        branchItem("previous", ChevronLeftIcon, "上一个版本", () => store.selectBranch(message.id, branch.index - 1), running || branch.index === 0),
        position,
        branchItem("next", ChevronRightIcon, "下一个版本", () => store.selectBranch(message.id, branch.index + 1), running || branch.index === branch.count - 1),
      );
    }

    const row = document.createElement("div");
    row.style.cssText = "display: flex; flex-wrap: wrap; align-items: center; gap: 4px";
    if (message.role === "assistant" && textOf(message) !== "")
      row.append(clipboard(textOf(message)));
    if (items.length > 0) {
      const toolbar = document.createElement("xh-toolbar");
      toolbar.setAttribute("size", "sm");
      const root = document.createElement("div");
      root.setAttribute("data-xh-part", "root");
      root.setAttribute("aria-label", message.role === "user" ? "提问操作" : "回复操作");
      root.append(...items);
      toolbar.append(root);
      row.append(toolbar);
    }
    return row;
  }

  function paint(node, message, state) {
    node.setAttribute("item-role", message.role === "user" ? "user" : "assistant");
    node.toggleAttribute("item-streaming", message.status === "streaming");
    const label = document.createElement("span");
    label.setAttribute("data-xh-part", "item-label");
    label.textContent = message.role === "user" ? "我" : "助手";
    if (editing === message.id) {
      node.replaceChildren(label, editor(message));
      return;
    }
    const content = document.createElement("div");
    content.textContent = textOf(message);
    const parts = [label, content];
    if (message.status === "error" || message.status === "aborted") {
      const note = document.createElement("div");
      note.textContent = message.status === "error" ? errorOf(message) : "（已停止）";
      parts.push(note);
    }
    // 动作条只在这条写完之后出现：生成中的那条没有可操作的内容
    if (message.status !== "streaming")
      parts.push(actions(message, state));
    node.replaceChildren(...parts);
  }

  // 条目按消息 id 留着，只重画快照里变了的那几条：流式输出时别的条目连同焦点原地不动
  const views = new Map();

  function render() {
    // 示例被移出文档就收手：退订并释放会话容器
    if (!feed.isConnected) {
      unsubscribe();
      store.dispose();
      return;
    }
    const snapshot = store.getSnapshot();
    const running = snapshot.status === "submitted" || snapshot.status === "streaming";
    feed.setAttribute("count", String(snapshot.messages.length));
    feed.setAttribute("status", snapshot.status);

    const nodes = snapshot.messages.map((message, index) => {
      const state = { running, last: index === snapshot.messages.length - 1, branch: snapshot.branches[message.id] };
      const key = JSON.stringify([message.status, textOf(message), errorOf(message), state, editing === message.id]);
      let view = views.get(message.id);
      if (!view) {
        view = { node: document.createElement("article"), key: "" };
        view.node.setAttribute("data-xh-part", "item");
        view.node.setAttribute("item-id", message.id);
        views.set(message.id, view);
      }
      view.node.setAttribute("item-index", String(index));
      if (view.key !== key) {
        view.key = key;
        paint(view.node, message, state);
      }
      return view.node;
    });
    // 按快照的顺序落位：已在位的节点不挪，新条目插进去，离开当前路径的摘掉
    nodes.forEach((node, index) => {
      if (list.children[index] !== node)
        list.insertBefore(node, list.children[index] ?? null);
    });
    while (list.children.length > nodes.length)
      list.lastElementChild.remove();
    for (const [id, view] of views) {
      if (!nodes.includes(view.node))
        views.delete(id);
    }

    ask.disabled = running;
    stop.disabled = !running;
    fail.disabled = failNext;
    fail.querySelector("button").textContent = failNext ? "下一轮会失败" : "让下一轮失败";
  }

  const unsubscribe = store.subscribe(render);
  render();

  const followUps = ["发布前要冻结哪些改动？", "回滚预案怎么写？"];
  let asked = 0;
  ask.addEventListener("click", () => {
    store.submit(followUps[asked % followUps.length]);
    asked += 1;
  });
  stop.addEventListener("click", () => store.stop());
  fail.addEventListener("click", () => {
    failNext = true;
    render();
  });
<\/script>
`;export{e as default};
