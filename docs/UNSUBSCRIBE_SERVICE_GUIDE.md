# UnsubscribeService - Guida all'uso

## 📚 Cos'è?

`UnsubscribeService` è un servizio helper che gestisce automaticamente la pulizia delle subscription (RxJS e Firebase), prevenendo memory leak.

## 🎯 Perché usarlo?

**Senza UnsubscribeService** ❌:
```typescript
export class MyComponent implements OnInit, OnDestroy {
  private sub1?: Subscription;
  private sub2?: Subscription;
  private unsub1?: () => void;

  ngOnInit() {
    this.sub1 = this.service.getData().subscribe(...);
    this.sub2 = this.route.params.subscribe(...);
    this.unsub1 = this.firebaseService.listen(...);
  }

  ngOnDestroy() {
    // Devi ricordarti di fare unsubscribe per OGNI subscription!
    this.sub1?.unsubscribe();
    this.sub2?.unsubscribe();
    this.unsub1?.();
  }
}
```

**Con UnsubscribeService** ✅:
```typescript
@Component({
  providers: [UnsubscribeService] // Importante!
})
export class MyComponent implements OnInit {
  constructor(private unsubscribe: UnsubscribeService) {}

  ngOnInit() {
    const sub1 = this.service.getData().subscribe(...);
    this.unsubscribe.add(sub1);

    const sub2 = this.route.params.subscribe(...);
    this.unsubscribe.add(sub2);

    const unsub = this.firebaseService.listen(...);
    this.unsubscribe.add(unsub);
  }

  // Non serve ngOnDestroy! Tutto viene pulito automaticamente
}
```

## 🚀 Come usarlo

### 1. Aggiungi il provider al componente

```typescript
import { UnsubscribeService } from 'src/app/shared/services/unsubscribe.service';

@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.html',
  providers: [UnsubscribeService] // ⚠️ IMPORTANTE: a livello di componente!
})
export class MyComponent {
  constructor(private unsubscribe: UnsubscribeService) {}
}
```

### 2. Usa `.add()` per ogni subscription

#### RxJS Observable
```typescript
ngOnInit() {
  // Observable da servizio
  const sub = this.userService.users$.subscribe(users => {
    console.log(users);
  });
  this.unsubscribe.add(sub);

  // Route params
  const routeSub = this.route.params.subscribe(params => {
    console.log(params);
  });
  this.unsubscribe.add(routeSub);

  // HTTP request (anche se completa automaticamente, è buona pratica)
  const httpSub = this.http.get('/api/data').subscribe(data => {
    console.log(data);
  });
  this.unsubscribe.add(httpSub);
}
```

#### Firebase listeners
```typescript
ngOnInit() {
  // Firebase onSnapshot
  const unsub = this.evaluationService.getEvaluation4studentAndTeacher(
    studentKey,
    teacherKey,
    (evaluations) => {
      this.evaluations = evaluations;
    }
  );
  this.unsubscribe.add(unsub);

  // Altro listener Firebase
  const unsub2 = this.classiService.getClassiOnRealtime().subscribe(classi => {
    this.classi = classi;
  });
  this.unsubscribe.add(unsub2);
}
```

#### Combinazione di entrambi
```typescript
ngOnInit() {
  // RxJS
  const sub1 = this.service.data$.subscribe(...);
  this.unsubscribe.add(sub1);

  // Firebase
  const unsub = this.firebaseService.listen(...);
  this.unsubscribe.add(unsub);

  // Interval
  const intervalSub = interval(1000).subscribe(...);
  this.unsubscribe.add(intervalSub);
}
```

## 📋 Esempi pratici

### Esempio 1: Componente con lista studenti

```typescript
import { UnsubscribeService } from 'src/app/shared/services/unsubscribe.service';

@Component({
  selector: 'app-student-list',
  providers: [UnsubscribeService]
})
export class StudentListComponent implements OnInit {
  students: UserModel[] = [];
  classKey: string = '';

  constructor(
    private unsubscribe: UnsubscribeService,
    private usersService: UsersService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Ascolta i parametri della route
    const routeSub = this.route.params.subscribe(params => {
      this.classKey = params['classKey'];
      this.loadStudents();
    });
    this.unsubscribe.add(routeSub);
  }

  loadStudents() {
    // Listener Firebase per studenti
    const unsub = this.usersService.getUsersByClass(
      this.classKey,
      (students) => {
        this.students = students;
      }
    );
    this.unsubscribe.add(unsub);
  }
}
```

