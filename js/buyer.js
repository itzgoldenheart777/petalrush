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
   GLOBALS
========================= */

let currentProduct = null;
let currentQty = 1;
let cartData = [];
let discountAmount = 0;

/* =========================
   NAVIGATION
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
  document.getElementById("home").style.display = "grid";
  document.getElementById("filterSection").style.display = "flex";

  const { data } = await supabaseClient
    .from("products")
    .select("*");

  renderProducts(data);
}

function renderProducts(data) {
  const home = document.getElementById("home");
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
   DETAIL
========================= */

async function showDetail(id) {
  hideAll();
  document.getElementById("detail").style.display = "block";

  const { data } = await supabaseClient
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  currentProduct = data;
  currentQty = 1;

  document.getElementById("detail").innerHTML = `
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
   ADD CART
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

  const { data: existing } = await supabaseClient
    .from("cart")
    .select("*")
    .eq("user_email", user.email)
    .eq("product_id", currentProduct.id)
    .maybeSingle();

  if (existing) {
    await supabaseClient
      .from("cart")
      .update({ qty: existing.qty + currentQty })
      .eq("id", existing.id);
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
   CART
========================= */

async function showCart() {
  hideAll();
  document.getElementById("cart").style.display = "block";

  const { data } = await supabaseClient
    .from("cart")
    .select(`
      id,
      qty,
      products(id,name,price,quantity)
    `)
    .eq("user_email", user.email);

  cartData = data;
  let subtotal = 0;

  const cartDiv = document.getElementById("cartItems");
  cartDiv.innerHTML = "";

  data.forEach(item => {
    let price = item.products.price * item.qty;
    subtotal += price;

    cartDiv.innerHTML += `
      <div class="cart-item">
        <span>${item.products.name} x ${item.qty}</span>
        <div>
          ₹${price}
          <button onclick="removeCart('${item.id}')" 
          style="background:red;color:white;border:none;margin-left:10px">X</button>
        </div>
      </div>
    `;
  });

  calculateTotals(subtotal);
  loadAddressDropdown();
}

function calculateTotals(subtotal) {
  let delivery = subtotal < 500 ? 50 : subtotal * 0.05;
  let gst = subtotal * 0.05;
  let grand = subtotal + delivery + gst - discountAmount;

  document.getElementById("subtotal").innerText = subtotal.toFixed(2);
  document.getElementById("delivery").innerText = delivery.toFixed(2);
  document.getElementById("gst").innerText = gst.toFixed(2);
  document.getElementById("discount").innerText = discountAmount.toFixed(2);
  document.getElementById("grandTotal").innerText = grand.toFixed(2);
}

async function removeCart(id) {
  await supabaseClient.from("cart").delete().eq("id", id);
  showCart();
}

/* =========================
   COUPON
========================= */

async function applyCoupon() {

  const code = document.getElementById("couponInput").value.trim();

  const { data } = await supabaseClient
    .from("coupons")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (!data) {
    alert("Invalid coupon");
    return;
  }

  if (data.usage_limit && data.used_count >= data.usage_limit) {
    alert("Coupon limit reached");
    return;
  }

  discountAmount = data.discount;

  await supabaseClient
    .from("coupons")
    .update({ used_count: data.used_count + 1 })
    .eq("code", code);

  alert("Coupon applied");
  showCart();
}

/* =========================
   PLACE ORDER
========================= */

async function placeOrder() {

  if (cartData.length === 0) {
    alert("Cart empty");
    return;
  }

  const orderId = "ORD-" + Date.now();
  let subtotal = 0;

  for (const item of cartData) {

    if (item.qty > item.products.quantity) {
      alert("Stock not available for " + item.products.name);
      return;
    }

    let itemTotal = item.qty * item.products.price;
    subtotal += itemTotal;

    await supabaseClient.from("order_items").insert({
      order_id: orderId,
      product_id: item.products.id,
      qty: item.qty,
      price: itemTotal
    });

    await supabaseClient
      .from("products")
      .update({
        quantity: item.products.quantity - item.qty
      })
      .eq("id", item.products.id);
  }

  await supabaseClient.from("orders").insert({
    id: orderId,
    user_email: user.email,
    price: subtotal - discountAmount,
    status: "Placed"
  });

  await supabaseClient.from("cart")
    .delete()
    .eq("user_email", user.email);

  discountAmount = 0;

  alert("Order placed successfully\nOrder ID: " + orderId);

  showProfile();
}

/* =========================
   PROFILE
========================= */

async function showProfile() {
  hideAll();
  document.getElementById("profile").style.display = "block";
}

/* =========================
   START
========================= */

showHome();

