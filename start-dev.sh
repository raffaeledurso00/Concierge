#!/bin/bash

# Avvia il backend
echo "Avvio del backend..."
cd backend
npm run dev &
BACKEND_PID=$!

# Avvia il frontend
echo "Avvio del frontend con http-server..."
cd ../frontend
npx http-server -p 3000 &
FRONTEND_PID=$!

# Funzione per terminare correttamente i processi quando lo script viene interrotto
cleanup() {
  echo "Termino i processi..."
  kill $BACKEND_PID
  kill $FRONTEND_PID
  exit
}

# Registra la funzione di cleanup per terminare correttamente i processi quando lo script viene interrotto
trap cleanup SIGINT SIGTERM

echo "Servizi avviati! Backend su http://localhost:3001, Frontend su http://localhost:3000"
echo "Premi Ctrl+C per terminare entrambi i servizi."

# Mantieni lo script in esecuzione
wait
