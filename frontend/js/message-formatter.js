// frontend/js/message-formatter.js

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
    }
    
    /**
     * Formatta il testo del messaggio con liste dove appropriato
     * @param {string} text - Il testo originale
     * @returns {string} - Il testo formattato con HTML
     */
    format(text) {
        if (!text) return '';
        
        // Prima controlla se è un messaggio che contiene sezioni
        let containsFormattableContent = false;
        this.sectionPatterns.forEach(section => {
            section.patterns.forEach(pattern => {
                if (pattern.test(text)) {
                    containsFormattableContent = true;
                }
            });
        });
        
        // Se non contiene sezioni formattabili, restituisci il testo originale
        if (!containsFormattableContent) {
            return text;
        }
        
        // Applica formattazione a tutte le sezioni riconosciute
        let formattedText = text;
        
        this.sectionPatterns.forEach(section => {
            section.patterns.forEach(pattern => {
                // Cerca la sezione nel testo
                const match = formattedText.match(pattern);
                if (match && match[1]) {
                    // Contenuto della sezione
                    const sectionContent = match[1].trim();
                    
                    // Crea lista formattata
                    const formattedSection = this.createFormattedList(sectionContent, section.type);
                    
                    // Sostituisci la sezione originale con quella formattata
                    // Usa RegExp con il flag 's' per far sì che il punto matchi anche i newline
                    const fullPattern = new RegExp(pattern.source, 'is');
                    
                    // Estrai il titolo della sezione (es. "ANTIPASTI:")
                    const sectionTitle = formattedText.match(fullPattern)[0].split(':')[0] + ':';
                    
                    // Sostituisci la sezione con titolo + lista formattata
                    formattedText = formattedText.replace(
                        fullPattern, 
                        `<div class="formatted-section ${section.type}-section">
                            <div class="section-title">${sectionTitle}</div>
                            ${formattedSection}
                        </div>`
                    );
                }
            });
        });
        
        return formattedText;
    }
    
    /**
     * Crea una lista formattata dal contenuto della sezione
     * @param {string} content - Contenuto della sezione
     * @param {string} type - Tipo di sezione (menu, attivita, eventi)
     * @returns {string} - HTML della lista formattata
     */
    createFormattedList(content, type) {
        // Array per contenere gli elementi della lista puliti
        const cleanItems = [];
        
        // Dividi in frasi (separate da punto o punto e virgola)
        const sentences = content.split(/[\.;](?=\s|$)/);
        
        sentences.forEach(sentence => {
            const trimmedSentence = sentence.trim();
            if (trimmedSentence.length === 0) return;
            
            // Gestisci diversamente le frasi con o senza virgole
            if (trimmedSentence.includes(',')) {
                // Dividi per virgole e processa ogni parte
                const parts = trimmedSentence.split(',');
                parts.forEach(part => {
                    const trimmedPart = part.trim();
                    if (trimmedPart.length > 0) {
                        cleanItems.push(this.cleanItemText(trimmedPart));
                    }
                });
            } else {
                // Aggiungi la frase intera come elemento
                cleanItems.push(this.cleanItemText(trimmedSentence));
            }
        });
        
        // Rimuovi duplicati e filtra elementi vuoti
        const uniqueItems = [...new Set(cleanItems)].filter(item => item && item.title.length > 1);
        
        // Costruisci la lista HTML
        const listItems = uniqueItems.map(item => {
            return `
                <li class="list-item ${type}-item">
                    <div class="item-name">${item.title}</div>
                    ${item.details ? `<div class="item-details">${item.details}</div>` : ''}
                    ${item.price ? `<div class="item-price">${item.price}</div>` : ''}
                </li>
            `;
        });
        
        return `<ul class="formatted-list ${type}-list">${listItems.join('')}</ul>`;
    }
    
    /**
     * Pulisce il testo dell'elemento, rimuovendo caratteri indesiderati e separando dettagli e prezzo
     * @param {string} text - Testo dell'elemento da pulire
     * @returns {Object} - Oggetto contenente titolo, dettagli e prezzo
     */
    cleanItemText(text) {
        // Oggetto risultante
        const result = {
            title: '',
            details: '',
            price: ''
        };
        
        // Rimuovi i simboli () vuoti
        const cleanedText = text.replace(/\(\s*\)/g, '').trim();
        
        // Estrai prezzo se presente (formato €XX o €XX.XX)
        const priceMatch = cleanedText.match(/(€\s*\d+(?:[.,]\d+)?)/);
        if (priceMatch) {
            result.price = priceMatch[1].replace(/\s+/g, ''); // Rimuovi spazi nel prezzo
            
            // Rimuovi il prezzo dal testo dell'elemento
            const textWithoutPrice = cleanedText.replace(priceMatch[0], '').trim();
            result.title = textWithoutPrice;
        } else {
            result.title = cleanedText;
        }
        
        // Estrai dettagli tra parentesi se presenti
        const detailsMatch = result.title.match(/\(([^)]+)\)/);
        if (detailsMatch) {
            result.details = detailsMatch[1].trim();
            
            // Rimuovi i dettagli tra parentesi dal titolo
            result.title = result.title.replace(/\s*\([^)]+\)/, '').trim();
        }
        
        return result;
    }
}

// Crea istanza globale
window.messageFormatter = new MessageFormatter();