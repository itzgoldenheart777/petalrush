/* ═══════════════════════════════════════════════════════════
   PetalRush — index.js  |  Auth + Role Router
   Flow: index.html → login/signup → role check → buyer/seller
═══════════════════════════════════════════════════════════ */

/* ── SUPABASE ────────────────────────────────────────────── */
const _sb = window.supabase.createClient(
  "https://lssjsgfppehhclxqulso.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0"
);

/* ── THEME (auto dark/light) ─────────────────────────────── */
(function initTheme(){
  var saved = localStorage.getItem("prTheme");
  if(!saved) saved = window.matchMedia("(prefers-color-scheme:light)").matches ? "light" : "dark";
  if(saved === "light") document.body.classList.add("light-mode");
})();

/* ── SCREEN MANAGER ──────────────────────────────────────── */
var _screens = ["splash","auth","login","signup","forgot","loading"];

function showScreen(id){
  _screens.forEach(function(s){
    var el = document.getElementById(s);
    if(el) el.classList.toggle("hidden", s !== id);
  });
}

/* ── INIT: check existing session ────────────────────────── */
window.addEventListener("load", async function(){
  showScreen("loading");

  // 1. Try localStorage first (instant)
  try {
    var cached = JSON.parse(localStorage.getItem("prUser"));
    if(cached && cached.email && cached.role){
      // Verify Supabase session in background
      _sb.auth.getSession().then(function(s){
        if(!s.data || !s.data.session) {
          // Session expired - clear and show login
          localStorage.removeItem("prUser");
          localStorage.removeItem("user");
          localStorage.removeItem("prSellerUser");
          showScreen("splash");
        }
      });
      routeByRole(cached);
      return;
    }
  } catch(e){}

  // 2. Check Supabase session
  var s = await _sb.auth.getSession();
  if(s.data && s.data.session && s.data.session.user){
    await fetchRoleAndRoute(s.data.session.user);
  } else {
    showScreen("splash");
  }
});

/* ── AUTH STATE LISTENER ─────────────────────────────────── */
_sb.auth.onAuthStateChange(async function(event, session){
  if(event === "SIGNED_IN" && session && session.user){
    // Don't double-route if already on a page
    if(window._routing) return;
    await fetchRoleAndRoute(session.user);
  } else if(event === "PASSWORD_RECOVERY"){
    showScreen("login");
    showMsg("loginMsg", "Set your new password in the seller/buyer panel after logging in.", "ok");
  }
});

/* ── ROLE FETCH + ROUTE ───────────────────────────────────── */
async function fetchRoleAndRoute(authUser){
  window._routing = true;
  showScreen("loading");

  try {
    // Get role from users table
    var res = await _sb.from("users").select("role,name,avatar_url").eq("email", authUser.email).maybeSingle();
    var role = (res.data && res.data.role) || "buyer";
    var name = (res.data && res.data.name) || (authUser.user_metadata && authUser.user_metadata.full_name) || authUser.email.split("@")[0];
    var avatar = (res.data && res.data.avatar_url) || (authUser.user_metadata && authUser.user_metadata.avatar_url) || "";

    var userObj = {
      id: authUser.id,
      email: authUser.email,
      role: role,
      name: name,
      avatar_url: avatar,
      user_metadata: authUser.user_metadata || {}
    };

    routeByRole(userObj);
  } catch(e){
    console.error("Role fetch error:", e);
    // Default to buyer on error
    routeByRole({ id: authUser.id, email: authUser.email, role: "buyer", user_metadata: authUser.user_metadata || {} });
  }
}

function routeByRole(userObj){
  // Save to localStorage for buyer.html
  localStorage.setItem("user", JSON.stringify(userObj));
  // Save separate key for seller.html
  localStorage.setItem("prUser", JSON.stringify(userObj));

  if(userObj.role === "seller"){
    // Also save in seller.html format
    localStorage.setItem("prSellerUser", JSON.stringify({
      id: userObj.id,
      email: userObj.email,
      user_metadata: Object.assign({}, userObj.user_metadata, {
        full_name: userObj.name,
        avatar_url: userObj.avatar_url
      })
    }));
    window.location.href = "seller.html";
  } else {
    window.location.href = "buyer.html";
  }
}

/* ── SPLASH ──────────────────────────────────────────────── */
function showAuth(){
  showScreen("auth");
  // Animate in
  var el = document.getElementById("auth");
  if(el){ el.style.opacity = "0"; setTimeout(function(){ el.style.opacity = "1"; }, 10); }
}

/* ── AUTH OPTIONS ────────────────────────────────────────── */
function showLogin(){
  clearMsg("loginMsg");
  showScreen("login");
  setTimeout(function(){ var e = document.getElementById("loginEmail"); if(e) e.focus(); }, 200);
}

function showSignup(){
  clearMsg("signupMsg");
  showScreen("signup");
  setTimeout(function(){ var e = document.getElementById("signupEmail"); if(e) e.focus(); }, 200);
}

function showForgot(){
  clearMsg("forgotMsg");
  showScreen("forgot");
}

