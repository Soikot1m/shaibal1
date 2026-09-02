# Shaibal Tours & Travels — Hosting Guide (একদম beginner-দের জন্য, বাংলায়)

> **এক লাইনে:** InfinityFree-তে এই সাইট চলবে না (কারণ নিচে)। তার বদলে **সম্পূর্ণ ফ্রি**-তে
> **GitHub + Neon + Vercel** দিয়ে ৪৫ মিনিটে live করা যায়। এই guide-এ প্রতিটা click ও কমান্ড
> ধাপে ধাপে দেওয়া আছে — কোনো আগের অভিজ্ঞতা লাগবে না।

## সূচি

| ধাপ | কাজ | সময় |
|---|---|---|
| ০ | আগে বুঝে নিন — কী লাগে, কেন | ৩ মিনিট |
| ১ | Project নিজের কম্পিউটারে নামান | ৫ মিনিট |
| ২ | ৩টা software install করুন | ১০ মিনিট |
| ৩ | Project খুলুন ও `npm install` | ৫ মিনিট |
| ৪ | Neon-এ ফ্রি database বানান | ৫ মিনিট |
| ৫ | `.env` ঠিক করুন → table বানান → demo data ভরুন | ৩ মিনিট |
| ৬ | নিজের কম্পিউটারে সাইট চালিয়ে দেখুন | ২ মিনিট |
| ৭ | GitHub-এ code তুলুন | ৭ মিনিট |
| ৮ | Vercel-এ deploy করুন — সাইট live | ৫ মিনিট |
| ৯ | Live হওয়ার পর অবশ্যই করণীয় | ১০ মিনিট |
| ১০ | পরে কিছু বদলালে কীভাবে update হবে | — |
| ১১ | ঐচ্ছিক: নিজের domain | — |
| ১২ | ব্যবসা বড় হলে: VPS / Railway | — |
| ১৩ | সমস্যা ও সমাধান | — |
| ১৪ | Environment variables reference | — |

---

## ০. আগে বুঝে নিন (৩ মিনিট)

**একটা website live থাকতে ২টা জিনিস লাগে:**

1. **Server** — একটা কম্পিউটার যেটা ২৪ ঘণ্টা চালু থেকে আপনার সাইটের code চালায়।
2. **Database** — যেখানে booking, customer, tour, payment — সব তথ্য জমা থাকে।

**এই সাইট বানানো হয়েছে:** Next.js (Node.js) + PostgreSQL database দিয়ে।

**InfinityFree কেন চলবে না:**

| | InfinityFree দেয় | এই সাইটের লাগে |
|---|---|---|
| Server | শুধু PHP | Node.js |
| Database | শুধু MySQL | PostgreSQL |

মানে: InfinityFree-তে তুললে login, booking, admin panel — কিছুই চলবে না। এটা কারও ভুল না; শুধু ভিন্ন প্রযুক্তি।

**আমরা যা ব্যবহার করব (সবই ফ্রি):**

| Service | কাজ | খরচ |
|---|---|---|
| **GitHub** (github.com) | আপনার code online রাখার জায়গা | ফ্রি |
| **Neon** (neon.tech) | PostgreSQL database | ফ্রি (0.5 GB — হাজার হাজার booking-এর জন্য যথেষ্ট) |
| **Vercel** (vercel.com) | সাইট চালাবে, HTTPS সহ `xxx.vercel.app` ঠিকানা দেবে | ফ্রি (Hobby plan) |

**পুরো প্রক্রিয়ার ছবি:**

```
আপনার কম্পিউটার ──(git push)──▶ GitHub ──(auto)──▶ Vercel  (সাইট live)
                                                       │
                                                       ▼
                                                  Neon (database)
```

সময়: ~৪৫ মিনিট। খরচ: ০ টাকা। (নিজের domain চাইলে ~$10/বছর — ঐচ্ছিক।)

> ⚠️ Vercel-এর ফ্রি (Hobby) plan শুধু personal / non-commercial ব্যবহারের জন্য। Test করা,
> ক্লায়েন্টকে দেখানো, soft launch — ঠিক আছে। ব্যবসা পুরোদমে চললে Vercel Pro ($20/মাস)
> অথবা ~$5/মাসের VPS (ধাপ ১২) নিন। শুরু করার জন্য ফ্রি-টাই যথেষ্ট।

