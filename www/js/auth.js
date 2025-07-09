console.log("auth.js bien chargé");

document.addEventListener("DOMContentLoaded", function () {
  const publicPages = ["index.html", "login.html", ""];

  const matches = window.location.href.match(/\/([^/]+\.(html|htm))/i);
  const currentPage = matches ? matches[1] : "";

  console.log("Page détectée :", currentPage);

  if (!publicPages.includes(currentPage)) {
    console.log("Page privée, on vérifie l'authentification");
    checkAuthBeforeAccess();
  } else {
    console.log("Page publique, pas de vérification");
  }
  const loginBtn = document.getElementById("loginButton");
  if (loginBtn) loginBtn.addEventListener("click", login);

  const logoutBtn = document.getElementById("logoutButton");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  updateUI(); // Appelé après chargement DOM
});

const API_URL = "http://192.168.1.124:3000"; // server local

// Fonction pour générer faux JWT (mettre vrai plus tard)
function generateFakeJWT(email) {
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      email,
      exp: Date.now() + 3600 * 1000, // Expire dans 1h
    })
  );
  const signature = "FAKE_SIGNATURE"; // Simule signature RSA

  return `${header}.${payload}.${signature}`;
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Veuillez entrer un email et un mot de passe.");
    return;
  }

  console.log(
    ` Tentative de connexion à : ${API_URL}/users?email=${email}&password=${password}`
  );

  try {
    // Vérif email et mot de passe dans JSON Server
    const response = await fetch(
      `${API_URL}/users?email=${email}&password=${password}`
    );
    const users = await response.json();

    if (users.length > 0) {
      console.log(" Connexion réussie !");

      //   JWT test (remplacé par vrai plus tard)
      const token = generateFakeJWT(email);
      localStorage.setItem("jwt", token);

      updateUI();

      window.location.href = "lieux.html";
    } else {
      alert(" Identifiants incorrects !");
    }
  } catch (error) {
    console.error(" Erreur de connexion :", error);
    alert("Erreur de connexion !");
  }
}

function logout() {
  localStorage.removeItem("jwt");
  updateUI();
}

// Vérif user connecté avec JWT valide
function isAuthenticated() {
  try {
    const token = localStorage.getItem("jwt");
    if (!token) return false;

    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp > Date.now(); // Vérif si le token a expiré
  } catch (error) {
    console.error("Erreur dans isAuthenticated():", error);
    return false;
  }
}

// Empeche l'accès aux pages protégées
function checkAuthBeforeAccess() {
  try {
    console.log("checkAuthBeforeAccess appelé");
    if (!isAuthenticated()) {
      alert("Accès refusé, veuillez vous connecter !");
      window.location.href = "index.html";
    } else {
      console.log("Utilisateur authentifié ✅");
    }
  } catch (err) {
    console.error("Erreur dans checkAuthBeforeAccess:", err);
  }
}

// Met à jour l'UI en fonction de l'état d'authentification
function updateUI() {
  const token = localStorage.getItem("jwt");
  const isAuth = isAuthenticated();

  const loginBtn = document.getElementById("loginButton");
  const logoutBtn = document.getElementById("logoutButton");
  const statusEl = document.getElementById("loginStatus");

  if (loginBtn) loginBtn.style.display = isAuth ? "none" : "block";
  if (logoutBtn) logoutBtn.style.display = isAuth ? "block" : "none";
  if (statusEl) statusEl.innerText = isAuth ? "✅ Connecté" : "❌ Déconnecté";
}

// Vérifier si un utilisateur est déjà connecté au chargement de l'appli
updateUI();
