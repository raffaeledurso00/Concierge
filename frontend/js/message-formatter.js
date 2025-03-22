// Nuovo file: frontend/js/message-formatter.js

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
        
        // Pattern per riconoscere elementi di una lista
        this.itemPattern = /([^,]+?)(?:\(([^)]+)\))?,?/g;
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
        // Dividi il contenuto in elementi della lista
        // Gli elementi possono essere separati da virgole o da punti
        const items = [];
        
        // Dividi prima in frasi (separate da punto)
        const sentences = content.split(/\.(?=\s|$)/);
        
        sentences.forEach(sentence => {
            if (!sentence.trim()) return;
            
            // Cerca elementi all'interno della frase
            let match;
            
            // Se la frase non contiene virgole, considerala come un singolo elemento
            if (!sentence.includes(',')) {
                items.push(sentence.trim());
            } else {
                // Altrimenti dividi per virgole
                sentence.split(',').forEach(part => {
                    if (part.trim()) {
                        items.push(part.trim());
                    }
                });
            }
        });
        
        // Rimuovi duplicati e filtra elementi vuoti
        const uniqueItems = [...new Set(items)].filter(item => item && item.length > 1);
        
        // Costruisci la lista HTML
        const listItems = uniqueItems.map(item => {
            // Estrai prezzo se presente
            const priceMatch = item.match(/(€\d+(?:[.,]\d+)?)/);
            const price = priceMatch ? priceMatch[1] : '';
            
            // Rimuovi il prezzo dal testo dell'elemento
            let itemText = item.replace(/(€\d+(?:[.,]\d+)?)/, '').trim();
            
            // Estrai dettagli tra parentesi se presenti
            const detailsMatch = itemText.match(/\(([^)]+)\)/);
            const details = detailsMatch ? detailsMatch[1] : '';
            
            // Rimuovi i dettagli tra parentesi dal testo dell'elemento
            itemText = itemText.replace(/\s*\([^)]+\)/, '').trim();
            
            return `
                <li class="list-item ${type}-item">
                    <div class="item-name">${itemText}</div>
                    ${details ? `<div class="item-details">${details}</div>` : ''}
                    ${price ? `<div class="item-price">${price}</div>` : ''}
                </li>
            `;
        });
        
        return `<ul class="formatted-list ${type}-list">${listItems.join('')}</ul>`;
    }
}

// Crea istanza globale
window.messageFormatter = new MessageFormatter();