// const API_URL = "https://ton-serveur.com/api"; // serveur plus tard

// document.getElementById("loginButton").addEventListener("click", login);
// document.getElementById("logoutButton").addEventListener("click", logout);

// async function login() {
//   const email = document.getElementById("email").value;
//   const password = document.getElementById("password").value;

//   if (!email || !password) {
//     alert("Veuillez entrer un email et un mot de passe.");
//     return;
//   }

//   console.log(" Tentative de connexion avec :", email);

//   try {
//     // Simulation envoi serveur `fetch`)
//     const fakeJWT = generateFakeJWT(email); // Simule un token JWT

//     localStorage.setItem("jwt", fakeJWT);
//     updateUI();
//     alert(" Connexion réussie !");
//   } catch (error) {
//     console.error(" Erreur de connexion :", error);
//     alert("Erreur de connexion !");
//   }
// }

// function logout() {
//   localStorage.removeItem("jwt");
//   updateUI();
//   alert(" Déconnexion réussie !");
// }

// function updateUI() {
//   const token = localStorage.getItem("jwt");
//   if (token) {
//     document.getElementById("loginButton").style.display = "none";
//     document.getElementById("logoutButton").style.display = "block";
//     document.getElementById("loginStatus").innerText = " Connecté";
//   } else {
//     document.getElementById("loginButton").style.display = "block";
//     document.getElementById("logoutButton").style.display = "none";
//     document.getElementById("loginStatus").innerText = " Déconnecté";
//   }
// }

// // Fonction temporaire pour générer un faux JWT vrai serveur plus tard
// function generateFakeJWT(email) {
//   const payload = {
//     email,
//     exp: Math.floor(Date.now() / 1000) + 60 * 60, // Expire dans 1h
//   };
//   return btoa(JSON.stringify(payload)); // Simule un token JWT
// }

// // Vérifier si un utilisateur est déjà connecté au chargement de l'appli
// updateUI();

const API_URL = "http://192.168.1.124:3000"; //  JSON Server tourne en local

document.getElementById("loginButton").addEventListener("click", login);
document.getElementById("logoutButton").addEventListener("click", logout);

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Veuillez entrer un email et un mot de passe.");
    return;
  }

  console.log(" Tentative de connexion avec :", email);

  console.log(
    `🔍 Tentative de connexion à : ${API_URL}/users?email=${email}&password=${password}`
  );

  try {
    // 🔥 Vérifie si l'email et le mot de passe existent dans JSON Server
    const response = await fetch(
      `${API_URL}/users?email=${email}&password=${password}`
    );
    const users = await response.json();

    if (users.length > 0) {
      console.log(" Connexion réussie !");
      localStorage.setItem("jwt", btoa(email)); //  Stocke un fake token (plus tard, on mettra un vrai JWT)
      updateUI();
      alert(" Connexion réussie !");
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

function updateUI() {
  const token = localStorage.getItem("jwt");
  if (token) {
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
