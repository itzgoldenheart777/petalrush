async function signup(){

const email = emailInput.value;
const password = passwordInput.value;
const role = roleSelect.value;

await client.from("users")
.insert([{email,password,role}]);

alert("Signup success");

}


async function login(){

const email = emailInput.value;
const password = passwordInput.value;

const { data } =
await client.from("users")
.select("*")
.eq("email",email)
.eq("password",password);

if(data.length > 0){

const user = data[0];

localStorage.setItem("user", email);
localStorage.setItem("role", user.role);

if(user.role === "seller"){

location.href="seller.html";

}else{

location.href="dashboard.html";

}

}else{

alert("Login failed");

}

}