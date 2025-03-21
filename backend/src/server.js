const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const chatRoutes = require('./routes/chatRoutes');

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

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server attivo sulla porta ${PORT}`);
});
