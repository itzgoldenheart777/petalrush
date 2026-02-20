/* =========================
   SUPABASE INIT
========================= */

const SUPABASE_URL = "https://lssjsgfppehhclxqulso.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/* =========================
   USER CHECK
========================= */

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

  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    alert(error.message);
    return;
  }

  renderProducts(data);
}

function renderProducts(products) {

  const home = document.getElementById("home");

  home.innerHTML = "";

  products.forEach(p => {

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
   SEARCH
========================= */

async function searchProducts() {

  const value = document.getElementById("search").value;

  const { data } = await supabaseClient
    .from("products")
    .select("*")
    .ilike("name", `%${value}%`);

  renderProducts(data);
}

/* =========================
   FILTER
========================= */

async function applyFilter(type) {

  let query = supabaseClient.from("products").select("*");

  if (type === "low")
    query = query.order("price", { ascending: true });

  if (type === "high")
    query = query.order("price", { ascending: false });

  if (type === "new")
    query = query.order("created_at", { ascending: false });

  const { data } = await query;

  renderProducts(data);
}

/* =========================
   PRODUCT DETAIL
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

    <button class="btn" onclick="addCart()">
      Add to Cart
    </button>

    <button class="btn" onclick="showHome()" style="background:#333">
      Back
    </button>

  `;
}

/* =========================
   CHANGE QTY
========================= */

function changeQty(val) {

  currentQty += val;

  if (currentQty < 1) currentQty = 1;

  if (currentQty > currentProduct.quantity) {

    alert("Stock limit reached");

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

  const { data: existing } = await supabaseClient
    .from("cart")
    .select("*")
    .eq("user_email", user.email)
    .eq("product_id", currentProduct.id)
    .maybeSingle();

  if (existing) {

    await supabaseClient
      .from("cart")
      .update({
        qty: existing.qty + currentQty
      })
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
   SHOW CART
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

  const div = document.getElementById("cartItems");

  div.innerHTML = "";

  data.forEach(item => {

    let price = item.products.price * item.qty;

    subtotal += price;

    div.innerHTML += `
      <div class="cart-item">

        ${item.products.name} x ${item.qty}

        <button onclick="removeCart('${item.id}')">
          X
        </button>

      </div>
    `;
  });

  calculateTotals(subtotal);

  loadAddresses();
}

/* =========================
   REMOVE CART
========================= */

async function removeCart(id) {

  await supabaseClient
    .from("cart")
    .delete()
    .eq("id", id);

  showCart();
}

/* =========================
   TOTAL CALCULATION
========================= */

function calculateTotals(subtotal) {

  let delivery = subtotal < 500 ? 50 : subtotal * 0.05;

  let gst = subtotal * 0.05;

  let total = subtotal + delivery + gst - discountAmount;

  document.getElementById("subtotal").innerText = subtotal;

  document.getElementById("delivery").innerText = delivery;

  document.getElementById("gst").innerText = gst;

  document.getElementById("discount").innerText = discountAmount;

  document.getElementById("grandTotal").innerText = total;
}

/* =========================
   COUPON
========================= */

async function applyCoupon() {

  const code = document.getElementById("couponInput").value;

  const { data } = await supabaseClient
    .from("coupons")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (!data) {
    alert("Invalid coupon");
    return;
  }

  discountAmount = data.discount;

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

  let total = 0;

  for (const item of cartData) {

    let price = item.qty * item.products.price;

    total += price;

    await supabaseClient
      .from("order_items")
      .insert({

        order_id: orderId,

        product_id: item.products.id,

        qty: item.qty,

        price: price

      });

    await supabaseClient
      .from("products")
      .update({

        quantity: item.products.quantity - item.qty

      })
      .eq("id", item.products.id);
  }

  await supabaseClient
    .from("orders")
    .insert({

      id: orderId,

      user_email: user.email,

      price: total,

      status: "Placed"

    });

  await supabaseClient
    .from("cart")
    .delete()
    .eq("user_email", user.email);

  alert("Order placed: " + orderId);

  showHome();
}

/* =========================
   ADDRESS
========================= */

async function loadAddresses() {

  const { data } = await supabaseClient
    .from("addresses")
    .select("*")
    .eq("user_email", user.email);

  const select = document.getElementById("addressSelect");

  select.innerHTML = "";

  data.forEach(a => {

    select.innerHTML += `<option>${a.address}</option>`;
  });
}

/* =========================
   PROFILE
========================= */

function showProfile() {

  hideAll();

  document.getElementById("profile").style.display = "block";
}

/* =========================
   START
========================= */

showHome();
