const t=`<!-- 拖动与贴边 | 按住页面右侧的触发器拖到别处，松手贴到近的那条边；位置按比例记，宿主存下来下次照样落在原处 -->
<p>当前位置：<span id="float-button-draggable-position"></span></p>
<xh-float-button id="float-button-draggable" button-draggable>
  <div data-xh-part="root">
    <button data-xh-part="trigger"></button>
    <div data-xh-part="list">
      <button type="button" aria-label="消息"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg></button>
      <button type="button" aria-label="分享"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51 8.59 10.49"/></svg></button>
    </div>
  </div>
</xh-float-button>

<script type="module">
  // 位置是对象，只走 property：设初值、每次落定写回
  const button = document.getElementById("float-button-draggable");
  const text = document.getElementById("float-button-draggable-position");
  const show = (position) => {
    text.textContent = JSON.stringify(position);
  };
  button.position = { edge: "inline-end", ratio: 0.75 };
  show(button.position);
  button.addEventListener("position-change", (event) => {
    button.position = event.detail.position;
    show(event.detail.position);
  });
<\/script>
`;export{t as default};
