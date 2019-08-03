import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidnavTestComponent } from './sidnav-test.component';

describe('SidnavTestComponent', () => {
  let component: SidnavTestComponent;
  let fixture: ComponentFixture<SidnavTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidnavTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidnavTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
