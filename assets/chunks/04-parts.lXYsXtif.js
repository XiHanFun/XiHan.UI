const n=`<!-- 手写部件 | 逐部件自己写，标签里就能塞头像、计数这类自带内容，摘除钮照旧归 cell 管；产出的结构与只交数据那一份完全一致，Tab 位与键盘也一样 -->
<xh-tag-group
  id="tag-group-parts"
  selection-mode="multiple"
  variant="outline"
  deletable
>
  <div data-xh-part="root">
    <span data-xh-part="label">协作成员</span>
    <div data-xh-part="list">
      <span data-xh-part="item" value="zhang">
        <span data-xh-part="cell">
          <!-- 首字头像只是装饰，连打检索取的是 item-text 里那几个字 -->
          <span
            aria-hidden="true"
            style="
              display: inline-flex;
              align-items: center;
              justify-content: center;
              inline-size: 16px;
              block-size: 16px;
              border-radius: 50%;
              background: var(--xh-bg-subtle);
              font-size: var(--xh-font-size-xs);
            "
            >张</span
          >
          <span data-xh-part="item-text">张三</span>
          <span aria-hidden="true" style="color: var(--xh-fg-muted)">3</span>
          <button data-xh-part="item-delete-trigger"></button>
        </span>
      </span>
      <span data-xh-part="item" value="li">
        <span data-xh-part="cell">
          <span
            aria-hidden="true"
            style="
              display: inline-flex;
              align-items: center;
              justify-content: center;
              inline-size: 16px;
              block-size: 16px;
              border-radius: 50%;
              background: var(--xh-bg-subtle);
              font-size: var(--xh-font-size-xs);
            "
            >李</span
          >
          <span data-xh-part="item-text">李四</span>
          <span aria-hidden="true" style="color: var(--xh-fg-muted)">8</span>
          <button data-xh-part="item-delete-trigger"></button>
        </span>
      </span>
      <span data-xh-part="item" value="wang">
        <span data-xh-part="cell">
          <span
            aria-hidden="true"
            style="
              display: inline-flex;
              align-items: center;
              justify-content: center;
              inline-size: 16px;
              block-size: 16px;
              border-radius: 50%;
              background: var(--xh-bg-subtle);
              font-size: var(--xh-font-size-xs);
            "
            >王</span
          >
          <span data-xh-part="item-text">王五</span>
          <span aria-hidden="true" style="color: var(--xh-fg-muted)">0</span>
          <button data-xh-part="item-delete-trigger"></button>
        </span>
      </span>
    </div>
  </div>
</xh-tag-group>
<p>已选：<span id="tag-group-parts-value">li</span></p>

<script type="module">
  const group = document.getElementById("tag-group-parts");
  const readout = document.getElementById("tag-group-parts-value");

  group.value = ["li"];

  group.addEventListener("value-change", (event) => {
    group.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });

  // 条目的去留归宿主：元素只报「用户要摘这一枚」，节点由这里摘掉
  group.addEventListener("item-delete", (event) => {
    group.querySelector(\`[data-xh-part="item"][value="\${event.detail.value}"]\`)?.remove();
  });
<\/script>
`;export{n as default};