---

## ১. Project নিজের কম্পিউটারে নামান

1. যে platform-এ এই project বানানো হয়েছে, সেখানে project **Download / Export / Download ZIP** করার option আছে — সেটা দিয়ে ZIP নামান।
2. ZIP-টা **Extract** করুন (right-click → Extract All)। Folder-টা সহজ জায়গায় রাখুন, যেমন
   `C:\Users\<আপনার নাম>\shaibal-tours` (Mac: `~/shaibal-tours`)।
3. Folder খুলে দেখুন — `package.json`, `src`, `public`, `next.config.ts` আছে কি না।
   **যে folder-এ `package.json` আছে, সেটাই project folder।** (ZIP-এর ভেতরে আরেকটা folder থাকলে ভেতরেরটা ব্যবহার করুন।)

> Platform-এ যদি সরাসরি **"Push to GitHub" / "Connect GitHub"** option থাকে, সেটা ব্যবহার করলে ধাপ ১ ও ৭ লাগবে না — তবে ধাপ ২–৬ তবুও লাগবে (database বানানোর জন্য)।

---

## ২. ৩টা software install করুন (একবারই)

### ২.১ Node.js — সাইটের engine
- <https://nodejs.org> → বড় সবুজ **LTS** বোতাম (v22.x) → download → install (সব Next, শেষে Install)।
- **যাচাই:** Start menu → "PowerShell" লিখে খুলুন → লিখুন `node -v` → Enter → `v22.x.x` দেখালে ঠিক আছে।

### ২.২ Git — code GitHub-এ পাঠানোর tool
- <https://git-scm.com/downloads> → Windows → download → install (সব default রেখে Next)।
- **যাচাই:** PowerShell-এ `git --version` → `git version 2.x` দেখাবে।

### ২.৩ VS Code — file edit + terminal (beginner-দের জন্য সবচেয়ে সহজ)
- <https://code.visualstudio.com> → Download → install।

Mac হলে: nodejs.org থেকে macOS installer; Git সাধারণত আগে থেকেই থাকে (`git --version` লিখলে install করতে বলবে)।

---

## ৩. Project খুলুন ও `npm install`

1. VS Code খুলুন → **File → Open Folder** → ধাপ ১-এর project folder select করুন → "Yes, I trust the authors"।
2. উপরের menu থেকে **Terminal → New Terminal** — নিচে একটা terminal খুলবে (Windows-এ PowerShell)।
   **এই guide-এর সব কমান্ড এখানেই লিখবেন।**
3. লিখুন:

   ```bash
   npm install
   ```

   ২–৫ মিনিট লাগবে (internet থেকে dependencies নামায়)। শেষে "added ... packages" দেখাবে।
   "vulnerabilities" লেখা warning আসতে পারে — **উপেক্ষা করুন।**

> ❗ Windows-এ যদি লাল লেখা আসে *"npm.ps1 cannot be loaded because running scripts is disabled"* →
> terminal-এ লিখুন `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` → Enter → `Y` → Enter।
> তারপর আবার `npm install`।

---

## ৪. Neon-এ ফ্রি database বানান

1. <https://neon.tech> → **Sign Up** → "Continue with Google" (সবচেয়ে সহজ)।
2. প্রথমবার project বানাতে বলবে:
   - **Project name:** `shaibal-tours`
   - **Postgres version:** যা default আছে
   - **Region:** **Asia Pacific (Singapore)** ← বাংলাদেশ থেকে সবচেয়ে কাছে, অবশ্যই এটা
   - **Create project**
