# Esempio di Refactoring: classe-dialog.ts

## Prima (senza UnsubscribeService)

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-classe-dialog',
  templateUrl: './classe-dialog.html'
})
export class ClasseDialogPage implements OnInit, OnDestroy {
  // Molte variabili per gestire le subscription
  private routeSub?: Subscription;
  private classiSub?: Subscription;
  private evalUnsub?: () => void;
  private activitiesUnsub?: () => void;

  constructor(
    private route: ActivatedRoute,
    private service: ClassiService,
    private evaluationService: EvaluationService,
    private activitiesService: ActivitiesService
  ) {}

  ngOnInit() {
    // Route params
    this.routeSub = this.route.params.subscribe(params => {
      const classKey = params['classkey'];
      if (classKey) {
        this.loadClassData(classKey);
      }
    });

    // Classi in tempo reale
    this.classiSub = this.service.classes$.subscribe(classes => {
      this.updateClassList(classes);
    });
  }

  loadClassData(classKey: string) {
    // Valutazioni in tempo reale
    this.evalUnsub = this.evaluationService.getEvaluationsForClass(
      classKey,
      (evaluations) => {
        this.evaluations = evaluations;
      }
    );

    // Attività in tempo reale
    this.activitiesUnsub = this.activitiesService.getActivities4teacherOnRealtime(
      this.teacherKey,
      (activities) => {
        this.activities = activities;
      }
    );
  }

  ngOnDestroy() {
    // Devi ricordarti di pulire TUTTO!
    this.routeSub?.unsubscribe();
    this.classiSub?.unsubscribe();
    this.evalUnsub?.();
    this.activitiesUnsub?.();
  }
}
```

## Dopo (con UnsubscribeService) ✅

```typescript
import { Component, OnInit } from '@angular/core';
import { UnsubscribeService } from 'src/app/shared/services/unsubscribe.service';

@Component({
  selector: 'app-classe-dialog',
  templateUrl: './classe-dialog.html',
  providers: [UnsubscribeService] // ⚠️ Importante!
})
export class ClasseDialogPage implements OnInit {
  // ✅ Non servono più variabili per le subscription!

  constructor(
    private unsubscribe: UnsubscribeService, // ✅ Inietta il servizio
    private route: ActivatedRoute,
    private service: ClassiService,
    private evaluationService: EvaluationService,
    private activitiesService: ActivitiesService
  ) {}

  ngOnInit() {
    // Route params
    const routeSub = this.route.params.subscribe(params => {
      const classKey = params['classkey'];
      if (classKey) {
        this.loadClassData(classKey);
      }
    });
    this.unsubscribe.add(routeSub); // ✅ Aggiungi alla gestione automatica

    // Classi in tempo reale
    const classiSub = this.service.classes$.subscribe(classes => {
      this.updateClassList(classes);
    });
    this.unsubscribe.add(classiSub); // ✅ Aggiungi alla gestione automatica
  }

  loadClassData(classKey: string) {
    // Valutazioni in tempo reale
    const evalUnsub = this.evaluationService.getEvaluationsForClass(
      classKey,
      (evaluations) => {
        this.evaluations = evaluations;
      }
    );
    this.unsubscribe.add(evalUnsub); // ✅ Aggiungi alla gestione automatica

    // Attività in tempo reale
    const activitiesUnsub = this.activitiesService.getActivities4teacherOnRealtime(
      this.teacherKey,
      (activities) => {
        this.activities = activities;
      }
    );
    this.unsubscribe.add(activitiesUnsub); // ✅ Aggiungi alla gestione automatica
  }

  // ✅ Non serve più ngOnDestroy!
  // Tutto viene pulito automaticamente quando il componente viene distrutto
}
```

## Vantaggi del refactoring

### Codice più pulito
- ❌ **Prima**: 4 variabili private + ngOnDestroy con 4 righe
- ✅ **Dopo**: 0 variabili private + 0 righe di cleanup

### Meno errori
- ❌ **Prima**: Facile dimenticare un unsubscribe
- ✅ **Dopo**: Impossibile dimenticare, tutto automatico

### Più manutenibile
- ❌ **Prima**: Ogni nuova subscription = nuova variabile + riga in ngOnDestroy
- ✅ **Dopo**: Ogni nuova subscription = solo `.add()`

## Checklist per il refactoring

1. [ ] Aggiungi `providers: [UnsubscribeService]` al decorator
2. [ ] Inietta `UnsubscribeService` nel constructor
3. [ ] Per ogni subscription:
   - [ ] Rimuovi la variabile privata
   - [ ] Salva il risultato in una variabile locale
   - [ ] Chiama `this.unsubscribe.add(variabile)`
4. [ ] Rimuovi `ngOnDestroy` se non serve per altro
5. [ ] Rimuovi `OnDestroy` dall'implements se non serve
6. [ ] Testa che tutto funzioni correttamente

## Pattern comuni

### Pattern 1: Subscription immediata
```typescript
// Prima
this.sub = this.service.getData().subscribe(...);

// Dopo
const sub = this.service.getData().subscribe(...);
this.unsubscribe.add(sub);
```

### Pattern 2: Subscription condizionale
```typescript
// Prima
if (condition) {
  this.sub = this.service.getData().subscribe(...);
}

// Dopo
if (condition) {
  const sub = this.service.getData().subscribe(...);
  this.unsubscribe.add(sub);
}
```

### Pattern 3: Subscription in metodi
```typescript
// Prima
loadData() {
  this.sub = this.service.getData().subscribe(...);
}

// Dopo
loadData() {
  const sub = this.service.getData().subscribe(...);
  this.unsubscribe.add(sub);
}
```

### Pattern 4: Multiple subscription dello stesso tipo
```typescript
// Prima
this.sub1 = this.service.getData1().subscribe(...);
this.sub2 = this.service.getData2().subscribe(...);
this.sub3 = this.service.getData3().subscribe(...);

// Dopo
const sub1 = this.service.getData1().subscribe(...);
this.unsubscribe.add(sub1);

const sub2 = this.service.getData2().subscribe(...);
this.unsubscribe.add(sub2);

const sub3 = this.service.getData3().subscribe(...);
this.unsubscribe.add(sub3);
```
