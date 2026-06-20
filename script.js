import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInWithPopup, GithubAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, updateDoc, doc, where } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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

let currentUser = null;
let currentStreamId = null;

// Login
document.getElementById('login-btn').addEventListener('click', () => {
    signInWithPopup(auth, provider);
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    signOut(auth);
});

// Auth State
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateAuthUI();
});

function updateAuthUI() {
    const loginBtn = document.getElementById('login-btn');
    const userMenu = document.getElementById('user-menu');

    if (currentUser) {
        loginBtn.classList.add('hidden');
        userMenu.classList.remove('hidden');
        document.getElementById('user-name').textContent = currentUser.displayName || 'Kullanıcı';
        document.getElementById('user-avatar').src = currentUser.photoURL || '';
    } else {
        loginBtn.classList.remove('hidden');
        userMenu.classList.add('hidden');
    }
}

// Go Live
document.getElementById('start-btn').addEventListener('click', async () => {
    if (!currentUser) return;
    const title = prompt('Yayın Başlığı:');
    if (!title) return;

    const streamRef = await addDoc(collection(db, 'streams'), {
        streamerId: currentUser.uid,
        streamerName: currentUser.displayName,
        streamerAvatar: currentUser.photoURL,
        title: title,
        category: 'Sosyal',
        viewers: 1,
        createdAt: serverTimestamp(),
        isActive: true
    });

    currentStreamId = streamRef.id;
    alert('Yayın başladı!');
});

// Load Streams
const streamsQuery = query(collection(db, 'streams'), where('isActive', '==', true), orderBy('createdAt', 'desc'));

onSnapshot(streamsQuery, (snapshot) => {
    const grid = document.getElementById('streams-grid');
    grid.innerHTML = '';

    snapshot.forEach(doc => {
        const stream = doc.data();
        const card = document.createElement('div');
        card.className = 'stream-card';
        card.innerHTML = `
            <div class="stream-thumbnail">
                <div class="stream-badge">🔴 CANLI</div>
                <span>${stream.viewers} İzleyici</span>
            </div>
            <div class="stream-info-card">
                <div class="stream-title">${stream.title}</div>
                <div class="stream-meta">
                    <div class="streamer-avatar"></div>
                    <span>${stream.streamerName}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            openStreamModal(stream, doc.id);
        });

        grid.appendChild(card);
    });
});

function openStreamModal(stream, streamId) {
    const modal = document.getElementById('stream-modal');
    document.getElementById('modal-title').textContent = stream.title;
    document.getElementById('modal-streamer').textContent = `Yayıncı: ${stream.streamerName}`;
    document.getElementById('modal-viewers').textContent = `👥 ${stream.viewers} İzleyici`;
    modal.classList.remove('hidden');

    // Seçili yayının chat'ini yükle
    loadStreamChat(streamId);
}

// Modal Close
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('stream-modal').classList.add('hidden');
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('stream-modal');
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});

// Chat
function loadStreamChat(streamId) {
    const chatDiv = document.getElementById('chat-messages');
    chatDiv.innerHTML = '';

    const messagesQuery = query(
        collection(db, 'messages'),
        where('streamId', '==', streamId),
        orderBy('createdAt', 'asc')
    );

    onSnapshot(messagesQuery, (snapshot) => {
        snapshot.forEach(doc => {
            const msg = doc.data();
            const msgEl = document.createElement('div');
            msgEl.className = 'chat-message';
            msgEl.innerHTML = `<b>${msg.user}:</b> ${msg.text}`;
            chatDiv.appendChild(msgEl);
        });
        chatDiv.scrollTop = chatDiv.scrollHeight;
    });
}

document.getElementById('send-btn').addEventListener('click', async () => {
    if (!currentUser || !currentStreamId) return;

    const input = document.getElementById('msg-input');
    if (input.value.trim()) {
        await addDoc(collection(db, 'messages'), {
            streamId: currentStreamId,
            user: currentUser.displayName,
            text: input.value,
            createdAt: serverTimestamp()
        });
        input.value = '';
    }
});