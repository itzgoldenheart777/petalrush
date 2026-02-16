const supabaseUrl = "https://lssjsgfppehhclxqulso.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0";

const client = supabase.createClient(supabaseUrl, supabaseKey);


loadFlowers();


async function loadFlowers(){

const { data } = await client.from("flowers").select("*");

let html="";

data.forEach(f=>{

html+=`

<div>

<h4>${f.name}</h4>

<p>₹${f.price}</p>

<button onclick="order('${f.name}',${f.price})">
Order
</button>

</div>

`;

});

document.getElementById("flowers").innerHTML=html;

}


async function order(name,price){

const email=localStorage.getItem("user");

await client.from("orders").insert([{

flower_name:name,
price:price,
user_email:email

}]);

alert("Order placed");

}