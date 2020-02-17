import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoSsoComponent } from './no-sso.component';

describe('NoSsoComponent', () => {
  let component: NoSsoComponent;
  let fixture: ComponentFixture<NoSsoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoSsoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoSsoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
