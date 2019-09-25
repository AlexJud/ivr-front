import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeSettingsPanelComponent } from './node-settings-panel.component';

describe('NodeSettingsPanelComponent', () => {
  let component: NodeSettingsPanelComponent;
  let fixture: ComponentFixture<NodeSettingsPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeSettingsPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeSettingsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
