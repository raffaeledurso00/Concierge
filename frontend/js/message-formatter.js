// frontend/js/message-formatter.js

/**
 * MessageFormatter che formatta tutte le sezioni come liste di elementi
 * Assicura che attività ed eventi siano visualizzati come elementi di lista separati
 * proprio come il menu del ristorante
 */
class MessageFormatter {
    constructor() {
        // Definizione delle sezioni
        this.sections = {
            menu: ['ANTIPASTI:', 'PRIMI:', 'SECONDI:', 'DOLCI:'],
            attivita: ['INTERNE:', 'ESTERNE:', 'ESCURSIONI:'],
            eventi: ['SPECIALI:', 'SETTIMANALI:', 'STAGIONALI:']
        };
        
        // Pattern per riconoscere le conclusioni
        this.conclusionPatterns = [
            /([^.!?]+\?)[^?]*$/,  // Ultima frase che termina con '?'
            /Desidera\s+(?:altre|ulteriori)?\s*informazioni/i,
            /(?:vorrebbe|vuole)\s+prenotare/i,
            /Quale\s+(?:attività|piatto|evento)/i,
            /(?:le|ti)\s+interessa/i,
            /(?:come|posso)\s+(?:posso|aiutarti|aiutarla)/i
        ];
    }
    
    /**
     * Formatta il testo del messaggio
     */
    format(text) {
        if (!text) return '';
        
        // Controlla se il testo contiene sezioni da formattare
        let hasSection = false;
        for (const type in this.sections) {
            for (const section of this.sections[type]) {
                if (text.includes(section)) {
                    hasSection = true;
                    break;
                }
            }
            if (hasSection) break;
        }
        
        // Se non ci sono sezioni, restituisci il testo originale
        if (!hasSection) {
            return text;
        }
        
        // Estrai la domanda/conclusione dal testo
        const { mainText, conclusionText } = this.extractConclusion(text);
        
        // Formatta il testo principale con le sezioni
        let formattedText = this.formatSections(mainText);
        
        // Aggiungi la conclusione se presente
        if (conclusionText) {
            formattedText += `<div class="conclusion-text">${conclusionText}</div>`;
        }
        
        return formattedText;
    }
    
    /**
     * Estrae la conclusione dal testo
     */
    extractConclusion(text) {
        // Prova ciascun pattern di conclusione
        for (const pattern of this.conclusionPatterns) {
            const match = text.match(pattern);
            if (match && match.index > text.length / 2) {  // Deve essere nella seconda metà del testo
                const conclusionText = match[0];
                const mainText = text.substring(0, match.index);
                return { mainText, conclusionText };
            }
        }
        
        // Se non c'è conclusione, restituisci il testo originale
        return { mainText: text, conclusionText: '' };
    }
    
    /**
     * Formatta le sezioni nel testo
     */
    formatSections(text) {
        let result = text;
        
        // Cerca tutte le sezioni nel testo
        for (const type in this.sections) {
            for (const sectionHeader of this.sections[type]) {
                // Crea un'espressione regolare per trovare la sezione e il suo contenuto
                const sectionRegex = new RegExp(
                    `(${this.escapeRegExp(sectionHeader)})([\\s\\S]*?)(?=(?:${this.sections[type].map(s => this.escapeRegExp(s)).join('|')})|$)`, 
                    'i'
                );
                
                // Cerca la sezione nel testo
                const match = result.match(sectionRegex);
                if (match) {
                    // Formatta il contenuto della sezione
                    const header = match[1];
                    const content = match[2];
                    
                    // Estrai gli elementi dalla sezione
                    const items = this.extractItemsFromSection(content, type);
                    
                    // Crea il markup HTML per la sezione con elementi in lista
                    const formattedSection = `
                        <div class="formatted-section ${type}-section">
                            <div class="section-title">${header}</div>
                            <ul class="formatted-list ${type}-list">
                                ${items.map(item => this.createListItemHtml(item, type)).join('')}
                            </ul>
                        </div>
                    `;
                    
                    // Sostituisci la sezione originale
                    result = result.replace(match[0], formattedSection);
                }
            }
        }
        
        return result;
    }
    
