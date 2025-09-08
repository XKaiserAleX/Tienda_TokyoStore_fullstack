
// --- Utils ---
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

function fmtCLP(num){
  try { return new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(num); }
  catch(e){ return '$'+num }
}

// LocalStorage helpers
const LS = {
  get(key, def){ try{ return JSON.parse(localStorage.getItem(key)) ?? def }catch{ return def } },
  set(key, val){ localStorage.setItem(key, JSON.stringify(val)) }
};

// Seed sample data if empty
function seedData(){
  if(!LS.get('products')){
 const sample = [
  {
    code: "HD2025",
    name: "Control Gamer Inalámbrico",
    description: "Mando inalámbrico con vibración, luces LED y batería recargable. Compatible con PC y consolas.",
    price: 39990,
    stock: 15,
    stockCritico: 3,
    category: "Accesorios",
    image: "assets/img/gamersir.jpg"
  },
  {
    code: "KBMECH",
    name: "GameSir X2 Tipo-C",
    description: "Control telescópico para smartphones con puerto USB-C, ideal para gaming en la nube.",
    price: 49990,
    stock: 10,
    stockCritico: 2,
    category: "Computación",
    image: "assets/img/gamesir-x2-tipo-c.jpg"
  },
  {
    code: "MOUSEG",
    name: "Mouse Gamer Logitech G",
    description: "Sensor óptico de alta precisión, 6 botones programables y diseño ergonómico.",
    price: 29990,
    stock: 20,
    stockCritico: 4,
    category: "Gaming",
    image: "assets/img/mouse.webp"
  }
];

    LS.set('products', sample);
  }
  if(!LS.get('users')){
    LS.set('users', []);
  }
  if(!LS.get('cart')){
    LS.set('cart', []);
  }
}
seedData();

// CART BADGE
function updateCartCount(){
  const count = LS.get('cart', []).reduce((a,b)=>a + (b.qty||0), 0);
  const badge = $("#cartCount"); if(badge) badge.textContent = count;
}
updateCartCount();

// --- RUT (RUN) validation ---
function validarRUN(run){
  if(!run) return false;
  const clean = run.toString().toUpperCase().replace(/[^0-9K]/g,'');
  if(clean.length < 7 || clean.length > 9) return false;
  const cuerpo = clean.slice(0,-1);
  const dv = clean.slice(-1);
  let suma = 0, mult = 2;
  for(let i=cuerpo.length-1;i>=0;i--){
    suma += parseInt(cuerpo[i],10)*mult;
    mult = mult===7 ? 2 : mult+1;
  }
  const res = 11 - (suma % 11);
  const dvCalc = (res===11?'0':res===10?'K':String(res));
  return dv === dvCalc;
}

// --- Email domain validation ---
function validarCorreoDominio(email){
  if(!email) return false;
  const ok = email.length<=100 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if(!ok) return false;
  return /(@duoc\.cl|@profesor\.duoc\.cl|@gmail\.com)$/i.test(email);
}

// --- Regions/Comunas binding ---
function bindRegionComuna(regionSel, comunaSel){
  const r = $(regionSel), c = $(comunaSel);
  if(!r || !c || !window.REGIONES) return;
  r.innerHTML = REGIONES.map((rg,i)=>`<option value="${rg.nombre}">${rg.nombre}</option>`).join('');
  function refreshComunas(){
    const rg = REGIONES.find(x=>x.nombre === r.value) || REGIONES[0];
    c.innerHTML = (rg?.comunas||[]).map(cm=>`<option>${cm}</option>`).join('');
  }
  r.addEventListener('change', refreshComunas);
  refreshComunas();
}

// --- Home products ---
function renderHome(){
  const el = $("#homeProducts");
  if(!el) return;
  const products = LS.get('products', []);
  const top = products.slice(0,3).map(p => `
    <div class="card product">
      <a href="product.html?id=${encodeURIComponent(p.code)}"><img src="${p.image||'assets/img/gamersir.jpg'}" alt=""></a>
      <b>${p.name}</b>
      <span class="price">${fmtCLP(p.price)}</span>
      <div style="display:flex;gap:8px">
        <a class="btn small" href="product.html?id=${encodeURIComponent(p.code)}">Ver detalle</a>
        <button class="btn small" onclick="addToCart('${p.code}')">Añadir</button>
      </div>
    </div>
  `).join('');
  el.innerHTML = top;
}

