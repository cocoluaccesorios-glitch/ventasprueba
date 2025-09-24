/**
 * Script para ejecutar pruebas masivas del formulario
 * Genera y ejecuta múltiples combinaciones de prueba
 */

import { chromium } from 'playwright';
import TestDataGenerator from './utils/testDataGenerator.js';
import SalesFormHelper from './utils/salesFormHelper.js';

class MassTestRunner {
  constructor() {
    this.testDataGenerator = new TestDataGenerator();
    this.results = [];
  }

  async runMassTests(count = 20) {
    console.log(`🚀 Iniciando pruebas masivas (${count} escenarios)...`);
    
    const browser = await chromium.launch({ 
      headless: false, // Cambiar a true para ejecutar sin interfaz
      slowMo: 100 // Ralentizar para ver mejor
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const salesFormHelper = new SalesFormHelper(page);
    
    // Generar escenarios de prueba
    const scenarios = this.testDataGenerator.generateMultipleScenarios(count);
    
    let successCount = 0;
    let failureCount = 0;
    
    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      console.log(`\n📋 Ejecutando prueba ${i + 1}/${scenarios.length}: ${scenario.name}`);
      
      try {
        const result = await salesFormHelper.executeTestScenario(scenario);
        
        if (result.success) {
          successCount++;
          console.log(`✅ Prueba ${i + 1} exitosa`);
        } else {
          failureCount++;
          console.log(`❌ Prueba ${i + 1} falló: ${result.error}`);
        }
        
        this.results.push(result);
        
        // Esperar entre pruebas
        await page.waitForTimeout(2000);
        
      } catch (error) {
        failureCount++;
        console.log(`💥 Error en prueba ${i + 1}: ${error.message}`);
        this.results.push({
          success: false,
          scenario: scenario.name,
          error: error.message
        });
      }
    }
    
    await browser.close();
    
    // Generar reporte
    this.generateReport(successCount, failureCount, scenarios.length);
  }

  generateReport(successCount, failureCount, totalTests) {
    console.log('\n📊 REPORTE DE PRUEBAS MASIVAS');
    console.log('='.repeat(50));
    console.log(`Total de pruebas: ${totalTests}`);
    console.log(`✅ Exitosas: ${successCount}`);
    console.log(`❌ Fallidas: ${failureCount}`);
    console.log(`📈 Tasa de éxito: ${((successCount / totalTests) * 100).toFixed(2)}%`);
    
    if (failureCount > 0) {
      console.log('\n❌ PRUEBAS FALLIDAS:');
      this.results
        .filter(r => !r.success)
        .forEach((result, index) => {
          console.log(`${index + 1}. ${result.scenario}: ${result.error}`);
        });
    }
    
    console.log('\n🎯 RECOMENDACIONES:');
    if (successCount / totalTests >= 0.9) {
      console.log('✅ Excelente! El formulario funciona muy bien');
    } else if (successCount / totalTests >= 0.8) {
      console.log('⚠️  Bueno, pero hay algunas áreas de mejora');
    } else {
      console.log('🚨 Necesita revisión urgente del formulario');
    }
  }

  async runSpecificScenarios(scenarioTypes) {
    console.log(`🎯 Ejecutando escenarios específicos: ${scenarioTypes.join(', ')}`);
    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const salesFormHelper = new SalesFormHelper(page);
    
    for (const scenarioType of scenarioTypes) {
      console.log(`\n🧪 Ejecutando escenario: ${scenarioType}`);
      
      const scenario = this.testDataGenerator.generateTestScenario(scenarioType);
      const result = await salesFormHelper.executeTestScenario(scenario);
      
      console.log(result.success ? '✅ Exitoso' : `❌ Falló: ${result.error}`);
      
      await page.waitForTimeout(1000);
    }
    
    await browser.close();
  }
}

// Función principal
async function main() {
  const runner = new MassTestRunner();
  
  // Ejecutar pruebas masivas
  await runner.runMassTests(15);
  
  // Ejecutar escenarios específicos
  console.log('\n🎯 Ejecutando escenarios específicos...');
  await runner.runSpecificScenarios([
    'contado_completo',
    'abono_simple',
    'abono_mixto',
    'pago_mixto',
    'con_descuento',
    'con_delivery',
    'minimal'
  ]);
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default MassTestRunner;
