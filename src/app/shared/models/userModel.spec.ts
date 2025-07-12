import {
  UserModel
} from './userModel';
import {
  UsersRole
} from './usersRole';

describe('UserModel', () => {
  it('should create an instance', () => {
    const user = new UserModel();
    expect(user).toBeTruthy();
  });

  it('should build from args', () => {
    const args = {
      key: 'k',
      email: 'test@a.it',
      firstName: 'A',
      lastName: 'B',
      role: UsersRole.TEACHER
    };
    const user = new UserModel(args);
    expect(user.key).toBe('k');
    expect(user.email).toBe('test@a.it');
    expect(user.role).toBe(UsersRole.TEACHER);
  });

  it('should serialize correctly', () => {
    const user = new UserModel({ key: 'x', email: 'y', role: UsersRole.ADMIN });
    const serialized = user.serialize();
    expect(serialized.key).toBe('x');
    expect(serialized.email).toBe('y');
    expect(serialized.role).toBe(UsersRole.ADMIN);
  });
});