### Esempio 2: Dashboard con multiple subscription

```typescript
@Component({
  selector: 'app-dashboard',
  providers: [UnsubscribeService]
})
export class DashboardComponent implements OnInit {
  classes: ClasseModel[] = [];
  evaluations: Evaluation[] = [];
  activities: ActivityModel[] = [];

  constructor(
    private unsubscribe: UnsubscribeService,
    private classiService: ClassiService,
    private evaluationService: EvaluationService,
    private activitiesService: ActivitiesService
  ) {}

  ngOnInit() {
    // Classi in tempo reale
    const classiSub = this.classiService.classes$.subscribe(classes => {
      this.classes = classes;
    });
    this.unsubscribe.add(classiSub);

    // Valutazioni in tempo reale
    const evalUnsub = this.evaluationService.getEvaluationsOnRealtime(
      (evaluations) => {
        this.evaluations = evaluations;
      }
    );
    this.unsubscribe.add(evalUnsub);

    // Attività in tempo reale
    const actUnsub = this.activitiesService.getActivities4teacherOnRealtime(
      teacherKey,
      (activities) => {
        this.activities = activities;
      }
    );
    this.unsubscribe.add(actUnsub);
  }
}
```

## ⚠️ Cose importanti da ricordare

### 1. Provider a livello di componente
```typescript
@Component({
  providers: [UnsubscribeService] // ✅ Corretto
})
```

**NON** fornire a livello di modulo o root:
```typescript
@NgModule({
  providers: [UnsubscribeService] // ❌ SBAGLIATO!
})
```

### 2. Sempre usare `.add()`
```typescript
// ✅ Corretto
const sub = this.service.getData().subscribe(...);
this.unsubscribe.add(sub);

// ❌ Sbagliato - memory leak!
this.service.getData().subscribe(...);
```

### 3. Non serve ngOnDestroy
```typescript
// ✅ Corretto - il servizio fa tutto
export class MyComponent implements OnInit {
  // ...
}

// ❌ Non necessario (ma non dannoso)
export class MyComponent implements OnInit, OnDestroy {
  ngOnDestroy() {
    // Non serve, il servizio fa già tutto
  }
}
```

## 🔧 Metodi avanzati

### Cleanup manuale
```typescript
// Pulisce tutte le subscription prima della distruzione del componente
clearSubscriptions() {
  this.unsubscribe.clear();
}
```

### Debug - contare le subscription attive
```typescript
ngOnInit() {
  console.log('Subscription attive:', this.unsubscribe.count);
}
```

## 🐛 Troubleshooting

### "Cannot read property 'add' of undefined"
**Causa**: Hai dimenticato di aggiungere il provider
**Soluzione**: Aggiungi `providers: [UnsubscribeService]` al decorator del componente

### Le subscription non vengono pulite
**Causa**: Il provider è a livello di modulo invece che di componente
**Soluzione**: Sposta il provider nel decorator del componente

### Memory leak ancora presenti
**Causa**: Hai dimenticato di chiamare `.add()` per qualche subscription
**Soluzione**: Assicurati di aggiungere TUTTE le subscription con `.add()`

## ✅ Checklist

Prima di fare commit:
- [ ] Ho aggiunto `providers: [UnsubscribeService]` al componente?
- [ ] Ho iniettato il servizio nel constructor?
- [ ] Ho chiamato `.add()` per TUTTE le subscription?
- [ ] Ho rimosso `ngOnDestroy` se non serve per altro?

## 📚 Risorse aggiuntive

- [RxJS Subscription](https://rxjs.dev/guide/subscription)
- [Angular OnDestroy](https://angular.io/api/core/OnDestroy)
- [Firebase Unsubscribe](https://firebase.google.com/docs/firestore/query-data/listen)
