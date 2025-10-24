import { or, QueryFieldFilterConstraint, WhereFilterOp } from 'firebase/firestore';
import { where } from '@angular/fire/firestore';
export class QueryCondition {
    field: string;
    operator: "==" | "!=" | "<" | "<=" | ">" | ">=" | "array-contains" | "array-contains-any" | "in" | "not-in" 
    value: any;


    constructor(field: string, operator: WhereFilterOp, value: any) {
    this.field = field;
        this.operator = operator;
        this.value = value;
    }
    toWhere():QueryFieldFilterConstraint{
      return  where(this.field, this.operator, this.value);
    }
}

export class OrCondition{
  conditions:QueryCondition[]= [];
  constructor(conditions:QueryCondition[]){
    this.conditions = conditions;
  }
  toWhere(){
    return or(...this.conditions.map((condition)=>condition.toWhere()));
  }
}