# Zgjidhja për "Could not connect to server"

## Problemi
Expo Go në telefon nuk po lidhet me Metro Bundler në kompjuter.

## Zgjidhjet

### Zgjidhja 1: Përdor Tunnel Mode (MË E LEHTA)

Kjo funksionon edhe nëse je në WiFi të ndryshëm ose ke firewall.

**Hapat:**
1. Mbyll Metro (Ctrl+C)
2. Ekzekuto:
```bash
npx expo start --tunnel
```
3. Prit pak më shumë (tunnel ka nevojë për kohë)
4. Skano QR kodin e ri

### Zgjidhja 2: Kontrollo WiFi

**Sigurohu që:**
- ✅ Telefoni dhe kompjuteri janë në **të njëjtin WiFi**
- ✅ Nuk ke VPN aktiv në telefon ose kompjuter
- ✅ WiFi nuk është "Guest Network" (që bllokon pajisjet)

### Zgjidhja 3: Përdor LAN Mode

```bash
npx expo start --lan
```

### Zgjidhja 4: Testo në Web (për të parë nëse kodit i funksionon)

```bash
npx expo start
```
Pastaj shtyp **w** në terminal për të hapur në browser.

## Rekomandimi Im

**Provo Tunnel Mode:**
```bash
npx expo start --tunnel
```

Kjo është zgjidhja më e sigurt dhe funksionon në çdo situatë!

## Nëse Asnjë Nuk Funksionon

Mund të testosh në web browser:
1. Ekzekuto: `npx expo start`
2. Shtyp `w` në terminal
3. Hapet në browser (Chrome/Firefox)
4. Mund të testosh login/register atje
