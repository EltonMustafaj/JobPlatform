# 🚀 Quick Start Guide

## Hapat për të Filluar (Steps to Start)

### 1️⃣ Konfiguro Databazën (Configure Database)

**SHUMË E RËNDËSISHME** - Duhet ta bëni këtë para se të filloni aplikacionin!

1. Hap Supabase dashboard: https://opkbkkkonqhnwmqwkbav.supabase.co
2. Shko te **SQL Editor**
3. Hap file-in: `supabase/migrations/001_initial_schema.sql`
4. Kopjo të gjithë kodin SQL
5. Ngjite në SQL Editor
6. Kliko **Run** ose **Execute**

Kjo do të krijojë:
- ✅ Tabelat (profiles, jobs, applications)
- ✅ Storage buckets (profile-photos, cvs)
- ✅ RLS policies (siguria)
- ✅ Trigger për krijimin automatik të profilit

---

### 2️⃣ Fillo Aplikacionin (Start the App)

```bash
cd c:\Projekte\Platform\JobPlatform
npx expo start
```

---

### 3️⃣ Hap në Telefon (Open on Phone)

1. Shkarko **Expo Go** nga App Store ose Google Play
2. Skano QR kodin që shfaqet në terminal
3. Aplikacioni do të hapet në telefonin tënd

---

## 📱 Si ta Përdorni (How to Use)

### Regjistrohu (Register)
1. Kliko "Regjistrohuni"
2. Zgjidh rolin:
   - **💼 Punëdhënës** - për të postuar punë
   - **🔍 Punëkërkues** - për të kërkuar punë
3. Plotëso të dhënat (emri, email, fjalëkalimi)
4. Kliko "Regjistrohu"

### Për Punëdhënës (For Employers)
1. **Posto Punë**: Shko te "Posto Punë" tab
2. Plotëso të gjitha fushat
3. Kliko "Publiko Punën"
4. **Shiko Punët**: Shko te "Punët e Mia"

### Për Punëkërkues (For Job Seekers)
1. **Shfleto Punë**: Shiko të gjitha punët në "Punë" tab
2. **Apliko**: Kliko në një punë → "Apliko" → Zgjidh CV
3. **Shiko Aplikimet**: Shko te "Aplikimet" tab

---

## ⚠️ Probleme të Mundshme (Troubleshooting)

### "Profile or Role not found"
→ Nuk e ke ekzekutuar SQL migration. Shiko hapin 1️⃣

### Fotot/CV-të nuk ngarkohen
→ Kontrollo që storage buckets janë krijuar nga migration

### Aplikacioni nuk fillon
→ Ekzekuto: `npx expo start -c` (clear cache)

---

## 📂 Struktura e Projektit

```
JobPlatform/
├── app/
│   ├── (auth)/          # Login & Register
│   ├── (tabs)/          # Ekranet kryesore
│   └── job-details/     # Detajet e punës
├── lib/                 # Helper functions
├── supabase/           # SQL migrations
└── .env                # Supabase credentials
```

---

## ✅ Testimi (Testing)

- [ ] Regjistrohu si Punëdhënës
- [ ] Posto një punë
- [ ] Regjistrohu si Punëkërkues (email tjetër)
- [ ] Apliko për punën
- [ ] Kontrollo në Supabase që të dhënat janë ruajtur

---

## 🎉 Gati! (Ready!)

Aplikacioni është gati për t'u përdorur. Nëse ke pyetje, shiko `README.md` për më shumë detaje.