3. Dashboard-এ **"Connect"** (বা "Connection Details") বোতামে click করুন। একটা box-এ **connection string** দেখাবে, দেখতে এমন:

   ```
   postgresql://neondb_owner:npg_AbC123xyz@ep-cool-name-a1b2c3d4-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

4. ওই box-এ **"Connection pooling"** নামে একটা toggle আছে — **ON রাখুন** (default) এবং **copy** icon-এ click করুন
   (password সহ পুরো URL copy হবে)। Notepad-এ paste করে রাখুন — দুই জায়গায় লাগবে।

> 🔒 এই URL-এর মধ্যে password (`npg_...`) আছে — **কাউকে দেবেন না, Facebook/WhatsApp-এ পাঠাবেন না।**

---

## ৫. `.env` ঠিক করুন → table বানান → demo data ভরুন

`.env` হলো একটা ছোট file যেখানে গোপন settings (যেমন database-এর ঠিকানা) থাকে। এটা GitHub-এ যায় না।

1. VS Code terminal-এ:
   - Windows: `copy .env.example .env`
   - Mac/Linux: `cp .env.example .env`
2. VS Code-এর বাম পাশে (Explorer) `.env` file-টা click করে খুলুন। `DATABASE_URL=` লেখা লাইনটা খুঁজুন,
   `=`-এর পরের অংশ মুছে Neon-এর URL paste করুন:

   ```
   DATABASE_URL=postgresql://neondb_owner:npg_...@ep-....ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

   (quotation mark দেবেন না, space দেবেন না) → **Ctrl+S** দিয়ে save।
3. **Table বানান** (terminal-এ):

   ```bash
   npx drizzle-kit push
   ```

   কয়েক সেকেন্ডে `[✓] Changes applied` দেখাবে। (কিছু জিজ্ঞেস করলে Yes/Enter।)
4. **Demo data ভরুন** (tour, destination, review, admin account):

   ```bash
   npx tsx src/db/seed.ts
   ```

   শেষে দেখাবে:

   ```
   Seeded demo data successfully.
   Admin login   : admin@shaibaltours.com / shaibal123
   Customer login: demo@shaibaltours.com / shaibal123
   ```

> ⚠️ `seed.ts` database-এর **সব data মুছে** নতুন demo data বসায়। শুধু এই একবার চালান।
> সাইট live হওয়ার পর **আর কখনো না** — নাহলে আসল booking মুছে যাবে।

---

## ৬. নিজের কম্পিউটারে সাইট চালিয়ে দেখুন (ঐচ্ছিক, কিন্তু আত্মবিশ্বাসের জন্য ভালো)

```bash
npm run dev
```

Terminal-এ `Local: http://localhost:3000` দেখালে browser-এ **http://localhost:3000** খুলুন।
আপনার সাইট চলছে — Neon-এর আসল database দিয়েই। Login করে দেখুন (`admin@shaibaltours.com` / `shaibal123`)।

বন্ধ করতে terminal-এ **Ctrl+C** চাপুন।

---

## ৭. GitHub-এ code তুলুন

1. <https://github.com> → **Sign up** → email verify করুন।
2. উপরে ডানে **"+"** → **New repository**:
   - Repository name: `shaibal-tours`
   - **Private** select করুন (code গোপন থাকবে)
   - "Add a README" **টিক দেবেন না**
   - **Create repository**
3. পরের পেজে আপনার repo-র ঠিকানা দেখাবে: `https://github.com/<username>/shaibal-tours.git` — এটা লাগবে।
4. VS Code terminal-এ, প্রথমবার git-কে আপনার নাম ও email জানান:

   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "you@example.com"
   ```

5. এবার code push করুন (৬টা কমান্ড, একটা একটা করে; `<username>` জায়গায় আপনার GitHub username):

   ```bash
   git init
   git add .
   git commit -m "Shaibal Tours website"
   git branch -M main
   git remote add origin https://github.com/<username>/shaibal-tours.git
   git push -u origin main
   ```

   শেষ কমান্ডে একটা browser window খুলে GitHub-এ sign in করতে বলবে → **Sign in with your browser** → Authorize।
6. Browser-এ GitHub repo পেজ refresh করুন — সব file দেখা যাবে ✅
   (`.env` ও `node_modules` দেখা **যাবে না** — এটাই ঠিক; `.gitignore` এগুলো আটকায়।)

---

## ৮. Vercel-এ deploy করুন (সাইট live!)

1. <https://vercel.com> → **Sign Up** → **Continue with GitHub** → Authorize।
2. Dashboard → **Add New…** → **Project**।
3. "Import Git Repository"-তে `shaibal-tours` দেখাবে → **Import**।
   (না দেখালে → "Adjust GitHub App Permissions" → repo select → Install/Save → আবার দেখুন।)
4. **Configure Project** পেজে:
   - **Project Name:** `shaibal-tours` — এটাই আপনার ঠিকানা হবে: `shaibal-tours.vercel.app`
     (নামটা নেওয়া থাকলে অন্য নাম দিন, যেমন `shaibal-tours-bogura`)
   - **Framework Preset:** Next.js (নিজে থেকেই ধরবে)
   - Root Directory, Build settings — **কিছু বদলাবেন না**
5. **Environment Variables** অংশটা খুলুন এবং **২টা** যোগ করুন (Key লিখুন → Value paste করুন → Add):

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Neon-এর URL (ধাপ ৪-এ copy করা, `-pooler` ওয়ালা) |
   | `NEXT_PUBLIC_SITE_URL` | `https://shaibal-tours.vercel.app` (আপনার project name অনুযায়ী) |

