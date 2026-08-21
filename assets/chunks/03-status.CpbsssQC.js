const t=`<!-- 运行态与播报 | status 由宿主持有，组件只把它透出成 data-status；viewport 恒 aria-live="off"，播报只发生在 live-region 里 -->
<div style="width: 100%; display: grid; gap: 12px">
  <xh-thread id="thread-status" status="idle">
    <div data-xh-part="root" style="block-size: 200px">
      <div data-xh-part="viewport">
        <div data-xh-part="content" id="thread-status-content">
          <p style="margin: 0"><strong>用户：</strong>帮我写一段开场白。</p>
        </div>
      </div>
      <div data-xh-part="live-region" id="thread-status-live"></div>
    </div>
  </xh-thread>

  <div>
    <xh-button id="thread-status-run" variant="solid">
      <button data-xh-part="root">跑一轮</button>
    </xh-button>
    <xh-button id="thread-status-fail" variant="outline">
      <button data-xh-part="root">置为 error</button>
    </xh-button>
    <span style="margin-inline-start: 12px">status：<span id="thread-status-readout">idle</span></span>
  </div>
</div>

<script type="module">
  const host = document.getElementById("thread-status");
  const content = document.getElementById("thread-status-content");
  const live = document.getElementById("thread-status-live");
  const readout = document.getElementById("thread-status-readout");
  let timer = 0;

  // 运行态的真源在宿主，组件只负责把它铺成属性
  function setStatus(status) {
    host.setAttribute("status", status);
    readout.textContent = status;
  }

  // 往消息区补一条，返回正文节点以便后续改写
  function append(role, text) {
    const line = document.createElement("p");
    line.style.margin = "0";
    const who = document.createElement("strong");
    who.textContent = \`\${role}：\`;
    const body = document.createTextNode(text);
    line.append(who, body);
    content.append(line);
    return body;
  }

  document.getElementById("thread-status-run").addEventListener("click", () => {
    window.clearTimeout(timer);
    content.replaceChildren();
    append("用户", "帮我写一段开场白。");
    live.textContent = "";
    setStatus("submitted");

    timer = window.setTimeout(() => {
      setStatus("streaming");
      const body = append("助手", "好的，正在往下写…");

      timer = window.setTimeout(() => {
        const text = "好的，这是一段开场白：欢迎来到曦寒设计系统。";
        body.textContent = text;
        setStatus("idle");
        // 播报只写整段最终文本：中途逐字写等于让读屏把同一段话越念越长
        live.textContent = text;
      }, 1200);
    }, 600);
  });

  document.getElementById("thread-status-fail").addEventListener("click", () => {
    setStatus("error");
  });
<\/script>
`;export{t as default};
