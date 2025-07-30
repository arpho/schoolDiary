# Gestione degli Input con Angular Signals

## Problema
Quando si utilizzano Angular Signals per gestire gli input in un componente figlio, è importante gestire correttamente il timing dell'inizializzazione e l'aggiornamento dei valori.

## Soluzione

### 1. Nel Componente Padre
```typescript
// Esempio nel componente ClasseDialogPage
export class ClasseDialogPage {
  classkey = signal<string>('');
  teacherkey = signal<string>('');
  
  // Nel template
  <app-list-activities4class [classkey]="classkey()" [teacherkey]="teacherkey()"></app-list-activities4class>
}
```

### 2. Nel Componente Figlio
```typescript
export class ListActivities4classComponent {
  classkey = input<string>('');
  teacherkey = input<string>('');
  activitieslist = signal<ActivityModel[]>([]);

  constructor(
    private activitiesService: ActivitiesService
  ) {
    // Effetto che si attiva quando i valori cambiano
    effect(() => {
      const currentClassKey = this.classkey();
      const currentTeacherKey = this.teacherkey();
      
      if (currentClassKey && currentTeacherKey) {
        this.updateActivities();
      }
    });
  }

  private updateActivities() {
    // Logica per aggiornare le attività
    const query: QueryCondition[] = [
      new QueryCondition('classKey', '==', this.classkey()),
      new QueryCondition('teacherKey', '==', this.teacherkey())
    ];

    this.activitiesService.getActivitiesOnRealtime(
      this.teacherkey(),
      (activities: ActivityModel[]) => {
        this.activitieslist.set(activities);
      },
      query
    );
  }
}
```

## Punti Chiave
1. **Utilizzare `input<string>('')`** invece di `model<string>('')` per i valori di input
2. **Spostare l'effect nel costruttore** invece di ngOnInit per gestire correttamente i cambiamenti
3. **Utilizzare i segnali correttamente** nel template con la sintassi `classkey()`
4. **Verificare la presenza dei valori** prima di eseguire operazioni

## Errori Comuni da Evitare
- Non utilizzare `[(classkey)]` nel template, utilizzare `[classkey]`
- Non utilizzare `model<string>('')` per gli input
- Non dipendere da ngOnInit per l'inizializzazione dei segnali
- Verificare sempre la presenza dei valori prima di eseguire operazioni asincrone
