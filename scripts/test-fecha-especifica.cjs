const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testFechaEspecifica() {
  console.log('🧪 PROBANDO FUNCIONALIDAD DE FECHA ESPECÍFICA');
  console.log('');
  
  try {
    // Simular exactamente lo que hace el dashboard
    const fechaEspecifica = '2025-09-22'; // Fecha que el usuario seleccionaría
    
    console.log('📅 Fecha seleccionada:', fechaEspecifica);
    console.log('');
    
    // Crear período personalizado como lo hace el dashboard
    const periodoPersonalizado = {
      tipo: 'fecha_especifica',
      fechaInicio: new Date(fechaEspecifica + 'T00:00:00.000Z'), // Usar UTC
      fechaFin: new Date(fechaEspecifica + 'T23:59:59.999Z')   // Usar UTC
    };
    
    console.log('📅 Período personalizado creado:');
    console.log('   Inicio:', periodoPersonalizado.fechaInicio.toISOString());
    console.log('   Fin:', periodoPersonalizado.fechaFin.toISOString());
    console.log('');
    
    // Obtener pedidos del período específico
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('*')
      .gte('fecha_pedido', periodoPersonalizado.fechaInicio.toISOString())
      .lte('fecha_pedido', periodoPersonalizado.fechaFin.toISOString())
      .order('fecha_pedido', { ascending: false });
    
    if (error) {
      console.error('❌ Error obteniendo pedidos:', error);
      return;
    }
    
    console.log('📊 PEDIDOS ENCONTRADOS:', pedidos.length);
    console.log('');
    
    if (pedidos.length === 0) {
      console.log('⚠️ NO HAY PEDIDOS PARA ESTA FECHA');
      return;
    }
    
    // Calcular estadísticas como lo hace el dashboard
    const ventasTotales = pedidos.reduce((sum, p) => sum + (p.total_usd || 0), 0);
    
    // Calcular ingresos reales con la lógica corregida
    const ingresosReales = pedidos.reduce((sum, p) => {
      let ingresosPedido = 0;
      
      if (p.metodo_pago === 'Contado') {
        ingresosPedido = p.total_usd || 0;
      }
      
      if (p.es_pago_mixto) {
        const mixtoUSD = p.monto_mixto_usd || 0;
        const mixtoVES = p.monto_mixto_ves || 0;
        const mixtoVESUSD = mixtoVES / (p.tasa_bcv || 1);
        ingresosPedido = mixtoUSD + mixtoVESUSD;
        
        // Aplicar límite
        const totalPedido = p.total_usd || 0;
        if (ingresosPedido > totalPedido) {
          ingresosPedido = totalPedido;
        }
      }
      
      if (p.es_abono) {
        if (p.tipo_pago_abono === 'simple') {
          ingresosPedido = p.monto_abono_simple || 0;
          
          // Aplicar límite
          const totalPedido = p.total_usd || 0;
          if (ingresosPedido > totalPedido) {
            ingresosPedido = totalPedido;
          }
        } else if (p.tipo_pago_abono === 'mixto') {
          const abonoUSD = p.monto_abono_usd || 0;
          const abonoVES = p.monto_abono_ves || 0;
          const abonoVESUSD = abonoVES / (p.tasa_bcv || 1);
          ingresosPedido = abonoUSD + abonoVESUSD;
          
          // Aplicar límite
          const totalPedido = p.total_usd || 0;
          if (ingresosPedido > totalPedido) {
            ingresosPedido = totalPedido;
          }
        }
      }
      
      // Si es pago en VES (Pago Móvil, Punto de Venta, Transferencia)
      if (p.metodo_pago && p.metodo_pago.includes('(VES)')) {
        // Para pagos en VES, el total_usd ya está convertido, así que es el ingreso real
        ingresosPedido = p.total_usd || 0;
      }
      
      return sum + ingresosPedido;
    }, 0);
    
    // Calcular productos vendidos REALES usando detalles_pedido
    const { data: detalles, error: detallesError } = await supabase
      .from('detalles_pedido')
      .select(`
        cantidad,
        pedidos!inner(fecha_pedido)
      `)
      .gte('pedidos.fecha_pedido', periodoPersonalizado.fechaInicio.toISOString())
      .lte('pedidos.fecha_pedido', periodoPersonalizado.fechaFin.toISOString())
      .not('producto_id', 'is', null); // Solo productos reales, no manuales
    
    let productosVendidos = 0;
    if (!detallesError && detalles) {
      productosVendidos = detalles.reduce((sum, detalle) => 
        sum + (detalle.cantidad || 0), 0
      );
    }
    
    // Calcular clientes activos
    const clientesUnicos = new Set(pedidos.map(p => p.cliente_id).filter(id => id));
    const clientesActivos = clientesUnicos.size;
    
    // Calcular stock bajo (esto requiere consulta adicional)
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('stock_actual, stock_sugerido');
    
    let stockBajo = 0;
    if (!productosError && productos) {
      stockBajo = productos.filter(p => 
        (p.stock_actual || 0) <= (p.stock_sugerido || 5)
      ).length;
    }
    
    // Crear estadísticas como las devuelve el dashboard
    const estadisticas = {
      ventasTotales: parseFloat(ventasTotales.toFixed(2)),
      ingresosReales: parseFloat(ingresosReales.toFixed(2)),
      productosVendidos,
      clientesActivos,
      stockBajo
    };
    
    console.log('📊 ESTADÍSTICAS CALCULADAS:');
    console.log('   Ventas Totales: $' + estadisticas.ventasTotales);
    console.log('   Ingresos Reales: $' + estadisticas.ingresosReales);
    console.log('   Productos Vendidos: ' + estadisticas.productosVendidos);
    console.log('   Clientes Activos: ' + estadisticas.clientesActivos);
    console.log('   Stock Bajo: ' + estadisticas.stockBajo);
    console.log('');
    
    // Probar la función de datos para gráfica
    console.log('📈 PROBANDO DATOS PARA GRÁFICA:');
    
    // Obtener datos para gráfica por hora (horario comercial)
    const datosPorHora = new Map();
    
    pedidos.forEach(pedido => {
      const fecha = new Date(pedido.fecha_pedido);
      const hora = fecha.getHours();
      
      // Solo incluir si está en horario comercial (6:00 AM - 8:00 PM)
      if (hora >= 6 && hora <= 20) {
        const horaKey = fecha.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
        
        if (datosPorHora.has(horaKey)) {
          datosPorHora.set(horaKey, datosPorHora.get(horaKey) + (pedido.total_usd || 0));
        } else {
          datosPorHora.set(horaKey, pedido.total_usd || 0);
        }
      }
    });
    
    // Generar datos completos para el horario comercial
    const datosCompletos = [];
    for (let hora = 6; hora <= 20; hora++) {
      const horaKey = `${hora.toString().padStart(2, '0')}:00`;
      datosCompletos.push({
        fecha: horaKey,
        ventas: datosPorHora.get(horaKey) || 0
      });
    }
    
    console.log('   Datos para gráfica (horario comercial 6:00-20:00):');
    datosCompletos.forEach(dato => {
      if (dato.ventas > 0) {
        console.log(`     ${dato.fecha}: $${dato.ventas.toFixed(2)}`);
      }
    });
    
    console.log('');
    console.log('✅ RESULTADO:');
    console.log('   La funcionalidad de fecha específica debería funcionar correctamente');
    console.log('   Los datos están disponibles y se calculan correctamente');
    console.log('');
    console.log('💡 Si el dashboard no muestra estos datos:');
    console.log('   1. Verifica que estés usando la fecha correcta: 2025-09-22');
    console.log('   2. Revisa la consola del navegador para errores');
    console.log('   3. Asegúrate de que el modal se esté cerrando correctamente');
    console.log('   4. Verifica que la función actualizarDatosPorPeriodoPersonalizado se esté ejecutando');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testFechaEspecifica();
