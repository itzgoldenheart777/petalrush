const supabaseUrl = "https://lssjsgfppehhclxqulso.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0";

const client = supabase.createClient(supabaseUrl, supabaseKey);


async function signup(){

const email = document.getElementById("email").value;

const password = document.getElementById("password").value;

const role = document.getElementById("role").value;


const { error } = await client
.from("users")
.insert([{

email: email,
password: password,
role: role

}]);


if(error){

alert(error.message);

}else{

alert("Signup success");

}

}



async function login(){

const email = document.getElementById("email").value;

const password = document.getElementById("password").value;


const { data, error } = await client
.from("users")
.select("*")
.eq("email", email)
.eq("password", password)
.single();


if(error){

alert("Invalid login");

return;

}


localStorage.setItem("user", email);

localStorage.setItem("role", data.role);


if(data.role === "buyer"){

window.location.href="buyer.html";

}else{

window.location.href="seller.html";

}

}