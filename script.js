const firebaseConfig = {
    apiKey: "BURAYA_FIREBASE_KEY_YAZ",
    authDomain: "night-app.firebaseapp.com",
    projectId: "night-app"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const provider = new firebase.auth.GithubAuthProvider();

document.getElementById('login-btn').addEventListener('click', () => auth.signInWithPopup(provider));

auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('user-profile').style.display = 'block';
        document.getElementById('user-name').innerText = user.displayName;
        if (user.email === "senin.mailin@gmail.com") {
            document.getElementById('admin-panel-btn').style.display = 'block';
        }
    }
});
