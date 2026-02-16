const supabaseUrl = "https://lssjsgfppehhclxqulso.supabase.co";
const supabaseKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0";

const client = supabase.createClient(supabaseUrl, supabaseKey);


// Signup
async function signup(){

const email = document.getElementById("email").value.trim();
const password = document.getElementById("password").value.trim();
const role = document.getElementById("role").value;

if(!email || !password){
alert("Enter email and password");
return;
}

const { error } = await client
.from("users")
.insert([{ email, password, role }]);

if(error){
alert(error.message);
}else{
alert("Signup successful. Please login.");
}

}


// Login
async function login(){

const email = document.getElementById("email").value.trim();
const password = document.getElementById("password").value.trim();

const { data, error } = await client
.from("users")
.select("*")
.eq("email", email)
.eq("password", password)
.single();

if(error || !data){

alert("Invalid email or password");
return;

}

// Save session
localStorage.setItem("user", data.email);
localStorage.setItem("role", data.role);

// Redirect based on role
if(data.role === "buyer"){

window.location.href = "buyer.html";

}
else if(data.role === "seller"){

window.location.href = "seller.html";

}
else if(data.role === "admin"){

window.location.href = "admin.html";

}

}