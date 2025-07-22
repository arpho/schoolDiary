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
      phoneNumber: '+391234567890',
      role: UsersRole.TEACHER,
      classes: ['1A', '2B']
    };
    const user = new UserModel(args);
    expect(user.key).toBe('k');
    expect(user.email).toBe('test@a.it');
    expect(user.firstName).toBe('A');
    expect(user.lastName).toBe('B');
    expect(user.phoneNumber).toBe('+391234567890');
    expect(user.role).toBe(UsersRole.TEACHER);
    expect(user.classes).toEqual(['1A', '2B']);
  });

  it('should serialize correctly', () => {
    const user = new UserModel({
      key: 'x',
      email: 'y',
      role: UsersRole.ADMIN,
      classes: ['a', 'b'],
      phoneNumber: '+390987654321'
    });
    const serialized = user.serialize();
    expect(serialized.key).toBe('x');
    expect(serialized.email).toBe('y');
    expect(serialized.role).toBe(UsersRole.ADMIN);
    expect(serialized.phoneNumber).toBe('+390987654321');
    expect(serialized.classes).toEqual(['a', 'b']);
  });
});
