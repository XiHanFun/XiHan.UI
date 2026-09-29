async function u(){const n=[{value:"lilei",label:"李雷",role:"前端",initials:"李"},{value:"hanmeimei",label:"韩梅梅",role:"设计",initials:"韩"},{value:"poly",label:"Poly",role:"后端",initials:"P"}],a=document.getElementById("mention-custom-item"),o=a.querySelector('[data-xh-part="content"]'),s=document.getElementById("mention-custom-item-value");a.translations={content:"提及谁"};function r(e){const t=document.createElement("div");return t.dataset.xhPart="item",t.setAttribute("value",e.value),t.innerHTML=`
      <xh-avatar size="sm">
        <span data-xh-part="root">
          <span data-xh-part="fallback">${e.initials}</span>
        </span>
      </xh-avatar>
      <span data-xh-part="item-text">${e.label}</span>
      <span style="color: var(--xh-fg-subtle); font-size: var(--xh-font-size-xs)">
        ${e.role}
      </span>
    `,t}function l(e){const t=(e??"").trim().toLowerCase(),c=t===""?n:n.filter(i=>i.value.includes(t)||i.label.toLowerCase().includes(t));o.replaceChildren(...c.map(r))}l(""),a.addEventListener("query-change",e=>l(e.detail.query)),a.addEventListener("value-change",e=>{s.textContent=e.detail.value||"（空）"})}export{u as default};
