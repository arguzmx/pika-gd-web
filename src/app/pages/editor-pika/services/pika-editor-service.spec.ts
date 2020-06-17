import { TestBed } from '@angular/core/testing';

import { PikaEditorService } from './pika-editor-service';

describe('PikaEditorServiceService', () => {
  let service: PikaEditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PikaEditorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
