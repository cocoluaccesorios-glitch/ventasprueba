#!/usr/bin/env node

/**
 * Script para inspeccionar el DOM de la aplicación y obtener selectores correctos
 */

import { chromium } from '@playwright/test';

async function inspectDOM() {
  console.log('🔍 Inspeccionando DOM de la aplicación...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navegar a la aplicación
    console.log('🌐 Navegando a la aplicación...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Hacer login
    console.log('🔐 Realizando login...');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Esperar SweetAlert si aparece
    try {
      const sweetAlert = await page.locator('.swal2-popup');
      if (await sweetAlert.isVisible()) {
        await page.waitForTimeout(2000);
        const confirmBtn = await page.locator('.swal2-confirm');
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    } catch (e) {
      // No hay SweetAlert
    }
    
    // Navegar a ventas
    console.log('🧭 Navegando a ventas...');
    await page.goto('http://localhost:5173/ventas');
    await page.waitForLoadState('networkidle');
    
    // Esperar a que la página cargue completamente
    await page.waitForTimeout(3000);
    
    console.log('\n📋 INFORMACIÓN DEL DOM:');
    console.log('======================');
    
    // Obtener información de la página
    const title = await page.title();
    console.log(`Título: ${title}`);
    
    const url = page.url();
    console.log(`URL: ${url}`);
    
    // Buscar elementos de cliente
    console.log('\n👤 ELEMENTOS DE CLIENTE:');
    console.log('=======================');
    
    const clienteInputs = await page.locator('input').all();
    for (let i = 0; i < clienteInputs.length; i++) {
      const input = clienteInputs[i];
      const placeholder = await input.getAttribute('placeholder');
      const id = await input.getAttribute('id');
      const name = await input.getAttribute('name');
      const className = await input.getAttribute('class');
      
      if (placeholder && (placeholder.includes('cliente') || placeholder.includes('nombre') || placeholder.includes('cédula'))) {
        console.log(`Input ${i}: placeholder="${placeholder}", id="${id}", name="${name}", class="${className}"`);
      }
    }
    
    // Buscar elementos de producto
    console.log('\n📦 ELEMENTOS DE PRODUCTO:');
    console.log('========================');
    
    for (let i = 0; i < clienteInputs.length; i++) {
      const input = clienteInputs[i];
      const placeholder = await input.getAttribute('placeholder');
      const id = await input.getAttribute('id');
      const name = await input.getAttribute('name');
      const className = await input.getAttribute('class');
      
      if (placeholder && placeholder.includes('producto')) {
        console.log(`Input ${i}: placeholder="${placeholder}", id="${id}", name="${name}", class="${className}"`);
      }
    }
    
    // Buscar botones
    console.log('\n🔘 BOTONES:');
    console.log('===========');
    
    const buttons = await page.locator('button').all();
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const type = await button.getAttribute('type');
      const className = await button.getAttribute('class');
      
      if (text && (text.includes('submit') || text.includes('Enviar') || text.includes('Registrar'))) {
        console.log(`Button ${i}: text="${text.trim()}", type="${type}", class="${className}"`);
      }
    }
    
    // Buscar selects
    console.log('\n📋 SELECTS:');
    console.log('===========');
    
    const selects = await page.locator('select').all();
    for (let i = 0; i < selects.length; i++) {
      const select = selects[i];
      const name = await select.getAttribute('name');
      const id = await select.getAttribute('id');
      const className = await select.getAttribute('class');
      
      console.log(`Select ${i}: name="${name}", id="${id}", class="${className}"`);
    }
    
    // Obtener HTML de la página para análisis
    console.log('\n📄 HTML COMPLETO:');
    console.log('================');
    
    const html = await page.content();
    console.log('HTML guardado en: dom-inspection.html');
    
    // Guardar HTML para análisis
    const fs = await import('fs');
    fs.writeFileSync('dom-inspection.html', html);
    
    console.log('\n✅ Inspección completada. Revisa el archivo dom-inspection.html para más detalles.');
    console.log('\nPresiona Ctrl+C para cerrar el navegador...');
    
    // Mantener el navegador abierto para inspección manual
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Error durante la inspección:', error.message);
  } finally {
    await browser.close();
  }
}

// Ejecutar inspección
inspectDOM().catch(console.error);
