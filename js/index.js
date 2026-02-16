function showAuth(){

hideAll();
document.getElementById("authChoice").classList.remove("hidden");

}

function showLogin(){

hideAll();
document.getElementById("loginScreen").classList.remove("hidden");

}

function showSignup(){

hideAll();
document.getElementById("signupScreen").classList.remove("hidden");

}

function showForgot(){

hideAll();
document.getElementById("forgotScreen").classList.remove("hidden");

}

function back(){

hideAll();
document.getElementById("authChoice").classList.remove("hidden");

}

function hideAll(){

document.getElementById("splash").classList.add("hidden");
document.getElementById("authChoice").classList.add("hidden");
document.getElementById("loginScreen").classList.add("hidden");
document.getElementById("signupScreen").classList.add("hidden");
document.getElementById("forgotScreen").classList.add("hidden");

}


async function signup(){

const email =
document.getElementById("signupEmail").value;

const password =
document.getElementById("signupPassword").value;

const role =
document.getElementById("signupRole").value;


const { data, error } =
await supabase.auth.signUp({

email: email,
password: password

});

if(error){

alert(error.message);

}else{

await supabase.from("users").insert([{

email: email,
role: role

}]);

alert("Signup successful");

showLogin();

}

}


async function login(){

const email =
document.getElementById("loginEmail").value;

const password =
document.getElementById("loginPassword").value;

const { data, error } =
await supabase.auth.signInWithPassword({

email: email,
password: password

});

if(error){

alert("Invalid login");

return;

}

const { data: userData } =
await supabase
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



async function sendReset(){

const email =
document.getElementById("forgotEmail").value;

const { error } =
await supabase.auth.resetPasswordForEmail(email);

if(error){

alert(error.message);

}else{

alert("Password reset email sent");

}

}
