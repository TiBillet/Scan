const API_URL = "http://192.168.1.124:3000"; // JSON Server tourne en local

document.getElementById("loginButton").addEventListener("click", login);
document.getElementById("logoutButton").addEventListener("click", logout);

// Fonction pour générer faux JWT (à remplacer par un vrai plus tard)
function generateFakeJWT(email) {
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      email,
      exp: Date.now() + 3600 * 1000, // Expire dans 1h
    })
  );
  const signature = "FAKE_SIGNATURE"; // Simule une signature RSA

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

      //   JWT test (remplacé par un vrai plus tard)
      const token = generateFakeJWT(email);
      localStorage.setItem("jwt", token);

      updateUI();
      alert(" Connexion réussie !");
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
  alert(" Déconnexion réussie !");
}

// Vérif user connecté avec JWT valide
function isAuthenticated() {
  const token = localStorage.getItem("jwt");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp > Date.now(); // Vérif si le token a expiré
  } catch (error) {
    return false;
  }
}

// Empêcher l'accès aux pages protégées
function checkAuthBeforeAccess() {
  if (!isAuthenticated()) {
    alert(" Accès refusé, veuillez vous connecter !");
    window.location.href = "login.html"; // Redirige vers la page de login
  }
}

// Met à jour l'UI en fonction de l'état d'authentification
function updateUI() {
  const token = localStorage.getItem("jwt");
  if (isAuthenticated()) {
    document.getElementById("loginButton").style.display = "none";
    document.getElementById("logoutButton").style.display = "block";
    document.getElementById("loginStatus").innerText = "✅ Connecté";
  } else {
    document.getElementById("loginButton").style.display = "block";
    document.getElementById("logoutButton").style.display = "none";
    document.getElementById("loginStatus").innerText = "❌ Déconnecté";
  }
}

// Vérifier si un utilisateur est déjà connecté au chargement de l'appli
updateUI();
