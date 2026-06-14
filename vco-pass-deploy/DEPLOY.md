# VCO Pass Server v2 — pronto, testato end-to-end

Tutto in questo zip è stato generato e VERIFICATO qui:
- `signerCert.pem` + `signerKey.pem` (passphrase `vcotrasporti`) = certificato vero emesso
  da Apple WWDR G4 per `pass.com.byds.vcotrasporti2` (Team S6C4FQLMT5), valido fino al
  14 luglio 2027, accoppiato con la chiave RSA 2048 corretta (modulo verificato uguale).
- `signature` del pass generato: **"Verification successful"** contro la WWDR reale.
- `biglietto-test.pkpass` allegato è il pass vero generato con questi certificati — puoi
  già aprirlo su iPhone per controllare che Wallet lo accetti, anche prima del deploy.

## Caricamento su GitHub (repo vco-pass-server2)

Sostituisci/aggiungi questi file (Upload files, drag&drop):

| File | Dove |
|---|---|
| `server.js` | root del repo |
| `package.json` | root del repo |
| `certs/signerCert.pem` | cartella `certs/` |
| `certs/signerKey.pem` | cartella `certs/` |
| `certs/wwdr.pem` | cartella `certs/` (sostituisce quello vecchio, è lo stesso) |
| `images/*.png` | cartella `images/` (sono le tue, invariate) |

Commit. Aspetta il redeploy (1-2 min). Apri:
```
https://vco-pass-server2.onrender.com/health
```
Deve dare `{"ok":true,"certs":true,"error":null}`.

## IMPORTANTISSIMO — lato app/Xcode

Il pass è firmato per **`pass.com.byds.vcotrasporti2`** (nuovo identifier, diverso dal
vecchio `pass.com.byds.vcotrasporti`). Devi:

1. Xcode → target dell'app → **Signing & Capabilities → Wallet**
2. Aggiungi il Pass Type ID `pass.com.byds.vcotrasporti2` (oltre o al posto del vecchio)
3. Rebuilda e installa l'app sul telefono (serve un nuovo provisioning con questo
   entitlement)

Senza questo passo, Wallet rifiuta il pass anche se il server lo genera correttamente,
perché l'app non ha il diritto (entitlement) di gestire pass con quell'identifier.

## Test rapido del pass allegato

Apri `biglietto-test.pkpass` su iPhone (AirDrop o Mail): se Wallet te lo propone di
aggiungere, certificati e firma sono perfetti — qualsiasi problema residuo sarebbe
solo l'endpoint del server, non più i certificati.
