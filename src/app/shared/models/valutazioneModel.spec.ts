import { ValutazioneModel } from './ValutazioneModel';
import { Grids } from './grids';
import { Indicatore } from './indicatore';

describe('ValutazioneModel', () => {
  let model: ValutazioneModel;
  let testGrid: Grids;
  
  beforeEach(() => {
    model = new ValutazioneModel();
    testGrid = new Grids({
      nome: 'Test Grid',
      descrizione: 'Test description',
      indicatori: [new Indicatore({ nome: 'Test Indicatore' })]
    });
  });

  it('should create an instance with default values', () => {
    expect(model).toBeTruthy();
    expect(model.key).toBeUndefined();
    expect(model.studentKey).toBe('');
    expect(model.classeKey).toBe('');
    expect(model.note).toBe('');
    expect(model.data).toBe('');
    expect(model.grid).toBeInstanceOf(Grids);
  });

  it('should set key using setKey', () => {
    const testKey = 'test-key-123';
    model.setKey(testKey);
    expect(model.key).toBe(testKey);
  });

  it('should build model from args', () => {
    const args = {
      key: 'test-key',
      studentKey: 'student-1',
      classeKey: 'class-1',
      note: 'Test note',
      data: '2025-07-20',
      grid: testGrid
    };

    model.build(args);
    expect(model.key).toBe(args.key);
    expect(model.studentKey).toBe(args.studentKey);
    expect(model.classeKey).toBe(args.classeKey);
    expect(model.note).toBe(args.note);
    expect(model.data).toBe(args.data);
    expect(model.grid).toEqual(args.grid);
  });

  it('should serialize to correct format', () => {
    const args = {
      key: 'test-key',
      studentKey: 'student-1',
      classeKey: 'class-1',
      note: 'Test note',
      data: '2025-07-20',
      grid: testGrid
    };

    model.build(args);
    const serialized = model.serialize();
    
    expect(serialized).toEqual({
      key: args.key,
      studentKey: args.studentKey,
      classeKey: args.classeKey,
      note: args.note,
      data: args.data,
      grid: args.grid.serialize()
    });
  });

  it('should maintain grid structure when building', () => {
    const args = {
      grid: {
        nome: 'Test Grid',
        descrizione: 'Test description',
        indicatori: [{ nome: 'Test Indicatore' }]
      }
    };

    model.build(args);
    expect(model.grid).toBeInstanceOf(Grids);
    expect(model.grid.indicatori[0]).toBeInstanceOf(Indicatore);
  });

  it('should handle empty args during build', () => {
    const emptyModel = new ValutazioneModel();
    emptyModel.build();
    
    expect(emptyModel.key).toBeUndefined();
    expect(emptyModel.studentKey).toBe('');
    expect(emptyModel.classeKey).toBe('');
    expect(emptyModel.note).toBe('');
    expect(emptyModel.data).toBe('');
    expect(emptyModel.grid).toBeInstanceOf(Grids);
  });
});
