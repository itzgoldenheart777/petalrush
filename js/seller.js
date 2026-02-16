// SUPABASE CONFIG

const SUPABASE_URL =
"https://lssjsgfppehhclxqulso.supabase.co";

const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0";

const client =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);


// CHECK USER

const user =
JSON.parse(localStorage.getItem("user"));

if(!user){

window.location="index.html";

}



// LOGOUT

function logout(){

localStorage.clear();

window.location="index.html";

}



// NAVIGATION

function hideAll(){

document.getElementById("profile").style.display="none";

document.getElementById("bank").style.display="none";

document.getElementById("catalog").style.display="none";

document.getElementById("products").style.display="none";

}


function showProfile(){

hideAll();

document.getElementById("profile").style.display="block";

}


function showBank(){

hideAll();

document.getElementById("bank").style.display="block";

}


function showCatalog(){

hideAll();

document.getElementById("catalog").style.display="block";

}


function showProducts(){

hideAll();

document.getElementById("products").style.display="block";

loadProducts();

}



// SAVE PROFILE

async function saveProfile(){

const name =
document.getElementById("name").value;

const {error} =
await client
.from("users")
.update({name})
.eq("email",user.email);

if(error){

alert(error.message);

}else{

alert("Saved");

}

}



// SAVE BANK

async function saveBank(){

const bank_name =
document.getElementById("bank_name").value;

const account_number =
document.getElementById("account_number").value;

const ifsc =
document.getElementById("ifsc").value;


const {error} =
await client
.from("users")
.update({

bank_name,
account_number,
ifsc

})
.eq("email",user.email);


if(error){

alert(error.message);

}else{

alert("Bank Saved");

}

}



// IMAGE PREVIEW

let imageFile;

function previewImage(event){

imageFile = event.target.files[0];

const reader = new FileReader();

reader.onload=function(){

document.getElementById("preview").src =
reader.result;

};

reader.readAsDataURL(imageFile);

}



// UPLOAD PRODUCT

async function uploadProduct(){

const name =
document.getElementById("pname").value;

const price =
document.getElementById("price").value;

const qty =
document.getElementById("qty").value;

const desc =
document.getElementById("desc").value;

const location =
document.getElementById("location").value;


const fileName =
Date.now()+"_"+imageFile.name;


// upload image

const {error:uploadError} =
await client.storage
.from("products")
.upload(fileName,imageFile);


if(uploadError){

alert(uploadError.message);

return;

}


// get image url

const image_url =
SUPABASE_URL +
"/storage/v1/object/public/products/"
+ fileName;


// save product

const {error} =
await client
.from("products")
.insert([{

seller_email:user.email,
name,
price,
quantity:qty,
description:desc,
pickup_location:location,
image_url

}]);


if(error){

alert(error.message);

}else{

alert("Product uploaded");

}

}



// LOAD PRODUCTS

async function loadProducts(){

const {data,error} =
await client
.from("products")
.select("*")
.eq("seller_email",user.email);


if(error){

alert(error.message);

return;

}


let html="";

data.forEach(p=>{

html+=`

<div>

<img src="${p.image_url}" width="80">

<p>${p.name}</p>

<p>₹${p.price}</p>

</div>

`;

});


document.getElementById("productList").innerHTML=html;

}
