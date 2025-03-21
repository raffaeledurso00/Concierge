const MODEL_CONFIG = {
    name: 'llama3.1:8b',
    baseUrl: 'http://localhost:11434',
    apiPath: '/api/generate',
    parameters: {
        num_thread: 4,     
        num_ctx: 512,     
        temperature: 0.3,
        top_p: 0.7,
        max_tokens: 500,
        top_k: 40,
        repeat_penalty: 1.1  
    }
};

module.exports = MODEL_CONFIG;