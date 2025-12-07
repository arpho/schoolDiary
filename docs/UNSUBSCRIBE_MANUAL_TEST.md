# Test Manuale UnsubscribeService

## ✅ Come verificare che funzioni (senza unit test)

### Metodo 1: Console Log Test

Aggiungi questo codice temporaneo in un componente esistente:

```typescript
import { Component, OnInit } from '@angular/core';
import { UnsubscribeService } from 'src/app/shared/services/unsubscribe.service';
import { interval } from 'rxjs';

@Component({
  selector: 'app-test',
  template: '<p>Test UnsubscribeService - Controlla la console</p>',
  providers: [UnsubscribeService]
})
export class TestComponent implements OnInit {
  constructor(private unsubscribe: UnsubscribeService) {
    console.log('✅ UnsubscribeService iniettato correttamente');
  }

  ngOnInit() {
    console.log('📊 Subscription attive all\'inizio:', this.unsubscribe.count);

    // Test 1: RxJS Observable
    const sub1 = interval(1000).subscribe(tick => {
      console.log('⏱️ Tick:', tick);
    });
    this.unsubscribe.add(sub1);
    console.log('📊 Dopo add(sub1):', this.unsubscribe.count);

    // Test 2: Altro Observable
    const sub2 = interval(2000).subscribe(tick => {
      console.log('⏱️ Tick lento:', tick);
    });
    this.unsubscribe.add(sub2);
    console.log('📊 Dopo add(sub2):', this.unsubscribe.count);

    // Test 3: Firebase-like function
    const unsub = () => {
      console.log('🔥 Firebase unsubscribe chiamato!');
    };
    this.unsubscribe.add(unsub);
    console.log('📊 Dopo add(unsub):', this.unsubscribe.count);

    console.log('✅ Tutte le subscription aggiunte. Totale:', this.unsubscribe.count);
    console.log('💡 Quando esci dal componente, vedrai i cleanup automatici');
  }

  ngOnDestroy() {
    console.log('🧹 ngOnDestroy chiamato - UnsubscribeService farà il cleanup');
  }
}
```

**Cosa aspettarsi nella console:**
```
✅ UnsubscribeService iniettato correttamente
📊 Subscription attive all'inizio: 0
📊 Dopo add(sub1): 1
📊 Dopo add(sub2): 2
📊 Dopo add(unsub): 3
✅ Tutte le subscription aggiunte. Totale: 3
⏱️ Tick: 0
⏱️ Tick lento: 0
⏱️ Tick: 1
⏱️ Tick: 2
⏱️ Tick lento: 1
... (quando esci dal componente)
🧹 ngOnDestroy chiamato - UnsubscribeService farà il cleanup
🔥 Firebase unsubscribe chiamato!
... (i tick si fermano)
```

---

### Metodo 2: Chrome DevTools Memory Test

1. **Apri Chrome DevTools** (F12)
2. **Vai alla tab "Memory"**
3. **Prendi uno snapshot** (Heap snapshot)
4. **Naviga al componente** che usa UnsubscribeService
5. **Naviga via dal componente**
6. **Prendi un altro snapshot**
7. **Confronta** - dovresti vedere che le subscription sono state pulite

---

### Metodo 3: Test Pratico nel tuo progetto

Usa `UnsubscribeService` in `classe-dialog.ts`:

```typescript
// In classe-dialog.ts
import { UnsubscribeService } from 'src/app/shared/services/unsubscribe.service';

@Component({
  selector: 'app-classe-dialog',
  templateUrl: './classe-dialog.html',
  styleUrls: ['./classe-dialog.scss'],
  providers: [UnsubscribeService] // Aggiungi questo
})
export class ClasseDialogPage implements OnInit {
  constructor(
    // ... altri servizi
    private unsubscribe: UnsubscribeService // Aggiungi questo
  ) {
    console.log('✅ UnsubscribeService pronto in classe-dialog');
  }

  async ngOnInit(): Promise<void> {
    console.log('📊 Subscription all\'inizio:', this.unsubscribe.count);

    // Esempio: Ascolta i parametri della route
    const routeSub = this.route.params.subscribe(params => {
      const classkey = params['classkey'];
      console.log('📍 Route param:', classkey);
    });
    this.unsubscribe.add(routeSub);
    console.log('📊 Dopo route subscription:', this.unsubscribe.count);

    // ... resto del codice esistente
  }

  // Rimuovi ngOnDestroy se esiste - non serve più!
}
```

