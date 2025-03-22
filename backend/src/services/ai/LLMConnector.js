// backend/src/services/ai/LLMConnector.js
const axios = require('axios');
const MODEL_CONFIG = require('../../config/modelConfig');

class LLMConnector {
    /**
     * Invia un prompt al modello LLM e ottiene una risposta
     */
    async sendPrompt(prompt) {
        try {
            console.log('Invio prompt a Ollama');
            
            const response = await axios.post(
                `${MODEL_CONFIG.baseUrl}${MODEL_CONFIG.apiPath}`,
                {
                    model: MODEL_CONFIG.name,
                    prompt: prompt,
                    stream: false,
                    ...MODEL_CONFIG.parameters
                },
                { timeout: 15000 }
            );
            
            return response.data.response;
        } catch (error) {
            console.error('Errore nella chiamata ad Ollama:', error);
            throw error;
        }
    }
}

module.exports = LLMConnector;