# Changelog

Tutte le modifiche di rilievo apportate a questo progetto saranno documentate in questo file.

## [0.0.2] - 2026-09-16

### Aggiunto
- **Miglioramento Importazione Studenti**: Aggiunto uno spinner di caricamento e la chiusura automatica del popup al termine del processo, con svuotamento della lista per confermare l'avvenuto salvataggio.

### Risolto
- **Correzione Importazione Nomi**: Risolto il problema del taglio dei nomi per gli studenti con cognomi composti (es. "Di Maggio") o doppi nomi durante l'importazione massiva da Excel.
- **Correzione Generazione Email**: Rimossi gli spazi dai nomi e cognomi durante la generazione dell'email istituzionale.

## [Unreleased] - 2026-07-11

### Aggiunto
- **Angular 22 Zoneless**: L'intera applicazione è stata aggiornata ad Angular 22, rimuovendo completamente `zone.js`.
- **Signal Forms API**: Rimosso `ReactiveFormsModule` e completata la migrazione chirurgica alla nuova Signal Forms API (`@angular/forms/signals`) per tutti i form e le finestre di dialogo dell'app, incluse la gestione Valutazioni, Attività ed Eventi.
- **Miglioramenti UI e Tema Scuro**: Corretto un problema estetico che rendeva invisibili o difficilmente leggibili le voci del menu di navigazione (sidebar) per le interfacce Utente e Classe quando veniva attivato il Tema Scuro.

## [Precedente] - 2026-06-10
- **Navigazione Rapida Studenti**: Aggiunti i pulsanti "Precedente" e "Successivo" in `evaluations4student` per scorrere rapidamente gli studenti di una classe, migliorando notevolmente il workflow di valutazione continua.
- **Scorciatoia Navigazione**: Introdotto un pulsante per tornare direttamente al pannello classe dalla vista delle valutazioni studente, ottimizzando il flusso di lavoro.
- **Panoramica Globale (Tabellone Voti)**: Creata una nuova schermata a griglia (`class-evaluations-overview`) accessibile dalla lista studenti. Permette di visualizzare le medie della classe a colpo d'occhio e inserire in modo massivo le "proposte di voto finale", con salvataggio diretto nel profilo studente (`UserModel`).
- **Filtro Multi-Materia**: I docenti che insegnano più materie possono ora filtrare le valutazioni per il singolo insegnamento sia nel Tabellone Voti che nella scheda del singolo studente. Le proposte di voto finale tengono traccia della materia, e la selezione della materia viene ricordata scorrendo la classe.
- **Fix UI & Bugfix**:
  - I colori del Tabellone Voti e della lista studenti sono stati ottimizzati per la modalità scura (Dark Mode) sfruttando sfondi in formato RGBA dinamico.
  - Corretto l'uso di ID duplicati nei selettori data di `evaluation4-student` per impedire conflitti UI navigando rapidamente tra gli studenti.

### Modificato
- **Integrazione Tabellone Voti**: Aggiunto un link diretto al Tabellone Voti nel menu laterale della schermata classe.
- **Navigazione Dettaglio Studente**: Nel Tabellone Voti, i nomi degli studenti sono ora cliccabili per accedere direttamente al loro dettaglio valutazioni.
- **Formattazione Voti**: I voti mostrati all'interno dei badge circolari nella lista valutazioni dello studente vengono ora arrotondati a numeri interi per una maggiore chiarezza visiva.

## [Precedente] - 2026-06-06

### Aggiunto
- **Componente `student-avatar`**: Inserimento dell'avatar studente nel pannello `user-dialog` con possibilità di caricare foto su Firebase Storage, visualizzare le iniziali (se nessuna foto è presente) e ritagliare le immagini tramite `ngx-image-cropper`.
- **Componente `student-disability`**: Nuovo tab dedicato "Disabilità & PDP" all'interno del `user-dialog`. Include:
  - Gestione dei chip disabilità (DVA, DSA, BES, ADHD) con gradienti cromatici e animazioni.
  - Elenco dinamico dei Documenti PDP con bottoni azione (apri link, copia link, elimina).
- **Nuovo Layout `user-dialog`**: Sostituite le tab mobili (`<ion-tabs>`) con una sidebar laterale responsiva che divide l'interfaccia in 4 sezioni principali: Generalità, Disabilità & PDP, Note, Valutazioni.

### Modificato
- **`user-generalities2`**: Rimosse le sezioni relative a disabilità e documenti PDP. Il form è stato riprogettato con un layout a griglia (`<ion-grid>`) a due colonne per migliorare l'usabilità desktop e tablet.
- **`reserved-notes4student`**: Restyling completo dell'interfaccia:
  - Categorie implementate tramite bottoni (chip) interattivi con un tema cromatico specifico (Comportamento, Profitto, Comunicazione Famiglia, Salute, Altro).
  - Ricerca Full-Text implementata direttamente lato client (tramite signal `computed`) che estende i filtri a testo, categorie, URL degli allegati e data di creazione.
  - Le note ora vengono visualizzate con un layout a card verticali arricchite da un bordo sinistro colorato a seconda della categoria.
- **`evaluation4-student`**: Completa rivisitazione in chiave moderna delle valutazioni:
  - Le valutazioni appaiono con un layout a card compatte e orizzontali.
  - Implementato un sistema di "Badge Score" visivo per i voti: verde (`>= 0.7`), arancione (`>= 0.5` e `< 0.7`) e rosso (`< 0.5`).
  - Materie, attività, e griglie sono evidenziate con meta-tag visivi e gli allegati con chip cliccabili.
- Pulizia del codice e rimozione dei `console.log` residui per i componenti legati all'`user-dialog`.

### Risolto
- Risolto un bug di sincronizzazione reattiva all'interno di `student-disability` legato all'uso del nuovo `input()` di Angular in combinazione con `ngOnChanges` (sostituito da un `effect()`).
- Risolto un problema di visibilità del testo nel menu di navigazione laterale in `class-dialog` e `user-dialog` quando è impostato il tema scuro.
- Corretto il selettore CSS in `class-dialog` per applicare correttamente lo stile di "voce attiva" (`ion-item`).