function backSplash(){ showScreen("splash"); }
function backAuth(){ showScreen("auth"); }

/* ── LOGIN ───────────────────────────────────────────────── */
async function login(){
  var email    = (document.getElementById("loginEmail").value||"").trim().toLowerCase();
  var password = document.getElementById("loginPassword").value;

  if(!email || !password){ showMsg("loginMsg","Enter your email and password","err"); return; }

  var btn = document.getElementById("loginBtn");
  setLoading(btn, true, "Signing in...");

  var r = await _sb.auth.signInWithPassword({ email: email, password: password });

  if(r.error){
    setLoading(btn, false, "Login");
    var msg = r.error.message;
    if(msg.includes("Invalid login")) msg = "Incorrect email or password.";
    else if(msg.includes("Email not confirmed")) msg = "Please verify your email first.";
    showMsg("loginMsg", msg, "err");
    return;
  }

  // onAuthStateChange will call fetchRoleAndRoute
  setLoading(btn, true, "Redirecting...");
}

/* ── SIGNUP ──────────────────────────────────────────────── */
async function signup(){
  var email    = (document.getElementById("signupEmail").value||"").trim().toLowerCase();
  var password = document.getElementById("signupPassword").value;
  var role     = document.getElementById("role").value || "buyer";

  if(!email || !password){ showMsg("signupMsg","Enter email and password","err"); return; }
  if(password.length < 6){ showMsg("signupMsg","Password must be at least 6 characters","err"); return; }
  if(!email.includes("@")){ showMsg("signupMsg","Enter a valid email address","err"); return; }

  var btn = document.getElementById("signupBtn");
  setLoading(btn, true, "Creating account...");

  // Create Supabase Auth user
  var r = await _sb.auth.signUp({
    email: email,
    password: password,
    options: { data: { role: role } }
  });

  if(r.error){
    setLoading(btn, false, "Create Account");
    var msg = r.error.message;
    if(msg.includes("already registered")) msg = "This email is already registered. Try logging in.";
    showMsg("signupMsg", msg, "err");
    return;
  }

  // Save role to users table
  await _sb.from("users").upsert({
    email: email,
    role: role,
    created_at: new Date().toISOString()
  }, { onConflict: "email" });

  // Check if email confirmation required
  var needsConfirm = r.data && r.data.user && !r.data.user.email_confirmed_at && !r.data.session;

  if(needsConfirm){
    setLoading(btn, false, "Create Account");
    showMsg("signupMsg",
      "Account created! Check your email to verify, then login.",
      "ok"
    );
    setTimeout(function(){ showScreen("login"); clearMsg("loginMsg"); }, 2500);
    return;
  }

  // Auto-login successful
  if(r.data && r.data.user){
    setLoading(btn, true, "Redirecting...");
    await fetchRoleAndRoute(r.data.user);
  } else {
    setLoading(btn, false, "Create Account");
    showMsg("signupMsg", "Account created! Please log in.", "ok");
    setTimeout(function(){ showScreen("login"); }, 1800);
  }
}

/* ── FORGOT PASSWORD ─────────────────────────────────────── */
async function forgotPassword(){
  var email = (document.getElementById("forgotEmail").value||"").trim().toLowerCase();
  if(!email){ showMsg("forgotMsg","Enter your email address","err"); return; }

  var btn = document.getElementById("forgotBtn");
  setLoading(btn, true, "Sending...");

  var r = await _sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/index.html"
  });

  setLoading(btn, false, "Send Reset Link");

  if(r.error){
    showMsg("forgotMsg", r.error.message, "err");
  } else {
    showMsg("forgotMsg", "Reset link sent! Check your email inbox.", "ok");
    setTimeout(function(){ showScreen("login"); }, 2500);
  }
}

/* ── FORGOT LINK on login page ───────────────────────────── */
function forgot(){
  showForgot();
}

/* ── ENTER KEY HANDLERS ──────────────────────────────────── */
document.addEventListener("DOMContentLoaded", function(){
  // Login form: Enter key
  ["loginEmail","loginPassword"].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.addEventListener("keydown", function(e){ if(e.key==="Enter") login(); });
  });
  // Signup form: Enter key
  ["signupEmail","signupPassword"].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.addEventListener("keydown", function(e){ if(e.key==="Enter") signup(); });
  });
  // Forgot: Enter key
  var fe = document.getElementById("forgotEmail");
  if(fe) fe.addEventListener("keydown", function(e){ if(e.key==="Enter") forgotPassword(); });
});

/* ── HELPERS ─────────────────────────────────────────────── */
function setLoading(btn, loading, text){
  if(!btn) return;
  btn.disabled = loading;
  btn.textContent = text;
}

function showMsg(elId, text, type){
  var el = document.getElementById(elId);
  if(!el) return;
  el.textContent = text;
  el.className = "msg " + (type === "ok" ? "msg-ok" : "msg-err");
  el.style.display = "block";
}

function clearMsg(elId){
  var el = document.getElementById(elId);
  if(el){ el.textContent = ""; el.style.display = "none"; }
}
