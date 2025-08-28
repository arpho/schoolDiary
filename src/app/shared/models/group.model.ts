export interface GroupModel {
  key: string;
  name: string;
  classKey: string;
  memberKeys: string[]; // Array of student keys
  description?: string;
  createdAt: Date;
  updatedAt: Date;

  serialize: () => any;
}
