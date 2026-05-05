# 📅 DP Events — Plateforme de gestion d'événements

Application web complète inspirée de Luma, construite avec **Next.js 14 + Supabase + Resend**, 100% gratuit.

---

## Stack technique

| Couche | Tech | Tier gratuit |
|---|---|---|
| Frontend | Next.js 14 (App Router + TypeScript) | ✅ |
| Auth | Supabase Auth | ✅ 50 000 MAU |
| Database | Supabase PostgreSQL | ✅ 500 MB |
| Storage (photos) | Supabase Storage | ✅ 1 GB |
| Emails | Resend | ✅ 3 000/mois |
| Déploiement | Vercel | ✅ Hobby plan |

---

## Fonctionnalités

### Utilisateurs
- Inscription avec demande de validation admin
- Connexion sécurisée (Supabase Auth)
- Voir la liste des événements à venir
- S'inscrire / se désinscrire d'un événement
- Voir qui est inscrit à chaque événement
- Recevoir des notifications in-app + emails (nouvel event, modification, annulation)

### Administrateurs
- Créer / modifier / supprimer des événements
- Upload de photo de couverture
- Valider / refuser / supprimer des utilisateurs
- Promouvoir un utilisateur en admin
- Créer des comptes directement
- Notifications envoyées automatiquement aux bons destinataires

---

## Installation et configuration

### 1. Cloner et installer

```bash
git clone <repo>
cd eide-events
npm install
```

### 2. Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com) → **New project**
2. Notez : Project URL, anon key, service_role key

### 3. Exécuter le schéma SQL

Dans **Supabase Dashboard → SQL Editor**, copier-coller le contenu de :
```
supabase/migrations/001_initial_schema.sql
```

### 4. Configurer les variables d'environnement

```bash
cp .env.local.example .env.local
```

Remplir `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_xxxx
RESEND_FROM_EMAIL=noreply@dp.lu
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Créer le compte admin

Dans Supabase Dashboard → **Authentication → Users** → Add user :
- Email : votre email
- Password : votre mot de passe

Puis dans **SQL Editor** :
```sql
UPDATE public.profiles
SET role = 'admin', status = 'active'
WHERE email = 'votre-email@dp.lu';
```

### 6. Configurer Resend (emails)

1. Créer un compte sur [resend.com](https://resend.com)
2. **API Keys** → Create API Key → copier dans `.env.local`
3. **Domains** → Add Domain → vérifier `dp.lu`
   - En test : utiliser `onboarding@resend.dev` comme `RESEND_FROM_EMAIL`

### 7. Lancer en développement

```bash
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

---

## Déploiement sur Vercel

```bash
npm i -g vercel
vercel
```

Puis dans **Vercel Dashboard → Settings → Environment Variables**, ajouter toutes les variables de `.env.local`.

Mettre à jour `NEXT_PUBLIC_SITE_URL` avec l'URL Vercel finale.

---

## Structure du projet

```
eide-events/
├── app/
│   ├── auth/
│   │   ├── login/          → Page de connexion
│   │   └── register/       → Page d'inscription
│   ├── dashboard/
│   │   ├── page.tsx        → Liste des événements
│   │   ├── events/[id]/    → Détail d'un événement
│   │   ├── notifications/  → Centre de notifications
│   │   └── admin/
│   │       ├── events/     → CRUD événements (admin)
│   │       └── users/      → Gestion utilisateurs (admin)
│   └── api/
│       ├── auth/           → Emails d'inscription
│       ├── events/notify/  → Notifications événements
│       └── users/          → Gestion admin des comptes
├── components/
│   ├── layout/Sidebar.tsx
│   ├── events/RegisterButton.tsx
│   ├── admin/EventFormModal.tsx
│   ├── admin/UserActions.tsx
│   └── notifications/MarkAllReadButton.tsx
├── lib/
│   ├── supabase/client.ts  → Client navigateur
│   ├── supabase/server.ts  → Client serveur + admin
│   └── emails.ts           → Templates Resend
├── types/index.ts          → Types TypeScript
├── middleware.ts           → Protection des routes
└── supabase/migrations/    → Schéma SQL complet
```

---

## Sécurité

- Row Level Security (RLS) activé sur toutes les tables
- Seuls les utilisateurs `active` peuvent voir les événements
- Seuls les admins peuvent créer/modifier/supprimer
- Les utilisateurs ne peuvent gérer que leurs propres inscriptions et notifications
- Service Role Key uniquement côté serveur (API routes)

---

## Extensions possibles

- [ ] Calendrier visuel mensuel
- [ ] Export PDF/iCal des inscriptions
- [ ] QR Code de check-in à l'événement
- [ ] Commentaires sur les événements
- [ ] Intégration Google Calendar
- [ ] Rappels automatiques 24h avant
