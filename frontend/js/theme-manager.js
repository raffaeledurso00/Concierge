/**
 * theme-manager.js - Gestisce il cambio di tema dell'interfaccia
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Theme Manager inizializzato');
    
    // Classe principale per la gestione dei temi
    class ThemeManager {
        constructor() {
            this.themes = ['default', 'green', 'blue', 'purple', 'dark', 'light'];
            this.currentTheme = 'default';
            this.storageKey = 'villa_petriolo_theme';
            
            // Inizializza
            this.init();
        }
        
        /**
         * Inizializza il gestore dei temi
         */
        init() {
            // Carica tema salvato
            this.loadSavedTheme();
            
            // Crea selettore di temi se non esiste già
            this.createThemeSelector();
            
            // Aggiungi event listeners
            this.setupEventListeners();
        }
        
        /**
         * Crea il selettore di temi nell'interfaccia
         */
        createThemeSelector() {
            // Cerca container per il selettore
            let container = document.querySelector('.sidebar-footer');
            
            // Se non esiste, esci
            if (!container) {
                console.error('Container per il selettore di temi non trovato');
                return;
            }
            
            // Crea il contenitore per il selettore
            const selectorContainer = document.createElement('div');
            selectorContainer.className = 'theme-selector';
            
            // Aggiungi label
            const label = document.createElement('div');
            label.className = 'theme-selector-label';
            label.textContent = 'Tema';
            selectorContainer.appendChild(label);
            
            // Crea un pulsante per ciascun tema
            this.themes.forEach(theme => {
                const themeBtn = document.createElement('button');
                themeBtn.className = `theme-option${theme === this.currentTheme ? ' active' : ''}`;
                themeBtn.setAttribute('data-theme', theme);
                themeBtn.setAttribute('title', this.getThemeName(theme));
                themeBtn.setAttribute('aria-label', `Tema ${this.getThemeName(theme)}`);
                
                selectorContainer.appendChild(themeBtn);
            });
            
            // Aggiungi il selettore al container
            container.appendChild(selectorContainer);
        }
        
        /**
         * Imposta gli event listeners 
         */
        setupEventListeners() {
            // Aggiungi listener ai pulsanti dei temi
            document.querySelectorAll('.theme-option').forEach(btn => {
                btn.addEventListener('click', e => {
                    const theme = e.currentTarget.getAttribute('data-theme');
                    this.setTheme(theme);
                });
            });
        }
        
        /**
         * Imposta il tema specificato
         * @param {string} theme - Il tema da applicare
         */
        setTheme(theme) {
            // Ignora se è già il tema corrente
            if (theme === this.currentTheme) return;
            
            // Rimuovi classe tema precedente
            document.body.setAttribute('data-theme', theme);
            
            // Aggiorna meta theme-color per mobile
            let metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (metaThemeColor) {
                // Imposta il colore in base al tema
                const themeColors = {
                    'default': '#9f887c',
                    'green': '#4caf50',
                    'blue': '#2196f3',
                    'purple': '#9c27b0',
                    'dark': '#212121',
                    'light': '#f0f0f0'
                };
                
                metaThemeColor.setAttribute('content', themeColors[theme] || '#9f887c');
            }
            
            // Aggiorna il pulsante attivo
            document.querySelectorAll('.theme-option').forEach(btn => {
                if (btn.getAttribute('data-theme') === theme) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // Salva il tema selezionato
            this.currentTheme = theme;
            localStorage.setItem(this.storageKey, theme);
            
            console.log('Tema cambiato a:', this.getThemeName(theme));
        }
        
        /**
         * Carica il tema salvato
         */
        loadSavedTheme() {
            const savedTheme = localStorage.getItem(this.storageKey);
            
            if (savedTheme && this.themes.includes(savedTheme)) {
                this.currentTheme = savedTheme;
                document.body.setAttribute('data-theme', savedTheme);
                console.log('Tema caricato da localStorage:', this.getThemeName(savedTheme));
            }
        }
        
        /**
         * Ottieni il nome leggibile del tema
         * @param {string} theme - Codice del tema
         * @returns {string} Nome leggibile del tema
         */
        getThemeName(theme) {
            const names = {
                'default': 'Classico',
                'green': 'Verde',
                'blue': 'Blu',
                'purple': 'Viola',
                'dark': 'Scuro',
                'light': 'Chiaro'
            };
            
            return names[theme] || 'Sconosciuto';
        }
    }
    
    // Inizializza il gestore dei temi
    window.themeManager = new ThemeManager();
});