// Supabase connection
const SUPABASE_URL = "https://lssjsgfppehhclxqulso.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0";

const supabase = window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);


// SHOW AUTH OPTIONS
function showAuthOptions(){

document.getElementById("mainScreen").style.display="none";
document.getElementById("authOptions").style.display="block";

}


// OPEN LOGIN
function openLogin(){

document.getElementById("authOptions").style.display="none";
document.getElementById("loginScreen").style.display="block";

}


// OPEN SIGNUP
function openSignup(){

document.getElementById("authOptions").style.display="none";
document.getElementById("signupScreen").style.display="block";

}


// BACK
function goBack(){

location.reload();

}


// SIGNUP
async function signup(){

const email=document.getElementById("signupEmail").value;
const password=document.getElementById("signupPassword").value;
const role=document.getElementById("signupRole").value;

const {error}=await supabase.from("users").insert([
{email,password,role}
]);

if(error){

alert(error.message);

}else{

alert("Signup success");
openLogin();

}

}


// LOGIN
async function login(){

const email=document.getElementById("loginEmail").value;
const password=document.getElementById("loginPassword").value;

const {data,error}=await supabase
.from("users")
.select("*")
.eq("email",email)
.eq("password",password)
.single();

if(error){

alert("Invalid login");
return;

}

localStorage.setItem("user",JSON.stringify(data));

if(data.role==="buyer"){

window.location="buyer.html";

}else{

window.location="seller.html";

}

}
