declare namespace NodeJS {
  export interface ProcessEnv {
    MAILERSEND_API_KEY: string;
    EMAIL_SENDER: string;
    EMAIL_SENDER_NAME: string;
    // Aggiungi qui altre variabili d'ambiente se necessario
  }
}
