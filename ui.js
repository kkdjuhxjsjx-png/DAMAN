/* ui.js — ميزات واجهة مشتركة: وضع داكن، إعلانات، بحث/ترتيب المنتجات، مشاركة المتجر */
(function(){
  var root = document.documentElement;
  function ls(k,v){ try{ return v===undefined ? localStorage.getItem(k) : localStorage.setItem(k,v); }catch(e){} }

  /* 1) الوضع الداكن — يتبع النظام ما لم يختر المستخدم */
  var saved = ls('theme');
  var dark = saved ? saved==='dark' : matchMedia('(prefers-color-scheme:dark)').matches;
  function apply(){ root.setAttribute('data-theme', dark?'dark':'light'); if(btn) btn.textContent = dark?'☀️':'🌙'; if(btn) btn.setAttribute('aria-label', dark?'الوضع الفاتح':'الوضع الداكن'); }
  var btn = document.createElement('button');
  btn.className = 'theme-btn'; btn.type = 'button';
  btn.onclick = function(){ dark=!dark; ls('theme',dark?'dark':'light'); apply(); };
  var host = document.querySelector('.site-header .nav-links') || document.querySelector('.site-header .container');
  if (host) host.insertBefore(btn, host.firstChild);
  else { btn.className += ' ui-fab'; document.body.appendChild(btn); }
  apply();

  /* 2) زر العودة للأعلى */
  var up = document.createElement('button');
  up.className = 'ui-fab top'; up.type = 'button'; up.textContent = '↑'; up.setAttribute('aria-label','للأعلى');
  up.onclick = function(){ scrollTo({top:0}); };
  document.body.appendChild(up);
  addEventListener('scroll', function(){ up.classList.toggle('show', scrollY > 500); }, {passive:true});

  /* 3) شريط الإعلانات (من مجموعة announcements النشطة) */
  if (typeof db !== 'undefined' && !/admin|dashboard/.test(location.pathname)){
    db.collection('announcements').where('active','==',true).limit(1).get().then(function(s){
      if (s.empty) return;
      var t = s.docs[0].data().text, k = 'ann_'+s.docs[0].id;
      if (ls(k)) return;
      var bar = document.createElement('div'); bar.className = 'ann-bar';
      bar.appendChild(document.createTextNode(t));
      var x = document.createElement('button'); x.textContent = '✕'; x.setAttribute('aria-label','إغلاق');
      x.onclick = function(){ ls(k,'1'); bar.remove(); };
      bar.appendChild(x); document.body.insertBefore(bar, document.body.firstChild);
    }).catch(function(){});
  }

  /* 4) صفحة المتجر: بحث + ترتيب + تصفية بالنوع + مشاركة */
  if (typeof renderProducts === 'function' && typeof state !== 'undefined' && state.products !== undefined && !document.querySelector('.dash-nav')){
    var orig = renderProducts, all = null, q = '', sort = '', type = '';
    var TYPES = {digital_file:'ملفات رقمية',game_topup:'شحن واشتراكات',code_stock:'أكواد',physical_or_custom:'منتجات'};
    var minPrice = function(p){ return p.variants && p.variants.length ? Math.min.apply(null,p.variants.map(function(v){return +v.price})) : +p.price||0; };
    window.renderProducts = function(){
      if (!all) all = state.products.slice();
      var wrap = document.getElementById('productsWrap');
      if (wrap && !document.getElementById('prodToolbar')){
        var bar = document.createElement('div'); bar.id = 'prodToolbar';
        var types = Object.keys(TYPES).filter(function(t){ return all.some(function(p){return p.type===t}); });
        bar.innerHTML = '<div class="prod-toolbar"><input class="input" id="pq" type="search" placeholder="ابحث في المنتجات...">'
          + '<select class="input" id="ps"><option value="">الأحدث</option><option value="lo">السعر: الأقل</option><option value="hi">السعر: الأعلى</option><option value="az">الاسم</option></select>'
          + '<button class="btn btn-ghost btn-sm" id="pshare" type="button">🔗 مشاركة</button></div>'
          + (types.length>1 ? '<div class="chips"><button class="chip-btn on" data-t="">الكل</button>'+types.map(function(t){return '<button class="chip-btn" data-t="'+t+'">'+TYPES[t]+'</button>'}).join('')+'</div>' : '');
        wrap.parentNode.insertBefore(bar, wrap);
        bar.querySelector('#pq').oninput = function(e){ q = e.target.value.trim().toLowerCase(); window.renderProducts(); };
        bar.querySelector('#ps').onchange = function(e){ sort = e.target.value; window.renderProducts(); };
        bar.querySelectorAll('.chip-btn').forEach(function(b){ b.onclick = function(){
          type = b.dataset.t; bar.querySelectorAll('.chip-btn').forEach(function(x){x.classList.toggle('on',x===b)}); window.renderProducts(); }; });
        bar.querySelector('#pshare').onclick = function(){
          var u = location.href;
          if (navigator.share) navigator.share({title:document.title,url:u}).catch(function(){});
          else navigator.clipboard.writeText(u).then(function(){ toast('تم نسخ رابط المتجر','ok'); });
        };
      }
      var list = all.filter(function(p){
        return (!type || p.type===type) && (!q || ((p.name||'')+' '+(p.description||'')).toLowerCase().indexOf(q)>-1);
      });
      if (sort==='lo') list.sort(function(a,b){return minPrice(a)-minPrice(b)});
      if (sort==='hi') list.sort(function(a,b){return minPrice(b)-minPrice(a)});
      if (sort==='az') list.sort(function(a,b){return (a.name||'').localeCompare(b.name||'','ar')});
      state.products = list; orig();
      state.products = all;
      if (!list.length && all.length) document.getElementById('productsWrap').innerHTML = '<div class="no-match">لا منتجات تطابق بحثك. جرّب كلمة أخرى أو اختر "الكل".</div>';
    };
  }
})();
