const DEMO_USER = 'estudiante';
const DEMO_PASSWORD = '123456';
let products = [
 {id:1,name:'iPhone XR 64GB',price:650000,category:'Electrónica',emoji:'📱',state:'Como nuevo',location:'Villavicencio'},
 {id:2,name:'AirPods Pro 2',price:90000,category:'Electrónica',emoji:'🎧',state:'Nuevo',location:'Villavicencio'},
 {id:3,name:'Libro Cálculo Stewart',price:80000,category:'Libros',emoji:'📖',state:'Buen estado',location:'Campus'},
 {id:4,name:'Mochila Totto Original',price:95000,category:'Ropa',emoji:'🎒',state:'Como nueva',location:'Campus'},
 {id:5,name:'Calculadora científica',price:55000,category:'Papelería',emoji:'🧮',state:'Buen estado',location:'Villavicencio'}
];
let favorites = JSON.parse(localStorage.getItem('unimarketFavorites') || '[]');
function money(v){return '$'+Number(v).toLocaleString('es-CO')}
function renderProducts(list=products,target='productGrid'){
 const grid=document.getElementById(target); if(!grid)return;
 grid.innerHTML=list.length?list.map(p=>`<article class="product"><button class="heart ${favorites.includes(p.id)?'active':''}" onclick="toggleFavorite(${p.id},this)">♥</button><div class="product-img">${p.emoji}</div><div class="product-info"><h3>${p.name}</h3><div class="price">${money(p.price)}</div><div class="meta">${p.state} · ${p.location}</div></div></article>`).join(''):'<p>No hay productos para mostrar.</p>';
}
function toggleFavorite(id,btn){favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];localStorage.setItem('unimarketFavorites',JSON.stringify(favorites));btn.classList.toggle('active')}
function showSection(id){document.querySelectorAll('.page-section').forEach(s=>s.classList.remove('active-section'));const sec=document.getElementById(id);if(sec)sec.classList.add('active-section');document.querySelectorAll('.nav-item[data-section]').forEach(b=>b.classList.toggle('active',b.dataset.section===id));if(id==='inicio')renderProducts();if(id==='favoritos')renderProducts(products.filter(p=>favorites.includes(p.id)),'favoriteGrid');if(id==='categorias')renderCategories()}
function renderCategories(){const box=document.getElementById('categoryList');box.innerHTML=['Libros','Electrónica','Ropa','Papelería','Muebles','Deportes','Otros'].map(c=>`<button onclick="filterCategory('${c}')">${c}</button>`).join('');renderProducts(products,'categoryProducts')}
function filterCategory(c){renderProducts(products.filter(p=>p.category===c),'categoryProducts')}
function openPublish(){document.getElementById('publishModal').classList.add('open')}
function closePublish(){document.getElementById('publishModal').classList.remove('open')}
function publishProduct(){const name=document.getElementById('newName').value.trim(),price=Number(document.getElementById('newPrice').value),category=document.getElementById('newCategory').value;if(!name||!price){alert('Completa nombre y precio.');return}products.unshift({id:Date.now(),name,price,category,emoji:'📦',state:'Nueva publicación',location:'Campus'});closePublish();renderProducts();document.querySelectorAll('#publishModal input,#publishModal textarea').forEach(x=>x.value='');alert('Producto publicado correctamente.')}
function enterApp(username){document.getElementById('loginScreen').style.display='none';document.getElementById('mainApp').style.display='flex';document.getElementById('loggedUser').textContent=username+'⌄';renderProducts()}
function logout(){localStorage.removeItem('unimarketLoggedUser');document.getElementById('mainApp').style.display='none';document.getElementById('loginScreen').style.display='flex';document.getElementById('loginPassword').value=''}
function togglePassword(){const i=document.getElementById('loginPassword');i.type=i.type==='password'?'text':'password'}
function showDemoCredentials(){document.getElementById('loginUser').value=DEMO_USER;document.getElementById('loginPassword').value=DEMO_PASSWORD;document.getElementById('loginError').style.color='#0a8b3c';document.getElementById('loginError').textContent='Datos de demostración cargados.'}
function demoRegister(){alert('El registro real se puede conectar posteriormente a una base de datos.')}
document.getElementById('loginForm').addEventListener('submit',e=>{e.preventDefault();const u=document.getElementById('loginUser').value.trim(),p=document.getElementById('loginPassword').value,error=document.getElementById('loginError');if(u===DEMO_USER&&p===DEMO_PASSWORD){if(document.getElementById('rememberMe').checked)localStorage.setItem('unimarketLoggedUser',u);enterApp(u)}else{error.textContent='Usuario o contraseña incorrectos.'}});
document.querySelectorAll('.nav-item[data-section]').forEach(b=>b.addEventListener('click',()=>showSection(b.dataset.section)));
document.getElementById('searchInput').addEventListener('input',e=>{const t=e.target.value.toLowerCase().trim();renderProducts(products.filter(p=>p.name.toLowerCase().includes(t)||p.category.toLowerCase().includes(t)))});
document.querySelectorAll('.category').forEach(b=>b.addEventListener('click',()=>{const c=b.dataset.category;renderProducts(products.filter(p=>p.category===c));document.getElementById('searchInput').value=c}));
const saved=localStorage.getItem('unimarketLoggedUser');if(saved)enterApp(saved);else document.getElementById('mainApp').style.display='none';
