const supabaseUrl = "https://lssjsgfppehhclxqulso.supabase.co";

const supabaseKey = "YOUR_ANON_KEY_HERE";

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

const { data, error } = await client
.from("users")
.insert([{ email, password, role }]);

if(error){

alert("Signup error: " + error.message);

}else{

alert("Signup successful");

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
.eq("password", password);

if(error){

alert(error.message);
return;

}

if(!data || data.length === 0){

alert("Invalid login");
return;

}

const user = data[0];

localStorage.setItem("user", user.email);
localStorage.setItem("role", user.role);

alert("Login successful");

if(user.role === "buyer"){

window.location.href = "buyer.html";

}

if(user.role === "seller"){

window.location.href = "seller.html";

}

}