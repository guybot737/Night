import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInWithPopup, GithubAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, updateDoc, doc, getDocs, where } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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

let currentStreamId = null;
let currentUser = null;

// Giriş İşlemi
document.getElementById('login-btn').addEventListener('click', () => {
    signInWithPopup(auth, provider).catch(err => console.log(err));
});

// Çıkış İşlemi
document.getElementById('logout-btn').addEventListener('click', () => {
    signOut(auth).then(() => {
        currentUser = null;
        updateUI();
    });
});

// UI Güncelleme
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateUI();
});

function updateUI() {
    if (currentUser) {
        document.getElementById('login-btn').classList.add('hidden');
        document.getElementById('user-profile').classList.remove('hidden');
        document.getElementById('user-name').innerText = currentUser.displayName;
        document.getElementById('start-stream-btn').classList.remove('hidden');
    } else {
        document.getElementById('login-btn').classList.remove('hidden');
        document.getElementById('user-profile').classList.add('hidden');
        document.getElementById('start-stream-btn').classList.add('hidden');
        document.getElementById('stop-stream-btn').classList.add('hidden');
    }
}

// Yayın Başlat
document.getElementById('start-stream-btn').addEventListener('click', async () => {
    if (!currentUser) return;
    
    const title = prompt("Yayın başlığı girin:");
    if (!title) return;

    const streamRef = await addDoc(collection(db, "streams"), {
        streamerId: currentUser.uid,
        streamerName: currentUser.displayName,
        title: title,
        viewers: 1,
        createdAt: serverTimestamp(),
        isActive: true
    });

    currentStreamId = streamRef.id;
    document.getElementById('start-stream-btn').classList.add('hidden');
    document.getElementById('stop-stream-btn').classList.remove('hidden');
    document.getElementById('stream-title').innerText = title;
    document.getElementById('streamer-name').innerText = `Yayıncı: ${currentUser.displayName}`;
    document.getElementById('stream-status').innerText = "🔴 CANLI";
    document.getElementById('stream-status').style.color = '#ef4444';
});

// Yayını Durdur
document.getElementById('stop-stream-btn').addEventListener('click', async () => {
    if (!currentStreamId) return;

    await updateDoc(doc(db, "streams", currentStreamId), {
        isActive: false
    });

    currentStreamId = null;
    document.getElementById('start-stream-btn').classList.remove('hidden');
    document.getElementById('stop-stream-btn').classList.add('hidden');
    document.getElementById('stream-status').innerText = "Canlı Yayın Bekleniyor...";
    document.getElementById('stream-status').style.color = '#666';
});

// Aktif Yayını Dinle
const streamsQuery = query(collection(db, "streams"), where("isActive", "==", true), orderBy("createdAt", "desc"));
onSnapshot(streamsQuery, (snapshot) => {
    if (!snapshot.empty) {
        const stream = snapshot.docs[0].data();
        document.getElementById('stream-title').innerText = stream.title;
        document.getElementById('streamer-name').innerText = `Yayıncı: ${stream.streamerName}`;
        document.getElementById('stream-status').innerText = "🔴 CANLI";
        document.getElementById('stream-status').style.color = '#ef4444';
        document.getElementById('viewer-count').innerText = `${stream.viewers} İzleyici`;
    }
});

// Chat İşlemleri
document.getElementById('send-msg-btn').addEventListener('click', async () => {
    const input = document.getElementById('msg-input');
    if (input.value.trim()) {
        await addDoc(collection(db, "messages"), {
            text: input.value,
            user: currentUser ? currentUser.displayName : "Misafir",
            userAvatar: currentUser ? currentUser.photoURL : "👤",
            createdAt: serverTimestamp()
        });
        input.value = "";
    }
});

// Chat'i Anlık Dinle
const messagesQuery = query(collection(db, "messages"), orderBy("createdAt", "asc"));
onSnapshot(messagesQuery, (snapshot) => {
    const chatDiv = document.getElementById('chat-messages');
    chatDiv.innerHTML = "";
    snapshot.forEach(doc => {
        const msg = doc.data();
        const msgElement = document.createElement('div');
        msgElement.className = 'chat-message';
        msgElement.innerHTML = `<p><b>${msg.user}:</b> ${msg.text}</p>`;
        chatDiv.appendChild(msgElement);
    });
    chatDiv.scrollTop = chatDiv.scrollHeight;
});