
const SUPABASE_URL="https://lssjsgfppehhclxqulso.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0";


const client=supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

const user=
JSON.parse(localStorage.getItem("user"));



function logout(){

localStorage.clear();

window.location="index.html";

}



function hideAll(){

document.getElementById("profile").classList.add("hidden");
document.getElementById("bank").classList.add("hidden");
document.getElementById("catalog").classList.add("hidden");
document.getElementById("products").classList.add("hidden");

}



function showProfile(){

hideAll();
document.getElementById("profile").classList.remove("hidden");

}


function showBank(){

hideAll();
document.getElementById("bank").classList.remove("hidden");

}


function showCatalog(){

hideAll();
document.getElementById("catalog").classList.remove("hidden");

}


function showProducts(){

hideAll();

document.getElementById("products").classList.remove("hidden");

loadProducts();

}



async function saveProfile(){

await client

.from("users")

.update({

name:
document.getElementById("name").value

})

.eq("email",user.email);


alert("Saved");

}



async function saveBank(){

await client

.from("users")

.update({

bank_name:
document.getElementById("bank_name").value,

account_number:
document.getElementById("account_number").value,

ifsc:
document.getElementById("ifsc").value

})

.eq("email",user.email);


alert("Bank saved");

}



async function uploadProduct(){

await client

.from("products")

.insert([{

seller_email:user.email,

name:
document.getElementById("pname").value,

price:
document.getElementById("price").value,

quantity:
document.getElementById("qty").value,

description:
document.getElementById("desc").value,

image_url:
document.getElementById("image").value,

pickup_location:
document.getElementById("location").value

}]);


alert("Uploaded");

}



async function loadProducts(){

const {data}=await client

.from("products")

.select("*")

.eq("seller_email",user.email);


let html="";

data.forEach(p=>{

html+=`

<div>

<h4>${p.name}</h4>

<p>₹${p.price}</p>

<p>${p.quantity}</p>

</div>

`;

});


document.getElementById("productList").innerHTML=html;

}
