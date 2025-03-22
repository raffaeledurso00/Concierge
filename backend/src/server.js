const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const chatRoutes = require('./routes/chatRoutes');
const aiService = require('./services/ai');

// Carica variabili d'ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Routes
app.use('/api/chat', chatRoutes);

// Route di test
app.get('/', (req, res) => {
  res.json({ message: 'Villa Petriolo Concierge API attiva' });
});

// Pulizia periodica dei vecchi contesti
setInterval(() => {
  aiService.cleanupOldContexts();
}, 3600000); // Ogni ora

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server attivo sulla porta ${PORT}`);
});