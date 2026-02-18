export const LOCALES = ["pt", "en", "es", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export const UI_STRINGS: Record<
  Locale,
  {
    start: string;
    startTrigger: string;
    placeholder: string;
    typing: string;
    errorStart: string;
    errorSend: string;
    languageLabel: string;
    send: string;
    navInterview: string;
    navProcessor: string;
    navHistory: string;
    navAdmin: string;
    signOut: string;
  }
> = {
  pt: {
    start: "Iniciar entrevista",
    startTrigger: "Iniciar entrevista",
    placeholder: "Digite sua resposta...",
    typing: "Digitando...",
    errorStart: "Erro ao iniciar: ",
    errorSend: "Erro: ",
    languageLabel: "Idioma da entrevista",
    send: "Enviar",
    navInterview: "Entrevista",
    navProcessor: "Processador",
    navHistory: "Histórico",
    navAdmin: "Admin",
    signOut: "Sair",
  },
  en: {
    start: "Start interview",
    startTrigger: "Start interview",
    placeholder: "Type your answer...",
    typing: "Typing...",
    errorStart: "Error starting: ",
    errorSend: "Error: ",
    languageLabel: "Interview language",
    send: "Send",
    navInterview: "Interview",
    navProcessor: "Processor",
    navHistory: "History",
    navAdmin: "Admin",
    signOut: "Sign out",
  },
  es: {
    start: "Iniciar entrevista",
    startTrigger: "Iniciar entrevista",
    placeholder: "Escribe tu respuesta...",
    typing: "Escribiendo...",
    errorStart: "Error al iniciar: ",
    errorSend: "Error: ",
    languageLabel: "Idioma de la entrevista",
    send: "Enviar",
    navInterview: "Entrevista",
    navProcessor: "Procesador",
    navHistory: "Historial",
    navAdmin: "Admin",
    signOut: "Salir",
  },
  fr: {
    start: "Commencer l'entretien",
    startTrigger: "Commencer l'entretien",
    placeholder: "Tapez votre réponse...",
    typing: "En train d'écrire...",
    errorStart: "Erreur au démarrage : ",
    errorSend: "Erreur : ",
    languageLabel: "Langue de l'entretien",
    send: "Envoyer",
    navInterview: "Entretien",
    navProcessor: "Processeur",
    navHistory: "Historique",
    navAdmin: "Admin",
    signOut: "Se déconnecter",
  },
};

export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "pt";
  const lang = navigator.language?.toLowerCase() ?? "";
  if (lang.startsWith("en")) return "en";
  if (lang.startsWith("es")) return "es";
  if (lang.startsWith("fr")) return "fr";
  return "pt";
}
