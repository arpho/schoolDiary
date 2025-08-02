# schoolDiary

## Descrizione

schoolDiary è un'applicazione per la gestione del diario scolastico sviluppata con Ionic e Angular.

## Tecnologie Principali

- **Framework**: Ionic 9.0.0
- **Frontend Framework**: Angular 20.1.0
- **Database**: Firebase
- **Capacitor**: 7.4.1 (per supporto nativo mobile)
- **Routing**: Angular Router
- **Form Management**: Angular Forms
- **State Management**: RxJS
- **UI Components**: Ionic Components

## Struttura del Progetto

```
src/app/
├── pages/           # Pagine principali dell'applicazione
│   ├── activities/  # Gestione attività
│   ├── auth/       # Autenticazione
│   ├── classes/    # Gestione classi
│   ├── dashboard/  # Dashboard principale
│   ├── evaluations/ # Gestione valutazioni
│   ├── grids/      # Gestione griglie
│   ├── profile/    # Profilo utente
│   └── users/      # Gestione utenti
├── shared/         # Componenti e servizi condivisi
└── home/          # Pagina iniziale
```

## Funzionalità

- Gestione utenti e autenticazione
- Gestione classi
- Gestione attività
- Sistema di valutazioni
- Dashboard informativo
- Profilo utente
- Supporto nativo mobile tramite Capacitor

## Installazione

1. Installare le dipendenze:
```bash
npm install
```

2. Avviare il server di sviluppo:
```bash
ng serve
```

3. Per la versione mobile:
```bash
npx cap sync
npx cap open android  # per Android
# o
npx cap open ios      # per iOS
```

## Requisiti di Sistema

- Node.js >= 20.x
- npm >= 10.x
- Angular CLI >= 20.1.0
- Ionic CLI >= 9.0.0
- Capacitor CLI >= 7.4.1

## Licenza

MIT License
