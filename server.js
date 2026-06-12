const express = require("express");
const { PKPass } = require("passkit-generator");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const PASS_TYPE_ID = "pass.com.byds.vcotrasporti";
const TEAM_ID      = "S6C4FQLMT5";
const P12_PASSWORD = "vcotrasporti";

app.get("/health", (req, res) => res.json({ ok: true }));

app.post("/genera-pass", async (req, res) => {
    try {
        const { ticketId, tariffa, prezzo, qrCode, validoFino } = req.body;

        if (!ticketId || !tariffa || !qrCode || !validoFino) {
            return res.status(400).json({ error: "Parametri mancanti: ticketId, tariffa, qrCode, validoFino" });
        }

        const expiry = new Date(validoFino);

        const pass = new PKPass(
            {
                "logo.png":    fs.readFileSync(path.join(__dirname, "images", "logo.png")),
                "logo@2x.png": fs.readFileSync(path.join(__dirname, "images", "logo@2x.png")),
                "icon.png":    fs.readFileSync(path.join(__dirname, "images", "icon.png")),
                "icon@2x.png": fs.readFileSync(path.join(__dirname, "images", "icon@2x.png")),
            },
            {
                signerCert:          fs.readFileSync(path.join(__dirname, "certs", "VCOPassCertificate.p12")),
                signerKey:           fs.readFileSync(path.join(__dirname, "certs", "VCOPassCertificate.p12")),
                signerKeyPassphrase: P12_PASSWORD,
            },
            {
                formatVersion:       1,
                passTypeIdentifier:  PASS_TYPE_ID,
                serialNumber:        ticketId,
                teamIdentifier:      TEAM_ID,
                organizationName:    "VCO Trasporti",
                description:         "Biglietto VCO Trasporti",
                logoText:            "VCO Trasporti",
                backgroundColor:     "rgb(0, 87, 163)",
                foregroundColor:     "rgb(255, 255, 255)",
                labelColor:          "rgb(200, 220, 255)",
                expirationDate:      expiry.toISOString(),
                barcodes: [{
                    message:         qrCode,
                    format:          "PKBarcodeFormatQR",
                    messageEncoding: "iso-8859-1",
                    altText:         ticketId,
                }],
                generic: {
                    primaryFields: [{
                        key: "tariffa", label: "TARIFFA", value: tariffa
                    }],
                    secondaryFields: [{
                        key: "prezzo", label: "PREZZO",
                        value: prezzo ? `€ ${parseFloat(prezzo).toFixed(2)}` : ""
                    }],
                    auxiliaryFields: [{
                        key: "scadenza", label: "SCADE ALLE",
                        value: expiry.toISOString(),
                        dateStyle: "PKDateStyleNone",
                        timeStyle: "PKDateStyleShort",
                        isRelative: true,
                    }],
                    backFields: [
                        { key: "info", label: "CONDIZIONI",
                          value: "Biglietto valido per una corsa. Mostrare al controllore. Non cedibile." },
                        { key: "contatti", label: "CONTATTI",
                          value: "VCO Trasporti S.r.l.\nTel: 0323 518611\nwww.vcotrasporti.it" }
                    ]
                }
            }
        );

        const buffer = pass.getAsBuffer();
        res.set("Content-Type", "application/vnd.apple.pkpass");
        res.set("Content-Disposition", `attachment; filename="${ticketId}.pkpass"`);
        res.send(buffer);

    } catch (err) {
        console.error("Errore generazione pass:", err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`VCO Pass Server in ascolto su porta ${PORT}`));
