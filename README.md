# English Learning Platform (ELP)

> AI yordamida ingliz tilini oʻrganish platformasi — Oʻzbek tilida UI

---

## Texnologiyalar

| Layer | Stack |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand |
| Backend | NestJS, TypeScript, Passport JWT |
| Database | PostgreSQL + Prisma ORM |
| AI | OpenAI GPT-4o-mini (yozish), Whisper (gapirish) |
| Deploy | Vercel (client) + Railway (server) + Supabase (DB) |

---

## Tezkor ishga tushirish

### 1. Repozitoriyni klonlash

```bash
git clone <repo-url>
cd english-learning-platform
```

### 2. Environment o'zgaruvchilarini sozlash

```bash
cp .env.example .env
# .env faylini tahrirlang va o'z qiymatlaringizni kiriting
```

`.env` faylida to'ldirilishi shart:
- `JWT_SECRET` — tasodifiy 32+ belgi
- `JWT_REFRESH_SECRET` — boshqa tasodifiy 32+ belgi
- `OPENAI_API_KEY` — OpenAI dashboard'dan oling

### 3. Docker bilan ishga tushirish (tavsiya etiladi)

```bash
docker-compose up -d
```

Bu PostgreSQL, server va clientni ishga tushiradi.

### 4. Ma'lumotlar bazasini tayyorlash

```bash
cd server
npm install
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Lokal ishga tushirish (Docker'siz)

**Terminal 1 — Backend:**
```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm install
cp .env.local.example .env.local
npm run dev
```

Brauzerda: http://localhost:3000

---

## Test hisoblar

| Role | Email | Parol |
|------|-------|-------|
| ADMIN | admin@elp.uz | Admin123! |
| USER | user@elp.uz | User123! |

---

## Papka tuzilishi

```
english-learning-platform/
├── client/                     # Next.js frontend
│   └── src/
│       ├── app/                # Next.js App Router sahifalar
│       │   ├── page.tsx        # Landing page
│       │   ├── dashboard/      # Foydalanuvchi boshqaruv paneli
│       │   ├── vocabulary/     # Lugʻat + flashcardlar
│       │   ├── writing/        # AI yozish tekshiruvi
│       │   ├── speaking/       # Gapirish (Whisper)
│       │   ├── admin/          # Admin panel
│       │   └── auth/           # Login + register
│       ├── components/         # Qayta ishlatiladigan komponentlar
│       ├── hooks/              # useAuth, useDailyPlan
│       ├── stores/             # Zustand store'lar
│       ├── services/           # API integratsiya
│       ├── types/              # TypeScript tiplar
│       └── locales/uz.ts       # Oʻzbek tarjima
│
├── server/                     # NestJS backend
│   └── src/
│       ├── auth/               # JWT autentifikatsiya
│       ├── users/              # Foydalanuvchi profili
│       ├── vocabulary/         # Soʻzlar + spaced repetition
│       ├── learning/           # Kunlik reja
│       ├── writing/            # Yozish saqlash
│       ├── ai/                 # OpenAI integratsiya
│       ├── admin/              # Admin CRUD
│       ├── common/             # Guard, decorator, filter
│       └── prisma/             # PrismaService
│
├── server/prisma/
│   ├── schema.prisma           # DB sxema
│   └── seed.ts                 # Demo maʼlumotlar
│
├── docker-compose.yml
└── .env.example
```

---

## API Endpointlar

### Auth
```
POST /api/auth/register    — Roʻyxatdan oʻtish
POST /api/auth/login       — Kirish
POST /api/auth/refresh     — Token yangilash
POST /api/auth/logout      — Chiqish
POST /api/auth/me          — Joriy foydalanuvchi (JWT)
```

### Vocabulary
```
GET  /api/words/daily      — Bugungi soʻzlar (yangi + takrorlash)
POST /api/words/review     — Soʻzni baholash
GET  /api/words            — Barcha soʻzlar (?level=A1&search=...)
GET  /api/words/stats      — Statistika
```

### Learning
```
GET  /api/learning/daily-plan              — Kunlik reja
POST /api/learning/daily-plan/complete/:id — Soʻzni bajarildi deb belgilash
GET  /api/learning/progress                — Progress grafik
```

### Writing
```
POST /api/writing/check    — AI tekshiruvi
GET  /api/writing          — Yozuv tarixi
GET  /api/writing/:id      — Bitta yozuv
```

### Admin (ADMIN roli kerak)
```
GET    /api/admin/stats          — Statistika
GET    /api/admin/users          — Foydalanuvchilar roʻyxati
GET    /api/admin/users/:id      — Foydalanuvchi tafsilotlari
POST   /api/admin/words          — Soʻz qoʻshish
PUT    /api/admin/words/:id      — Soʻz tahrirlash
DELETE /api/admin/words/:id      — Soʻz oʻchirish
```

---

## Spaced Repetition algoritmi

Har bir soʻz uchun intervalli takrorlash:

| Interval | Keyingi takrorlash |
|---------|-------------------|
| 0 (yangi) | 1 kun keyin |
| 1 | 2 kun keyin |
| 2 | 5 kun keyin |
| 3 | 10 kun keyin |
| 4+ | 30 kun keyin |

Toʻgʻri javob → interval oshadi  
Notoʻgʻri javob → interval 0 ga tushadi

---

## AI Yozish tekshiruvi

Foydalanuvchi ingliz tilida matn yozadi → GPT-4o-mini:
- Grammatika xatolarini topadi
- Har bir xatoni oʻzbek tilida tushuntiradi
- 0-100 ball beradi
- Toʻgʻirlangan matn qaytaradi
- Rivojlanish tavsiyalari beradi

---

## Deployment

### Frontend — Vercel

```bash
cd client
vercel deploy
# Environment: NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### Backend — Railway

```bash
cd server
# Railway CLI yoki GitHub integratsiya orqali deploy qiling
# Environment o'zgaruvchilarini Railway dashboard'da kiriting
```

### Database — Supabase

1. Supabase'da yangi loyiha yarating
2. Connection string'ni `DATABASE_URL` ga qo'ying
3. `npx prisma migrate deploy` ni ishga tushiring

---

## Xavfsizlik

- Parollar bcrypt (10 round) bilan hashlangan
- JWT access token: 15 daqiqa
- JWT refresh token: 7 kun
- RBAC (Role-Based Access Control) — ADMIN/USER rollari
- Global rate limiting (100 req/min)
- DTO validation (class-validator)
- Barcha maxfiy maʼlumotlar .env da

---

## Kelajak rejalari

- [ ] Streak leaderboard
- [ ] Email tasdiqlash
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] Vocabulary kategoriyalar
- [ ] Video darslar integratsiya
- [ ] Multi-til UI (en, uz, ru)
