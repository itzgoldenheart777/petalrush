const supabase = window.supabase.createClient(
"https://lssjsgfppehhclxqulso.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0"
);


function hideAll(){

mainScreen.classList.add("hidden");
authOptions.classList.add("hidden");
loginScreen.classList.add("hidden");
signupScreen.classList.add("hidden");
forgotScreen.classList.add("hidden");

}


function showAuthOptions(){

hideAll();
authOptions.classList.remove("hidden");

}


function openLogin(){

hideAll();
loginScreen.classList.remove("hidden");

}


function openSignup(){

hideAll();
signupScreen.classList.remove("hidden");

}


function openForgot(){

hideAll();
forgotScreen.classList.remove("hidden");

}


function goBack(){

hideAll();
authOptions.classList.remove("hidden");

}



// SIGNUP

async function signup(){

const email=signupEmail.value;
const password=signupPassword.value;
const role=signupRole.value;

const { error } = await supabase
.from("users")
.insert([{email,password,role}]);

status.innerText = error ? error.message : "Signup success";

}



// LOGIN

async function login(){

const { data,error } = await supabase
.from("users")
.select("*")
.eq("email",loginEmail.value)
.eq("password",loginPassword.value)
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



// OTP

let otp;

function sendOTP(){

otp=Math.floor(100000+Math.random()*900000);

alert("OTP: "+otp);

otpBox.classList.remove("hidden");

}


async function resetPassword(){

if(otpInput.value!=otp){

alert("Wrong OTP");
return;

}


await supabase
.from("users")
.update({password:newPassword.value})
.eq("email",resetEmail.value);

alert("Password updated");

openLogin();

}