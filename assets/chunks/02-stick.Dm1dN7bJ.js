const t=`<!-- 粘底与回到底部 | 内容长高时自动跟到底；往上滚一下当场撒手，回到底部按钮随即露出，滚回阈值内又自动粘上 -->
<div style="width: 100%; display: grid; gap: 12px">
  <!-- threshold 是距底多少像素算在底，默认 64 -->
  <xh-thread id="thread-stick" threshold="64">
    <div data-xh-part="root" style="block-size: 220px">
      <div data-xh-part="viewport">
        <div data-xh-part="content" id="thread-stick-content">
          <p style="margin: 0"><strong>用户：</strong>粘底是按什么判的？</p>
          <p style="margin: 0">
            <strong>助手：</strong>按滚动位置离底还差多少像素，差值落在阈值内就算在底。
          </p>
          <p style="margin: 0"><strong>用户：</strong>我自己往上滚一段呢？</p>
          <p style="margin: 0">
            <strong>助手：</strong>当场撒手，此后再长多少都不跟，右下角给你一条回去的路。
          </p>
          <p style="margin: 0"><strong>用户：</strong>滚回去要不要再点一下按钮？</p>
          <p style="margin: 0">
            <strong>助手：</strong>不用，滚进阈值内的那一下自动重新粘上。
          </p>
        </div>
      </div>
      <button data-xh-part="scroll-button">↓ 回到底部</button>
    </div>
  </xh-thread>

  <div>
    <xh-button id="thread-stick-append" variant="solid">
      <button data-xh-part="root">追加一条消息</button>
    </xh-button>
    <span style="margin-inline-start: 12px">
      在底：<span id="thread-stick-at-bottom">是</span> · 粘附：<span
        id="thread-stick-sticking"
        >是</span
      >
    </span>
  </div>
</div>

<script type="module">
  // 追加一条消息，粘底状态回显在后面那行文字里
  const host = document.getElementById("thread-stick");
  const content = document.getElementById("thread-stick-content");
  const atBottom = document.getElementById("thread-stick-at-bottom");
  const sticking = document.getElementById("thread-stick-sticking");
  let nextId = 6;

  document.getElementById("thread-stick-append").addEventListener("click", () => {
    nextId += 1;
    const line = document.createElement("p");
    line.style.margin = "0";
    const role = document.createElement("strong");
    role.textContent = "助手：";
    line.append(role, \`第 \${nextId} 条 · 粘着就跟到底，撒手了就停在原处等你回来。\`);
    content.append(line);
  });

  host.addEventListener("stick-change", (event) => {
    atBottom.textContent = event.detail.atBottom ? "是" : "否";
    sticking.textContent = event.detail.sticking ? "是" : "否";
  });
<\/script>
`;export{t as default};
