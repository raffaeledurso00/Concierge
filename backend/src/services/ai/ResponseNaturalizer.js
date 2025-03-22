// backend/src/services/ai/ResponseNaturalizer.js
class ResponseNaturalizer {
    constructor() {
        // Espressioni toscane casuali per dare carattere alle risposte
        this.TOSCANA_EXPRESSIONS = [
            "Come diciamo in Toscana, 'chi ha tempo non aspetti tempo'!",
            "Sa, qui in Toscana diciamo che 'il vino fa buon sangue'.",
            "Come diciamo qui, 'andare a zonzo' tra le colline è un'esperienza imperdibile.",
            "In Toscana abbiamo un detto: 'val più la pratica della grammatica'.",
            "Come si dice qui, 'il contadino, scarpe grosse e cervello fino'."
        ];
        
        // Variazioni nelle chiusure delle risposte
        this.RESPONSE_CLOSINGS = [
            "Posso aiutarla con altro?",
            "C'è altro che le interessa?",
            "Ha altre domande?",
            "Desidera sapere altro su questo?",
            "Posso fornirle ulteriori dettagli?",
            "Le serve altro?"
        ];
    }
    
    /**
     * Rende le risposte più naturali e pulisce il testo da caratteri problematici
     */
    naturalizeResponse(response, topic) {
        // Pulisci le parentesi vuote e altri caratteri problematici
        let naturalResponse = response;
        naturalResponse = naturalResponse.replace(/\(\s*\)/g, '');  // Rimuovi parentesi vuote
        naturalResponse = naturalResponse.replace(/\s{2,}/g, ' ');  // Riduci spazi multipli a uno solo
        
        // Sistema problemi comuni con la punteggiatura
        naturalResponse = naturalResponse.replace(/\,\s*\,/g, ',');  // Rimuovi virgole doppie
        naturalResponse = naturalResponse.replace(/\.\s*\./g, '.');  // Rimuovi punti doppi
        
        // Evita risposte troppo formali o rigide
        naturalResponse = naturalResponse.replace(/Mi permetta di informarla/g, "Posso dirle");
        naturalResponse = naturalResponse.replace(/Non esiti a contattarci/g, "Non esiti a chiedere");
        naturalResponse = naturalResponse.replace(/Desidero informarla/g, "Le faccio sapere");
        
        // Sistema i nomi delle sezioni per assicurare la formattazione corretta
        naturalResponse = naturalResponse.replace(/ANTIPASTI\s*:/g, "ANTIPASTI:");
        naturalResponse = naturalResponse.replace(/PRIMI\s*:/g, "PRIMI:");
        naturalResponse = naturalResponse.replace(/SECONDI\s*:/g, "SECONDI:");
        naturalResponse = naturalResponse.replace(/DOLCI\s*:/g, "DOLCI:");
        naturalResponse = naturalResponse.replace(/INTERNE\s*:/g, "INTERNE:");
        naturalResponse = naturalResponse.replace(/ESTERNE\s*:/g, "ESTERNE:");
        naturalResponse = naturalResponse.replace(/ESCURSIONI\s*:/g, "ESCURSIONI:");
        
        // Controlla che i prezzi siano formattati correttamente
        naturalResponse = naturalResponse.replace(/(\d+)\s*euro/gi, '€$1');
        naturalResponse = naturalResponse.replace(/€\s+(\d+)/g, '€$1');
        
        // Aggiungi espressioni toscane occasionali per dare carattere
        if (Math.random() > 0.9) {
            const randomExpression = this.TOSCANA_EXPRESSIONS[Math.floor(Math.random() * this.TOSCANA_EXPRESSIONS.length)];
            naturalResponse += " " + randomExpression;
        }
        
        // Aggiungi variazione nelle chiusure delle risposte
        const randomClosing = this.RESPONSE_CLOSINGS[Math.floor(Math.random() * this.RESPONSE_CLOSINGS.length)];
        
        // Se la risposta non termina già con una domanda, aggiungine una
        if (!naturalResponse.trim().endsWith("?")) {
            naturalResponse += " " + randomClosing;
        }
        
        return naturalResponse;
    }
}

module.exports = ResponseNaturalizer;