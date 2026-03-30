const { getDb } = require('./connection');

function seed() {
  const db = getDb();
  const routeCount = db.prepare('SELECT COUNT(*) AS count FROM routes').get().count;

  if (routeCount === 0) {
    const insertRoute = db.prepare('INSERT INTO routes (id, name, origin, destination) VALUES (?, ?, ?, ?)');
    const routes = [
      ['RTE-001', 'Kottawa Express', 'Kottawa', 'SLIIT Malabe'],
      ['RTE-002', 'Makumbura Shuttle', 'Makumbura', 'SLIIT Malabe'],
      ['RTE-003', 'Kaduwela Connector', 'Kaduwela', 'SLIIT Malabe'],
      ['RTE-004', 'Battaramulla Line', 'Battaramulla', 'SLIIT Malabe']
    ];

    for (const [id, name, origin, destination] of routes) {
      insertRoute.run(id, name, origin, destination);
    }
  }

  const scheduleCount = db.prepare('SELECT COUNT(*) AS count FROM schedules').get().count;

  if (scheduleCount === 0) {
    const routes = db.prepare('SELECT * FROM routes').all();
    const insertSchedule = db.prepare(`
      INSERT INTO schedules (
        id, routeId, departureTime, arrivalTime, travelDate, totalSeats, availableSeats, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    let scheduleNumber = 1;

    for (const route of routes) {
      insertSchedule.run(
        `SCH-${String(scheduleNumber++).padStart(3, '0')}`,
        route.id,
        '07:30',
        '08:15',
        '2026-03-30',
        40,
        40,
        'scheduled'
      );

      insertSchedule.run(
        `SCH-${String(scheduleNumber++).padStart(3, '0')}`,
        route.id,
        '16:30',
        '17:15',
        '2026-03-30',
        40,
        40,
        'scheduled'
      );
    }
  }
}

module.exports = {
  seed
};
