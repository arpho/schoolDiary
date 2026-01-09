import { or, QueryFieldFilterConstraint, WhereFilterOp } from 'firebase/firestore';
import { where } from '@angular/fire/firestore';
/**
 * Rappresenta una singola condizione di query per Firebase Firestore.
 */
export class QueryCondition {
  field: string;
  operator: "==" | "!=" | "<" | "<=" | ">" | ">=" | "array-contains" | "array-contains-any" | "in" | "not-in";
  value: any;

  /**
   * Costruttore della condizione.
   * @param field Campo su cui applicare il filtro.
   * @param operator Operatore di confronto (es. '==', '>', 'in').
   * @param value Valore di confronto.
   */
  constructor(field: string, operator: WhereFilterOp, value: any) {
    this.field = field;
    this.operator = operator;
    this.value = value;
  }

  /**
   * Converte la condizione in un vincolo `QueryFieldFilterConstraint` di Firestore.
   * @returns Oggetto `where` utilizzabile nelle query Firestore.
   */
  toWhere(): QueryFieldFilterConstraint {
    return where(this.field, this.operator, this.value);
  }
}

/**
 * Rappresenta un insieme di condizioni in OR logico.
 */
export class OrCondition {
  conditions: QueryCondition[] = [];

  /**
   * Costruttore per le condizioni OR.
   * @param conditions Array di QueryCondition da combinare in OR.
   */
  constructor(conditions: QueryCondition[]) {
    this.conditions = conditions;
  }

  /**
   * Converte le condizioni in un vincolo `or` di Firestore.
   * @returns Oggetto `or` contenente i vincoli mappati.
   */
  toWhere() {
    return or(...this.conditions.map((condition) => condition.toWhere()));
  }
}