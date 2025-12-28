const SalesPredictionService = require('./src/services/SalesPredictionService');

async function verifyForecast() {
  try {
    console.log('=== Verifying Weekly Forecast ===\n');
    const forecast = await SalesPredictionService.getWeeklyForecast(3);

    console.log('[OK] Weekly forecast generated!');
    console.log('[OK] Daily forecasts:', forecast.daily_forecasts.length);
    console.log('[OK] Summary:');
    console.log('  - Total predicted quantity:', forecast.summary.total_predicted_quantity, 'units');
    console.log('  - Total predicted revenue: $' + forecast.summary.total_predicted_revenue);

    if (forecast.daily_forecasts.length > 0) {
      console.log('\n[OK] Sample forecast (first 5 days):');
      forecast.daily_forecasts.slice(0, 5).forEach(f => {
        console.log(`  - ${f.prediction_date}: ${f.daily_quantity} units = $${f.daily_revenue}`);
      });
    }
  } catch(err) {
    console.error('[ERROR]', err.message);
    console.error(err.stack);
  }
}

verifyForecast().then(() => process.exit(0));
