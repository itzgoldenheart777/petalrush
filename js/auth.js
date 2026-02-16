// REPLACE THESE with your actual Supabase Project details
const SUPABASE_URL = "https://lssjsgfppehclxqulso.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pzZ2ZwcGVoaGNseHF1bHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTAwNzksImV4cCI6MjA4Njc2NjA3OX0.nRq1iFBiOEyty0ALRmS45ARoso7BsB0ENOvttu7nvX0"; 
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Navigation Functions
function showAuthOptions() {
    hideAll();
    document.getElementById("authOptions").classList.remove("hidden");
}

function openLogin() {
    hideAll();
    document.getElementById("loginScreen").classList.remove("hidden");
}

function openSignup() {
    hideAll();
    document.getElementById("signupScreen").classList.remove("hidden");
}

function goBack() {
    location.reload();
}

function hideAll() {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
}

// Authentication Logic
async function signup() {
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const role = document.getElementById("signupRole").value;

    if(!email || !password) return alert("Please fill all fields");

    const { data, error } = await supabase.from("users").insert([
        { email, password, role }
    ]);

    if (error) {
        alert("Signup Error: " + error.message);
    } else {
        alert("Account created! Please login.");
        openLogin();
    }
}

async function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();

    if (error || !data) {
        alert("Invalid login credentials.");
        return;
    }

    // Store user session
    localStorage.setItem("user", JSON.stringify(data));

    // Redirect based on role
    if (data.role === "buyer") {
        window.location.href = "buyer.html";
    } else {
        window.location.href = "seller.html";
    }
}
