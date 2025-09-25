#!/usr/bin/env node

/**
 * Script de Ejecución de Pruebas Comprehensivas
 * Ejecuta todas las pruebas de ventas de manera sistemática
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class TestRunner {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      progress: '🔄'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTest(testFile, description) {
    this.log(`Iniciando: ${description}`, 'progress');
    
    try {
      const command = `npx playwright test ${testFile} --reporter=json`;
      const output = execSync(command, { 
        encoding: 'utf8',
        cwd: process.cwd(),
        timeout: 300000 // 5 minutos por archivo
      });
      
      const result = JSON.parse(output);
      
      this.results.total += result.stats.total;
      this.results.passed += result.stats.passed;
      this.results.failed += result.stats.failed;
      this.results.skipped += result.stats.skipped;
      
      if (result.stats.failed > 0) {
        this.results.errors.push({
          test: description,
          failures: result.stats.failed,
          details: result.results.filter(r => r.status === 'failed')
        });
      }
      
      this.log(`Completado: ${description} - ${result.stats.passed} pasaron, ${result.stats.failed} fallaron`, 
        result.stats.failed > 0 ? 'error' : 'success');
      
    } catch (error) {
      this.log(`Error ejecutando ${description}: ${error.message}`, 'error');
      this.results.errors.push({
        test: description,
        error: error.message
      });
    }
  }

  async runAllTests() {
    this.log('🚀 Iniciando ejecución de pruebas comprehensivas', 'info');
    this.log('=' .repeat(80), 'info');
    
    const tests = [
      {
        file: 'tests/comprehensive-sales-tests.spec.js',
        description: 'Pruebas Comprehensivas de Ventas - Todas las Variantes'
      },
      {
        file: 'tests/comprehensive-test-runner.spec.js',
        description: 'Ejecutor de Pruebas Comprehensivas - Todas las Variantes'
      },
      {
        file: 'tests/advanced-sales-tests.spec.js',
        description: 'Pruebas Avanzadas de Ventas (Existentes)'
      }
    ];

    for (const test of tests) {
      if (fs.existsSync(test.file)) {
        await this.runTest(test.file, test.description);
      } else {
        this.log(`Archivo no encontrado: ${test.file}`, 'warning');
      }
    }

    this.generateReport();
  }

  generateReport() {
    const endTime = Date.now();
    const duration = Math.round((endTime - this.startTime) / 1000);
    
    this.log('=' .repeat(80), 'info');
    this.log('📊 REPORTE FINAL DE PRUEBAS', 'info');
    this.log('=' .repeat(80), 'info');
    
    this.log(`⏱️  Duración total: ${duration} segundos`, 'info');
    this.log(`📈 Total de pruebas: ${this.results.total}`, 'info');
    this.log(`✅ Pruebas exitosas: ${this.results.passed}`, 'success');
    this.log(`❌ Pruebas fallidas: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'success');
    this.log(`⏭️  Pruebas omitidas: ${this.results.skipped}`, 'info');
    
    const successRate = this.results.total > 0 ? 
      Math.round((this.results.passed / this.results.total) * 100) : 0;
    this.log(`📊 Tasa de éxito: ${successRate}%`, successRate >= 90 ? 'success' : 'warning');
    
    if (this.results.errors.length > 0) {
      this.log('', 'info');
      this.log('🔍 DETALLES DE ERRORES:', 'error');
      this.log('-' .repeat(40), 'error');
      
      this.results.errors.forEach((error, index) => {
        this.log(`${index + 1}. ${error.test}`, 'error');
        if (error.failures) {
          this.log(`   Fallos: ${error.failures}`, 'error');
        }
        if (error.error) {
          this.log(`   Error: ${error.error}`, 'error');
        }
        this.log('', 'error');
      });
    }
    
    this.log('=' .repeat(80), 'info');
    
    // Guardar reporte en archivo
    const reportData = {
      timestamp: new Date().toISOString(),
      duration: duration,
      results: this.results,
      summary: {
        successRate: successRate,
        status: this.results.failed === 0 ? 'PASSED' : 'FAILED'
      }
    };
    
    const reportFile = `test-results/comprehensive-test-report-${Date.now()}.json`;
    fs.mkdirSync('test-results', { recursive: true });
    fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
    
    this.log(`📄 Reporte guardado en: ${reportFile}`, 'info');
    
    // Generar reporte HTML
    this.generateHTMLReport(reportData);
  }

  generateHTMLReport(data) {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Pruebas Comprehensivas</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
        }
        .stat-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            border-left: 4px solid #667eea;
        }
        .stat-card.success {
            border-left-color: #28a745;
        }
        .stat-card.error {
            border-left-color: #dc3545;
        }
        .stat-card.warning {
            border-left-color: #ffc107;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-label {
            color: #6c757d;
            font-size: 0.9em;
        }
        .errors {
            padding: 30px;
            border-top: 1px solid #dee2e6;
        }
        .error-item {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .error-title {
            font-weight: bold;
            color: #721c24;
            margin-bottom: 10px;
        }
        .error-details {
            color: #721c24;
            font-size: 0.9em;
        }
        .footer {
            background: #6c757d;
            color: white;
            padding: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Reporte de Pruebas Comprehensivas</h1>
            <p>Sistema de Ventas Cocolú - ${new Date(data.timestamp).toLocaleString('es-ES')}</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${data.results.total}</div>
                <div class="stat-label">Total de Pruebas</div>
            </div>
            <div class="stat-card success">
                <div class="stat-number">${data.results.passed}</div>
                <div class="stat-label">Exitosas</div>
            </div>
            <div class="stat-card error">
                <div class="stat-number">${data.results.failed}</div>
                <div class="stat-label">Fallidas</div>
            </div>
            <div class="stat-card warning">
                <div class="stat-number">${data.results.skipped}</div>
                <div class="stat-label">Omitidas</div>
            </div>
            <div class="stat-card ${data.summary.successRate >= 90 ? 'success' : 'warning'}">
                <div class="stat-number">${data.summary.successRate}%</div>
                <div class="stat-label">Tasa de Éxito</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.duration}s</div>
                <div class="stat-label">Duración</div>
            </div>
        </div>
        
        ${data.results.errors.length > 0 ? `
        <div class="errors">
            <h2>🔍 Errores Encontrados</h2>
            ${data.results.errors.map(error => `
                <div class="error-item">
                    <div class="error-title">${error.test}</div>
                    <div class="error-details">
                        ${error.failures ? `Fallos: ${error.failures}` : ''}
                        ${error.error ? `Error: ${error.error}` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        <div class="footer">
            <p>Reporte generado automáticamente por el sistema de pruebas comprehensivas</p>
        </div>
    </div>
</body>
</html>`;

    const htmlFile = `test-results/comprehensive-test-report-${Date.now()}.html`;
    fs.writeFileSync(htmlFile, html);
    this.log(`📄 Reporte HTML guardado en: ${htmlFile}`, 'info');
  }
}

// Ejecutar pruebas
const runner = new TestRunner();
runner.runAllTests().catch(console.error);
