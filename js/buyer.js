const supabaseClient = window.supabase.createClient(
"https://lssjsgfppehhclxqulso.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0"
);

let user = JSON.parse(localStorage.getItem("user"));

if(!user){
alert("Please login");
location="index.html";
}

let currentProduct=null;
let currentQty=1;

function hideAll(){
document.getElementById("home").style.display="none";
document.getElementById("detail").style.display="none";
document.getElementById("profile").style.display="none";
document.getElementById("cart").style.display="none";
}

async function showHome(){
hideAll();
const home=document.getElementById("home");
home.style.display="grid";

const {data,error}=await supabaseClient
.from("products")
.select("*");

if(error) return console.log(error);

renderProducts(data);
}

function renderProducts(data){
const home=document.getElementById("home");
home.innerHTML="";
if(!data) return;

data.forEach(p=>{
home.innerHTML+=`
<div class="card" onclick="showDetail('${p.id}')">
<img src="${p.image_url || 'default-avatar.png'}">
${p.name}
<div class="price">₹${p.price}</div>
</div>`;
});
}

async function searchProducts(){
const text=document.getElementById("search").value;

const {data}=await supabaseClient
.from("products")
.select("*")
.ilike("name","%"+text+"%");

renderProducts(data);
}

async function applyFilter(type){
let query=supabaseClient.from("products").select("*");

if(type=="low") query=query.order("price",{ascending:true});
if(type=="high") query=query.order("price",{ascending:false});
if(type=="new") query=query.order("created_at",{ascending:false});

const {data}=await query;
renderProducts(data);
}

async function showDetail(id){
hideAll();
const detail=document.getElementById("detail");
detail.style.display="block";

const {data}=await supabaseClient
.from("products")
.select("*")
.eq("id",id)
.single();

currentProduct=data;
currentQty=1;

detail.innerHTML=`
<img src="${data.image_url}" width="100%">
<h2>${data.name}</h2>
<div class="price">₹<span id="price">${data.price}</span></div>
Stock: ${data.quantity}
<div class="qty-box">
<button class="qty-btn" onclick="changeQty(-1)">-</button>
<span id="qty">1</span>
<button class="qty-btn" onclick="changeQty(1)">+</button>
</div>
<button class="btn" onclick="addCart()">Add to Cart</button>
<button class="btn logout" onclick="showHome()">Back</button>
`;
}

function changeQty(val){
currentQty+=val;
if(currentQty<1) currentQty=1;
if(currentQty>currentProduct.quantity){
alert("Not enough stock");
currentQty=currentProduct.quantity;
}
document.getElementById("qty").innerText=currentQty;
document.getElementById("price").innerText=currentProduct.price*currentQty;
}

async function addCart(){
const {error}=await supabaseClient.from("cart").insert({
user_email:user.email,
product_id:currentProduct.id,
qty:currentQty
});
if(error) alert(error.message);
else alert("Added to cart");
}

async function showCart(){
hideAll();
document.getElementById("cart").style.display="block";

const {data}=await supabaseClient
.from("cart")
.select("qty,products(name,price)")
.eq("user_email",user.email);

const cartItems=document.getElementById("cartItems");
cartItems.innerHTML="";
let total=0;

if(data){
data.forEach(item=>{
if(item.products){
let price=item.products.price*item.qty;
total+=price;
cartItems.innerHTML+=`
<div class="cart-item">
${item.products.name}
₹${price}
</div>`;
}
});
}

document.getElementById("total").innerText="Total ₹"+total;
}

async function showProfile(){
hideAll();
document.getElementById("profile").style.display="block";

const {data}=await supabaseClient
.from("users")
.select("*")
.eq("email",user.email)
.single();

if(data){
if(data.avatar_url)
document.getElementById("avatar").src=data.avatar_url;

document.getElementById("profileInfo").innerHTML=
`Name: ${data.name || ""}<br>Phone: ${data.phone || ""}`;
}

loadAddresses();
loadOrders();
}

async function saveAddress(){
const addr=document.getElementById("addressInput").value;
await supabaseClient.from("addresses").insert({
user_email:user.email,
address:addr
});
loadAddresses();
}

async function loadAddresses(){
const {data}=await supabaseClient
.from("addresses")
.select("*")
.eq("user_email",user.email);

const div=document.getElementById("addressList");
div.innerHTML="";
if(data){
data.forEach(a=>{
div.innerHTML+=`<div>${a.address}</div>`;
});
}
}

async function loadOrders(){
const {data}=await supabaseClient
.from("orders")
.select("*")
.eq("user_email",user.email);

const div=document.getElementById("ordersList");
div.innerHTML="";
if(data){
data.forEach(o=>{
div.innerHTML+=`<div>${o.flower_name} ₹${o.price}</div>`;
});
}
}

async function uploadAvatar(e){
const file=e.target.files[0];
const name=user.email+".png";

await supabaseClient.storage
.from("avatars")
.upload(name,file,{upsert:true});

const url="https://lssjsgfppehhclxqulso.supabase.co/storage/v1/object/public/avatars/"+name;

document.getElementById("avatar").src=url;

await supabaseClient.from("users").upsert({
email:user.email,
avatar_url:url
});
}

function placeOrder(){
alert("Order placed");
}

function logout(){
localStorage.removeItem("user");
location="index.html";
}

showHome();
