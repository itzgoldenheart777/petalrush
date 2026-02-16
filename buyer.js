function showHome(){

document.getElementById("content").innerHTML=`

<h3>Flowers</h3>

<div>🌹 Rose ₹70</div>

<div>🌷 Tulip ₹120</div>

`;

}

function showCart(){

document.getElementById("content").innerHTML="Cart empty";

}

function showOrders(){

document.getElementById("content").innerHTML="No orders";

}

function showProfile(){

const email =
localStorage.getItem("user");

document.getElementById("content").innerHTML=`

<h3>${email}</h3>

<button onclick="logout()">Logout</button>

`;

}

function logout(){

localStorage.clear();

location.href="index.html";

}

showHome();