    /**
     * Estrae gli elementi da una sezione
     */
    extractItemsFromSection(content, type) {
        const items = [];
        
        // Prima puliamo il testo: rimuovi parentesi incomplete, spazi multipli, ecc.
        let cleanedContent = this.cleanText(content);
        
        // Dividi il contenuto in blocchi separati da linee vuote
        const blocks = cleanedContent.split(/\n\s*\n/)
            .map(block => block.trim())
            .filter(block => block.length > 0);
        
        // Se c'è un solo blocco, proviamo a dividerlo per linee
        if (blocks.length <= 1) {
            const lines = cleanedContent.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            
            // Per ciascuna linea, cerca di estrarre un elemento
            for (const line of lines) {
                const item = this.parseLineAsItem(line);
                if (item) {
                    items.push(item);
                }
            }
        } else {
            // Abbiamo più blocchi, ciascuno potrebbe essere un elemento completo
            for (const block of blocks) {
                const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                
                // Il primo elemento con un prezzo è probabilmente l'item principale
                let mainLine = '';
                let price = '';
                let details = [];
                
                for (const line of lines) {
                    const priceMatch = line.match(/(€\s*\d+(?:[.,]\d+)?)/);
                    if (priceMatch && !price) {
                        // Se troviamo un prezzo e non ne abbiamo già uno, questa è la linea principale
                        price = priceMatch[1];
                        mainLine = line.replace(price, '').trim();
                    } else if (line.length < 15) {
                        // Linee brevi sono probabilmente dettagli come "2 ore" o "giornaliero"
                        details.push(line);
                    } else if (!mainLine) {
                        // Se non abbiamo ancora una linea principale, questa lo diventa
                        mainLine = line;
                    } else {
                        // Altrimenti è un dettaglio
                        details.push(line);
                    }
                }
                
                // Se abbiamo almeno una linea principale o un prezzo, crea un elemento
                if (mainLine || price) {
                    items.push({
                        name: mainLine,
                        price: price,
                        details: details.join(', ')
                    });
                }
            }
        }
        
        // Se non abbiamo trovato elementi, fai un secondo tentativo cercando direttamente i prezzi
        if (items.length === 0) {
            const priceRegex = /(€\s*\d+(?:[.,]\d+)?)/g;
            let match;
            
            while ((match = priceRegex.exec(cleanedContent)) !== null) {
                const price = match[1];
                
                // Cerca il testo prima del prezzo
                const beforeIndex = Math.max(0, match.index - 100);
                const textBefore = cleanedContent.substring(beforeIndex, match.index).trim();
                
                // L'ultimo segmento prima del prezzo è probabilmente il nome dell'elemento
                const segments = textBefore.split(/[,.:;]/).map(s => s.trim());
                const name = segments.length > 0 ? segments[segments.length - 1] : 'Elemento';
                
                items.push({
                    name: name,
                    price: price,
                    details: ''
                });
            }
        }
        
        return items;
    }
    
    /**
     * Analizza una linea di testo per estrarne un elemento
     */
    parseLineAsItem(line) {
        // Cerca un prezzo nella linea
        const priceMatch = line.match(/(€\s*\d+(?:[.,]\d+)?)/);
        
        if (priceMatch) {
            // Se c'è un prezzo, estrai nome e prezzo
            const price = priceMatch[1];
            let name = line.replace(price, '').trim();
            
            // Pulisci il nome
            name = this.cleanItemText(name);
            
            return {
                name: name,
                price: price,
                details: ''
            };
        } else if (line.length > 5) {
            // Se non c'è un prezzo ma la linea è abbastanza lunga, potrebbe essere un elemento senza prezzo
            return {
                name: this.cleanItemText(line),
                price: '',
                details: ''
            };
        }
        
        // Non è un elemento valido
        return null;
    }
    
    /**
     * Crea l'HTML per un elemento della lista
     */
    createListItemHtml(item, type) {
        return `
            <li class="list-item ${type}-item">
                <div class="item-content">
                    <div class="item-name">${item.name || 'Elemento'}</div>
                    ${item.details ? `<div class="item-details">${item.details}</div>` : ''}
                </div>
                ${item.price ? `<div class="item-price">${item.price}</div>` : ''}
            </li>
        `;
    }
    
    /**
     * Pulisce il testo, rimuovendo problemi comuni
     */
    cleanText(text) {
        // Rimuovi caratteri problematici e normalizza il testo
        return text
            .replace(/\(\s*\)/g, '') // Rimuovi parentesi vuote
            .replace(/\(\s*$/, '') // Rimuovi parentesi aperte alla fine delle righe
            .replace(/^\s*\)/, '') // Rimuovi parentesi chiuse all'inizio delle righe
            .replace(/\s{2,}/g, ' ') // Rimuovi spazi multipli
            .trim();
    }
    
    /**
     * Pulisce il testo di un singolo elemento
     */
    cleanItemText(text) {
        let result = text;
        
        // Rimuovi parentesi vuote o incomplete
        result = result.replace(/\(\s*\)/g, '');
        result = result.replace(/\(\s*$/, '');
        result = result.replace(/^\s*\)/, '');
        
        // Rimuovi punteggiatura alla fine
        result = result.replace(/[,;.:]+$/, '');
        
        // Rimuovi spazi multipli
        result = result.replace(/\s{2,}/g, ' ').trim();
        
        return result;
    }
    
    /**
     * Escape di caratteri speciali per RegExp
     */
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

// Crea l'istanza globale
window.messageFormatter = new MessageFormatter();