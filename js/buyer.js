const supabaseUrl = "https://lssjsgfppehhclxqulso.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0";


const client=supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

load();



async function load(){

const {data}=await client
.from("products")
.select("*");


let html="";


data.forEach(p=>{

html+=`

<div class="card">

<img src="${p.image_url}" width="100">

<h3>${p.name}</h3>

<p>₹${p.price}</p>

<button onclick="order('${p.id}')">Buy</button>

</div>

`;

});


document.getElementById("products").innerHTML=html;

}



async function order(id){

const user=
JSON.parse(localStorage.getItem("user"));

await client

.from("orders")

.insert([{

buyer_email:user.email,

product_id:id

}]);


alert("Order placed");

}
