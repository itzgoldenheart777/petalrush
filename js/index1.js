
// YOUR SUPABASE DETAILS
const SUPABASE_URL = "https://lssjsgfppehhclxqulso.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0";


// INIT CLIENT
const client = supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);



function hideAll(){

document.getElementById("splash").style.display="none";
document.getElementById("auth").style.display="none";
document.getElementById("login").style.display="none";
document.getElementById("signup").style.display="none";

}



function showAuth(){

hideAll();
document.getElementById("auth").style.display="block";

}


function showLogin(){

hideAll();
document.getElementById("login").style.display="block";

}


function showSignup(){

hideAll();
document.getElementById("signup").style.display="block";

}


function backSplash(){

hideAll();
document.getElementById("splash").style.display="block";

}


function backAuth(){

hideAll();
document.getElementById("auth").style.display="block";

}



async function signup(){

const email =
document.getElementById("signupEmail").value;

const password =
document.getElementById("signupPassword").value;

const role =
document.getElementById("role").value;



const {data,error} =
await client.auth.signUp({

email:email,
password:password

});


if(error){

alert(error.message);
return;

}


// save role
await client
.from("users")
.insert([
{
email:email,
role:role
}
]);


alert("Signup success");

showLogin();

}



async function login(){

const email =
document.getElementById("loginEmail").value;

const password =
document.getElementById("loginPassword").value;



const {data,error} =
await client.auth.signInWithPassword({

email:email,
password:password

});


if(error){

alert(error.message);
return;

}


// get role
const {data:userData} =
await client
.from("users")
.select("*")
.eq("email",email)
.single();


localStorage.setItem(
"user",
JSON.stringify(userData)
);


if(userData.role=="buyer"){

window.location="buyer.html";

}else{

window.location="seller.html";

}

}



async function forgot(){

const email =
prompt("Enter your email");


await client.auth.resetPasswordForEmail(
email
);

alert("Reset link sent");

}
