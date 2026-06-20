// Firebase SDK'larını CDN üzerinden çekiyoruz
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";
import { getAuth, signInWithPopup, GithubAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Senin Firebase ayarların
const firebaseConfig = {
  apiKey: "AIzaSyB_qgWXfL4hHC2we1VMIMKyxK9jv7wBrCw",
  authDomain: "night-176fd.firebaseapp.com",
  projectId: "night-176fd",
  storageBucket: "night-176fd.firebasestorage.app",
  messagingSenderId: "60467877640",
  appId: "1:60467877640:web:b870b5b49f65e626877ebd",
  measurementId: "G-LQJPYEHHWD"
};

// Başlatma işlemleri
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GithubAuthProvider();

// Giriş butonuna tıklandığında çalışacak kod
document.getElementById('login-btn').addEventListener('click', () => {
    signInWithPopup(auth, provider)
    .then((result) => {
        console.log("Giriş yapıldı!");
    })
    .catch((error) => {
        console.error("Hata:", error);
    });
});

// Kullanıcı giriş yaptı mı kontrolü
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Giriş başarılıysa butonları düzenle
        document.getElementById('login-btn').style.display = 'none';
        if (document.getElementById('user-profile')) document.getElementById('user-profile').style.display = 'block';
        if (document.getElementById('user-name')) document.getElementById('user-name').innerText = user.displayName;
        
        // Admin mail kontrolü (Buraya kendi mailini yaz)
        if (user.email === "senin.mailin@gmail.com") {
            if (document.getElementById('admin-panel-btn')) document.getElementById('admin-panel-btn').style.display = 'block';
        }
    } else {
        // Giriş yapılmadıysa
        document.getElementById('login-btn').style.display = 'block';
        if (document.getElementById('user-profile')) document.getElementById('user-profile').style.display = 'none';
    }
});
