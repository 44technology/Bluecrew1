# Git Push – "Correct access rights" / "Repository exists" Hatası

## Durum

Projede şu an **hiç remote tanımlı değil** (`origin` yok). Bu yüzden `git push origin master` çalışmaz.

---

## 1. Remote ekleme (GitHub / GitLab / Bitbucket)

Uzak repoyu oluşturduktan sonra proje klasöründe:

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project

# GitHub örneği (HTTPS – kullanıcı adı + token/şifre gerekir)
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git

# veya SSH (SSH key’iniz hesaba ekliyse)
git remote add origin git@github.com:KULLANICI_ADI/REPO_ADI.git
```

- `KULLANICI_ADI`: GitHub/GitLab kullanıcı adınız  
- `REPO_ADI`: Repo adı (örn. `bluecrew-app`)

Kontrol:

```bash
git remote -v
```

---

## 2. Erişim hakları (access rights)

"Correct access rights" genelde şunlardan biri:

### A) HTTPS kullanıyorsanız

- GitHub: Artık şifreyle push yok; **Personal Access Token (PAT)** gerekir.
  1. GitHub → Settings → Developer settings → Personal access tokens
  2. Yeni token (repo yetkisi ile)
  3. Push时 şifre yerine bu token’ı girin.

### B) SSH kullanıyorsanız

1. **SSH key var mı?**

   ```bash
   ls -la ~/.ssh
   # id_rsa.pub veya id_ed25519.pub olmalı
   ```

2. **Yoksa oluştur:**

   ```bash
   ssh-keygen -t ed25519 -C "info44technology.com@email.com"
   # Enter ile devam edebilirsiniz
   ```

3. **Public key’i GitHub/GitLab’a ekleyin:**
   - `cat ~/.ssh/id_ed25519.pub` çıktısını kopyalayın
   - GitHub → Settings → SSH and GPG keys → New SSH key → yapıştırın

4. **Test:**

   ```bash
   ssh -T git@github.com
   # veya GitLab: ssh -T git@gitlab.com
   ```

---

## 3. İlk push

Remote ekleyip erişimi hallettikten sonra:

```bash
git push -u origin master
```

Branch adınız `main` ise:

```bash
git push -u origin master:main
# veya önce branch’i main yapıp:
# git branch -M main
# git push -u origin main
```

---

## Hızlı kontrol listesi

- [ ] Uzak repoyu GitHub/GitLab’da oluşturdunuz mu?
- [ ] `git remote add origin <URL>` ile remote eklediniz mi?
- [ ] HTTPS ise: Personal Access Token hazır mı?
- [ ] SSH ise: `~/.ssh`’ta key var mı ve hesaba eklendi mi?
- [ ] `git push -u origin master` (veya `main`) çalıştı mı?

---

## Özet

1. **Remote yok** → `git remote add origin <repo-URL>`  
2. **Erişim** → HTTPS için PAT, SSH için key + hesaba ekleme  
3. **Push** → `git push -u origin master` (veya `main`)
