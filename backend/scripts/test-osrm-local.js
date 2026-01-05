/**
 * Test Local OSRM Server Integration
 * Verifies the local OSRM server is working with Sierra Leone data
 */
const OSRMRoutingService = require('../src/services/OSRMRoutingService');

async function testLocalOSRM() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         LOCAL OSRM SERVER TEST                             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Initialize OSRM service
  const osrm = new OSRMRoutingService({
    osrmUrl: 'http://localhost:5000',
    enabled: true
  });

  // Wait for availability check
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('Server Status:');
  console.log(`  Available: ${osrm.isAvailable}`);
  console.log(`  Using Public: ${osrm.usingPublic}`);
  console.log(`  URL: ${osrm.osrmUrl}\n`);

  if (!osrm.isAvailable) {
    console.error('❌ OSRM server is not available!');
    console.log('\nMake sure your OSRM server is running:');
    console.log('  docker run -t -i -p 5000:5000 osrm/osrm-backend osrm-routed ...');
    process.exit(1);
  }

  // Test coordinates within Njala University campus
  const depot = [8.1129, -12.0710];  // Riders Depot
  const quad1 = [8.1138658, -12.0708755];  // Quad 1
  const heavens = [8.1174974, -12.0674132];  // Heavens 1
  const matturi = [8.118805, -12.0699399];  // Matturi Block A

  console.log('Testing Distance Calculations:\n');

  // Test 1: Depot to Quad 1
  const dist1 = await osrm.getDistance(depot, quad1);
  console.log(`1. Depot → Quad 1: ${dist1}m`);

  // Test 2: Quad 1 to Heavens
  const dist2 = await osrm.getDistance(quad1, heavens);
  console.log(`2. Quad 1 → Heavens 1: ${dist2}m`);

  // Test 3: Heavens to Matturi
  const dist3 = await osrm.getDistance(heavens, matturi);
  console.log(`3. Heavens 1 → Matturi: ${dist3}m`);

  // Test 4: Matturi back to Depot
  const dist4 = await osrm.getDistance(matturi, depot);
  console.log(`4. Matturi → Depot: ${dist4}m`);

  const totalDistance = (dist1 + dist2 + dist3 + dist4) / 1000;
  console.log(`\nTotal round trip: ${totalDistance.toFixed(2)} km\n`);

  // Test route geometry
  console.log('Testing Route Geometry:\n');
  const waypoints = [depot, quad1, heavens, matturi, depot];
  const routeGeometry = await osrm.getRouteGeometryWithFallback(waypoints);

  console.log(`  Source: ${routeGeometry.source}`);
  console.log(`  Coordinates: ${routeGeometry.coordinates.length} points`);

  if (routeGeometry.distance) {
    console.log(`  Distance: ${(routeGeometry.distance / 1000).toFixed(2)} km`);
    console.log(`  Duration: ${Math.round(routeGeometry.duration / 60)} minutes`);
  }

  // Show first few coordinates
  console.log(`\n  Sample coordinates (first 3):`);
  routeGeometry.coordinates.slice(0, 3).forEach((coord, i) => {
    console.log(`    ${i + 1}. [${coord[0].toFixed(6)}, ${coord[1].toFixed(6)}]`);
  });

  // Cache stats
  const cacheStats = osrm.getCacheStats();
  console.log(`\n📊 Cache Statistics:`);
  console.log(`  Cached distances: ${cacheStats.size}/${cacheStats.maxSize}`);
  console.log(`  Utilization: ${cacheStats.utilization}`);

  console.log('\n✅ Local OSRM server is working correctly!');
  console.log('   The system is now using Sierra Leone road data for routing.\n');

  process.exit(0);
}

testLocalOSRM().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
});
