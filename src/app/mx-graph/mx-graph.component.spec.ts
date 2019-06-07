import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MxGraphComponent } from './mx-graph.component';

describe('MxGraphComponent', () => {
  let component: MxGraphComponent;
  let fixture: ComponentFixture<MxGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MxGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MxGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
