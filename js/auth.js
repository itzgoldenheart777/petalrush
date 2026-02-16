// Supabase connection
const SUPABASE_URL = "https://lssjsgfppehhclxqulso.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0";

const supabase = window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);


// Screen control
function hideAll(){

document.getElementById("mainScreen").classList.add("hidden");
document.getElementById("authOptions").classList.add("hidden");
document.getElementById("loginScreen").classList.add("hidden");
document.getElementById("signupScreen").classList.add("hidden");
document.getElementById("forgotScreen").classList.add("hidden");

}


function showAuthOptions(){

hideAll();
document.getElementById("authOptions").classList.remove("hidden");

}


function openLogin(){

hideAll();
document.getElementById("loginScreen").classList.remove("hidden");

}


function openSignup(){

hideAll();
document.getElementById("signupScreen").classList.remove("hidden");

}


function openForgot(){

hideAll();
document.getElementById("forgotScreen").classList.remove("hidden");

}


function goBack(){

hideAll();
document.getElementById("mainScreen").classList.remove("hidden");

}



// Signup
async function signup(){

const email=document.getElementById("signupEmail").value;
const password=document.getElementById("signupPassword").value;
const role=document.getElementById("signupRole").value;

const { error } = await supabase
.from("users")
.insert([{email,password,role}]);

if(error){

alert(error.message);

}else{

alert("Signup success");
openLogin();

}

}



// Login
async function login(){

const email=document.getElementById("loginEmail").value;
const password=document.getElementById("loginPassword").value;

const { data,error } = await supabase
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



// OTP
let otp;

function sendOTP(){

otp=Math.floor(100000+Math.random()*900000);

alert("Demo OTP: "+otp);

document.getElementById("otpBox").classList.remove("hidden");

}


async function resetPassword(){

const entered=document.getElementById("otpInput").value;

if(entered!=otp){

alert("Wrong OTP");
return;

}


const email=document.getElementById("resetEmail").value;
const pass=document.getElementById("newPassword").value;


await supabase
.from("users")
.update({password:pass})
.eq("email",email);


alert("Password reset success");

openLogin();

}
