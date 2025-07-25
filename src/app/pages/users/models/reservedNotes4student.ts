export class ReservedNotes4student {
  ownerKey = "";
  note = "";
  studentKey = "";
  key = "";
  date = "";

  constructor(args?: any) {
    this.build(args);
  }

  setStudentKey(key: string) {
    this.studentKey = key;
    return this;
  }

  setKey(key: string) {
    this.key = key;
    return this;
  }

  setNote(note: string) {
    this.note = note;
    return this;
  }

  setOwner(owner: string) {
    this.ownerKey = owner;
    return this;
  }

  setDate(date: string) {
    this.date = date;
    return this;
  }

  build(args: any) {
    Object.assign(this, args);
    return this;
  }

  serialize() {
    return {
      key: this.key,
      note: this.note,
      ownerKey: this.ownerKey,
      studentKey: this.studentKey,
      date: this.date
    };
  }
}
