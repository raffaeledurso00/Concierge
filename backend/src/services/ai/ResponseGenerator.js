// backend/src/services/ai/ResponseGenerator.js
class ResponseGenerator {
    constructor() {
        // Risposte semplici per domande comuni
        this.SIMPLE_RESPONSES = {
            'ciao': 'Salve! Come posso esserle utile oggi?',
            'salve': 'Salve! Come posso esserle utile oggi?',
            'buongiorno': 'Buongiorno! Come posso esserle utile oggi?',
            'buonasera': 'Buonasera! Come posso esserle utile oggi?',
            'grazie': 'Prego! Sono qui per qualsiasi altra necessità.',
            'arrivederci': 'Arrivederci! Le auguro una piacevole permanenza a Villa Petriolo.',
            'addio': 'Arrivederci! Le auguro una piacevole permanenza a Villa Petriolo.'
        };
        
        // Categorie di argomenti
        this.TOPIC_CATEGORIES = {
            MENU: 'menu',
            ATTIVITA: 'attivita',
            SERVIZI: 'servizi',
            EVENTI: 'eventi',
            METEO: 'meteo',
            GENERALE: 'generale'
        };
    }
    
    /**
     * Ottiene una risposta semplice per messaggi comuni
     */
    getSimpleResponse(message) {
        const lowerMessage = message.toLowerCase().trim();
        return this.SIMPLE_RESPONSES[lowerMessage] || null;
    }
    
    /**
     * Ottiene informazioni contestuali basate sull'argomento
     */
    getContextualInformation(topic) {
        let info = '';
        
        switch (topic) {
            case this.TOPIC_CATEGORIES.MENU:
                info = `
- L'utente sta chiedendo informazioni sul ristorante o sul cibo
- Il nostro ristorante si chiama "L'Olivaia" ed è aperto tutti i giorni dalle 12:30 alle 14:30 e dalle 19:30 alle 22:00
- Offriamo cucina toscana tradizionale con ingredienti biologici dalla nostra tenuta
- I piatti più popolari includono: bistecca alla fiorentina, pappardelle al cinghiale, e ribollita
- Abbiamo un'ottima selezione di vini toscani
- Offriamo opzioni per ospiti con esigenze alimentari speciali (vegetariani, vegani, celiaci)
- È consigliata la prenotazione per la cena`;
                break;
                
            case this.TOPIC_CATEGORIES.ATTIVITA:
                info = `
- L'utente è interessato alle attività disponibili
- Villa Petriolo offre diverse attività interne: degustazione di vini (€45), corso di cucina toscana (€85), accesso alla spa (€30)
- Attività esterne: tour in bicicletta (€35), passeggiata a cavallo (€60), visita al frantoio (€15)
- Organizziamo escursioni a Firenze, San Gimignano, Siena e alle cantine locali
- La maggior parte delle attività richiede prenotazione con 24 ore di anticipo
- Offriamo attività adatte a famiglie con bambini`;
                break;
                
            case this.TOPIC_CATEGORIES.SERVIZI:
                info = `
- L'utente sta chiedendo dei servizi dell'hotel
- Offriamo: WiFi gratuito in tutta la struttura, parcheggio gratuito, reception 24/7, servizio in camera
- Check-in dalle 14:00, check-out entro le 11:00
- Servizio navetta a pagamento da/per aeroporto e stazione
- Servizio lavanderia disponibile con consegna in 24 ore
- Noleggio biciclette, servizio baby-sitting su richiesta
- Assistenza per prenotazione di tour e attività fuori struttura`;
                break;
                
            case this.TOPIC_CATEGORIES.EVENTI:
                info = `
- L'utente vuole informazioni sugli eventi
- Eventi speciali: Serata Degustazione Vini (15 aprile), Concerto Jazz sotto le Stelle (22 aprile), Cooking Class: Pasta Fresca (18 aprile)
- Eventi settimanali: Aperitivo al Tramonto (venerdì e sabato), Yoga all'Alba (lunedì, mercoledì, venerdì), Tour del Giardino Botanico (martedì, giovedì, domenica)
- Eventi stagionali: Festival della Primavera (15 Aprile - 15 Maggio)
- La maggior parte degli eventi richiede prenotazione`;
                break;
                
            case this.TOPIC_CATEGORIES.METEO:
                info = `
- L'utente chiede informazioni sul meteo
- Il clima in Toscana è generalmente mite
- Primavera (marzo-maggio): temperature tra 10°C e 23°C, occasionali piogge
- Estate (giugno-agosto): caldo e soleggiato, temperature tra 18°C e 32°C
- Autunno (settembre-novembre): temperature tra 9°C e 25°C, più piovoso
- Inverno (dicembre-febbraio): temperature tra 4°C e 12°C
- Le previsioni per i prossimi giorni sono di tempo soleggiato con temperature massime di 24°C`;
                break;
                
            default:
                info = `
- Villa Petriolo è un agriturismo di lusso in Toscana
- Siamo situati in una zona tranquilla tra colline e uliveti
- Produciamo olio d'oliva e vino biologici
- Siamo a 30 minuti di auto da Firenze
- Le camere sono arredate in stile tradizionale toscano con comfort moderni
- Abbiamo una piscina all'aperto, una spa, e un ristorante con prodotti biologici`;
                break;
        }
        
        return info;
    }
    
    /**
     * Genera una risposta di fallback basata sul contesto
     */
    generateFallbackResponse(topic) {
        switch (topic) {
            case this.TOPIC_CATEGORIES.MENU:
                return "Il nostro ristorante offre piatti tipici toscani. ANTIPASTI: Tagliere di salumi toscani (€16), Panzanella (€12). PRIMI: Pappardelle al cinghiale (€18), Risotto ai funghi porcini (€20). SECONDI: Bistecca alla fiorentina (€8/etto), Cinghiale in umido (€22). DOLCI: Cantucci con Vin Santo (€10), Tiramisù della casa (€9). Desidera altre informazioni o vorrebbe prenotare un tavolo?";
                
            case this.TOPIC_CATEGORIES.ATTIVITA:
                return "A Villa Petriolo offriamo diverse attività: INTERNE: Degustazione di vini (€45, 2 ore), Corso di cucina toscana (€85, 3 ore), Accesso alla spa (€30, giornaliero). ESTERNE: Tour in bicicletta (€35, 4 ore), Passeggiata a cavallo (€60, 2 ore), Visita al frantoio (€15, 1 ora). Quale attività le interessa maggiormente?";
                
            case this.TOPIC_CATEGORIES.EVENTI:
                return "Ecco alcuni eventi in programma: SPECIALI: Serata Degustazione Vini (15 aprile), Concerto Jazz sotto le Stelle (22 aprile). SETTIMANALI: Aperitivo al Tramonto (venerdì e sabato), Yoga all'Alba (lunedì, mercoledì, venerdì). Le interessa qualcuno di questi eventi?";
                
            default:
                return "Come concierge di Villa Petriolo, sono qui per aiutarla con qualsiasi necessità riguardante il suo soggiorno. Posso fornirle informazioni sul nostro ristorante, sulle attività disponibili o sui servizi della struttura. Come posso esserle utile oggi?";
        }
    }
}

module.exports = ResponseGenerator;