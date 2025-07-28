export class ActivityModel {
  key: string = '';
  title: string = '';
  date: string = '';
  classKey: string = '';
  description: string = '';
  teacherKey: string = '';

  constructor(args?: any) {
    this.build(args);
  }

  setKey(key: string) {
    this.key = key;
    return this;
  }

  build(args?: any) {
    if (args) {
      Object.assign(this, args);
    }
    return this;
  }

  serialize() {
    return {
      key: this.key,
      title: this.title,
      date: this.date,
      classKey: this.classKey,
      description: this.description,
      teacherKey: this.teacherKey
    };
  }
}