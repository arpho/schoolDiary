# Documentazione API createUser

## Descrizione

Crea un nuovo utente nel sistema con autenticazione Firebase e profilo utente in Firestore.

## Endpoint

`POST /createUser`

## Autenticazione

Richiede un utente autenticato.

## Parametri di Input

### Body (JSON)

```typescript
{
  email: string;          // Email dell'utente (obbligatoria, formato valido)
  password: string;       // Password (obbligatoria, minimo 6 caratteri)
  role: number;           // Ruolo utente (obbligatorio, vedi enum UsersRole)
  firstName: string;      // Nome dell'utente (obbligatorio)
  lastName: string;       // Cognome dell'utente (obbligatorio)
  classKey?: string;      // Chiave della classe (obbligatoria per studenti)
  additionalData?: {      // Dati aggiuntivi opzionali
    displayName?: string;
    photoURL?: string;
    [key: string]: any;   // Altri campi personalizzati
  }
}
```

### Enum UsersRole

```typescript
enum UsersRole {
  ADMIN = 1,
  TEACHER = 2,
  STUDENT = 3
}
```

## Risposta di Successo (200)

```typescript
{
  uid: string;            // ID univoco dell'utente
  email: string;          // Email dell'utente
  role: number;           // Ruolo assegnato
  classKey?: string;      // Classe (se studente)
  emailVerified: boolean; // Stato verifica email
  displayName?: string;   // Nome visualizzato
  photoURL?: string;      // URL immagine profilo
  customClaims: {         // Claims personalizzati
    role: number;
    classKey?: string;
  }
}
```

## Errori

### 400 Bad Request - INVALID_ARGUMENT

- `Email non valida`
- `Password obbligatoria (minimo 6 caratteri)`
- `Ruolo non valido. I ruoli validi sono: ADMIN=1, TEACHER=2, STUDENT=3`
- `Nome e cognome sono obbligatori`
- `Per gli studenti è obbligatorio specificare la classe`

### 401 Unauthorized - UNAUTHENTICATED

- `Devi essere autenticato per creare un utente`

### 409 Conflict - ALREADY_EXISTS

- `Un utente con questa email esiste già`

### 500 Internal Server Error - INTERNAL

- `Si è verificato un errore durante la creazione dell'utente`

## Esempi

### Creazione Insegnante

```bash
curl -X POST /createUser \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ID_TOKEN>" \
  -d '{
    "email": "insegnante@scuola.it",
    "password": "passwordSicura123",
    "firstName": "Mario",
    "lastName": "Rossi",
    "role": 2,
    "additionalData": {
      "displayName": "Mario Rossi"
    }
  }'
```

### Creazione Studente

```bash
curl -X POST /createUser \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ID_TOKEN>" \
  -d '{
    "email": "studente@scuola.it",
    "password": "passwordSicura123",
    "firstName": "Luigi",
    "lastName": "Bianchi",
    "role": 3,
    "classKey": "3A",
    "additionalData": {
      "displayName": "Luigi Bianchi",
      "sezione": "3A"
    }
  }'
```

## Note sulla Sicurezza

- La password deve essere gestita in modo sicuro lato client
- L'endpoint è protetto da autenticazione
- I ruoli sono validati lato server
- I dati sensibili non vengono mai restituiti nella risposta