6. **Deploy** চাপুন। ২–৪ মিনিট অপেক্ষা করুন — build log চলবে; শেষে 🎉 → **Continue to Dashboard**।
7. Dashboard-এ **Visit** (বা domain link) click করুন → **আপনার সাইট live!**
8. **যাচাই করুন:** Settings → **Domains**-এ আসল ঠিকানাটা দেখুন। যদি সেটা ধাপ ৫-এ দেওয়া
   `NEXT_PUBLIC_SITE_URL`-এর সাথে **না মেলে**: Settings → **Environment Variables** → `NEXT_PUBLIC_SITE_URL` → Edit →
   ঠিক ঠিকানা → Save → **Deployments** tab → সর্বশেষ deployment-এর **⋯ → Redeploy**।
   (QR code, verify link, sitemap — সব এই ঠিকানা ব্যবহার করে, তাই এটা ঠিক থাকা জরুরি।)
9. **(ঐচ্ছিক, দ্রুততার জন্য)** Settings → **Functions** → Function Region → **Singapore (sin1)** → Save → Redeploy।
   Database Singapore-এ; সাইটও Singapore-এ থাকলে page দ্রুত খোলে।

---

## ৯. Live হওয়ার পর অবশ্যই করণীয় (১০ মিনিট)

1. `https://<আপনার-সাইট>/login` → `admin@shaibaltours.com` / `shaibal123`
2. **Password বদলান:** Account → Profile → **Password** section → নতুন শক্ত password।
   (যতক্ষণ না বদলান, Admin panel-এর উপরে হলুদ সতর্কবার্তা দেখাবে।)
3. **Admin → Content & Settings** → আসল **phone, WhatsApp, email, ঠিকানা, Facebook link**
   (`https://www.facebook.com/soibaltours`) বসান → Save। `[Phone Number]`-এর মতো placeholder-গুলো সব বদলান।
4. **Admin → Tours** → demo tour-গুলো নিজের tour, দাম, তারিখ দিয়ে edit করুন; যেগুলো লাগবে না → Unpublish।
5. `demo@shaibaltours.com` account দরকার না হলে Neon dashboard → **SQL Editor**-এ লিখে Run করুন:
   `DELETE FROM users WHERE email = 'demo@shaibaltours.com';`
6. Google-এ সাইট আনতে: <https://search.google.com/search-console> → property যোগ করুন →
   Sitemaps → `https://<আপনার-সাইট>/sitemap.xml` submit।

---

## ১০. পরে কিছু বদলালে কীভাবে update হবে

- **Tour, দাম, তারিখ, contact info, review, FAQ, announcement** → Admin panel থেকেই বদলান; সাথে সাথে live হয়। Code লাগে না।
- **Code / design বদলালে** (VS Code-এ file edit করে) → terminal-এ:

  ```bash
  git add .
  git commit -m "what you changed"
  git push
  ```

  Vercel নিজে থেকেই ১–২ মিনিটে নতুন version live করবে।
- **Database-এ নতুন table/column যোগ হলে** (developer করলে) → `.env`-এ Neon URL রেখে `npx drizzle-kit push` চালালেই হবে।

---

## ১১. ঐচ্ছিক: নিজের domain (যেমন shaibaltours.com)

1. Domain কিনুন — Namecheap / Porkbun (~$10/বছর, international card লাগে) অথবা বাংলাদেশি registrar
   (bKash নেয় এমন অনেক আছে)। `.com.bd` চাইলে BTCL-এর মাধ্যমে।
2. Vercel → Project → **Settings → Domains** → `shaibaltours.com` লিখে **Add** (www সহ)।
3. Vercel যে DNS record দেখাবে, registrar-এর DNS settings-এ বসান (সাধারণত):
   - Type `A`, Host `@`, Value `76.76.21.21`
   - Type `CNAME`, Host `www`, Value `cname.vercel-dns.com`
