// Supabase configuration
const supabaseUrl = "https://lssjsgfppehhclxqulso.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0";

const client = supabase.createClient(supabaseUrl, supabaseKey);


// Load flowers automatically
async function loadFlowers() {

const { data, error } = await client
.from("flowers")
.select("*");

if(error){
console.log(error);
return;
}

const container = document.getElementById("flowers");

container.innerHTML = "";

data.forEach(flower => {

container.innerHTML += `
<div class="flower">

<h3>${flower.name}</h3>

<p>Price: ₹${flower.price}</p>

<button onclick="orderFlower('${flower.name}', ${flower.price})">
Order Now
</button>

</div>
`;

});

}


// Signup
async function signup(){

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const { error } = await client
.from("users")
.insert([{ email, password }]);

if(error){

alert("Signup failed");

}else{

alert("Signup success");

}

}


// Login
async function login(){

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const { data } = await client
.from("users")
.select("*")
.eq("email", email)
.eq("password", password);

if(data.length > 0){

localStorage.setItem("user", email);

alert("Login success");

}else{

alert("Invalid login");

}

}


// Order flower
async function orderFlower(name, price){

const email = localStorage.getItem("user");

if(!email){

alert("Please login first");

return;

}

const { error } = await client
.from("orders")
.insert([
{
flower_name: name,
price: price,
user_email: email
}
]);

if(error){

alert("Order failed");

}else{

alert("Order placed successfully");

}

}


// Run automatically
loadFlowers();