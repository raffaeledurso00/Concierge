const MODEL_CONFIG = {
    name: 'llama3.1:8b',  // Manteniamo lo stesso modello
    baseUrl: 'http://localhost:11434',
    apiPath: '/api/generate',
    parameters: {
        num_thread: 4,
        num_ctx: 2048,      // Aumentato per gestire un contesto più ampio
        temperature: 0.4,   // Leggermente aumentato per più variabilità nelle risposte
        top_p: 0.85,        // Aumentato per consentire più creatività
        max_tokens: 1000,   // Aumentato per risposte più dettagliate
        top_k: 40,
        repeat_penalty: 1.2, // Aumentato per evitare ripetizioni
        presence_penalty: 0.3, // Aggiunto per penalizzare ripetizioni tematiche
        frequency_penalty: 0.5 // Aggiunto per incoraggiare un vocabolario più vario
    }
};

module.exports = MODEL_CONFIG;