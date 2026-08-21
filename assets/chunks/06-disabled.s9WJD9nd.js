const t=`<!-- 禁用 | disabled 只关掉卡片本身，触发器照样可点、可聚焦，也照样进不了展开等待 -->
<div style="display: flex; align-items: center; gap: 16px">
  <xh-hover-card id="hover-card-disabled" disabled placement="bottom-start" open-delay="0">
    <div data-xh-part="root">
      <button data-xh-part="trigger">@xihan（卡片已关）</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="arrow"></div>
          <span>这张卡片不会出现。</span>
        </div>
      </div>
    </div>
  </xh-hover-card>
  <span>已点 <span id="hover-card-disabled-count">0</span> 次</span>
</div>

<script type="module">
  // 触发器照样可点，计数落在后面那行文字上
  const card = document.getElementById("hover-card-disabled");
  const trigger = card.querySelector('[data-xh-part="trigger"]');
  const readout = document.getElementById("hover-card-disabled-count");
  let count = 0;
  trigger.addEventListener("click", () => {
    count += 1;
    readout.textContent = String(count);
  });
<\/script>
`;export{t as default};
