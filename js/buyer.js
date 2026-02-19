const supabaseClient = window.supabase.createClient(
"https://lssjsgfppehhclxqulso.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0"
);


let user =
JSON.parse(localStorage.getItem("user"));


let currentProduct=null;
let currentQty=1;



function hideAll(){

home.style.display="none";
detail.style.display="none";
profile.style.display="none";
cart.style.display="none";
filterSection.style.display="none";

}



async function showHome(){

hideAll();

home.style.display="grid";
filterSection.style.display="flex";

const {data} =
await supabaseClient
.from("products")
.select("*");

renderProducts(data);

}



function renderProducts(data){

home.innerHTML="";

if(!data)return;

data.forEach(p=>{

home.innerHTML+=`
<div class="card"
onclick="showDetail('${p.id}')">

<img src="${p.image_url}">

<div>${p.name}</div>

<div class="price">
₹${p.price}
</div>

</div>
`;

});

}



async function searchProducts(){

const text=search.value;

const {data}=
await supabaseClient
.from("products")
.select("*")
.ilike("name","%"+text+"%");

renderProducts(data);

}



async function applyFilter(type){

let query=
supabaseClient
.from("products")
.select("*");

if(type=="low")
query=query.order("price",{ascending:true});

if(type=="high")
query=query.order("price",{ascending:false});

if(type=="new")
query=query.order("created_at",{ascending:false});

const {data}=await query;

renderProducts(data);

}



async function showDetail(id){

hideAll();

detail.style.display="block";

const {data}=
await supabaseClient
.from("products")
.select("*")
.eq("id",id)
.single();

currentProduct=data;
currentQty=1;

detail.innerHTML=`

<img src="${data.image_url}" width="100%">

<h2>${data.name}</h2>

<div class="price">
₹<span id="priceDisplay">
${data.price}
</span>
</div>

<p>
Stock: ${data.quantity}
</p>

<div class="qty-box">

<button class="qty-btn"
onclick="changeQty(-1)">-</button>

<span id="qty">1</span>

<button class="qty-btn"
onclick="changeQty(1)">+</button>

</div>

<button class="btn"
onclick="addCart()">
Add to Cart
</button>

<button class="btn logout"
onclick="showHome()">
Back
</button>

`;

}



function changeQty(v){

currentQty+=v;

if(currentQty<1)
currentQty=1;

if(currentQty>currentProduct.quantity){

alert("Not enough stock");

currentQty=currentProduct.quantity;

}

qty.innerText=currentQty;

priceDisplay.innerText=
currentProduct.price*currentQty;

}



async function addCart(){

await supabaseClient
.from("cart")
.insert({

user_email:user.email,
product_id:currentProduct.id,
qty:currentQty

});

alert("Added to cart");

}



async function showCart(){

hideAll();

cart.style.display="block";

const {data}=
await supabaseClient
.from("cart")
.select("qty,products(name,price)")
.eq("user_email",user.email);

cartItems.innerHTML="";

let total=0;

data.forEach(item=>{

let price=
item.products.price*item.qty;

total+=price;

cartItems.innerHTML+=`

<div class="cart-item">

<span>
${item.products.name}
(x${item.qty})
</span>

<span>
₹${price}
</span>

</div>
`;

});

totalEl.innerText="Total ₹"+total;

}



async function showProfile(){

hideAll();

profile.style.display="block";

const {data}=
await supabaseClient
.from("users")
.select("*")
.eq("email",user.email)
.single();

if(data.avatar_url)
avatar.src=data.avatar_url;

profileInfo.innerHTML=
`
Name: ${data.name||""}
<br>
Phone: ${data.phone||""}
`;

loadAddresses();
loadOrders();

}



async function saveAddress(){

navigator.geolocation.getCurrentPosition(

async pos=>{

let gps=
pos.coords.latitude+
","+
pos.coords.longitude;

let addr=
addressInput.value+
"| GPS:"+gps;

await supabaseClient
.from("addresses")
.insert({

user_email:user.email,
address:addr

});

loadAddresses();

});

}



async function loadAddresses(){

const {data}=
await supabaseClient
.from("addresses")
.select("*")
.eq("user_email",user.email);

addressList.innerHTML="";

data.forEach(a=>{

addressList.innerHTML+=
`<div>${a.address}</div>`;

});

}



async function loadOrders(){

const {data}=
await supabaseClient
.from("orders")
.select("*")
.eq("user_email",user.email);

ordersList.innerHTML="";

data.forEach(o=>{

ordersList.innerHTML+=
`<div>${o.flower_name} ₹${o.price}</div>`;

});

}



async function uploadAvatar(e){

let file=e.target.files[0];

let name=user.email+".png";

await supabaseClient.storage
.from("avatars")
.upload(name,file,{upsert:true});

let url=
"https://lssjsgfppehhclxqulso.supabase.co/storage/v1/object/public/avatars/"
+name;

avatar.src=url;

await supabaseClient
.from("users")
.upsert({

email:user.email,
avatar_url:url

});

}



function placeOrder(){

alert("Order system ready");

}



function logout(){

localStorage.removeItem("user");

location="index.html";

}



showHome();