**Test:**
1. Apri la console del browser
2. Naviga a una classe
3. Dovresti vedere:
   ```
   ✅ UnsubscribeService pronto in classe-dialog
   📊 Subscription all'inizio: 0
   📍 Route param: abc123
   📊 Dopo route subscription: 1
   ```
4. Naviga via dalla classe
5. Le subscription vengono pulite automaticamente

---

### Metodo 4: Verifica visiva (più semplice)

**Prima (senza UnsubscribeService):**
```typescript
export class MyComponent implements OnInit, OnDestroy {
  private sub?: Subscription;

  ngOnInit() {
    this.sub = interval(1000).subscribe(tick => {
      console.log('Tick:', tick);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
```

**Comportamento:**
- Entri nel componente → vedi "Tick: 0, 1, 2, 3..."
- Esci dal componente → i tick si fermano (se hai implementato ngOnDestroy)
- Esci dal componente → i tick CONTINUANO (se hai dimenticato ngOnDestroy) ❌

**Dopo (con UnsubscribeService):**
```typescript
@Component({
  providers: [UnsubscribeService]
})
export class MyComponent implements OnInit {
  constructor(private unsubscribe: UnsubscribeService) {}

  ngOnInit() {
    const sub = interval(1000).subscribe(tick => {
      console.log('Tick:', tick);
    });
    this.unsubscribe.add(sub);
  }
}
```

**Comportamento:**
- Entri nel componente → vedi "Tick: 0, 1, 2, 3..."
- Esci dal componente → i tick si fermano SEMPRE ✅

---

## 🎯 Test Rapido (30 secondi)

1. Apri la console del browser (F12)
2. Incolla questo nel componente che stai testando:

```typescript
ngOnInit() {
  console.log('🧪 TEST: Subscription count:', this.unsubscribe?.count ?? 'UnsubscribeService non iniettato');
  
  if (this.unsubscribe) {
    const testSub = interval(1000).subscribe(() => console.log('⏱️'));
    this.unsubscribe.add(testSub);
    console.log('🧪 TEST: Dopo add:', this.unsubscribe.count);
  }
}
```

3. Ricarica la pagina
4. Dovresti vedere:
   ```
   🧪 TEST: Subscription count: 0
   🧪 TEST: Dopo add: 1
   ⏱️
   ⏱️
   ⏱️
   ```
5. Naviga via → i tick si fermano ✅

---

## ✅ Il servizio funziona se:

- ✅ Puoi iniettarlo senza errori
- ✅ `this.unsubscribe.count` ritorna un numero
- ✅ Puoi chiamare `.add()` senza errori
- ✅ Le subscription si fermano quando esci dal componente

## ❌ Problemi comuni:

### "Cannot read property 'add' of undefined"
**Soluzione**: Hai dimenticato `providers: [UnsubscribeService]` nel decorator

### "No provider for UnsubscribeService"
**Soluzione**: Aggiungi `providers: [UnsubscribeService]` al componente (NON al modulo)

### Le subscription non si fermano
**Soluzione**: Verifica di aver chiamato `.add()` per ogni subscription

---

## 💡 Conclusione

**Non hai bisogno dei test unitari per verificare che funzioni!**

Il servizio è molto semplice e puoi verificarlo facilmente:
1. Console log del count
2. Verifica visiva che le subscription si fermino
3. Test pratico in un componente reale

**Il servizio è pronto all'uso! 🚀**
