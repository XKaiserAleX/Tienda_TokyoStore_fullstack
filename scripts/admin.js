
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const LS = { get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k)) ?? d}catch{return d}}, set:(k,v)=>localStorage.setItem(k,JSON.stringify(v)) };
function validarRUN(run){ if(!run) return false; const clean=run.toString().toUpperCase().replace(/[^0-9K]/g,''); if(clean.length<7||clean.length>9) return false; const cuerpo=clean.slice(0,-1); const dv=clean.slice(-1); let suma=0,m=2; for(let i=cuerpo.length-1;i>=0;i--){ suma += parseInt(cuerpo[i],10)*m; m = m===7?2:m+1; } const res=11-(suma%11); const dvCalc = (res===11?'0':res===10?'K':String(res)); return dv===dvCalc; }
function validarCorreoDominio(email){ if(!email) return false; const ok = email.length<=100 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); if(!ok) return false; return /(@duoc\.cl|@profesor\.duoc\.cl|@gmail\.com)$/i.test(email); }

function bindRegionComuna(regionSel, comunaSel){
  const r = document.querySelector(regionSel), c = document.querySelector(comunaSel);
  if(!r || !c || !window.REGIONES) return;
  r.innerHTML = REGIONES.map(rg=>`<option>${rg.nombre}</option>`).join('');
  function refresh(){ const rg = REGIONES.find(x=>x.nombre===r.value)||REGIONES[0]; c.innerHTML=(rg?.comunas||[]).map(cm=>`<option>${cm}</option>`).join(''); }
  r.addEventListener('change', refresh); refresh();
}

// Productos list
function renderTablaProductos(){
  const tb=$("#tablaProductos tbody"); if(!tb) return;
  const prods=LS.get('products',[]);
  tb.innerHTML = prods.map(p=>`
    <tr>
      <td>${p.code}</td>
      <td>${p.name}</td>
      <td>${p.price}</td>
      <td>${p.stock}</td>
      <td>${p.category}</td>
      <td><button class="btn small" onclick="delProd('${p.code}')">Eliminar</button></td>
    </tr>
  `).join('');
}
function delProd(code){
  const next = LS.get('products',[]).filter(p=>p.code!==code);
  LS.set('products', next);
  renderTablaProductos();
}

// Guardar producto (validaciones)
function bindFormProducto(){
  bindRegionComuna("#rgRegion","#rgComuna"); // no usado aquí pero no hace daño
  const f=$("#formProducto"); if(!f) return;
  f.addEventListener('submit',(e)=>{
    e.preventDefault();
    $("#errProducto").textContent="";
    const code=$("#pdCodigo").value.trim();
    const name=$("#pdNombre").value.trim();
    const desc=$("#pdDescripcion").value.trim();
    const price=parseFloat($("#pdPrecio").value);
    const stock=parseInt($("#pdStock").value);
    const stockCritico= $("#pdStockCritico").value ? parseInt($("#pdStockCritico").value) : null;
    const category=$("#pdCategoria").value;
    const image=$("#pdImagen").value.trim();
    // Reglas
    let ok=true, msg=[];
    if(!(code && code.length>=3)) {ok=false; msg.push("Código min 3.");}
    if(!(name && name.length<=100)) {ok=false; msg.push("Nombre requerido (≤100).");}
    if(desc && desc.length>500){ ok=false; msg.push("Descripción ≤500."); }
    if(!(Number.isFinite(price) && price>=0)){ ok=false; msg.push("Precio ≥0."); }
    if(!(Number.isInteger(stock) && stock>=0)){ ok=false; msg.push("Stock entero ≥0."); }
    if(stockCritico!=null && !(Number.isInteger(stockCritico) && stockCritico>=0)){ ok=false; msg.push("Stock crítico entero ≥0."); }
    if(!category){ ok=false; msg.push("Categoría requerida."); }
    if(!ok){ $("#errProducto").textContent = msg.join(" "); return; }
    const prods=LS.get('products',[]);
    if(prods.some(p=>p.code===code)){ $("#errProducto").textContent="Código duplicado."; return; }
    prods.push({code,name,description:desc,price,stock,stockCritico,category,image:image||"assets/img/prod1.svg"});
    LS.set('products',prods);
    alert("Producto guardado."); location.href="productos.html";
  });
}

// Usuarios list
function renderTablaUsuarios(){
  const tb=$("#tablaUsuarios tbody"); if(!tb) return;
  const users=LS.get('users',[]);
  tb.innerHTML = users.map(u=>`
    <tr>
      <td>${u.run}</td>
      <td>${u.nombre} ${u.apellidos}</td>
      <td>${u.correo}</td>
      <td>${u.tipo}</td>
      <td>${u.region||''}</td>
      <td>${u.comuna||''}</td>
    </tr>
  `).join('');
}

// Guardar usuario (validaciones)
function bindFormUsuario(){
  bindRegionComuna("#usRegion","#usComuna");
  const f=$("#formUsuario"); if(!f) return;
  f.addEventListener('submit',(e)=>{
    e.preventDefault();
    $("#errUsuario").textContent="";
    const run=$("#usRun").value.trim().toUpperCase();
    const correo=$("#usCorreo").value.trim();
    const nombre=$("#usNombre").value.trim();
    const apellidos=$("#usApellidos").value.trim();
    const direccion=$("#usDireccion").value.trim();
    const tipo=$("#usTipo").value;
    const region=$("#usRegion").value;
    const comuna=$("#usComuna").value;
    let ok=true, msg=[];
    if(!validarRUN(run)){ ok=false; msg.push("RUN inválido."); }
    if(!validarCorreoDominio(correo)){ ok=false; msg.push("Correo inválido/dominio no permitido."); }
    if(!nombre || nombre.length>50){ ok=false; msg.push("Nombre requerido ≤50."); }
    if(!apellidos || apellidos.length>100){ ok=false; msg.push("Apellidos requerido ≤100."); }
    if(!direccion || direccion.length>300){ ok=false; msg.push("Dirección requerida ≤300."); }
    if(!ok){ $("#errUsuario").textContent = msg.join(" "); return; }
    const users=LS.get('users',[]);
    if(users.some(u=>u.run===run)){ $("#errUsuario").textContent="RUN ya existe."; return; }
    users.push({run, correo, nombre, apellidos, fecha: $("#usFecha").value||null, tipo, region, comuna, direccion});
    LS.set('users', users);
    alert("Usuario guardado."); location.href="usuarios.html";
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderTablaProductos();
  renderTablaUsuarios();
  bindFormProducto();
  bindFormUsuario();
});
