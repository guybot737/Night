// server.js
require('dotenv').config(); // .env dosyasını okumak için
const express = require('express');
const app = express();

app.use(express.static(__dirname)); // HTML ve CSS dosyalarını yayınlar

// Senin GitHub Mailin (Sistemin kalbi)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Sitenin Ana Sayfası
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// GitHub'a Yönlendirme Rotası
app.get('/auth/github', (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`;
    res.redirect(githubAuthUrl);
});

// GitHub'dan Dönüş (Callback) ve Admin Kontrolü
app.get('/auth/github/callback', async (req, res) => {
    const code = req.query.code;
    
    // Not: Gerçek sistemde bu kod ile GitHub'dan Access Token alınıp email çekilir.
    // Şimdilik mantığı oturtmak için simüle ediyoruz:
    const userEmailFromGithub = "senin.github.mailin@example.com"; // Github'dan gelen mail
    
    let userRole = "USER"; // Herkes normal kullanıcı doğar
    
    if (userEmailFromGithub === ADMIN_EMAIL) {
        userRole = "ADMIN"; // Eğer mail sana aitse, oto admin olursun!
        console.log("Kral geldi, yolları açın! Yetki: ADMIN");
    }

    res.send(`<h1>Giriş Başarılı! Rolünüz: ${userRole}</h1> <a href="/">Siteye Dön</a>`);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Ninght canlı yayında kanka! http://localhost:${PORT} adresine git.`);
});
