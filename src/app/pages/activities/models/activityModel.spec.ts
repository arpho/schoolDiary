import { ActivityModel } from './activityModel';

describe('ActivityModel', () => {
  let model: ActivityModel;

  beforeEach(() => {
    model = new ActivityModel();
  });

  it('should create an instance with default values', () => {
    expect(model).toBeTruthy();
    expect(model.key).toBe('');
    expect(model.title).toBe('');
    expect(model.date).toBe('');
    expect(model.classKey).toBe('');
    expect(model.description).toBe('');
    expect(model.teacherKey).toBe('');
  });

  it('should set key using setKey method', () => {
    const testKey = 'test-key';
    model.setKey(testKey);
    expect(model.key).toBe(testKey);
  });

  it('should build model from args', () => {
    const args = {
      key: 'activity-1',
      title: 'Test Activity',
      date: '2025-07-28',
      classKey: 'class-1',
      description: 'Test description',
      teacherKey: 'teacher-1'
    };

    model.build(args);
    expect(model.key).toBe(args.key);
    expect(model.title).toBe(args.title);
    expect(model.date).toBe(args.date);
    expect(model.classKey).toBe(args.classKey);
    expect(model.description).toBe(args.description);
    expect(model.teacherKey).toBe(args.teacherKey);
  });

  it('should serialize correctly', () => {
    const args = {
      key: 'activity-1',
      title: 'Test Activity',
      date: '2025-07-28',
      classKey: 'class-1',
      description: 'Test description',
      teacherKey: 'teacher-1'
    };

    model.build(args);
    const serialized = model.serialize();

    expect(serialized).toEqual({
      key: args.key,
      title: args.title,
      date: args.date,
      classKey: args.classKey,
      description: args.description,
      teacherKey: args.teacherKey
    });
  });

  it('should handle empty args during build', () => {
    model.build();
    expect(model.key).toBe('');
    expect(model.title).toBe('');
    expect(model.date).toBe('');
    expect(model.classKey).toBe('');
    expect(model.description).toBe('');
    expect(model.teacherKey).toBe('');
  });
});
