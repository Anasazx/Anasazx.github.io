import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { profile, projects, skills } from './data/portfolio';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should expose the name to screen readers in the h1', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(profile.name);
  });

  it('should render a build for every project', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('#projects .build').length).toBe(projects.length);
  });

  it('should put every skill in the inventory', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const total = skills.reduce((n, g) => n + g.items.length, 0);
    expect(compiled.querySelectorAll('#skills button.inv__slot').length).toBe(total);
  });
});
