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

/* ============================= */
/* GLOBALS */
/* ============================= */

let cartData = [];
let discountAmount = 0;

/* ============================= */
/* NAVIGATION */
/* ============================= */

function hideAll() {
  document.getElementById("home").style.display = "none";
  document.getElementById("detail").style.display = "none";
  document.getElementById("profile").style.display = "none";
  document.getElementById("cart").style.display = "none";
  document.getElementById("filterSection").style.display = "none";
}

/* ============================= */
/* PROFILE */
/* ============================= */

async function showProfile() {
  hideAll();
  document.getElementById("profile").style.display = "block";

  const { data } = await supabaseClient
    .from("users")
    .select("*")
    .eq("email", user.email)
    .single();

  if (data) {
    document.getElementById("nameInput").value = data.name || "";
    document.getElementById("phoneInput").value = data.phone || "";
  }
}

/* ============================= */
/* CART */
/* ============================= */

async function showCart() {
  hideAll();
  document.getElementById("cart").style.display = "block";

  const { data, error } = await supabaseClient
    .from("cart")
    .select(`
      id,
      qty,
      products(id,name,price,quantity)
    `)
    .eq("user_email", user.email);

  if (error) {
    alert(error.message);
    return;
  }

  cartData = data;
  let subtotal = 0;

  const cartItemsDiv = document.getElementById("cartItems");
  cartItemsDiv.innerHTML = "";

  data.forEach(item => {
    let price = item.products.price * item.qty;
    subtotal += price;

    cartItemsDiv.innerHTML += `
      <div class="cart-item">
        <span>${item.products.name} x ${item.qty}</span>
        <div>
          ₹${price}
          <button onclick="removeCart('${item.id}')" 
          style="margin-left:10px;background:red;border:none;color:white;padding:5px;">
          X</button>
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
  let grandTotal = subtotal + delivery + gst - discountAmount;

  document.getElementById("subtotal").innerText = subtotal.toFixed(2);
  document.getElementById("delivery").innerText = delivery.toFixed(2);
  document.getElementById("gst").innerText = gst.toFixed(2);
  document.getElementById("discount").innerText = discountAmount.toFixed(2);
  document.getElementById("grandTotal").innerText = grandTotal.toFixed(2);
}

async function removeCart(id) {
  await supabaseClient.from("cart").delete().eq("id", id);
  showCart();
}

/* ============================= */
/* COUPON */
/* ============================= */

async function applyCoupon() {

  const code = document.getElementById("couponInput").value.trim();

  if (!code) {
    alert("Enter coupon");
    return;
  }

  const { data, error } = await supabaseClient
    .from("coupons")
    .select("*")
    .eq("code", code)
    .maybeSingle();  // FIXED

  if (error || !data) {
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

/* ============================= */
/* PLACE ORDER */
/* ============================= */

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

  alert("Order placed successfully\nOrder ID: " + orderId);
  discountAmount = 0;
  showCart();
}

/* ============================= */
/* ADDRESS */
/* ============================= */

async function loadAddressDropdown() {

  const { data } = await supabaseClient
    .from("addresses")
    .select("*")
    .eq("user_email", user.email);

  const select = document.getElementById("addressSelect");
  select.innerHTML = "";

  data.forEach(a => {
    select.innerHTML += `
      <option value="${a.address}">
        ${a.address}
      </option>
    `;
  });
}

/* ============================= */
/* START */
/* ============================= */

showCart();
