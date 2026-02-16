const supabaseUrl = "https://lssjsgfppehhclxqulso.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0";

const client = supabase.createClient(supabaseUrl, supabaseKey);


async function addFlower(){

const name=document.getElementById("name").value;

const price=document.getElementById("price").value;

await client.from("flowers").insert([{

name:name,
price:price

}]);

alert("Flower added");

}