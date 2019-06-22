import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridSettingsPanelComponent } from './grid-settings-panel.component';

describe('GridSettingsPanelComponent', () => {
  let component: GridSettingsPanelComponent;
  let fixture: ComponentFixture<GridSettingsPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridSettingsPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridSettingsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
