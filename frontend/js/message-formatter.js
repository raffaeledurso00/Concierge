// frontend/js/message-formatter.js - Versione ultra specializzata con bugfix

/**
 * Utility per formattare i messaggi con liste e formattazione avanzata
 */
class MessageFormatter {
    constructor() {
        // Pattern per riconoscere le sezioni nel testo
        this.sectionPatterns = [
            // Pattern per il Menu
            {
                type: 'menu',
                patterns: [
                    /ANTIPASTI:(.+?)(?=PRIMI:|SECONDI:|DOLCI:|$)/is,
                    /PRIMI:(.+?)(?=ANTIPASTI:|SECONDI:|DOLCI:|$)/is,
                    /SECONDI:(.+?)(?=ANTIPASTI:|PRIMI:|DOLCI:|$)/is,
                    /DOLCI:(.+?)(?=ANTIPASTI:|PRIMI:|SECONDI:|$)/is
                ]
            },
            // Pattern per Attività
            {
                type: 'attivita',
                patterns: [
                    /INTERNE:(.+?)(?=ESTERNE:|ESCURSIONI:|$)/is,
                    /ESTERNE:(.+?)(?=INTERNE:|ESCURSIONI:|$)/is,
                    /ESCURSIONI:(.+?)(?=INTERNE:|ESTERNE:|$)/is
                ]
            },
            // Pattern per Eventi
            {
                type: 'eventi',
                patterns: [
                    /SPECIALI:(.+?)(?=SETTIMANALI:|STAGIONALI:|$)/is,
                    /SETTIMANALI:(.+?)(?=SPECIALI:|STAGIONALI:|$)/is,
                    /STAGIONALI:(.+?)(?=SPECIALI:|SETTIMANALI:|$)/is
                ]
            }
        ];
        
        // Pattern per frasi di conclusione che non dovrebbero essere incluse nelle liste
        this.conclusionPatterns = [
            /desidera\s+(?:altre|ulteriori)?\s*informazioni/i,
            /vorrebbe\s+prenotare/i,
            /(?:posso|le\s+serve|ha\s+bisogno)\s+(?:di\s+)?(?:aiutarla|altro)/i,
            /(?:c'è|c'|ci)\s+(?:altro|qualcos'altro)\s+(?:che\s+)?(?:le\s+)?(?:interessa|serve)/i,
            /(?:vuole|desidera)\s+(?:sapere|conoscere)\s+altro/i,
            /quale (?:preferisce|le interessa)/i,
            /posso prenotarlo/i,
            /le interessa qualcuna/i
        ];
    }
    
    /**
     * Formatta il testo del messaggio con liste dove appropriato
     */
    format(text) {
        if (!text) return '';
        
        // Verifica se contiene sezioni formattabili
        let containsFormattableContent = false;
        this.sectionPatterns.forEach(section => {
            section.patterns.forEach(pattern => {
                if (pattern.test(text)) containsFormattableContent = true;
            });
        });
        
        if (!containsFormattableContent) return text;
        
        // Estrai eventuali frasi di conclusione
        let conclusionText = '';
        const lastSentences = text.split(/(?<=\.)\s+/).slice(-2);
        for (const sentence of lastSentences) {
            if (this.isConclusion(sentence)) {
                const index = text.lastIndexOf(sentence);
                conclusionText = text.substring(index);
                text = text.substring(0, index).trim();
                break;
            }
        }
        
        // Formatta le sezioni
        let formattedText = text;
        
        this.sectionPatterns.forEach(section => {
            section.patterns.forEach(pattern => {
                const match = formattedText.match(pattern);
                if (match && match[1]) {
                    const sectionContent = match[1].trim();
                    
                    // Seleziona il formattatore appropriato
                    let formattedSection;
                    if (section.type === 'menu') {
                        formattedSection = this.formatMenuSection(sectionContent);
                    } else if (section.type === 'attivita') {
                        formattedSection = this.formatActivitySection(sectionContent);
                    } else if (section.type === 'eventi') {
                        formattedSection = this.formatEventSection(sectionContent);
                    } else {
                        formattedSection = this.formatGenericSection(sectionContent);
                    }
                    
                    // Estrai il titolo della sezione
                    const fullMatch = formattedText.match(pattern);
                    const sectionTitle = fullMatch[0].split(':')[0] + ':';
                    
                    // Sostituisci la sezione originale con quella formattata
                    formattedText = formattedText.replace(
                        pattern, 
                        `<div class="formatted-section ${section.type}-section">
                            <div class="section-title">${sectionTitle}</div>
                            ${formattedSection}
                        </div>`
                    );
                }
            });
        });
        
        // Aggiungi la conclusione
        if (conclusionText) {
            formattedText += `<p class="conclusion-text">${conclusionText}</p>`;
        }
        
        return formattedText;
    }
    
    // INIZIO FORMATTAZIONE MENU
    
    /**
     * Formatta una sezione del menu
     */
    formatMenuSection(content) {
        // In questo metodo, estraiamo i piatti dal menu con hardcoding specializzato
        
        // Dividiamo il testo in singoli piatti candidati
        const rawItems = this.splitMenuText(content);
        const menuItems = [];
        
        // Per ogni elemento, estrai nome, descrizione e prezzo
        rawItems.forEach(rawItem => {
            // Pulisci il testo
            const itemText = rawItem.trim();
            
            // Salta elementi vuoti, troppo brevi o che sembrano domande
            if (itemText.length < 3 || this.isConclusion(itemText) || this.looksLikeQuestion(itemText)) {
                return;
            }
            
            // Analizza il piatto
            const dish = this.parseMenuDish(itemText);
            if (dish && dish.name) {
                menuItems.push(dish);
            }
        });
        
        // Genera l'HTML per ciascun piatto
        const menuHtml = menuItems.map(item => `
            <li class="list-item menu-item">
                <div class="item-header">
                    <div class="item-name">${item.name}</div>
                    ${item.price ? `<div class="item-price">${item.price}</div>` : ''}
                </div>
                ${item.description ? `<div class="item-details">${item.description}</div>` : ''}
            </li>
        `).join('');
        
        return `<ul class="formatted-list menu-list">${menuHtml}</ul>`;
    }
    
    /**
     * Divide il testo del menu in piatti individuali
     */
    splitMenuText(text) {
        // Strategia 1: Dividi per punti (migliore se i piatti sono separati da periodi)
        const byPeriod = text.split(/\.(?=\s|$)/).filter(item => item.trim());
        if (byPeriod.length > 1) {
            return byPeriod;
        }
        
        // Strategia 2: Se c'è un solo elemento, prova a dividere per virgole e prezzi
        return this.splitTextByDishPatterns(text);
    }
    
    /**
     * Divide il testo in base a pattern tipici dei piatti (prezzi, virgole con maiuscole)
     */
    splitTextByDishPatterns(text) {
        const result = [];
        let currentPosition = 0;
        
        // Cerca tutti i prezzi nel testo
        const priceMatches = Array.from(text.matchAll(/€\s*\d+(?:[.,]\d+)?(?:\/\w+)?|\d+(?:[.,]\d+)?\s*€|\d+(?:[.,]\d+)?\s*euro/gi));
        
        if (priceMatches.length > 1) {
            // Usa i prezzi come delimitatori di piatti
            for (let i = 0; i < priceMatches.length; i++) {
                const priceMatch = priceMatches[i];
                const pricePosition = priceMatch.index;
                
                // Se non è il primo prezzo, estrai il piatto precedente
                if (i > 0) {
                    // Cerca l'inizio del piatto corrente (prima lettera maiuscola dopo il prezzo precedente)
                    const prevPriceEnd = priceMatches[i-1].index + priceMatches[i-1][0].length;
                    const textBetween = text.substring(prevPriceEnd, pricePosition);
                    
                    // Cerca una lettera maiuscola dopo uno spazio o all'inizio
                    const capitaMatch = textBetween.match(/(?:^|\s+|,\s*)([A-Z][a-zàèìòù]+)/);
                    if (capitaMatch) {
                        const dishStart = prevPriceEnd + textBetween.indexOf(capitaMatch[1]);
                        // Estrai il piatto completo con il suo prezzo
                        const dishText = text.substring(dishStart, pricePosition + priceMatch[0].length);
                        result.push(dishText.trim());
                    } else {
                        // Se non troviamo una maiuscola, prendi tutto il testo tra i prezzi
                        result.push(text.substring(prevPriceEnd, pricePosition + priceMatch[0].length).trim());
                    }
                } else {
                    // Per il primo prezzo, prendi tutto dall'inizio fino al prezzo incluso
                    result.push(text.substring(0, pricePosition + priceMatch[0].length).trim());
                }
                
                // Aggiorna la posizione corrente
                currentPosition = pricePosition + priceMatch[0].length;
            }
            
            // Aggiungi il testo rimanente se ce n'è
            if (currentPosition < text.length) {
                result.push(text.substring(currentPosition).trim());
            }
            
            return result.filter(item => item.length > 0);
        }
        
        // Se non ci sono prezzi multipli, cerca maiuscole dopo virgole
        const commaSplit = text.split(/,\s*(?=[A-Z])/).filter(item => item.trim());
        if (commaSplit.length > 1) {
            return commaSplit;
        }
        
        // Se tutto fallisce, considera l'intero testo come un solo elemento
        return [text];
    }
    
    /**
     * Analizza un singolo piatto per estrarre nome, descrizione e prezzo
     */
    parseMenuDish(text) {
        const dish = {
            name: text.trim(),
            description: '',
            price: ''
        };
        
        // Estrai prezzo
        const priceMatch = dish.name.match(/€\s*\d+(?:[.,]\d+)?(?:\/\w+)?|\d+(?:[.,]\d+)?\s*€|\d+(?:[.,]\d+)?\s*euro/i);
        if (priceMatch) {
            // Normalizza il prezzo
            const priceText = priceMatch[0];
            
            if (priceText.match(/\d+\s*euro/i)) {
                dish.price = '€' + priceText.match(/\d+(?:[.,]\d+)?/)[0];
            } else if (priceText.match(/\d+\s*€/)) {
                dish.price = '€' + priceText.match(/\d+(?:[.,]\d+)?/)[0];
            } else {
                dish.price = priceText.replace(/\s+/g, '');
            }
            
            // Gestione speciale per /etto
            if (priceText.includes('/')) {
                const perUnit = priceText.match(/\/\w+/);
                if (perUnit) {
                    dish.price = dish.price.replace(/\/\w+/, '') + perUnit[0];
                }
            }
            
            // Rimuovi il prezzo dal nome
            dish.name = dish.name.replace(priceMatch[0], '').trim();
        }
        
        // CORREZIONE: Gestione migliorata delle parentesi
        // Estrai descrizione tra parentesi
        const descMatches = dish.name.match(/\(([^)]+)\)/g);
        if (descMatches && descMatches.length > 0) {
            // Prendi il contenuto di tutte le parentesi e uniscile
            const descriptionParts = descMatches.map(match => {
                return match.substring(1, match.length - 1).trim();
            });
            
            dish.description = descriptionParts.join('. ');
            
            // Rimuovi tutte le parentesi dal nome
            descMatches.forEach(match => {
                dish.name = dish.name.replace(match, '').trim();
            });
        }
        
        // Cerca descrizioni dopo virgola, solo se non abbiamo già una descrizione
        if (!dish.description && dish.name.includes(',')) {
            const parts = dish.name.split(',');
            
            // Il primo elemento è il nome, il resto è la descrizione
            dish.name = parts[0].trim();
            dish.description = parts.slice(1).join(',').trim();
        }
        
        // CORREZIONE: Se non abbiamo trovato un prezzo, cerchiamo numeri seguiti da € o euro
        if (!dish.price) {
            const altPriceMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:€|euro|EUR)/i);
            if (altPriceMatch) {
                dish.price = '€' + altPriceMatch[1];
            }
        }
        
        // Pulizia finale
        dish.name = this.cleanText(dish.name);
        dish.description = this.cleanText(dish.description);
        
        return dish;
    }
    
    // INIZIO FORMATTAZIONE ATTIVITÀ
    
    /**
     * Formatta una sezione di attività
     */
    formatActivitySection(content) {
        // Dividi il testo in attività separate
        const rawItems = this.splitActivityText(content);
        const activities = [];
        
        // Per ogni elemento, estrai le informazioni
        rawItems.forEach(rawItem => {
            // Pulisci il testo
            const itemText = rawItem.trim();
            
            // Salta elementi vuoti, troppo brevi o che sembrano domande
            if (itemText.length < 3 || this.isConclusion(itemText) || this.looksLikeQuestion(itemText)) {
                return;
            }
            
            // Analizza l'attività
            const activity = this.parseActivity(itemText);
            if (activity && activity.name) {
                activities.push(activity);
            }
        });
        
        // Genera l'HTML per ciascuna attività
        const activitiesHtml = activities.map(item => `
            <li class="list-item attivita-item">
                <div class="item-header">
                    <div class="item-name">${item.name}</div>
                    ${item.price ? `<div class="item-price">${item.price}</div>` : ''}
                </div>
                ${item.description ? `<div class="item-details">${item.description}</div>` : ''}
                ${item.duration ? `<div class="item-date">${item.duration}</div>` : ''}
            </li>
        `).join('');
        
        return `<ul class="formatted-list attivita-list">${activitiesHtml}</ul>`;
    }
    
    /**
     * Divide il testo delle attività in elementi separati
     */
    splitActivityText(text) {
        // Strategia 1: Dividi per punti o punti e virgola
        const byPeriodOrSemicolon = text.split(/[.;](?=\s|$)/).filter(item => item.trim());
        if (byPeriodOrSemicolon.length > 1) {
            return byPeriodOrSemicolon;
        }
        
        // Strategia 2: Cerca pattern di attività specifici
        return this.splitByActivityPatterns(text);
    }
    
    /**
     * Divide il testo in base a pattern di attività (durate, prezzi, virgole con maiuscole)
     */
    splitByActivityPatterns(text) {
        // Pattern per durate
        const durationMatches = Array.from(text.matchAll(/\d+\s*or[ae]|giornalier[ao]|accesso\s+giornaliero/gi));
        
        // Pattern per prezzi
        const priceMatches = Array.from(text.matchAll(/€\s*\d+(?:[.,]\d+)?|\d+(?:[.,]\d+)?\s*€|\d+(?:[.,]\d+)?\s*euro/gi));
        
        // Se abbiamo sia durate che prezzi, possiamo usarli per dividere
        const markers = [...durationMatches, ...priceMatches].sort((a, b) => a.index - b.index);
        
        if (markers.length > 1) {
            const activities = [];
            
            // Segmenta il testo sulla base dei marker trovati
            for (let i = 0; i < markers.length; i++) {
                const markerPos = markers[i].index;
                
                // Se non è il primo marker, cerca l'inizio dell'attività
                if (i > 0) {
                    const prevMarkerEnd = markers[i-1].index + markers[i-1][0].length;
                    
                    // Cerca una lettera maiuscola dopo uno spazio o una virgola
                    const textBetween = text.substring(prevMarkerEnd, markerPos);
                    const capitaMatch = textBetween.match(/(?:^|\s+|,\s*)([A-Z][a-zàèìòù]+)/);
                    
                    if (capitaMatch) {
                        const activityStart = prevMarkerEnd + textBetween.indexOf(capitaMatch[1]);
                        activities.push(text.substring(activityStart, text.length).trim());
                        break;  // Abbiamo trovato l'inizio della nuova attività
                    }
                }
                
                // Per il primo marker, o se non troviamo un inizio chiaro
                if (i === 0) {
                    // Cerca indietro dal marker per trovare l'inizio dell'attività
                    let activityStart = 0;
                    const textBefore = text.substring(0, markerPos);
                    
                    // Cerca l'ultima maiuscola preceduta da punto, virgola o inizio testo
                    const capitaBeforeMatch = textBefore.match(/(?:^|[.,]\s+)([A-Z][a-zàèìòù]+)[^.,]*$/);
                    if (capitaBeforeMatch) {
                        activityStart = textBefore.lastIndexOf(capitaBeforeMatch[1]);
                    }
                    
                    activities.push(text.substring(activityStart, text.length).trim());
                    break;  // Abbiamo l'intera stringa da questo punto
                }
            }
            
            // Se abbiamo trovato almeno un'attività, torniamola
            if (activities.length > 0) {
                return activities;
            }
        }
        
        // Strategia 3: Cerca virgole seguite da lettere maiuscole
        const commaCapitalSplit = text.split(/,\s*(?=[A-Z])/).filter(item => item.trim());
        if (commaCapitalSplit.length > 1) {
            return commaCapitalSplit;
        }
        
        // Se tutto fallisce, considera l'intero testo come una sola attività
        return [text];
    }
    
    /**
     * Analizza una singola attività per estrarre nome, descrizione, durata e prezzo
     */
    parseActivity(text) {
        const activity = {
            name: text.trim(),
            description: '',
            duration: '',
            price: ''
        };
        
        // CORREZIONE: Migliora l'estrazione del prezzo
        const priceMatches = text.match(/(?:€\s*\d+(?:[.,]\d+)?|\d+(?:[.,]\d+)?\s*€|\d+(?:[.,]\d+)?\s*euro)/gi);
        if (priceMatches && priceMatches.length > 0) {
            // Prendi il primo prezzo trovato
            const priceText = priceMatches[0];
            
            if (priceText.match(/\d+\s*euro/i)) {
                activity.price = '€' + priceText.match(/\d+(?:[.,]\d+)?/)[0];
            } else if (priceText.match(/\d+\s*€/)) {
                activity.price = '€' + priceText.match(/\d+(?:[.,]\d+)?/)[0];
            } else {
                activity.price = priceText.replace(/\s+/g, '');
            }
            
            // Rimuovi tutti i prezzi dal nome
            priceMatches.forEach(match => {
                activity.name = activity.name.replace(match, '').trim();
            });
        }
        
        // CORREZIONE: Cerca prezzi alternativi come ultimo tentativo
        if (!activity.price) {
            const altPriceMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:€|euro|EUR)/i);
            if (altPriceMatch) {
                activity.price = '€' + altPriceMatch[1];
            }
        }
        
        // Estrai durata
        const durationPatterns = [
            /(\d+\s*or[ae])/i,
            /(accesso\s+giornaliero)/i,
            /(giornalier[ao])/i,
            /(mezz[a']?\s+giornata)/i,
            /(giornata\s+intera)/i
        ];
        
        for (const pattern of durationPatterns) {
            const match = activity.name.match(pattern);
            if (match) {
                activity.duration = match[1].trim();
                activity.name = activity.name.replace(match[0], '').trim();
                break;
            }
        }
        
        // Se la durata non è stata trovata nel nome, cercala nella parte rimanente
        if (!activity.duration) {
            // Cerca nella descrizione in parentesi o dopo virgole
            const restOfText = activity.name;
            
            for (const pattern of durationPatterns) {
                const match = restOfText.match(pattern);
                if (match) {
                    activity.duration = match[1].trim();
                    // Non rimuoviamo la durata dal testo perché estrarremo comunque la descrizione
                    break;
                }
            }
        }
        
        // CORREZIONE: Gestione migliorata delle parentesi per la descrizione
        const descMatches = activity.name.match(/\(([^)]+)\)/g);
        if (descMatches && descMatches.length > 0) {
            // Prendi il contenuto di tutte le parentesi e uniscile
            const descriptionParts = descMatches.map(match => {
                return match.substring(1, match.length - 1).trim();
            });
            
            activity.description = descriptionParts.join('. ');
            
            // Rimuovi tutte le parentesi dal nome
            descMatches.forEach(match => {
                activity.name = activity.name.replace(match, '').trim();
            });
        }
        
        // Cerca descrizioni dopo virgola
        if (!activity.description && activity.name.includes(',')) {
            const parts = activity.name.split(',');
            
            // Il primo elemento è il nome, il resto potrebbe essere descrizione o durata
            activity.name = parts[0].trim();
            const afterComma = parts.slice(1).join(',').trim();
            
            // Verifica se il testo dopo la virgola contiene una durata
            let containsDuration = false;
            for (const pattern of durationPatterns) {
                const match = afterComma.match(pattern);
                if (match) {
                    if (!activity.duration) {
                        activity.duration = match[1].trim();
                    }
                    
                    // Il resto diventa descrizione
                    const restDesc = afterComma.replace(match[0], '').trim();
                    if (restDesc && !activity.description) {
                        activity.description = restDesc;
                    }
                    
                    containsDuration = true;
                    break;
                }
            }
            
            // Se non contiene durata, è una descrizione
            if (!containsDuration && !activity.description) {
                activity.description = afterComma;
            }
        }
        
        // Pulizia finale
        activity.name = this.cleanText(activity.name);
        activity.description = this.cleanText(activity.description);
        
        return activity;
    }
    
    // INIZIO FORMATTAZIONE EVENTI
    
    /**
     * Formatta una sezione di eventi
     */
    formatEventSection(content) {
        // Dividi il testo in eventi separati
        const rawItems = this.splitEventText(content);
        const events = [];
        
        // Per ogni elemento, estrai le informazioni
        rawItems.forEach(rawItem => {
            // Pulisci il testo
            const itemText = rawItem.trim();
            
            // Salta elementi vuoti, troppo brevi o che sembrano domande
            if (itemText.length < 3 || this.isConclusion(itemText) || this.looksLikeQuestion(itemText)) {
                return;
            }
            
            // Analizza l'evento
            const event = this.parseEvent(itemText);
            if (event && event.name) {
                events.push(event);
            }
        });
        
        // Genera l'HTML per ciascun evento
        const eventsHtml = events.map(item => `
            <li class="list-item eventi-item">
                <div class="item-header">
                    <div class="item-name">${item.name}</div>
                    ${item.price ? `<div class="item-price">${item.price}</div>` : ''}
                </div>
                ${item.description ? `<div class="item-details">${item.description}</div>` : ''}
                ${item.date ? `<div class="item-date">${item.date}</div>` : ''}
            </li>
        `).join('');
        
        return `<ul class="formatted-list eventi-list">${eventsHtml}</ul>`;
    }
    
    /**
     * Divide il testo degli eventi in elementi separati
     */
    splitEventText(text) {
        // Strategia 1: Dividi per punti o punti e virgola
        const byPeriodOrSemicolon = text.split(/[.;](?=\s|$)/).filter(item => item.trim());
        if (byPeriodOrSemicolon.length > 1) {
            return byPeriodOrSemicolon;
        }
        
        // Strategia 2: Cerca date specifiche per eventi
        return this.splitByEventPatterns(text);
    }
    
    /**
     * Divide il testo in base a pattern di eventi (date, giorni, virgole con maiuscole)
     */
    splitByEventPatterns(text) {
        // Definisci i pattern di date
        const datePatterns = [
            /\d{1,2}\s+(?:gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/gi,
            /\d{1,2}\s+(?:gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)/gi,
            /(?:lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)(?:\s+e\s+(?:lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica))*/gi
        ];
        
        // Cerca le occorrenze di date nel testo
        let dateMatches = [];
        for (const pattern of datePatterns) {
            const matches = Array.from(text.matchAll(pattern));
            dateMatches = [...dateMatches, ...matches];
        }
        
        // Ordina le occorrenze per posizione
        dateMatches.sort((a, b) => a.index - b.index);
        
        if (dateMatches.length > 0) {
            const events = [];
            
            // Usa le date come delimitatori di eventi
            for (let i = 0; i < dateMatches.length; i++) {
                const dateMatch = dateMatches[i];
                const datePosition = dateMatch.index;
                
                // Cerca indietro per trovare l'inizio dell'evento
                const textBefore = text.substring(0, datePosition);
                
                // Cerca l'ultima maiuscola preceduta da punto, virgola o inizio testo
                let eventStart = 0;
                const capitaBeforeMatch = textBefore.match(/(?:^|[.,]\s+)([A-Z][a-zàèìòù]+)[^.,]*$/);
                if (capitaBeforeMatch) {
                    eventStart = textBefore.lastIndexOf(capitaBeforeMatch[1]);
                }
                
                // Trova la fine dell'evento (prossima data o fine testo)
                let eventEnd = text.length;
                let hasNextDate = false;
                let nextDatePos = -1;
                
                if (i < dateMatches.length - 1) {
                    // Cerca l'inizio del prossimo evento
                    nextDatePos = dateMatches[i+1].index;
                    hasNextDate = true;
                    const textBetween = text.substring(datePosition + dateMatch[0].length, nextDatePos);
                    
                    // Cerca una lettera maiuscola dopo uno spazio o virgola
                    const capitaAfterMatch = textBetween.match(/(?:^|\s+|,\s*)([A-Z][a-zàèìòù]+)/);
                    if (capitaAfterMatch) {
                        eventEnd = datePosition + dateMatch[0].length + textBetween.indexOf(capitaAfterMatch[1]);
                    }
                }
                
                // Estrai l'evento
                events.push(text.substring(eventStart, eventEnd).trim());
                
                // Se abbiamo trovato l'inizio del prossimo evento e non è la data stessa, passiamo direttamente ad esso
                if (hasNextDate && eventEnd < text.length && eventEnd !== nextDatePos) {
                    i = i+1;
                }
            }
            
            // Se abbiamo trovato almeno un evento, torniamolo
            if (events.length > 0) {
                return events;
            }
        }
        
        // Strategia 3: Cerca virgole seguite da lettere maiuscole
        const commaCapitalSplit = text.split(/,\s*(?=[A-Z])/).filter(item => item.trim());
        if (commaCapitalSplit.length > 1) {
            return commaCapitalSplit;
        }
        
        // Se tutto fallisce, considera l'intero testo come un solo evento
        return [text];
    }
    
    /**
     * Analizza un singolo evento per estrarre nome, descrizione, data e prezzo
     */
    parseEvent(text) {
        const event = {
            name: text.trim(),
            description: '',
            date: '',
            price: ''
        };
        
        // CORREZIONE: Miglioramento dell'estrazione del prezzo
        const priceMatches = text.match(/(?:€\s*\d+(?:[.,]\d+)?|\d+(?:[.,]\d+)?\s*€|\d+(?:[.,]\d+)?\s*euro)/gi);
        if (priceMatches && priceMatches.length > 0) {
            // Prendi il primo prezzo trovato
            const priceText = priceMatches[0];
            
            if (priceText.match(/\d+\s*euro/i)) {
                event.price = '€' + priceText.match(/\d+(?:[.,]\d+)?/)[0];
            } else if (priceText.match(/\d+\s*€/)) {
                event.price = '€' + priceText.match(/\d+(?:[.,]\d+)?/)[0];
            } else {
                event.price = priceText.replace(/\s+/g, '');
            }
            
            // Rimuovi il prezzo dal nome (tutti i prezzi trovati)
            priceMatches.forEach(match => {
                event.name = event.name.replace(match, '').trim();
            });
        }
        
        // CORREZIONE: Cerca prezzi alternativi se non ne abbiamo trovato uno
        if (!event.price) {
            // Cerca pattern come "costa 25 euro" o "prezzo di 30€"
            const pricePhraseMatch = event.name.match(/(?:costa|prezzo|costo)[^\d]*(\d+(?:[.,]\d+)?)/i);
            if (pricePhraseMatch) {
                event.price = '€' + pricePhraseMatch[1];
                
                // Rimuovi la frase del prezzo dal nome
                const pricePhrase = event.name.substring(
                    event.name.indexOf(pricePhraseMatch[0]), 
                    event.name.indexOf(pricePhraseMatch[0]) + pricePhraseMatch[0].length
                );
                event.name = event.name.replace(pricePhrase, '').trim();
            }
        }
        
        // Estrai date con pattern specifici
        const datePatterns = [
            {
                regex: /(\d{1,2}\s+(?:gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre))/i,
                extract: match => match[1].trim()
            },
            {
                regex: /(\d{1,2}\s+(?:gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic))/i,
                extract: match => match[1].trim()
            },
            {
                regex: /((?:lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)(?:\s+e\s+(?:lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica))*)/i,
                extract: match => match[1].trim()
            },
            {
                regex: /((?:lun|mar|mer|gio|ven|sab|dom)(?:\s+e\s+(?:lun|mar|mer|gio|ven|sab|dom))*)/i,
                extract: match => match[1].trim()
            },
            {
                regex: /(\d{1,2}\s*-\s*\d{1,2}\s+(?:gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre))/i,
                extract: match => match[1].trim()
            },
            {
                regex: /(\d{1,2}\s+(?:gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s*-\s*\d{1,2}\s+(?:gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre))/i,
                extract: match => match[1].trim()
            }
        ];
        
        // Cerca le date nel testo
        let dateText = '';
        
        for (const pattern of datePatterns) {
            const match = event.name.match(pattern.regex);
            if (match) {
                const dateValue = pattern.extract(match);
                if (dateText) {
                    dateText += ', ' + dateValue;
                } else {
                    dateText = dateValue;
                }
                
                event.name = event.name.replace(match[0], '').trim();
            }
        }
        
        // Imposta la data se trovata
        if (dateText) {
            event.date = dateText;
        }
        
        // Estrai descrizione tra parentesi
        const descMatch = event.name.match(/\(([^)]+)\)/);
        if (descMatch) {
            event.description = descMatch[1].trim();
            event.name = event.name.replace(/\s*\([^)]+\)/, '').trim();
        }
        
        // Cerca descrizioni dopo virgola
        if (!event.description && event.name.includes(',')) {
            const parts = event.name.split(',');
            
            // Il primo elemento è il nome, il resto potrebbe essere descrizione o data
            event.name = parts[0].trim();
            const afterComma = parts.slice(1).join(',').trim();
            
            // Verifica se il testo dopo la virgola contiene una data
            let containsDate = false;
            for (const pattern of datePatterns) {
                const match = afterComma.match(pattern.regex);
                if (match) {
                    const dateValue = pattern.extract(match);
                    if (event.date) {
                        event.date += ', ' + dateValue;
                    } else {
                        event.date = dateValue;
                    }
                    
                    // Il resto diventa descrizione
                    const restDesc = afterComma.replace(match[0], '').trim();
                    if (restDesc && !event.description) {
                        event.description = restDesc;
                    }
                    
                    containsDate = true;
                    break;
                }
            }
            
            // Se non contiene data, è una descrizione
            if (!containsDate && !event.description) {
                event.description = afterComma;
            }
        }
        
        // Controllo specifico per "15 aprile" e "22 aprile" che potrebbero essere stati persi
        if (!event.date) {
            const specificDateMatch = text.match(/(\d{1,2}\s+aprile)/i);
            if (specificDateMatch) {
                event.date = specificDateMatch[1].trim();
            }
        }
        
        // Controllo specifico per "lunedì, mercoledì, venerdì" e "venerdì e sabato"
        if (!event.date) {
            const weekdaysMatch = text.match(/((?:lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)(?:\s*,\s*|\s+e\s+)(?:lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)(?:\s*,\s*|\s+e\s+)?(?:lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)?)/i);
            if (weekdaysMatch) {
                event.date = weekdaysMatch[1].trim();
            }
        }
        
        // CORREZIONE: Assicurati che il prezzo sia nel formato corretto
        if (event.price && !event.price.startsWith('€')) {
            event.price = '€' + event.price.replace(/[^\d,.]/g, '');
        }
        
        // Pulizia finale
        event.name = this.cleanText(event.name);
        event.description = this.cleanText(event.description);
        
        return event;
    }
    
    // INIZIO FORMATTAZIONE GENERICA
    
    /**
     * Formatta una sezione generica
     */
    formatGenericSection(content) {
        // Dividi il testo in elementi separati
        const rawItems = this.splitGenericText(content);
        const items = [];
        
        // Per ogni elemento, estrai le informazioni
        rawItems.forEach(rawItem => {
            // Pulisci il testo
            const itemText = rawItem.trim();
            
            // Salta elementi vuoti, troppo brevi o che sembrano domande
            if (itemText.length < 3 || this.isConclusion(itemText) || this.looksLikeQuestion(itemText)) {
                return;
            }
            
            // Analizza l'elemento
            const item = this.parseGenericItem(itemText);
            if (item && item.name) {
                items.push(item);
            }
        });
        
        // Genera l'HTML per ciascun elemento
        const itemsHtml = items.map(item => `
            <li class="list-item generic-item">
                <div class="item-header">
                    <div class="item-name">${item.name}</div>
                    ${item.value ? `<div class="item-price">${item.value}</div>` : ''}
                </div>
                ${item.description ? `<div class="item-details">${item.description}</div>` : ''}
            </li>
        `).join('');
        
        return `<ul class="formatted-list generic-list">${itemsHtml}</ul>`;
    }
    
    /**
     * Divide il testo generico in elementi separati
     */
    splitGenericText(text) {
        // Strategia 1: Dividi per punti o punti e virgola
        const byPeriodOrSemicolon = text.split(/[.;](?=\s|$)/).filter(item => item.trim());
        if (byPeriodOrSemicolon.length > 1) {
            return byPeriodOrSemicolon;
        }
        
        // Strategia 2: Cerca virgole seguite da lettere maiuscole
        const commaCapitalSplit = text.split(/,\s*(?=[A-Z])/).filter(item => item.trim());
        if (commaCapitalSplit.length > 1) {
            return commaCapitalSplit;
        }
        
        // Se tutto fallisce, considera l'intero testo come un solo elemento
        return [text];
    }
    
    /**
     * Analizza un elemento generico per estrarre nome, descrizione e valore
     */
    parseGenericItem(text) {
        const item = {
            name: text.trim(),
            description: '',
            value: ''
        };
        
        // Estrai valore numerico
        const valueMatch = item.name.match(/(\d+(?:[.,]\d+)?)/);
        if (valueMatch) {
            item.value = valueMatch[1];
        }
        
        // Estrai descrizione tra parentesi
        const descMatch = item.name.match(/\(([^)]+)\)/);
        if (descMatch) {
            item.description = descMatch[1].trim();
            item.name = item.name.replace(/\s*\([^)]+\)/, '').trim();
        }
        
        // Cerca descrizioni dopo virgola
        if (!item.description && item.name.includes(',')) {
            const parts = item.name.split(',');
            item.name = parts[0].trim();
            item.description = parts.slice(1).join(',').trim();
        }
        
        // Pulizia finale
        item.name = this.cleanText(item.name);
        item.description = this.cleanText(item.description);
        
        return item;
    }
    
    // UTILITY FUNCTIONS
    
    /**
     * Verifica se una stringa è una frase conclusiva
     */
    isConclusion(text) {
        if (!text) return false;
        
        return this.conclusionPatterns.some(pattern => pattern.test(text));
    }
    
    /**
     * Verifica se una stringa sembra una domanda
     */
    looksLikeQuestion(text) {
        if (!text) return false;
        
        // Controlla se contiene punto interrogativo
        if (text.includes('?')) return true;
        
        // Controlla parole tipiche di domande
        const questionWords = ['quanto', 'come', 'dove', 'quando', 'perché', 'chi', 'cosa', 'quale'];
        for (const word of questionWords) {
            if (text.toLowerCase().trim().startsWith(word)) return true;
        }
        
        return false;
    }
    
    /**
     * Pulisce il testo rimuovendo caratteri problematici
     */
    cleanText(text) {
        if (!text) return '';
        
        return text
            .replace(/^\s*-\s*/, '') // Rimuovi trattini iniziali
            .replace(/\(\s*\)/, '') // Rimuovi parentesi vuote
            .replace(/\s{2,}/g, ' ') // Riduci spazi multipli a uno solo
            .replace(/\.$/, '') // Rimuovi punto finale
            .replace(/^,\s*/, '') // Rimuovi virgola iniziale
            .replace(/\s*,\s*$/, '') // Rimuovi virgola finale
            .trim();
    }
}

// Crea istanza globale
window.messageFormatter = new MessageFormatter();