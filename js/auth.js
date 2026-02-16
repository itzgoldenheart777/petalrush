

const supabase = window.supabase.createClient(

"https://lssjsgfppehhclxqulso.supabase.co",

"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0"

);


// SIGNUP
async function signup(){

const email = document.getElementById("signupEmail").value;

const password = document.getElementById("signupPassword").value;

const role = document.getElementById("signupRole").value;


const { error } = await supabase

.from("users")

.insert([{ email, password, role }]);


if(error){

document.getElementById("status").innerText = error.message;

}else{

document.getElementById("status").innerText = "Account created. Please login.";

}

}


// LOGIN
async function login(){

const email = document.getElementById("loginEmail").value;

const password = document.getElementById("loginPassword").value;


const { data, error } = await supabase

.from("users")

.select("*")

.eq("email", email)

.eq("password", password)

.single();


if(error){

document.getElementById("status").innerText = "Invalid login";

return;

}


localStorage.setItem("user", JSON.stringify(data));


if(data.role === "buyer"){

window.location="buyer.html";

}else{

window.location="seller.html";

}

}


// FORGOT PASSWORD
function forgotPassword(){

alert("Contact support to reset password (Supabase reset coming next)");

}