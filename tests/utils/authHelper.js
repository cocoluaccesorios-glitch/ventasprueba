/**
 * Helper para manejar la autenticación en las pruebas
 */

export class AuthHelper {
  constructor(page) {
    this.page = page;
  }

  /**
   * Verifica si estamos en la página de login
   */
  async isOnLoginPage() {
    const url = this.page.url();
    return url.includes('/login') || url.includes('auth');
  }

  /**
   * Realiza login automático
   */
  async login(username = 'admin', password = 'admin123') {
    console.log('🔐 Realizando login automático...');
    
    // Verificar si ya estamos logueados
    if (!(await this.isOnLoginPage())) {
      console.log('✅ Ya estamos logueados');
      return true;
    }

    try {
      // Esperar a que aparezca el formulario de login
      await this.page.waitForSelector('textbox, input[type="text"], input[type="password"]', { timeout: 15000 });
      
      // Llenar credenciales usando selectores más genéricos
      // Buscar por el texto "Usuario" y "Contraseña"
      const usernameInput = await this.page.locator('textbox').first();
      await usernameInput.fill(username);
      
      const passwordInput = await this.page.locator('textbox').nth(1);
      await passwordInput.fill(password);
      
      // Hacer clic en el botón de login
      await this.page.click('button:has-text("Iniciar Sesión")');
      
      // Esperar a que se complete el login
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
      
      // Cerrar SweetAlert si aparece
      try {
        const sweetAlert = await this.page.locator('.swal2-popup');
        if (await sweetAlert.isVisible()) {
          await this.page.waitForTimeout(1000);
          // Intentar cerrar el SweetAlert
          const confirmBtn = await this.page.locator('.swal2-confirm');
          if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
            await this.page.waitForTimeout(1000);
          }
        }
      } catch (e) {
        // No hay SweetAlert, continuar
      }
      
      // Verificar que no estemos en la página de login
      const stillOnLogin = await this.isOnLoginPage();
      if (stillOnLogin) {
        console.log('❌ Login falló - aún en página de login');
        return false;
      }
      
      console.log('✅ Login exitoso');
      return true;
      
    } catch (error) {
      console.log('❌ Error en login:', error.message);
      return false;
    }
  }

  /**
   * Navega a una página específica manejando la autenticación
   */
  async navigateTo(path) {
    console.log(`🧭 Navegando a: ${path}`);
    
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
    
    // Si estamos en login, intentar loguearnos
    if (await this.isOnLoginPage()) {
      const loginSuccess = await this.login();
      if (!loginSuccess) {
        throw new Error('No se pudo completar el login');
      }
      
      // Navegar nuevamente después del login
      await this.page.goto(path);
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Verifica si hay algún modal de autenticación
   */
  async handleAuthModal() {
    try {
      // Buscar modales de autenticación
      const authModal = await this.page.locator('.modal, .swal2-popup').first();
      if (await authModal.isVisible()) {
        console.log('🔐 Modal de autenticación detectado');
        
        // Buscar botón de cerrar o cancelar
        const closeBtn = await this.page.locator('button:has-text("Cerrar"), button:has-text("Cancelar"), .btn-close').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
          await this.page.waitForTimeout(500);
        }
      }
    } catch (error) {
      // No hay modal, continuar
    }
  }

  /**
   * Espera a que la aplicación esté lista
   */
  async waitForAppReady() {
    console.log('⏳ Esperando que la aplicación esté lista...');
    
    // Esperar a que no haya elementos de carga
    await this.page.waitForFunction(() => {
      const loadingElements = document.querySelectorAll('.loading, .spinner, [class*="loading"]');
      return loadingElements.length === 0;
    }, { timeout: 10000 });
    
    // Esperar a que el contenido principal esté visible
    await this.page.waitForSelector('main, .container, .app', { timeout: 10000 });
    
    console.log('✅ Aplicación lista');
  }
}

export default AuthHelper;
