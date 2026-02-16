const supabase = window.supabase.createClient(

"https://lssjsgfppehhclxqulso.supabase.co",

"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0"

);


// SCREEN CONTROL

function hideAll(){

document.getElementById("intro").classList.add("hidden");

document.getElementById("login").classList.add("hidden");

document.getElementById("signup").classList.add("hidden");

document.getElementById("forgot").classList.add("hidden");

}


function showLogin(){

hideAll();

document.getElementById("login").classList.remove("hidden");

}


function showSignup(){

hideAll();

document.getElementById("signup").classList.remove("hidden");

}


function showForgot(){

hideAll();

document.getElementById("forgot").classList.remove("hidden");

}



// SIGNUP

async function signup(){

const email = signupEmail.value;

const password = signupPassword.value;

const role = signupRole.value;


const { error } = await supabase

.from("users")

.insert([{ email, password, role }]);


status.innerText = error ? error.message : "Signup successful";

}



// LOGIN

async function login(){

const email = loginEmail.value;

const password = loginPassword.value;


const { data, error } = await supabase

.from("users")

.select("*")

.eq("email", email)

.eq("password", password)

.single();


if(error){

status.innerText="Invalid login";

return;

}


localStorage.setItem("user",JSON.stringify(data));


if(data.role==="buyer")

window.location="buyer.html";

else

window.location="seller.html";

}



// OTP SYSTEM

let generatedOTP;


function sendOTP(){

generatedOTP=Math.floor(100000+Math.random()*900000);

alert("Your OTP is: "+generatedOTP);

document.getElementById("otpSection").classList.remove("hidden");

}


async function verifyOTP(){

if(otpInput.value!=generatedOTP){

alert("Wrong OTP");

return;

}


await supabase

.from("users")

.update({ password:newPassword.value })

.eq("email",resetEmail.value);


alert("Password reset successful");

showLogin();

}