// --- Products list ---
function renderProducts(){
  const el = $("#productsGrid"); if(!el) return;
  const products = LS.get('products', []);
  el.innerHTML = products.map(p => `
    <div class="card product">
      <a href="product.html?id=${encodeURIComponent(p.code)}"><img src="${p.image||'assets/img/gamersir.jpg'}" alt=""></a>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <b>${p.name}</b><span class="badge">${p.category}</span>
      </div>
      <span class="price">${fmtCLP(p.price)}</span>
      <button class="btn small" onclick="addToCart('${p.code}')">Añadir</button>
    </div>
  `).join('');
}

// --- Product detail ---
function renderProductDetail(){
  const holder = $("#productDetail"); if(!holder) return;
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const p = LS.get('products', []).find(x=>x.code===id);
  if(!p){ holder.innerHTML = `<div class="notice">Producto no encontrado.</div>`; return; }
  holder.innerHTML = `
    <div class="grid cols-2">
      <div class="card"><img src="${p.image||'assets/img/gamersir.jpg'}" style="width:100%;border-radius:12px"></div>
      <div class="card">
        <h1>${p.name}</h1>
        <p class="small">${p.description||''}</p>
        <div class="price" style="margin:10px 0">${fmtCLP(p.price)}</div>
        <div class="small">Stock: ${p.stock} ${p.stockCritico!=null ? `(crítico ≤ ${p.stockCritico})` : ''}</div>
        <button class="btn" onclick="addToCart('${p.code}')">Añadir al carrito</button>
      </div>
    </div>
  `;
}

// --- Blog list ---
function renderBlogList(){
  const el = $("#blogList"); if(!el) return;
  const posts = [
    {href:"blog1.html", title:"Lanzamiento de TokyoStore", desc:"Presentamos nuestra tienda Online.", img:"assets/img/store.jpg"},
    {href:"blog2.html", title:"5 Tips para elegir audífonos", desc:"Consejos rápidos antes de comprar.", img:"assets/img/audifonos.jpg"},
    {href:"blog1.html", title:"Nuestra misión", desc:"Por qué armamos este proyecto.", img:"assets/img/logo_final.png"}
  ];
  el.innerHTML = posts.map(b => `
    <a class="card" href="${b.href}">
      <img src="${b.img}" style="width:100%;border-radius:10px;margin-bottom:8px">
      <b>${b.title}</b>
      <p class="small">${b.desc}</p>
    </a>
  `).join('');
}

// --- Cart logic ---
function addToCart(code){
  const prods = LS.get('products', []);
  const p = prods.find(x=>x.code===code); if(!p) return;
  const cart = LS.get('cart', []);
  const item = cart.find(i=>i.code===code);
  if(item){ item.qty = Math.min((item.qty||0)+1, p.stock); }
  else { cart.push({code: p.code, qty: 1}); }
  LS.set('cart', cart); updateCartCount();
  alert("Añadido al carrito.");
}

function renderCart(){
  const el = $("#cartView"); if(!el) return;
  const prods = LS.get('products', []);
  const cart = LS.get('cart', []);
  if(cart.length===0){ el.innerHTML = `<div class="notice">Tu carrito está vacío.</div>`; return; }
  let total = 0;
  const rows = cart.map(it => {
    const p = prods.find(x=>x.code===it.code); if(!p) return "";
    const sub = p.price * it.qty; total += sub;
    return `
      <div style="display:flex;gap:14px;align-items:center;border-bottom:1px solid #1f2937;padding:10px 0">
        <img src="${p.image||'assets/img/audifonos.jpg'}" style="width:90px;border-radius:10px;border:1px solid #1f2937">
        <div style="flex:1">
          <b>${p.name}</b>
          <div class="small">${fmtCLP(p.price)} — Stock: ${p.stock}</div>
          <div style="margin-top:6px;display:flex;gap:8px;align-items:center">
            <button class="btn small" onclick="chgQty('${p.code}',-1)">-</button>
            <span>${it.qty}</span>
            <button class="btn small" onclick="chgQty('${p.code}',1)">+</button>
            <button class="btn small" onclick="remItem('${p.code}')">Quitar</button>
          </div>
        </div>
        <div><b>${fmtCLP(sub)}</b></div>
      </div>
    `;
  }).join('');
  el.innerHTML = rows + `<div style="text-align:right;margin-top:10px"><h3>Total: ${fmtCLP(total)}</h3></div>`;
  const btn = $("#btnCheckout"); if(btn){ btn.onclick = ()=>{ alert("Compra simulada. Gracias!"); LS.set('cart', []); updateCartCount(); location.href='index.html'; }; }
}
function chgQty(code,delta){
  const prods = LS.get('products', []);
  const p = prods.find(x=>x.code===code);
  const cart = LS.get('cart', []);
  const it = cart.find(i=>i.code===code); if(!it) return;
  it.qty = Math.max(0, Math.min((it.qty||0)+delta, p?.stock||1));
  if(it.qty===0){ LS.set('cart', cart.filter(i=>i.code!==code)); } else { LS.set('cart', cart); }
  renderCart(); updateCartCount();
}
function remItem(code){
  LS.set('cart', LS.get('cart', []).filter(i=>i.code!==code));
  renderCart(); updateCartCount();
}

