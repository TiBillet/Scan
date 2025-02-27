const API_URL = "https://ton-serveur.com/api"; // serveur plus tard

document.getElementById("loginButton").addEventListener("click", login);
document.getElementById("logoutButton").addEventListener("click", logout);

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Veuillez entrer un email et un mot de passe.");
    return;
  }

  console.log("🛠️ Tentative de connexion avec :", email);

  try {
    // Simulation envoi serveur `fetch`)
    const fakeJWT = generateFakeJWT(email); // Simule un token JWT

    localStorage.setItem("jwt", fakeJWT);
    updateUI();
    alert(" Connexion réussie !");
  } catch (error) {
    console.error(" Erreur de connexion :", error);
    alert("Erreur de connexion !");
  }
}

function logout() {
  localStorage.removeItem("jwt");
  updateUI();
  alert(" Déconnexion réussie !");
}

function updateUI() {
  const token = localStorage.getItem("jwt");
  if (token) {
    document.getElementById("loginButton").style.display = "none";
    document.getElementById("logoutButton").style.display = "block";
    document.getElementById("loginStatus").innerText = " Connecté";
  } else {
    document.getElementById("loginButton").style.display = "block";
    document.getElementById("logoutButton").style.display = "none";
    document.getElementById("loginStatus").innerText = " Déconnecté";
  }
}

// Fonction temporaire pour générer un faux JWT vrai serveur plus tard
function generateFakeJWT(email) {
  const payload = {
    email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // Expire dans 1h
  };
  return btoa(JSON.stringify(payload)); // Simule un token JWT
}

// Vérifier si un utilisateur est déjà connecté au chargement de l'appli
updateUI();
