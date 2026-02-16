const SUPABASE_URL = "https://lssjsgfppehhclxqulso.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const user = JSON.parse(localStorage.getItem("user"));

if (!user || user.role !== "seller") {
  window.location = "index.html";
}

// Navigation
function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.add("hidden");
  });
  document.getElementById(id).classList.remove("hidden");

  if (id === "products") loadProducts();
}

// Logout
function logout() {
  localStorage.removeItem("user");
  window.location = "index.html";
}

// Image Preview
function previewImage() {
  const file = document.getElementById("imageInput").files[0];
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById("previewImg").src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Save Profile
async function saveProfile() {
  await client.from("seller_profiles").upsert({
    seller_email: user.email,
    full_name: document.getElementById("fullName").value,
    phone: document.getElementById("phone").value,
    shop_name: document.getElementById("shopName").value,
    address: document.getElementById("address").value
  });

  alert("Profile Saved");
}

// Save Bank
async function saveBank() {
  await client.from("seller_profiles").upsert({
    seller_email: user.email,
    bank_name: document.getElementById("bankName").value,
    account_number: document.getElementById("accountNumber").value,
    ifsc_code: document.getElementById("ifsc").value
  });

  alert("Bank Details Saved");
}

// Upload Product
async function uploadProduct() {
  const file = document.getElementById("imageInput").files[0];
  const fileName = Date.now() + "-" + file.name;

  await client.storage.from("products").upload(fileName, file);

  const { data } = client.storage.from("products").getPublicUrl(fileName);

  await client.from("products").insert({
    seller_email: user.email,
    name: document.getElementById("productName").value,
    price: document.getElementById("price").value,
    quantity: document.getElementById("quantity").value,
    pickup_address: document.getElementById("pickup").value,
    description: document.getElementById("description").value,
    image_url: data.publicUrl
  });

  alert("Product Uploaded");
}

// Load Products
async function loadProducts() {
  const { data } = await client
    .from("products")
    .select("*")
    .eq("seller_email", user.email);

  const container = document.getElementById("productList");
  container.innerHTML = "";

  data.forEach(p => {
    container.innerHTML += `
      <div class="product-card">
        <img src="${p.image_url}">
        <h4>${p.name}</h4>
        <p>₹ ${p.price}</p>
      </div>
    `;
  });
}
