/**
 * Script para ejecutar todas las pruebas automatizadas
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class TestRunner {
  constructor() {
    this.testSuites = [
      'tests/login-test.spec.js',
      'tests/sales-form-simple.spec.js',
      'tests/advanced-sales-tests.spec.js',
      'tests/validation-tests.spec.js',
      'tests/integration-tests.spec.js',
      'tests/performance-tests.spec.js',
      'tests/error-handling-tests.spec.js',
      'tests/payment-type-tests.spec.js'
    ];
    
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      suites: []
    };
  }

  /**
   * Ejecuta todas las pruebas
   */
  async runAllTests() {
    console.log('🚀 Iniciando ejecución de todas las pruebas...\n');
    
    for (const suite of this.testSuites) {
      await this.runTestSuite(suite);
    }
    
    this.generateReport();
  }

  /**
   * Ejecuta una suite de pruebas específica
   */
  async runTestSuite(suitePath) {
    console.log(`📋 Ejecutando: ${suitePath}`);
    
    try {
      const startTime = Date.now();
      
      // Ejecutar pruebas
      const result = execSync(`npm run test:e2e -- ${suitePath}`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Parsear resultados
      const suiteResult = this.parseTestResults(result, suitePath, duration);
      this.results.suites.push(suiteResult);
      
      console.log(`✅ ${suitePath} - ${suiteResult.passed}/${suiteResult.total} pruebas pasaron (${duration}ms)\n`);
      
    } catch (error) {
      console.log(`❌ ${suitePath} - Error: ${error.message}\n`);
      
      this.results.suites.push({
        name: suitePath,
        total: 0,
        passed: 0,
        failed: 1,
        duration: 0,
        error: error.message
      });
    }
  }

  /**
   * Parsea los resultados de las pruebas
   */
  parseTestResults(output, suitePath, duration) {
    const lines = output.split('\n');
    let total = 0;
    let passed = 0;
    let failed = 0;
    
    for (const line of lines) {
      if (line.includes('passed')) {
        const match = line.match(/(\d+)\s+passed/);
        if (match) {
          passed = parseInt(match[1]);
        }
      }
      
      if (line.includes('failed')) {
        const match = line.match(/(\d+)\s+failed/);
        if (match) {
          failed = parseInt(match[1]);
        }
      }
    }
    
    total = passed + failed;
    
    return {
      name: suitePath,
      total,
      passed,
      failed,
      duration
    };
  }

  /**
   * Genera reporte final
   */
  generateReport() {
    // Calcular totales
    this.results.total = this.results.suites.reduce((sum, suite) => sum + suite.total, 0);
    this.results.passed = this.results.suites.reduce((sum, suite) => sum + suite.passed, 0);
    this.results.failed = this.results.suites.reduce((sum, suite) => sum + suite.failed, 0);
    
    console.log('📊 REPORTE FINAL DE PRUEBAS');
    console.log('='.repeat(50));
    console.log(`Total de pruebas: ${this.results.total}`);
    console.log(`Pruebas pasaron: ${this.results.passed}`);
    console.log(`Pruebas fallaron: ${this.results.failed}`);
    console.log(`Tasa de éxito: ${((this.results.passed / this.results.total) * 100).toFixed(2)}%`);
    console.log('='.repeat(50));
    
    console.log('\n📋 DETALLE POR SUITE:');
    for (const suite of this.results.suites) {
      const status = suite.failed === 0 ? '✅' : '❌';
      console.log(`${status} ${suite.name}: ${suite.passed}/${suite.total} (${suite.duration}ms)`);
    }
    
    // Guardar reporte en archivo
    this.saveReportToFile();
  }

  /**
   * Guarda el reporte en un archivo
   */
  saveReportToFile() {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: ((this.results.passed / this.results.total) * 100).toFixed(2)
      },
      suites: this.results.suites
    };
    
    const reportPath = 'tests/reports/test-report.json';
    
    // Crear directorio si no existe
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Reporte guardado en: ${reportPath}`);
  }

  /**
   * Ejecuta solo pruebas rápidas
   */
  async runQuickTests() {
    console.log('⚡ Ejecutando pruebas rápidas...\n');
    
    const quickSuites = [
      'tests/login-test.spec.js',
      'tests/sales-form-simple.spec.js'
    ];
    
    for (const suite of quickSuites) {
      await this.runTestSuite(suite);
    }
    
    this.generateReport();
  }

  /**
   * Ejecuta solo pruebas de validación
   */
  async runValidationTests() {
    console.log('🔍 Ejecutando pruebas de validación...\n');
    
    const validationSuites = [
      'tests/validation-tests.spec.js',
      'tests/error-handling-tests.spec.js'
    ];
    
    for (const suite of validationSuites) {
      await this.runTestSuite(suite);
    }
    
    this.generateReport();
  }

  /**
   * Ejecuta solo pruebas de rendimiento
   */
  async runPerformanceTests() {
    console.log('⚡ Ejecutando pruebas de rendimiento...\n');
    
    const performanceSuites = [
      'tests/performance-tests.spec.js'
    ];
    
    for (const suite of performanceSuites) {
      await this.runTestSuite(suite);
    }
    
    this.generateReport();
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  const testRunner = new TestRunner();
  
  if (args.includes('--quick')) {
    await testRunner.runQuickTests();
  } else if (args.includes('--validation')) {
    await testRunner.runValidationTests();
  } else if (args.includes('--performance')) {
    await testRunner.runPerformanceTests();
  } else {
    await testRunner.runAllTests();
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default TestRunner;