4. ১০ মিনিট থেকে কয়েক ঘণ্টায় চালু হবে, HTTPS নিজে থেকেই।
5. তারপর `NEXT_PUBLIC_SITE_URL` = `https://shaibaltours.com` করে Redeploy (ধাপ ৮.৮-এর মতো)।

---

## ১২. ব্যবসা বড় হলে: VPS বা Railway

### Option B — নিজের VPS (Hetzner / DigitalOcean / Contabo / বাংলাদেশি provider, ~$5/মাস)

সবচেয়ে সাশ্রয়ী ব্যবসায়িক সমাধান। Ubuntu 22.04/24.04, 2 GB RAM যথেষ্ট। Domain-এর `A` record
server-এর IP-তে point করুন, তারপর SSH করে:

**Docker দিয়ে (সহজ):**

```bash
curl -fsSL https://get.docker.com | sh
git clone https://github.com/<username>/shaibal-tours.git /opt/shaibal
cd /opt/shaibal
cp .env.example .env
nano .env        # NEXT_PUBLIC_SITE_URL=https://shaibaltours.com  এবং  POSTGRES_PASSWORD=<শক্ত password>

SEED_DEMO=true docker compose up -d --build      # প্রথমবার (demo data সহ)
git pull && docker compose up -d --build         # পরে প্রতিবার update-এ
```

সাইট port 3000-এ চলছে। HTTPS-এর জন্য সামনে **Caddy** (নিজে থেকেই SSL নেয়):

```bash
sudo apt install -y caddy
sudo tee /etc/caddy/Caddyfile >/dev/null <<'EOF'
shaibaltours.com, www.shaibaltours.com {
    reverse_proxy 127.0.0.1:3000
}
EOF
sudo systemctl restart caddy
```

**Docker ছাড়া (PM2 + Nginx):**

```bash
sudo apt update && sudo apt install -y git nginx postgresql certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs
sudo -u postgres psql -c "CREATE USER shaibal WITH PASSWORD 'strong-password';" -c "CREATE DATABASE shaibal OWNER shaibal;"

git clone https://github.com/<username>/shaibal-tours.git /var/www/shaibal
cd /var/www/shaibal
cp .env.example .env
nano .env     # DATABASE_URL=postgresql://shaibal:strong-password@127.0.0.1:5432/shaibal
              # NEXT_PUBLIC_SITE_URL=https://shaibaltours.com
npm ci
npx drizzle-kit push
npx tsx src/db/seed.ts          # শুধু প্রথমবার
npm run build
sudo npm i -g pm2
pm2 start npm --name shaibal -- start
pm2 save && pm2 startup
```

Nginx (`/etc/nginx/sites-available/shaibal`):

```nginx
server {
    listen 80;
    server_name shaibaltours.com www.shaibaltours.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/shaibal /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d shaibaltours.com -d www.shaibaltours.com     # ফ্রি HTTPS
```

Update: `cd /var/www/shaibal && git pull && npm ci && npm run build && pm2 restart shaibal`

### Option C — Railway / Render (click-deploy, Dockerfile সহ)

