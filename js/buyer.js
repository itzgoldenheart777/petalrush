/* =========================
   SUPABASE INIT
========================= */

const supabaseClient = window.supabase.createClient(
  "https://lssjsgfppehhclxqulso.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0"
);

let user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  alert("Login required");
  location = "index.html";
}

/* =========================
   GLOBAL STATE
========================= */

let currentProduct = null;
let currentQty = 1;
let cartData = [];
let discountAmount = 0;

/* =========================
   UTIL
========================= */

function hideAll() {
  document.getElementById("home").style.display = "none";
  document.getElementById("detail").style.display = "none";
  document.getElementById("profile").style.display = "none";
  document.getElementById("cart").style.display = "none";
  document.getElementById("filterSection").style.display = "none";
}

/* =========================
   HOME
========================= */

async function showHome() {
  hideAll();
  home.style.display = "grid";
  filterSection.style.display = "flex";

  const { data } = await supabaseClient
    .from("products")
    .select("*");

  renderProducts(data);
}

function renderProducts(data) {
  home.innerHTML = "";

  data.forEach(p => {
    home.innerHTML += `
      <div class="card" onclick="showDetail('${p.id}')">
        <img src="${p.image_url}">
        <div>${p.name}</div>
        <div class="price">₹${p.price}</div>
      </div>
    `;
  });
}

/* =========================
   PRODUCT DETAIL
========================= */

async function showDetail(id) {
  hideAll();
  detail.style.display = "block";

  const { data } = await supabaseClient
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  currentProduct = data;
  currentQty = 1;

  detail.innerHTML = `
    <img src="${data.image_url}" width="100%">
    <h2>${data.name}</h2>
    <div class="price">
      ₹<span id="price">${data.price}</span>
    </div>
    Stock: ${data.quantity}
    <br><br>
    <button onclick="changeQty(-1)">-</button>
    <span id="qty">1</span>
    <button onclick="changeQty(1)">+</button>
    <button class="btn" onclick="addCart()">Add to Cart</button>
    <button class="btn" onclick="showHome()" style="background:#333">Back</button>
  `;
}

function changeQty(val) {
  currentQty += val;

  if (currentQty < 1) currentQty = 1;

  if (currentQty > currentProduct.quantity) {
    alert("Not enough stock");
    currentQty = currentProduct.quantity;
  }

  document.getElementById("qty").innerText = currentQty;
  document.getElementById("price").innerText =
    currentProduct.price * currentQty;
}

/* =========================
   ADD TO CART
========================= */

async function addCart() {

  const { data: product } = await supabaseClient
    .from("products")
    .select("quantity")
    .eq("id", currentProduct.id)
    .single();

  if (currentQty > product.quantity) {
    alert("Stock not available");
    return;
  }

  const { data: cartItem } = await supabaseClient
    .from("cart")
    .select("*")
    .eq("user_email", user.email)
    .eq("product_id", currentProduct.id)
    .single();

  if (cartItem) {
    await supabaseClient
      .from("cart")
      .update({ qty: cartItem.qty + currentQty })
      .eq("id", cartItem.id);
  } else {
    await supabaseClient
      .from("cart")
      .insert({
        user_email: user.email,
        product_id: currentProduct.id,
        qty: currentQty
      });
  }

  alert("Added to cart");
}

/* =========================
   SHOW CART
========================= */

async function showCart() {

  hideAll();
  cart.style.display = "block";

  const { data, error } = await supabaseClient
    .from("cart")
    .select(`
      id,
      qty,
      products(id,name,price)
    `)
    .eq("user_email", user.email);

  if (error) {
    alert(error.message);
    return;
  }

  cartData = data;
  let subtotal = 0;

  cartItems.innerHTML = "";

  data.forEach(item => {

    let price = item.products.price * item.qty;
    subtotal += price;

    cartItems.innerHTML += `
      <div class="cart-item">
        <span>${item.products.name} x ${item.qty}</span>
        <div>
          <span>₹${price}</span>
          <button onclick="removeCart('${item.id}')" 
          style="margin-left:10px;background:red;border:none;color:white;padding:5px;">X</button>
        </div>
      </div>
    `;
  });

  calculateTotals(subtotal);
  loadAddressDropdown();
}

async function removeCart(id) {
  await supabaseClient.from("cart").delete().eq("id", id);
  showCart();
}

/* =========================
   TOTAL CALCULATION
========================= */

function calculateTotals(subtotal) {

  let delivery = subtotal < 500 ? 50 : subtotal * 0.05;
  let gst = subtotal * 0.05;

  let grandTotal =
    subtotal + delivery + gst - discountAmount;

  document.getElementById("subtotal").innerText = subtotal.toFixed(2);
  document.getElementById("delivery").innerText = delivery.toFixed(2);
  document.getElementById("gst").innerText = gst.toFixed(2);
  document.getElementById("discount").innerText = discountAmount.toFixed(2);
  document.getElementById("grandTotal").innerText = grandTotal.toFixed(2);
}

/* =========================
   COUPON
========================= */

async function applyCoupon() {

  const code =
    document.getElementById("couponInput").value.trim();

  if (!code) {
    alert("Enter coupon");
    return;
  }

  const { data } = await supabaseClient
    .from("coupons")
    .select("*")
    .eq("code", code)
    .single();

  if (!data) {
    alert("Invalid coupon");
    return;
  }

  discountAmount = data.discount;
  alert("Coupon applied");
  showCart();
}

/* =========================
   ADDRESS
========================= */

async function loadAddressDropdown() {

  const { data } = await supabaseClient
    .from("addresses")
    .select("*")
    .eq("user_email", user.email);

  addressSelect.innerHTML = "";

  data.forEach(a => {
    addressSelect.innerHTML +=
      `<option value="${a.address}">${a.address}</option>`;
  });
}

/* =========================
   START
========================= */

showHome();
