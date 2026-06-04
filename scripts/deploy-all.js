const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const https = require('https');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function runCommand(command) {
  try {
    console.log(`\n> Esecuzione: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`\n[ERRORE] Il comando ha fallito: ${command}`);
    return false;
  }
}

// Funzione helper per caricare la chiave API di Gemini dal file .env delle Cloud Functions
function getGeminiApiKey() {
  const envPath = path.join(__dirname, '../functions/.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY\s*=\s*(.*)/);
    if (match) {
      return match[1].trim();
    }
  }
  return '';
}

// Funzione helper per interrogare l'API di Gemini in background usando solo moduli nativi di Node.js
function generateAICommitMessage(diff, apiKey) {
  return new Promise((resolve, reject) => {
    // Riduciamo la lunghezza del diff per sicurezza se è eccezionalmente grande
    const maxDiffLength = 30000;
    const truncatedDiff = diff.length > maxDiffLength ? diff.substring(0, maxDiffLength) + "\n\n[Diff troncato per limiti di spazio]" : diff;

    const postData = JSON.stringify({
      contents: [{
        parts: [{
          text: `Genera un messaggio di commit Git sintetico, descrittivo e professionale in italiano (usando la convenzione Conventional Commits standard come 'feat(scope): descrizione' o 'fix(scope): descrizione') basato sul seguente git diff. Restituisci ESCLUSIVAMENTE il testo del messaggio di commit pronto all'uso, senza racchiuderlo tra virgolette, senza formattazione markdown (niente backticks o grassetti) e senza alcuna spiegazione extra. Massimo 72 caratteri.\n\nGit Diff:\n${truncatedDiff}`
        }]
      }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            return reject(new Error(`API Error (Status ${res.statusCode}): ${data}`));
          }
          const parsed = JSON.parse(data);
          if (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content && parsed.candidates[0].content.parts[0]) {
            const message = parsed.candidates[0].content.parts[0].text.trim();
            // Rimuoviamo eventuali virgolette esterne aggiunte per errore dall'LLM
            resolve(message.replace(/^["']|["']$/g, ''));
          } else {
            reject(new Error("Formato risposta API non valido."));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log("=== INIZIO WORKFLOW DI DEPLOY E AUTO-COMMIT CON IA (GEMINI) ===");

  // 1. Esecuzione test, build e deploy firebase
  console.log("\n1. Avvio dei test, compilazione e deploy su Firebase...");
  const deploySuccess = runCommand("ng test --watch=false && ionic build --prod && firebase deploy");
  if (!deploySuccess) {
    console.log("\n[ABORTITO] Il deploy è fallito. Interruzione del workflow.");
    rl.close();
    process.exit(1);
  }

  console.log("\n[OK] Deploy completato con successo!");

  // 2. Controllo modifiche git
  console.log("\n2. Analisi dello stato di Git...");
  let status = "";
  try {
    status = execSync("git status --porcelain").toString().trim();
  } catch (err) {
    console.error("Impossibile leggere lo stato di Git:", err);
    rl.close();
    process.exit(1);
  }

  if (!status) {
    console.log("Nessuna modifica pendente rilevata in Git. Workflow completato.");
    rl.close();
    process.exit(0);
  }

  const lines = status.split("\n").map(line => line.trim());
  const modifiedFiles = lines.map(line => {
    const parts = line.split(/\s+/);
    return {
      status: parts[0],
      file: parts.slice(1).join(" ")
    };
  });

  console.log(`   Rilevati ${modifiedFiles.length} file modificati/non tracciati.`);

  // 3. Commit del Changelog (se modificato)
  const changelogFile = modifiedFiles.find(f => f.file.includes("changelog.page.html"));
  if (changelogFile) {
    console.log("\n3. Rilevate modifiche al Changelog. Eseguo commit separato...");
    runCommand("git add src/app/pages/changelog/changelog.page.html");
    runCommand('git commit -m "docs(changelog): update changelog for the latest release"');
  }

  // 4. Commit del Codice con Generazione IA
  // Ricalcola lo status dopo il commit del changelog
  const remainingStatus = execSync("git status --porcelain").toString().trim();
  if (remainingStatus) {
    console.log("\n4. Preparazione delle modifiche del codice...");
    
    // Staging di tutte le modifiche per calcolare il diff
    runCommand("git add .");
    
    const diff = execSync("git diff --cached").toString().trim();
    const apiKey = getGeminiApiKey();

    let commitMsg = "";

    if (diff && apiKey) {
      console.log("   Generazione del messaggio di commit con l'IA di Gemini in corso...");
      try {
        commitMsg = await generateAICommitMessage(diff, apiKey);
        console.log(`\n🤖 Messaggio generato dall'IA:\n   "${commitMsg}"\n`);
      } catch (aiError) {
        console.warn("\n⚠️ Generazione IA fallita:", aiError.message);
      }
    } else if (!apiKey) {
      console.warn("\n⚠️ Nessuna GEMINI_API_KEY trovata nel file functions/.env.");
    }

    // Se l'IA ha generato il messaggio, procediamo, altrimenti chiediamo all'utente o usiamo il default
    if (commitMsg) {
      rl.question("Premi INVIO per confermare questo messaggio, oppure digita un messaggio personalizzato: ", (userInput) => {
        const finalMsg = userInput.trim() ? userInput.trim() : commitMsg;
        runCommand(`git commit -m "${finalMsg.replace(/"/g, '\\"')}"`);
        
        console.log("\nEseguo il push delle modifiche sul repository remoto...");
        runCommand("git push");

        console.log("\n=== WORKFLOW COMPLETATO CON SUCCESSO CON SUPPORTO IA! ===");
        rl.close();
        process.exit(0);
      });
    } else {
      rl.question("Inserisci il messaggio di commit per il codice modificato (invio per usare il default): ", (commitMsgInput) => {
        const finalMsg = commitMsgInput.trim() ? commitMsgInput.trim() : "feat(code): update application components and styles";
        runCommand(`git commit -m "${finalMsg.replace(/"/g, '\\"')}"`);
        
        console.log("\nEseguo il push delle modifiche sul repository remoto...");
        runCommand("git push");

        console.log("\n=== WORKFLOW COMPLETATO CON SUCCESSO! ===");
        rl.close();
        process.exit(0);
      });
    }
  } else {
    console.log("\nNessuna altra modifica al codice da committare.");
    console.log("=== WORKFLOW COMPLETATO CON SUCCESSO! ===");
    rl.close();
    process.exit(0);
  }
}

main().catch(err => {
  console.error("Errore imprevisto nel workflow:", err);
  rl.close();
  process.exit(1);
});
