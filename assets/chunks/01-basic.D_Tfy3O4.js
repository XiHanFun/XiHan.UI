const n=`<!-- 基础用法 | root 持有状态，control 是那个视觉盒；不传 value 与 visible 即为非受控，明暗由组件自己管，钮里的图标跟着明暗换 -->
<xh-password-input id="password-input-basic" placeholder="请输入密码">
  <div data-xh-part="root">
    <label data-xh-part="label">密码</label>
    <div data-xh-part="control">
      <input data-xh-part="input" style="inline-size: 200px" />
      <!-- 节点留空，大写锁定开着时元素把文字写进来，读屏念的就是这一段 -->
      <span data-xh-part="caps-lock-indicator"></span>
      <!-- 名字由组件按明暗写好；图标只管好看，读屏不念它，遮着时划一道斜杠 -->
      <button data-xh-part="visibility-trigger">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
          <circle cx="12" cy="12" r="3" />
          <path id="password-input-basic-slash" d="M4 4 20 20" />
        </svg>
      </button>
    </div>
  </div>
</xh-password-input>

<script type="module">
  // 文案与图标：文案给组件，图标是作者自己的事，跟着组件报上来的明暗换
  const field = document.getElementById("password-input-basic");
  const slash = document.getElementById("password-input-basic-slash");

  field.translations = { capsLockOn: "大写锁定已打开" };
  field.addEventListener("visibility-change", (event) => {
    slash.setAttribute("d", event.detail.visible ? "" : "M4 4 20 20");
  });
<\/script>
`;export{n as default};
