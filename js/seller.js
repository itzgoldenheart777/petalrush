
// ✅ YOUR SUPABASE DETAILS
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0";


const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ✅ GET LOGGED USER
const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  alert("Login required");
  window.location = "index.html";
}


// ✅ LOGOUT
function logout() {
  localStorage.removeItem("user");
  window.location = "index.html";
}


// ✅ SHOW SECTIONS
function showProfile() {

  hideAll();

  document.getElementById("profileSection").style.display = "block";
}


function showBank() {

  hideAll();

  document.getElementById("bankSection").style.display = "block";
}


function showCatalog() {

  hideAll();

  document.getElementById("catalogSection").style.display = "block";
}


function showProducts() {

  hideAll();

  document.getElementById("productsSection").style.display = "block";

  loadProducts();
}


function hideAll() {

  document.getElementById("profileSection").style.display="none";
  document.getElementById("bankSection").style.display="none";
  document.getElementById("catalogSection").style.display="none";
  document.getElementById("productsSection").style.display="none";
}



// ✅ SAVE PROFILE
async function saveProfile() {

  const name = document.getElementById("name").value;

  const { error } = await client
  .from("seller_profiles")
  .upsert({
    seller_email: user.email,
    name: name
  });

  if(error) alert(error.message);
  else alert("Profile saved");

}



// ✅ SAVE BANK
async function saveBank() {

  const bank = document.getElementById("bank").value;

  const { error } = await client
  .from("seller_profiles")
  .upsert({
    seller_email: user.email,
    bank_name: bank
  });

  if(error) alert(error.message);
  else alert("Bank saved");

}



// ✅ PREVIEW IMAGE
function previewImage(event){

  const img = document.getElementById("preview");

  img.src = URL.createObjectURL(event.target.files[0]);

}



// ✅ UPLOAD PRODUCT
async function uploadProduct(){

  const file = document.getElementById("image").files[0];

  const fileName = Date.now()+"-"+file.name;

  const { error:uploadError } =
  await client.storage
  .from("products")
  .upload(fileName,file);

  if(uploadError){
    alert(uploadError.message);
    return;
  }

  const { data } =
  client.storage.from("products").getPublicUrl(fileName);


  const name = document.getElementById("productName").value;
  const price = document.getElementById("price").value;


  const { error } =
  await client.from("products").insert({

    seller_email:user.email,
    name:name,
    price:price,
    image_url:data.publicUrl

  });

  if(error) alert(error.message);
  else alert("Product uploaded");

}



// ✅ LOAD PRODUCTS
async function loadProducts(){

  const { data,error } =
  await client.from("products")
  .select("*")
  .eq("seller_email",user.email);


  const div=document.getElementById("productList");

  div.innerHTML="";

  data.forEach(p=>{

    div.innerHTML+=`

    <div>
    <img src="${p.image_url}" width="100">
    <p>${p.name}</p>
    <p>₹${p.price}</p>
    </div>

    `;

  });

}
