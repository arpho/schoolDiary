import { WhereFilterOp } from 'firebase/firestore';

export class QueryCondition {
    field: string;
    operator: "==" | "!=" | "<" | "<=" | ">" | ">=" | "array-contains" | "array-contains-any" | "in" | "not-in" 
    value: any;


    constructor(field: string, operator: WhereFilterOp, value: any) {
    this.field = field;
        this.operator = operator;
        this.value = value;
    }
}