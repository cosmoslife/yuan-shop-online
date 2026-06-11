(function(){
  "use strict";
  // ---------- Catalog ----------
  var PRODUCTS = [
    { id:"dream",   name:"AI 解梦",     icon:"🌙", tagline:"把昨晚那个奇怪的梦说出来", desc:"把梦里奇怪的情节交给 AI，给你一段温柔的解读。", placeholder:"例：梦见自己在屋顶追一只白猫，下面是海。", tags:["梦见被追赶","梦见掉牙","梦见前任","梦见飞起来","梦见考试迟到","梦见蛇"] },
    { id:"fortune", name:"AI 抽签",     icon:"🎋", tagline:"心里想着一个问题",         desc:"心里默念一个问题，从 100 支签里抽一支给你。",   placeholder:"例：最近要不要跳槽？",                      tags:["今日运势","明日运势","本周运势","感情","事业","财运"] },
    { id:"poem",    name:"AI 写诗",     icon:"✒️", tagline:"写一首只属于你的小诗",     desc:"给人 / 事 / 词，写一首只属于你的小诗。",         placeholder:"例：关键词：初夏 / 旧单车 / 她",           tags:["给妈妈写一首","给前任写一首","给自己写一首","关于失眠","关于雨","关于猫"] },
    { id:"name",    name:"AI 起名",     icon:"🪪", tagline:"给小朋友 / 笔名 / 店名",   desc:"为孩子、笔名、店铺、小猫小狗想一个名字。",       placeholder:"例：姓李，男，2024 龙宝宝，希望有山有水",  tags:["男孩","女孩","笔名","店名","小猫","小狗"] },
    { id:"avatar",  name:"AI 头像配文", icon:"🎭", tagline:"一段能当签名的人设文案",   desc:"给你一段适合当签名 / 朋友圈封面的人设文案。",     placeholder:"例：双子座 / 爱喝冰美式 / 程序员",         tags:["社恐型","松弛感","清醒脑","治愈系","发疯文学","低调大佬"] },
    { id:"roast",   name:"AI 嘴替",     icon:"🔥", tagline:"帮我说一句难听的话",       desc:"把对方 / 老板 / 前任想骂又不敢骂的话，替你写。",   placeholder:"例：老板让我周末加班，还没加班费",         tags:["怼老板","怼前任","怼甲方","怼室友","怼怼精","怼相亲对象"] }
  ];
  window.PRODUCTS = PRODUCTS;
  function productById(id){ for(var i=0;i<PRODUCTS.length;i++) if(PRODUCTS[i].id===id) return PRODUCTS[i]; return null; }

  // ---------- Store ----------
  var STORE_KEY = "yuan_shop_v1";
  function readStore(){
    try{ var s = localStorage.getItem(STORE_KEY); return s ? JSON.parse(s) : {orders:[]}; }
    catch(e){ return {orders:[]}; }
  }
  function writeStore(s){ localStorage.setItem(STORE_KEY, JSON.stringify(s)); }
  function newId(){
    var d = new Date();
    var pad = function(n){ return n<10 ? "0"+n : ""+n; };
    var stamp = d.getFullYear().toString().slice(2) + pad(d.getMonth()+1) + pad(d.getDate()) + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
    var rnd = Math.floor(Math.random()*9000+1000);
    return "Y" + stamp + rnd;
  }
  function addOrder(o){ var s = readStore(); s.orders.unshift(o); writeStore(s); }
  function updateOrder(id, patch){
    var s = readStore();
    for(var i=0;i<s.orders.length;i++){ if(s.orders[i].id===id){ for(var k in patch) s.orders[i][k]=patch[k]; writeStore(s); return s.orders[i]; } }
    return null;
  }
  function getOrder(id){ var s = readStore(); for(var i=0;i<s.orders.length;i++) if(s.orders[i].id===id) return s.orders[i]; return null; }

  // ---------- Router ----------
  function parseHash(){
    var h = location.hash.replace(/^#/,"") || "/";
    var parts = h.split("/").filter(Boolean);
    return { path: "/" + parts.join("/"), parts: parts };
  }
  function go(path){ location.hash = "#" + path; }
  function render(){
    var p = parseHash();
    var root = document.getElementById("root");
    var view = p.parts[0] || "home";
    if(view==="home")            return renderHome(root);
    if(view==="product")         return renderProduct(root, p.parts[1]);
    if(view==="pay")             return renderPay(root, p.parts[1]);
    if(view==="order")           return renderOrder(root, p.parts[1]);
    if(view==="admin")           return renderAdmin(root, p.parts[1]);
    if(view==="faq")             return renderFaq(root);
    if(view==="thanks")          return renderThanks(root);
    return renderHome(root);
  }
  window.addEventListener("hashchange", render);

  // ---------- Helpers ----------
  function el(tag, attrs, children){
    var e = document.createElement(tag);
    if(attrs){
      for(var k in attrs){
        if(k==="class") e.className = attrs[k];
        else if(k==="html") e.innerHTML = attrs[k];
        else if(k==="text") e.textContent = attrs[k];
        else if(k.indexOf("on")===0) e.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        else e.setAttribute(k, attrs[k]);
      }
    }
    if(children){
      for(var i=0;i<children.length;i++){
        var c = children[i];
        if(c==null) continue;
        e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
      }
    }
    return e;
  }
  function showToast(msg){
    var t = document.getElementById("toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(showToast._t); showToast._t = setTimeout(function(){ t.classList.remove("show"); }, 1800);
  }
  function copyText(txt){
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(function(){ showToast("已复制：" + txt); }, function(){ fallbackCopy(txt); });
    } else fallbackCopy(txt);
  }
  function fallbackCopy(txt){
    var ta = document.createElement("textarea");
    ta.value = txt; ta.style.position="fixed"; ta.style.opacity="0";
    document.body.appendChild(ta); ta.select();
    try{ document.execCommand("copy"); showToast("已复制：" + txt); }catch(e){ showToast("复制失败，请手动选择"); }
    document.body.removeChild(ta);
  }
  function fmtTime(ts){ var d = new Date(ts); var p = function(n){ return n<10?"0"+n:""+n; }; return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+" "+p(d.getHours())+":"+p(d.getMinutes()); }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]; }); }
  function topbar(active){
    var items = [
      { k:"home",   label:"商品" },
      { k:"order",  label:"查询订单" },
      { k:"faq",    label:"FAQ" },
      { k:"admin",  label:"商家后台" }
    ];
    var links = items.map(function(it){
      return el("a", { href:"#"+it.k, "data-k":it.k, style: active===it.k ? "opacity:1;text-decoration:underline" : "" }, [it.label]);
    });
    return el("div", { class:"topbar" }, [
      el("div", { class:"brand" }, ["🪙 1元灵感小店"]),
      el("div", null, links)
    ]);
  }
  function banner(text){ return el("div", { class:"banner" }, [text]); }
  function kpiRow(){
    var s = readStore();
    var total = s.orders.length;
    var paid = s.orders.filter(function(o){ return o.status==="paid" || o.status==="delivered"; }).length;
    var delivered = s.orders.filter(function(o){ return o.status==="delivered"; }).length;
    return el("div", { class:"kpis" }, [
      el("div", { class:"k" }, [el("b", null, [total+"" ]), "累计下单"]),
      el("div", { class:"k" }, [el("b", null, [paid+""   ]), "已付款"]),
      el("div", { class:"k" }, [el("b", null, [delivered+"" ]), "已交付"]),
      el("div", { class:"k" }, [el("b", null, ["24h"]), "内回复"])
    ]);
  }
  function heroBlock(){
    return el("div", { class:"hero" }, [
      el("div", { class:"pill" }, ["明码标价 · 1 元 · 纯线上交付"]),
      el("h1", { html:'用 <span class="y">1元</span> 买一次 AI 的<span class="g">灵感</span>' }),
      el("p", { class:"sub" }, ["解一个梦 · 求一支签 · 写一首小诗 · 起一个名字 · 当一次嘴替", el("br"), "扫码 1 元，备注里写下你的请求，24 小时内交付"]),
      kpiRow(),
      el("div", { class:"steps" }, [
        el("div", { class:"s active" }, ["① 选服务"]),
        el("div", { class:"s" },         ["② 写请求 + 留联系方式"]),
        el("div", { class:"s" },         ["③ 扫码付 1 元"]),
        el("div", { class:"s" },         ["④ 24h 内交付"])
      ])
    ]);
  }

  // ---------- Views ----------
  function renderHome(root){
    root.innerHTML = "";
    root.appendChild(banner("试运行期：所有 1 元服务现价 1 元，限单日 1 单/账号"));
    root.appendChild(topbar("home"));
    root.appendChild(heroBlock());
    var grid = el("div", { class:"grid" });
    PRODUCTS.forEach(function(p){
      grid.appendChild(el("a", { class:"card", href:"#product/"+p.id }, [
        el("div", { class:"ic" }, [p.icon]),
        el("div", { class:"n" }, [p.name]),
        el("div", { class:"d" }, [p.desc]),
        el("div", { class:"pr" }, [
          el("div", { class:"p" }, ["¥1"]),
          el("div", { class:"u" }, [p.tagline])
        ])
      ]));
    });
    root.appendChild(grid);
    root.appendChild(footer());
  }

  function renderProduct(root, pid){
    var p = productById(pid);
    if(!p){ root.appendChild(topbar("home")); root.appendChild(el("div",{class:"panel"},[el("p",null,["未找到商品"])])); root.appendChild(footer()); return; }
    root.innerHTML = "";
    root.appendChild(banner("当前为「" + p.name + "」 · 单价 ¥1"));
    root.appendChild(topbar("home"));
    root.appendChild(el("div", { class:"crumbs", onclick:function(){ go("home"); } }, ["← 返回商品列表"]));
    root.appendChild(el("div", { class:"hero" }, [
      el("div", { class:"pill" }, [p.name]),
      el("h1", { html: p.icon + ' <span class="y">' + p.name + '</span>' }),
      el("p", { class:"sub" }, [p.desc])
    ]));

    var tagsRow = el("div", { class:"opt-row" });
    var tagRefs = [];
    p.tags.forEach(function(t){
      var tag = el("span", { class:"tag", "data-tag":t, onclick:function(){
        var ta = document.getElementById("brief");
        var cur = (ta.value || "").trim();
        ta.value = cur ? (cur + "，" + t) : t;
        ta.focus();
      }}, [t]);
      tagsRow.appendChild(tag); tagRefs.push(tag);
    });

    var panel = el("div", { class:"panel" }, [
      el("h2", null, ["1. 写一下你的请求"]),
      el("p", { class:"lead" }, ["把想说的写下来，AI 拿到后会认真回你。写得越具体，回得越准。"]),
      el("label", { class:"lb", for:"brief" }, ["你的请求"]),
      el("textarea", { id:"brief", placeholder:p.placeholder }),
      el("div", { class:"hint" }, ["也可以点下面的标签快速填："]),
      tagsRow,

      el("label", { class:"lb", for:"contact" }, ["联系方式（付款后我用来回你）"]),
      el("input", { id:"contact", type:"text", placeholder:"微信号 / QQ / 手机号 / 邮箱 任选一种" }),
      el("div", { class:"hint" }, ["承诺：联系方式仅用于本次交付，不存档不公开。"]),

      el("div", { class:"row", style:"margin-top:18px" }, [
        el("button", { class:"btn full", onclick:function(){
          var brief = (document.getElementById("brief").value || "").trim();
          var contact = (document.getElementById("contact").value || "").trim();
          if(!brief){ showToast("先写一句你的请求"); return; }
          if(!contact){ showToast("留个联系方式才能回你"); return; }
          var order = {
            id: newId(),
            productId: p.id, productName: p.name, productIcon: p.icon,
            brief: brief, contact: contact,
            amount: 1, status: "pending", createdAt: Date.now(), updatedAt: Date.now(),
            delivery: "", paidAt: null, deliveredAt: null, note: ""
          };
          addOrder(order);
          go("pay/" + order.id);
        }}, ["下一步：去支付 ¥1"])
      ])
    ]);
    root.appendChild(panel);
    root.appendChild(footer());
  }

  function renderPay(root, oid){
    var order = getOrder(oid);
    root.innerHTML = "";
    root.appendChild(banner("请在 30 分钟内扫码支付，超时订单将自动关闭"));
    root.appendChild(topbar("home"));
    if(!order){
      root.appendChild(el("div",{class:"panel"},[el("p",null,["订单不存在"])]));
      root.appendChild(footer()); return;
    }
    var payRemark = order.id + "｜" + order.productName;
    var root2 = el("div", { class:"panel" }, [
      el("h2", null, ["扫码支付 ¥1"]),
      el("p", { class:"lead" }, ["订单已生成。请使用支付宝扫下方二维码，付款金额 1.00 元，备注里写上订单号 + 服务名。"]),
      el("div", { style:"text-align:center" }, [
        el("div", { class:"pay-title" }, ["订单号："]),
        el("div", null, [
          el("span", { class:"order-id" }, [order.id]),
          el("button", { class:"copy-btn", onclick:function(){ copyText(order.id); } }, ["复制"])
        ]),
        el("div", { class:"pay-tip" }, ["服务："+order.productName+" · 金额：¥1.00"])
      ]),
      el("div", { class:"pay-area" }, [
        el("div", { class:"qr" }, [el("img", { src:"assets/qrcode.jpg", alt:"支付宝收款码" })]),
        el("div", { class:"qr-cap" }, ["长按或截图识别 · 请付 1.00 元"])
      ]),
      el("div", { class:"note" }, [
        el("b", null, ["付款时务必这样写备注："]),
        el("br"),
        el("code", null, [payRemark]),
        el("br"),
        "看不到备注我无法识别这是哪一单，所以备注一定要写对。"
      ]),
      el("div", { class:"note", style:"background:#f0f9ff;border-color:#bae6fd;color:#075985" }, [
        el("b", null, ["你的请求我已收到 ↓"]),
        el("br"),
        escapeHtml(order.brief),
        el("br"),
        "联系方式：" + escapeHtml(order.contact)
      ]),
      el("div", { class:"row", style:"margin-top:14px" }, [
        el("a", { class:"btn ghost", href:"#order/"+order.id }, ["我已付款，去查订单"]),
        el("button", { class:"btn", onclick:function(){ showToast("若已付，请到「查询订单」粘贴订单号查看"); } }, ["还没付？再扫一次"])
      ])
    ]);
    root.appendChild(root2);
    root.appendChild(footer());
  }

  function renderOrder(root, oid){
    root.innerHTML = "";
    root.appendChild(banner("输入或粘贴你的订单号，就能看到交付状态"));
    root.appendChild(topbar("order"));

    function lookup(id){
      id = (id || "").trim();
      if(!id){ showToast("请输入订单号"); return; }
      var order = getOrder(id);
      var box = document.getElementById("orderBox");
      if(!order){
        var empty = el("div", { class:"empty" }, ["找不到订单 " + id + "，请检查是否复制完整"]); box.innerHTML = ""; box.appendChild(empty);
        return;
      }
      var p = productById(order.productId) || { name: order.productName, icon: order.productIcon || "🪙" };
      var statusClass = order.status;
      var statusText = { pending:"待支付", paid:"已支付 · 排队中", delivered:"已交付", cancelled:"已取消" }[order.status] || order.status;
      var statusSmall = {
        pending: "我还没看到你的付款。看到后会在 24 小时内交付。",
        paid:    "已收到款，AI 正在生成你的内容，请耐心等待。",
        delivered: "已交付，点击下方链接查看 / 复制。",
        cancelled: "订单已取消。"
      }[order.status] || "";
      var boxEl = el("div", null, [
        el("div", { class:"status " + statusClass }, [
          el("div", { class:"big" }, [p.icon + " " + statusText]),
          el("div", { class:"small" }, [statusSmall])
        ]),
        el("div", { class:"panel" }, [
          el("h2", null, ["订单详情"]),
          rowKV("订单号", order.id, true),
          rowKV("服务", p.name),
          rowKV("金额", "¥" + order.amount.toFixed(2)),
          rowKV("创建时间", fmtTime(order.createdAt)),
          order.paidAt ? rowKV("付款时间", fmtTime(order.paidAt)) : null,
          order.deliveredAt ? rowKV("交付时间", fmtTime(order.deliveredAt)) : null,
          el("div", { class:"lb", style:"margin-top:14px" }, ["你的请求"]),
          el("div", { class:"delivery-box", style:"background:#f8faff" }, [order.brief]),
          el("div", { class:"lb" }, ["联系方式（仅本次使用）"]),
          el("div", { class:"delivery-box", style:"background:#f8faff" }, [order.contact]),
          order.delivery ? el("div", null, [
            el("div", { class:"lb" }, ["AI 生成结果"]),
            el("div", { class:"delivery-box" }, [order.delivery]),
            el("div", { class:"row" }, [
              el("button", { class:"btn ghost", onclick:function(){ copyText(order.delivery); } }, ["复制结果"])
            ])
          ]) : null
        ])
      ]);
      box.innerHTML = "";
      box.appendChild(boxEl);
    }
    function rowKV(k, v, copyable){
      var node = el("div", { class:"rowKV", style:"display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px dashed #eef0f6" }, [
        el("span", { class:"muted" }, [k]),
        el("span", null, [v + " "])
      ]);
      if(copyable){
        var btn = el("button", { class:"copy-btn", onclick:function(){ copyText(v); } }, ["复制"]);
        node.appendChild(btn);
      }
      return node;
    }

    root.appendChild(el("div", { class:"panel" }, [
      el("h2", null, ["查询订单"]),
      el("p", { class:"lead" }, ["把下单时给你的订单号粘进来就行。订单号长这样：Y2506101530123456"]),
      el("label", { class:"lb", for:"oid" }, ["订单号"]),
      el("input", { id:"oid", type:"text", placeholder:"Y…", value: oid || "" }),
      el("div", { class:"row", style:"margin-top:14px" }, [
        el("button", { class:"btn full", onclick:function(){ lookup(document.getElementById("oid").value); } }, ["查询"])
      ])
    ]));
    root.appendChild(el("div", { id:"orderBox" }));
    if(oid){ setTimeout(function(){ lookup(oid); }, 0); }
    root.appendChild(footer());
  }

  function renderAdmin(root, action){
    var s = readStore();
    var total = s.orders.length;
    var pending = s.orders.filter(function(o){ return o.status==="pending"; }).length;
    var paid = s.orders.filter(function(o){ return o.status==="paid"; }).length;
    var delivered = s.orders.filter(function(o){ return o.status==="delivered"; }).length;
    root.innerHTML = "";
    root.appendChild(banner("商家后台 · 演示版（数据保存在浏览器 localStorage）"));
    root.appendChild(topbar("admin"));

    var summary = el("div", { class:"summary" }, [
      el("div", { class:"s" }, [el("b", null, [total+"" ]), el("span", null, ["累计"])]),
      el("div", { class:"s" }, [el("b", null, [pending+"" ]), el("span", null, ["待支付"])]),
      el("div", { class:"s" }, [el("b", null, [paid+""    ]), el("span", null, ["待交付"])]),
      el("div", { class:"s" }, [el("b", null, [delivered+"" ]), el("span", null, ["已交付"])])
    ]);

    var statusFilter = "all";
    var query = "";
    function rebuildTable(){
      var sb = readStore();
      var rows = sb.orders.filter(function(o){
        if(statusFilter!=="all" && o.status!==statusFilter) return false;
        if(query){
          var q = query.toLowerCase();
          return (o.id.toLowerCase().indexOf(q)>=0) || (o.productName.toLowerCase().indexOf(q)>=0) || (o.contact.toLowerCase().indexOf(q)>=0) || (o.brief.toLowerCase().indexOf(q)>=0);
        }
        return true;
      });
      if(rows.length===0){
        tableBox.innerHTML = '<div class="empty">暂无订单</div>';
        return;
      }
      var table = el("table", { class:"admin-table" }, [
        el("thead", null, [el("tr", null, [
          el("th", null, ["时间"]),
          el("th", null, ["服务"]),
          el("th", null, ["订单号"]),
          el("th", null, ["状态"]),
          el("th", null, ["请求 + 联系方式"]),
          el("th", null, ["交付内容 / 操作"])
        ])])
      ]);
      var tbody = el("tbody");
      rows.forEach(function(o){
        var deliveryCell = el("td", null, [
          el("textarea", { placeholder:"粘 / 写交付内容（文字）", oninput:function(e){
            updateOrder(o.id, { delivery: e.target.value });
          } }, [o.delivery || ""]),
          el("div", { class:"row", style:"margin-top:6px;gap:6px" }, [
            o.status !== "paid"    ? el("button", { class:"btn", style:"padding:6px 10px;font-size:12px", onclick:function(){ updateOrder(o.id, { status:"paid",    paidAt: Date.now(), updatedAt: Date.now() }); rebuildTable(); showToast("已标记「已支付」"); }}, ["标记已付"]) : null,
            el("button", { class:"btn success", style:"padding:6px 10px;font-size:12px", onclick:function(){
              var current = getOrder(o.id); var dv = (current && current.delivery) || o.delivery; if(!dv || !dv.trim()){ showToast("请先填交付内容"); return; } updateOrder(o.id, { status:"delivered", deliveredAt: Date.now(), updatedAt: Date.now() });
              rebuildTable(); showToast("已标记「已交付」");
            }}, ["标记已交付"]),
            o.status !== "cancelled" ? el("button", { class:"btn danger", style:"padding:6px 10px;font-size:12px", onclick:function(){
              if(!confirm("确认取消订单 " + o.id + "？")) return;
              updateOrder(o.id, { status:"cancelled", updatedAt: Date.now() });
              rebuildTable(); showToast("已取消");
            }}, ["取消"]) : null
          ])
        ]);
        tbody.appendChild(el("tr", null, [
          el("td", null, [fmtTime(o.createdAt)]),
          el("td", null, [o.productIcon + " " + o.productName]),
          el("td", null, [
            el("div", null, [o.id]),
            el("button", { class:"copy-btn", onclick:function(){ copyText(o.id); } }, ["复制"])
          ]),
          el("td", null, [el("span", { class:"pill-s " + o.status }, [({pending:"待支付",paid:"已支付",delivered:"已交付",cancelled:"已取消"})[o.status]]) ]),
          el("td", null, [
            el("div", { style:"white-space:pre-wrap" }, [o.brief]),
            el("div", { class:"muted", style:"margin-top:4px" }, ["联系：" + o.contact])
          ]),
          deliveryCell
        ]));
      });
      table.appendChild(tbody);
      tableBox.innerHTML = "";
      tableBox.appendChild(table);
    }

    var filterSel = el("select", { onchange:function(e){ statusFilter = e.target.value; rebuildTable(); } }, [
      el("option", { value:"all" }, ["全部状态"]),
      el("option", { value:"pending" }, ["待支付"]),
      el("option", { value:"paid" }, ["已支付"]),
      el("option", { value:"delivered" }, ["已交付"]),
      el("option", { value:"cancelled" }, ["已取消"])
    ]);
    var search = el("input", { type:"text", placeholder:"搜订单号", oninput:function(e){ query = e.target.value; rebuildTable(); } });
    var exportBtn = el("button", { class:"btn ghost", onclick:function(){
      var data = JSON.stringify(readStore(), null, 2);
      var blob = new Blob([data], { type:"application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a"); a.href = url; a.download = "orders-" + new Date().toISOString().replace(/[:.]/g,"-") + ".json";
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    }}, ["导出 JSON"]);
    var seedBtn = el("button", { class:"btn ghost", onclick:function(){
      if(!confirm("插入 2 条演示订单？")) return;
      var now = Date.now();
      addOrder({ id: newId(), productId:"dream",   productName:"AI 解梦", productIcon:"🌙", brief:"梦见自己在屋顶追一只白猫，下面是海。", contact:"demo-wx-001", amount:1, status:"paid", createdAt: now-3600*1000, updatedAt: now-3600*1000, delivery:"", paidAt: now-3500*1000, deliveredAt: null, note:"" });
      addOrder({ id: newId(), productId:"poem",    productName:"AI 写诗", productIcon:"✒️", brief:"关键词：初夏 / 旧单车 / 她", contact:"13800000000", amount:1, status:"delivered", createdAt: now-86400*1000, updatedAt: now-86000*1000, delivery:"《旧单车》\n那年夏天的风是慢的\n你在前面蹬车\n我在后面数你的发梢\n——\n（自动生成 · 仅作示意）", paidAt: now-86300*1000, deliveredAt: now-86000*1000, note:"" });
      rebuildTable(); showToast("已插入 2 条演示订单");
    }}, ["插入演示数据"]);

    var tableBox = el("div", { id:"adminTable" });

    root.appendChild(el("div", { class:"panel" }, [
      el("h2", null, ["商家工作台"]),
      el("p", { class:"lead" }, ["在这里查看订单、标记付款、写入并发布交付结果。提示：所有数据只存在你自己的浏览器里，关掉页面 / 换电脑就看不到了。"]),
      summary,
      el("div", { class:"toolbar", style:"margin-top:14px" }, [filterSel, search, exportBtn, seedBtn]),
      tableBox
    ]));
    rebuildTable();
    root.appendChild(footer());
  }

  function renderFaq(root){
    root.innerHTML = "";
    root.appendChild(banner("如果你还有疑问，先看看这里"));
    root.appendChild(topbar("faq"));
    root.appendChild(el("div", { class:"faq" }, [
      el("h3", null, ["常见问题"]),
      el("div", { class:"q" }, ["Q1: 真的只要 1 块吗？"]),
      el("div", { class:"a" }, ["对。每个 SKU 标价 1 元，写清楚请求，扫 1 块的码，AI 认真回。"]),
      el("div", { class:"q" }, ["Q2: 付款后多久能收到？"]),
      el("div", { class:"a" }, ["看到备注后 24 小时内交付；高峰期可能稍晚，但一定交付。"]),
      el("div", { class:"q" }, ["Q3: 一定能收到吗？会不会吞单？"]),
      el("div", { class:"a" }, ["付款时务必在备注写「订单号｜服务名」，否则无法识别是哪一单。无备注吞单风险由买家承担。"]),
      el("div", { class:"q" }, ["Q4: 能退款吗？"]),
      el("div", { class:"a" }, ["AI 已经开始生成的时候不退；遇到离谱请求 / 重复付款会原路退回。"]),
      el("div", { class:"q" }, ["Q5: 我的内容会被公开 / 训练吗？"]),
      el("div", { class:"a" }, ["不会。每段都只发给你，不存档不公开。联系方式也只在本次使用。"]),
      el("div", { class:"q" }, ["Q6: 可以定制吗？"]),
      el("div", { class:"a" }, ["可以。备注里把偏好写越具体越准，比如「写温柔一点 / 不要押韵 / 三行就够」。"]),
      el("div", { class:"q" }, ["Q7: 一个人能下多单吗？"]),
      el("div", { class:"a" }, ["试运行期：限单日 1 单/账号，便于排期与交付。"])
    ]));
    root.appendChild(footer());
  }

  function renderThanks(root){
    root.innerHTML = "";
    root.appendChild(banner("已收到 · 感谢你的 1 元"));
    root.appendChild(topbar("home"));
    root.appendChild(el("div", { class:"panel" }, [
      el("h2", null, ["谢谢老板 ☕️"]),
      el("p", { class:"lead" }, ["你给的 1 块，是这个实验能继续下去的全部燃料。"]),
      el("p", { class:"lead" }, ["回到首页可以再选下一个服务，或者把店铺转给一个会需要它的朋友。"]),
      el("div", { class:"row" }, [
        el("a", { class:"btn", href:"#home" }, ["再逛逛"]),
        el("a", { class:"btn ghost", href:"#order" }, ["查订单"])
      ])
    ]));
    root.appendChild(footer());
  }

  function footer(){
    var links = [
      el("a", { href:"#home" },  ["商品"]),
      el("a", { href:"#order" }, ["查询订单"]),
      el("a", { href:"#faq" },   ["FAQ"]),
      el("a", { href:"#admin" }, ["商家后台"])
    ];
    return el("div", { class:"footer" }, [
      "🪙 1元灵感小店 · 纯线上运行 · ", links, el("br"),
      el("span", { class:"legal" }, ["本页面是「把灵感卖 1 元」的一次性实验。本站仅作为交易撮合入口，实际交付由商家通过 AI 完成。"])
    ]);
  }

  // ---------- Boot ----------
  document.addEventListener("DOMContentLoaded", render);
  if(document.readyState !== "loading") render();
})();