- **Railway** (<https://railway.app>, ~$5/মাস): New Project → Deploy from GitHub repo → `+ New → Database → PostgreSQL` →
  web service-এর Variables-এ `DATABASE_URL = ${{Postgres.DATABASE_URL}}`, `NEXT_PUBLIC_SITE_URL`, প্রথমবার `SEED_DEMO=true`।
  Railway নিজে থেকেই `Dockerfile` ব্যবহার করবে; start-এ schema apply হয়ে যাবে।
- **Render** (<https://render.com>): Web Service (Docker) + PostgreSQL। Free web service ১৫ মিনিট idle থাকলে
  ঘুমিয়ে যায় (প্রথম request ধীর) — ব্যবসার জন্য paid plan নিন।

---

## ১৩. সমস্যা ও সমাধান

| সমস্যা | সমাধান |
|---|---|
| Windows: *"npm.ps1 cannot be loaded… scripts is disabled"* | PowerShell-এ `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` → `Y`। অথবা terminal-এর dropdown থেকে "Command Prompt" বেছে নিন। |
| `node` / `git` / `npm` *"is not recognized"* | Install-এর পর VS Code / terminal **বন্ধ করে আবার খুলুন**। তাও না হলে Node.js আবার install করুন। |
| `npx drizzle-kit push` → *"DATABASE_URL is not set"* | `.env` file আছে কি না দেখুন (নাম ঠিক `.env`, `.env.txt` না); ভেতরে `DATABASE_URL=` লাইন ঠিক আছে কি না। |
| Neon-এ `connection refused` / timeout / SSL error | URL-এর শেষে `?sslmode=require` আছে কি না দেখুন। Neon ফ্রি database ৫ মিনিট idle থাকলে ঘুমায় — প্রথম request ১ সেকেন্ড ধীর হতে পারে, এটা স্বাভাবিক। |
| `npx drizzle-kit push` Neon-এ error দেয় | Neon-এর Connect box-এ **Connection pooling OFF** করে নতুন URL copy → `.env`-এ বসিয়ে আবার চালান। (Vercel-এ pooling ON-ওয়ালাটাই রাখুন।) |
| `git push` → password চায় / *"Authentication failed"* | GitHub account-এর password এখানে চলে না। Browser sign-in window এলে সেটা ব্যবহার করুন; না এলে GitHub → Settings → Developer settings → Personal access tokens (classic) → `repo` permission সহ token বানিয়ে password-এর জায়গায় দিন। |
| Vercel build fail: *"DATABASE_URL is required"* | Vercel → Settings → Environment Variables-এ `DATABASE_URL` যোগ করুন → Deployments → Redeploy। (Build-এর সময়ও এটা লাগে।) |
| Vercel-এ সাইট খোলে কিন্তু login/booking-এ *"couldn't reach the server"* | Settings → Environment Variables → `NEXT_PUBLIC_SITE_URL` ঠিক ঠিকানা কি না দেখুন → Redeploy। নিজের domain + CDN (Cloudflare proxy) থাকলে `ALLOWED_ORIGINS=yourdomain.com` যোগ করুন। |
| QR / share link-এ `localhost` দেখায় | `NEXT_PUBLIC_SITE_URL` ঠিক করে Redeploy। |
| Vercel-এ *"too many connections"* | Neon-এর **pooled** (`-pooler`) URL ব্যবহার করুন। |
| ছবি লোড হচ্ছে না | নতুন কোনো image host ব্যবহার করলে `next.config.ts`-এর `images.remotePatterns`-এ hostname যোগ করুন। |
| ভুলে `seed.ts` আবার চালিয়ে ফেলেছি | Neon → Branches / Restore (point-in-time) থেকে আগের অবস্থায় ফেরানো যায় (ফ্রি plan-এ সীমিত সময়)। |

---

## ১৪. Environment variables (reference)

| Variable | কোথায় | কী |
|---|---|---|
| `DATABASE_URL` | সব জায়গায় (আবশ্যক) | PostgreSQL connection string (Neon হলে `?sslmode=require` সহ) |
| `NEXT_PUBLIC_SITE_URL` | সব জায়গায় (আবশ্যক) | সাইটের public URL — QR, verify link, sitemap, metadata |
| `ALLOWED_ORIGINS` | ঐচ্ছিক | CDN/proxy-র পেছনে চললে অতিরিক্ত host (comma দিয়ে) |
| `POSTGRES_PASSWORD` | শুধু docker compose | Postgres container-এর password |
| `SEED_DEMO` | শুধু docker / Railway, প্রথমবার | `true` দিলে demo data বসে (তারপর সরিয়ে দিন) |
| `AI_API_KEY`, `AI_MODEL` | ঐচ্ছিক | AI assistant-এর LLM key; না দিলে rule-based উত্তর দেয় |
| `BKASH_*`, `NAGAD_*`, `SSLCOMMERZ_*`, `PAYMENT_WEBHOOK_SECRET` | ঐচ্ছিক | Payment gateway (শুধু server-side) |

পুরো তালিকা ও উদাহরণ: `.env.example`

---

**সবচেয়ে সহজ পথ, আবারও এক নজরে:**
Download → Node/Git/VS Code install → `npm install` → Neon-এ database → `.env`-এ URL → `npx drizzle-kit push` →
`npx tsx src/db/seed.ts` → GitHub-এ push → Vercel-এ import + ২টা variable → Deploy → password বদলান → contact info বসান। 🎉
