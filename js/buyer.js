/* =========================
   SUPABASE INIT
========================= */

const supabaseClient = window.supabase.createClient(
  "https://lssjsgfppehhclxqulso.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0"
); 

/* 
const supabase = window.supabase.createClient(
 "https://lssjsgfppehhclxqulso.supabase.co",
 "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0"
); 
*/

let user = JSON.parse(localStorage.getItem("user"));

if(!user){
location="index.html";
}

/* NAVIGATION */

function hideAll(){
home.style.display="none";
cart.style.display="none";
profile.style.display="none";
detail.style.display="none";
filterSection.style.display="none";
}

/* HOME */

async function showHome(){

hideAll();

home.style.display="grid";
filterSection.style.display="block";

let {data} = await supabase
.from("products")
.select("*");

home.innerHTML="";

data.forEach(p=>{

home.innerHTML+=`

<div class="card" onclick="showDetail('${p.id}')">

<img src="${p.image_url}">

<div>${p.name}</div>

<div class="price">₹${p.price}</div>

</div>

`;

});

}

/* DETAIL */

async function showDetail(id){

hideAll();

detail.style.display="block";

let {data} = await supabase
.from("products")
.select("*")
.eq("id",id)
.single();

detail.innerHTML=`

<img src="${data.image_url}" width="100%">

<h3>${data.name}</h3>

<div>₹${data.price}</div>

<button class="btn" onclick="addCart('${data.id}')">
Add to Cart
</button>

<button class="btn" onclick="showHome()">Back</button>

`;

}

/* ADD CART */

async function addCart(productId){

let {data} = await supabase
.from("cart")
.insert({
user_email:user.email,
product_id:productId,
qty:1
});

alert("Added to cart");

}

/* SHOW CART */

let discount=0;

async function showCart(){

hideAll();

cart.style.display="block";

let {data} = await supabase
.from("cart")
.select(`
id,
qty,
products(name,price,quantity,id)
`)
.eq("user_email",user.email);

cartItems.innerHTML="";

let subtotal=0;

data.forEach(item=>{

let price=item.products.price*item.qty;

subtotal+=price;

cartItems.innerHTML+=`

<div class="cart-item">

<div>
${item.products.name} x ${item.qty}
</div>

<div>
₹${price}
<button onclick="removeCart('${item.id}')">X</button>
</div>

</div>

`;

});

let delivery=subtotal<500?50:subtotal*0.05;
let gst=subtotal*0.05;
let total=subtotal+delivery+gst-discount;

subtotal.innerText=subtotal;
delivery.innerText=delivery;
gst.innerText=gst;
discount.innerText=discount;
grandTotal.innerText=total;

loadAddressDropdown();

}

/* REMOVE CART */

async function removeCart(id){

await supabase
.from("cart")
.delete()
.eq("id",id);

showCart();

}

/* COUPON */

async function applyCoupon(){

let code=couponInput.value;

let {data}=await supabase
.from("coupons")
.select("*")
.eq("code",code)
.single();

if(!data){
alert("Invalid coupon");
return;
}

discount=data.discount;

alert("Applied");

showCart();

}

/* PLACE ORDER */

async function placeOrder(){

let orderId="ORD-"+Date.now();

let {data}=await supabase
.from("cart")
.select(`
id,
qty,
products(id,price,quantity,name)
`)
.eq("user_email",user.email);

let total=0;

for(let item of data){

let price=item.qty*item.products.price;

total+=price;

await supabase.from("order_items")
.insert({
order_id:orderId,
product_id:item.products.id,
qty:item.qty,
price:price
});

await supabase.from("products")
.update({
quantity:item.products.quantity-item.qty
})
.eq("id",item.products.id);

}

await supabase.from("orders")
.insert({
id:orderId,
user_email:user.email,
price:total-discount
});

await supabase
.from("cart")
.delete()
.eq("user_email",user.email);

alert("Order placed\n"+orderId);

showProfile();

}

/* PROFILE */

async function showProfile(){

hideAll();

profile.style.display="block";

loadAddresses();
loadOrders();

}

/* SAVE PROFILE */

async function saveProfile(){

await supabase
.from("users")
.upsert({
email:user.email,
name:nameInput.value,
phone:phoneInput.value
});

alert("Saved");

}

/* ADDRESS */

async function saveAddress(){

let {data}=await supabase
.from("addresses")
.select("*")
.eq("user_email",user.email);

if(data.length>=3){
alert("Max 3 address");
return;
}

navigator.geolocation.getCurrentPosition(async pos=>{

await supabase
.from("addresses")
.insert({
user_email:user.email,
address:addressInput.value,
gps:pos.coords.latitude+","+pos.coords.longitude
});

loadAddresses();

});

}

async function loadAddresses(){

let {data}=await supabase
.from("addresses")
.select("*")
.eq("user_email",user.email);

addressList.innerHTML="";

data.forEach(a=>{

addressList.innerHTML+=`
<div class="address-card">

${a.address}

<button onclick="deleteAddress('${a.id}')">
Delete
</button>

</div>
`;

});

}

async function deleteAddress(id){

await supabase
.from("addresses")
.delete()
.eq("id",id);

loadAddresses();

}

async function loadAddressDropdown(){

let {data}=await supabase
.from("addresses")
.select("*")
.eq("user_email",user.email);

addressSelect.innerHTML="";

data.forEach(a=>{

addressSelect.innerHTML+=`

<option>${a.address}</option>

`;

});

}

/* ORDERS */

async function loadOrders(){

let {data}=await supabase
.from("orders")
.select("*")
.eq("user_email",user.email);

ordersList.innerHTML="";

data.forEach(o=>{

ordersList.innerHTML+=`

<div class="order-card">

Order ID: ${o.id}

<br>

₹${o.price}

</div>

`;

});

}

/* LOGOUT */

function logout(){

localStorage.removeItem("user");

location="index.html";

}

/* START */

showHome();
