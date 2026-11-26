/* icons.js — استبدال الإيموجي بأيقونات Lucide الاحترافية + سلوك القائمة الجانبية للهاتف */
(function(){
  var MAP={'★':['star',1],'⭐':['star',1],'☆':['star'],'✕':['x'],'✅':['circle-check'],'⚠':['triangle-alert'],'🏪':['store'],'📦':['package'],
    '💳':['credit-card'],'❌':['circle-x'],'🛒':['shopping-cart'],'📊':['layout-dashboard'],'🚩':['flag'],'💎':['gem'],'📋':['clipboard-list'],
    '☰':['menu'],'📥':['download'],'✔':['badge-check'],'🏦':['landmark'],'💠':['wallet'],'🛡':['shield-check'],'👤':['user'],'📢':['megaphone'],
    '⚙':['settings'],'🔒':['lock'],'🧾':['receipt'],'🎟':['ticket'],'👥':['users'],'🎨':['palette'],'✉':['mail'],'📲':['smartphone'],'📱':['smartphone'],
    '🔍':['search'],'💵':['banknote'],'📎':['paperclip'],'☀':['sun'],'🌙':['moon'],'🔗':['link'],'↑':['arrow-up']};
  var RE=new RegExp('('+Object.keys(MAP).join('|')+')[\\uFE0F\\u200D]*','g');
  var SKIP=/^(SCRIPT|STYLE|TEXTAREA|OPTION|TITLE|INPUT|SELECT|svg)$/i, busy=false, queued=false;

  function walk(root){
    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
      if(!n.nodeValue||!RE.test(n.nodeValue)){RE.lastIndex=0;return NodeFilter.FILTER_REJECT}
      RE.lastIndex=0;return n.parentNode&&SKIP.test(n.parentNode.nodeName)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});
    var nodes=[];while(w.nextNode())nodes.push(w.currentNode);
    nodes.forEach(function(n){
      var t=n.nodeValue,f=document.createDocumentFragment(),last=0,m;RE.lastIndex=0;
      while((m=RE.exec(t))){
        if(m.index>last)f.appendChild(document.createTextNode(t.slice(last,m.index)));
        var d=MAP[m[1]],i=document.createElement('i');
        i.setAttribute('data-lucide',d[0]);i.className='i'+(d[1]?' i-fill':'');i.setAttribute('aria-hidden','true');
        f.appendChild(i);last=RE.lastIndex;
      }
      if(last<t.length)f.appendChild(document.createTextNode(t.slice(last)));
      n.parentNode.replaceChild(f,n);
    });
  }
  function run(){
    if(busy)return;busy=true;
    try{walk(document.body);if(window.lucide)lucide.createIcons({attrs:{'stroke-width':2}});}catch(e){}
    busy=false;queued=false;
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(run)}

  function init(){
    run();
    new MutationObserver(function(){if(!busy)schedule()}).observe(document.body,{childList:true,subtree:true,characterData:true});
    // قائمة الهاتف: خلفية معتمة + إغلاق عند الاختيار
    var lazy=function(){document.querySelectorAll('img:not([loading])').forEach(function(im){im.loading='lazy';im.decoding='async'})};
    lazy();new MutationObserver(lazy).observe(document.body,{childList:true,subtree:true});
    var side=document.querySelector('.dash-sidebar,.admin-side,.cart-drawer');
    if(side){
      var bd=document.createElement('div');bd.className='nav-backdrop';document.body.appendChild(bd);
      var sync=function(){bd.classList.toggle('show',side.classList.contains('show'))};
      new MutationObserver(sync).observe(side,{attributes:true,attributeFilter:['class']});
      bd.onclick=function(){side.classList.remove('show')};
      side.addEventListener('click',function(e){if(e.target.closest('a[data-section],.admin-nav a'))side.classList.remove('show')});
      document.addEventListener('keydown',function(e){if(e.key==='Escape')side.classList.remove('show')});
    }
  }
  var s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/npm/lucide@0.469.0/dist/umd/lucide.min.js';
  s.onload=init;s.onerror=init;document.head.appendChild(s);
})();
