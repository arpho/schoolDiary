import { Evaluation } from './evaluation';
import { Grids } from './grids';

describe('Evaluation', () => {
  let evaluation: Evaluation;
  let testGrid: Grids;

  beforeEach(() => {
    evaluation = new Evaluation();
    testGrid = new Grids({ key: 'test-grid' });
  });

  it('should create an instance with default values', () => {
    expect(evaluation).toBeTruthy();
    expect(evaluation.key).toBe('');
    expect(evaluation.description).toBe('');
    expect(evaluation.note).toBe('');
    expect(evaluation.data).toBe('');
    expect(evaluation.grid).toBeInstanceOf(Grids);
    expect(evaluation.classKey).toBe('');
    expect(evaluation.studentKey).toBe('');
    expect(evaluation.teacherKey).toBe('');
  });

  it('should build from args', () => {
    const args = {
      key: 'eval-1',
      description: 'Test description',
      note: 'A',
      data: '2025-07-21',
      grid: testGrid,
      classeKey: 'class-1',
      studentKey: 'student-1',
      teacherKey: 'teacher-1'
    };

    evaluation.build(args);
    expect(evaluation.key).toBe(args.key);
    expect(evaluation.description).toBe(args.description);
    expect(evaluation.note).toBe(args.note);
    expect(evaluation.data).toBe(args.data);
    expect(evaluation.grid).toBe(args.grid);
    expect(evaluation.classKey).toBe(args.classeKey);
    expect(evaluation.studentKey).toBe(args.studentKey);
    expect(evaluation.teacherKey).toBe(args.teacherKey);
  });

  it('should serialize correctly', () => {
    const args = {
      key: 'eval-1',
      description: 'Test description',
      note: 'A',
      data: '2025-07-21',
      grid: testGrid,
      classKey: 'class-1',
      studentKey: 'student-1',
      teacherKey: 'teacher-1'
    };

    evaluation.build(args);
    const serialized = evaluation.serialize();

    expect(serialized).toEqual({
      description: args.description,
      note: args.note,
      data: args.data,
      grid: args.grid.key,
      classKey: args.classKey,
      studentKey: args.studentKey,
      teacherKey: args.teacherKey
    });
  });

  it('should handle empty args during build', () => {
    evaluation.build();
    expect(evaluation.key).toBe('');
    expect(evaluation.description).toBe('');
    expect(evaluation.note).toBe('');
    expect(evaluation.data).toBe('');
    expect(evaluation.grid).toBeInstanceOf(Grids);
    expect(evaluation.classKey).toBe('');
    expect(evaluation.studentKey).toBe('');
  });

  it('should set key using setKey method', () => {
    const testKey = 'test-key';
    evaluation.setKey(testKey);
    expect(evaluation.key).toBe(testKey);
  });
});
