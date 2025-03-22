// frontend/js/utils/formatter/index.js
// Classe principale che combina tutti i formatter specializzati

/**
 * Utility per formattare i messaggi con liste e formattazione avanzata
 * Questa classe combina tutti i formatter specializzati in un'unica interfaccia
 */
class MessageFormatter {
    constructor() {
        // Inizializza i formatter specializzati
        this.baseFormatter = new BaseFormatter();
        this.menuFormatter = new MenuFormatter();
        this.activityFormatter = new ActivityFormatter();
        this.eventFormatter = new EventFormatter();
        this.genericFormatter = new GenericFormatter();
        
        // Prendi i pattern di sezione dal base formatter
        this.sectionPatterns = this.baseFormatter.sectionPatterns;
        this.conclusionPatterns = this.baseFormatter.conclusionPatterns;
    }
    
    /**
     * Formatta il testo del messaggio con liste dove appropriato
     * @param {string} text - Testo da formattare
     * @returns {string} Testo formattato in HTML
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
            if (this.baseFormatter.isConclusion(sentence)) {
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
                        formattedSection = this.menuFormatter.formatMenuSection(sectionContent);
                    } else if (section.type === 'attivita') {
                        formattedSection = this.activityFormatter.formatActivitySection(sectionContent);
                    } else if (section.type === 'eventi') {
                        formattedSection = this.eventFormatter.formatEventSection(sectionContent);
                    } else {
                        formattedSection = this.genericFormatter.formatGenericSection(sectionContent);
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
    
    /**
     * Verifica se una stringa è una frase conclusiva
     * @param {string} text - Testo da verificare
     * @returns {boolean} true se è una conclusione
     */
    isConclusion(text) {
        return this.baseFormatter.isConclusion(text);
    }
    
    /**
     * Verifica se una stringa sembra una domanda
     * @param {string} text - Testo da verificare
     * @returns {boolean} true se sembra una domanda
     */
    looksLikeQuestion(text) {
        return this.baseFormatter.looksLikeQuestion(text);
    }
}

// Esporta la classe MessageFormatter
if (typeof module !== 'undefined') {
    module.exports = MessageFormatter;
} else {
    window.messageFormatter = new MessageFormatter();
}