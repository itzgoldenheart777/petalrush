const supabaseUrl =
"https://lssjsgfppehhclxqulso.supabase.co";

const supabaseKey =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0";

const client =
supabase.createClient(
supabaseUrl,
supabaseKey
);


// Signup
async function signup(){

const email =
document.getElementById("email").value;

const password =
document.getElementById("password").value;

const { error } =
await client
.from("users")
.insert([{email,password}]);

if(error){

alert(error.message);

}else{

alert("Signup success");

}

}


// Login
async function login(){

const email =
document.getElementById("email").value;

const password =
document.getElementById("password").value;

const { data,error } =
await client
.from("users")
.select("*")
.eq("email",email)
.eq("password",password);

if(data && data.length>0){

localStorage.setItem("user",email);

alert("Login success");

loadOrders();

}else{

alert("Invalid login");

}

}


// Load flowers
async function loadFlowers(){

const { data } =
await client
.from("flowers")
.select("*");

const container =
document.getElementById("flowers");

container.innerHTML="";

data.forEach(flower=>{

container.innerHTML+=`

<div class="flower">

<h3>${flower.name}</h3>

<p>₹${flower.price}</p>

<button onclick="orderFlower('${flower.name}',${flower.price})">
Order
</button>

</div>

`;

});

}


// Order flower
async function orderFlower(name,price){

const email=
localStorage.getItem("user");

if(!email){

alert("Login first");

return;

}

await client
.from("orders")
.insert([
{
flower_name:name,
price:price,
user_email:email
}
]);

alert("Order placed");

loadOrders();

}


// Load orders
async function loadOrders(){

const email=
localStorage.getItem("user");

if(!email)return;

const { data }=
await client
.from("orders")
.select("*")
.eq("user_email",email);

const container=
document.getElementById("orders");

container.innerHTML="";

data.forEach(order=>{

container.innerHTML+=`

<div class="flower">

${order.flower_name}
₹${order.price}

</div>

`;

});

}


loadFlowers();
loadOrders();