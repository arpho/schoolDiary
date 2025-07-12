import {
  UsersRole
} from './usersRole';

describe('UsersRole', () => {
  it('should have ADMIN, TEACHER, STUDENT', () => {
    expect(UsersRole.ADMIN).toBe(1);
    expect(UsersRole.TEACHER).toBe(2);
    expect(UsersRole.STUDENT).toBe(3);
  });
});
