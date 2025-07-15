import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';

import { GridsService } from './grids.service';

describe('GridsService', () => {
  let service: GridsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Firestore, useValue: { collection: () => ({ valueChanges: () => ({ subscribe: () => {} }) }) } }
      ]
    });
    service = TestBed.inject(GridsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
