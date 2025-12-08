# 🔔 Job Notifications Setup Guide

## Çfarë është shtuar?

Sistemi i njoftimeve automatike për Job Alerts është implementuar! Tani kur postohet një punë e re që përputhet me kriteret e një job alert, përdoruesi merr një njoftim.

## Hapat për Setup

### 1. Ekzekuto Migration-in në Supabase

Shko në Supabase Dashboard:
1. **SQL Editor** → **New Query**
2. Kopjo përmbajtjen e file-it `supabase/migrations/009_job_notifications.sql`
3. Ekzekuto query-n (Run)

### 2. Verifiko që tabela është krijuar

Në Supabase Dashboard:
- **Table Editor** → Duhet të shohësh tabelën `job_notifications`

## Si funksionon?

### Për Punëkërkuesin:

1. **Krijo një Job Alert**:
   - Shko në tab-in "Alerts"
   - Kliko butonin "+" për të krijuar alert të ri
   - Vendos kriteret (job type, location, keywords, etj.)

2. **Merr Njoftime**:
   - Kur postohet një punë që përputhet me kriteret, do të shfaqet një njoftim në tab-in "Alerts"
   - Badge-i në tab do të tregojë numrin e njoftimeve të pa lexuara
   - Njoftime të pa lexuara janë me ngjyrë blu

3. **Shiko Punën**:
   - Kliko në njoftim për të parë detajet e punës
   - Njoftime shënohet automatikisht si e lexuar

### Për Punëdhënësin:

Kur posto një punë të re:
1. Sistemi kontrollon automatikisht të gjitha alerts aktive
2. Nëse ka përputhje me kriteret, krijon njoftime për përdoruesit përkatës
3. Përdoruesit marrin njoftim menjëherë

## Karakteristikat

✅ **Real-time updates** - Badge përditësohet automatikisht
✅ **Njoftime të pa lexuara** - Dallim vizual për njoftime të reja
✅ **Navigim direkt** - Kliko njoftimin për të parë punën
✅ **Filtrim inteligjent** - Përputhje bazuar në:
   - Search query (në title/description)
   - Job type
   - Location
   - Work mode
   - Experience level

## Struktura e Databazës

### Tabela: `job_notifications`

| Kolona | Tipi | Përshkrimi |
|--------|------|------------|
| id | UUID | ID unike |
| user_id | UUID | Përdoruesi që merr njoftimin |
| job_id | UUID | Puna që përputhet |
| alert_id | UUID | Alert-i që shkaktoi njoftimin |
| title | TEXT | Titulli i njoftimit |
| message | TEXT | Mesazhi i njoftimit |
| is_read | BOOLEAN | A është lexuar? |
| created_at | TIMESTAMP | Koha e krijimit |

## Të ardhmen (Future Enhancements)

- 📧 Email notifications (per alerts me frequency "instant", "daily", "weekly")
- 📱 Push notifications (me Expo Notifications)
- 🗑️ Delete old notifications automatically
- 📊 Notification preferences per user

## Troubleshooting

### Badge-i nuk përditësohet?
- Sigurohu që migration-i është ekzekutuar
- Kontrollo RLS policies në Supabase
- Restart aplikacionin

### Njoftime nuk krijohen?
- Kontrollo që job alerts janë `is_active = true`
- Verifiko që kriteret përputhen
- Shiko console logs për errors

### Error në real-time subscription?
- Sigurohu që Supabase Realtime është enabled
- Kontrollo që tabela `job_notifications` ka realtime të aktivizuar

