/* eslint-disable valid-jsdoc */
/**
 * Enum che definisce i ruoli degli utenti nel sistema.
 * Deve essere mantenuto sincronizzato con il frontend
 * (src/app/shared/models/usersRole.ts)
 */
export enum UsersRole {
  /** Amministratore del sistema */
  ADMIN = 1,
  /** Insegnante */
  TEACHER = 2,
  /** Studente */
  STUDENT = 3
}

/**
 * Verifica se un valore è un ruolo valido
 // eslint-disable-next-line valid-jsdoc
 * @param value Valore da verificare
 * @return true se il valore è un ruolo valido
 */
export function isValidRole(value: unknown): value is UsersRole {
  return Object.values(UsersRole).includes(Number(value));
}
