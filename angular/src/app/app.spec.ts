import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { LoginFormComponent } from './components/login-form/login-form';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the real account login instead of demo credentials', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Iniciar sesión');
    expect(compiled.querySelector('input[type="email"]')).toBeTruthy();
    expect(compiled.querySelector('.demo-access')).toBeNull();
  });

  it('should ask for the email before showing the password step', async () => {
    const fixture = TestBed.createComponent(LoginFormComponent);
    const form = fixture.componentInstance;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#loginUser')).toBeTruthy();
    expect(compiled.querySelector('#loginPassword')).toBeNull();

    form.emailDraft = 'student@example.com';
    form.continueToPassword();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(form.step).toBe('password');
    expect(compiled.querySelector('#loginUser')).toBeNull();
    expect(compiled.querySelector('#loginPassword')).toBeTruthy();
    expect(compiled.textContent).toContain('student@example.com');

    fixture.destroy();
  });

  it('should restore preferences without trusting a locally stored login', async () => {
    localStorage.setItem('unimarketLoggedUser', 'estudiante');
    localStorage.setItem('unimarketDarkMode', 'true');

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Iniciar sesión');
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('estudiante');
    expect(document.body.classList.contains('dark-mode')).toBe(true);

    fixture.destroy();
    expect(document.body.classList.contains('dark-mode')).toBe(false);

    localStorage.removeItem('unimarketLoggedUser');
    localStorage.removeItem('unimarketDarkMode');
  });
});
