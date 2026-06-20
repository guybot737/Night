import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInWithPopup, GithubAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB_qgWXfL4hHC2we1VMIMKyxK9jv7wBrCw",
  authDomain: "night-176fd.firebaseapp.com",
  projectId: "night-176fd",
  storageBucket: "night-176fd.firebasestorage.app",
  messagingSenderId: "60467877640",
  appId: "1:60467877640:web:b870b5b49f65e626877ebd",
  measurementId: "G-LQJPYEHHWD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GithubAuthProvider();

// Giriş İşlemi
document.getElementById('login-btn').addEventListener('click', () => {
    signInWithPopup(auth, provider);
});

// UI Güncelleme (Giriş yapıldı mı?)
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('login-btn').classList.add('hidden');
        document.getElementById('user-profile').classList.remove('hidden');
        document.getElementById('user-name').innerText = user.displayName;
    }
});

// Chat İşlemleri
document.getElementById('send-msg-btn').addEventListener('click', async () => {
    const input = document.getElementById('msg-input');
    if (input.value.trim()) {
        await addDoc(collection(db, "messages"), {
            text: input.value,
            user: auth.currentUser ? auth.currentUser.displayName : "Misafir",
            createdAt: serverTimestamp()
        });
        input.value = "";
    }
});

// Chat'i Anlık Dinle
const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
onSnapshot(q, (snapshot) => {
    const chatDiv = document.getElementById('chat-messages');
    chatDiv.innerHTML = "";
    snapshot.forEach(doc => {
        const msg = doc.data();
        chatDiv.innerHTML += `<p><b>${msg.user}:</b> ${msg.text}</p>`;
    });
});