// --- Forms: Contacto ---
function bindContacto(){
  const f = $("#formContacto"); if(!f) return;
  f.addEventListener('submit', (e)=>{
    e.preventDefault();
    let ok = true;
    const nombre = $("#ctNombre").value.trim();
    const correo = $("#ctCorreo").value.trim();
    const comentario = $("#ctComentario").value.trim();
    $("#errCtNombre").textContent = "";
    $("#errCtCorreo").textContent = "";
    $("#errCtComentario").textContent = "";
    if(!nombre){ $("#errCtNombre").textContent="Nombre requerido"; ok=false; }
    if(correo && !validarCorreoDominio(correo)){ $("#errCtCorreo").textContent="Correo inválido o dominio no permitido"; ok=false; }
    if(!comentario){ $("#errCtComentario").textContent="Comentario requerido"; ok=false; }
    if(ok){ alert("Mensaje enviado (demo). ¡Gracias!"); f.reset(); }
  });
}

// --- Forms: Registro ---
function bindRegistro(){
  bindRegionComuna("#rgRegion","#rgComuna");
  const f = $("#formRegistro"); if(!f) return;
  f.addEventListener('submit',(e)=>{
    e.preventDefault();
    let ok = true;
    const run=$("#rgRun").value.trim().toUpperCase();
    const correo=$("#rgCorreo").value.trim();
    const nombre=$("#rgNombre").value.trim();
    const apellidos=$("#rgApellidos").value.trim();
    const direccion=$("#rgDireccion").value.trim();
    // reset errors
    $("#errRun").textContent=$("#errCorreo").textContent=$("#errNombre").textContent=$("#errApellidos").textContent=$("#errDireccion").textContent="";
    if(!validarRUN(run)){ $("#errRun").textContent="RUN inválido"; ok=false; }
    if(!validarCorreoDominio(correo)){ $("#errCorreo").textContent="Correo inválido o dominio no permitido"; ok=false; }
    if(!nombre){ $("#errNombre").textContent="Requerido"; ok=false; }
    if(!apellidos){ $("#errApellidos").textContent="Requerido"; ok=false; }
    if(!direccion){ $("#errDireccion").textContent="Requerido"; ok=false; }
    if(ok){
      const users=LS.get('users',[]);
      if(users.some(u=>u.run===run)){ alert("RUN ya registrado."); return; }
      users.push({
        run, correo, nombre, apellidos,
        fecha: $("#rgFecha").value || null,
        tipo: $("#rgTipo").value,
        region: $("#rgRegion").value,
        comuna: $("#rgComuna").value,
        direccion
      });
      LS.set('users',users);
      alert("Usuario registrado (demo)."); f.reset();
    }
  });
}

// --- Forms: Login ---
function bindLogin(){
  const f=$("#formLogin"); if(!f) return;
  f.addEventListener('submit',(e)=>{
    e.preventDefault();
    $("#errLgCorreo").textContent=$("#errLgClave").textContent="";
    const correo=$("#lgCorreo").value.trim();
    const clave=$("#lgClave").value;
    let ok=true;
    if(!validarCorreoDominio(correo)){ $("#errLgCorreo").textContent="Correo inválido o dominio no permitido"; ok=false; }
    if(!(clave && clave.length>=4 && clave.length<=10)){ $("#errLgClave").textContent="4 a 10 caracteres"; ok=false; }
    if(ok){
      alert("Login validado (demo). Redirigiendo…");
      location.href="index.html";
    }
  });
}

// --- Page inits ---
document.addEventListener('DOMContentLoaded', ()=>{
  renderHome();
  renderProducts();
  renderProductDetail();
  renderCart();
  renderBlogList();
  bindContacto();
  bindRegistro();
  bindLogin();
});
