const { getDb } = require('./connection');
const { createId } = require('../utils/id');

function seed() {
  const db = getDb();
  const routeCount = db.prepare('SELECT COUNT(*) AS count FROM routes').get().count;

  if (routeCount === 0) {
    const insertRoute = db.prepare('INSERT INTO routes (id, name, origin, destination) VALUES (?, ?, ?, ?)');
    const routes = [
      ['Kottawa Express', 'Kottawa', 'SLIIT Malabe'],
      ['Makumbura Shuttle', 'Makumbura', 'SLIIT Malabe'],
      ['Kaduwela Connector', 'Kaduwela', 'SLIIT Malabe'],
      ['Battaramulla Line', 'Battaramulla', 'SLIIT Malabe']
    ];

    for (const [name, origin, destination] of routes) {
      insertRoute.run(createId('RTE'), name, origin, destination);
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

    for (const route of routes) {
      insertSchedule.run(
        createId('SCH'),
        route.id,
        '07:30',
        '08:15',
        '2026-03-30',
        40,
        40,
        'scheduled'
      );

      insertSchedule.run(
        createId('SCH'),
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
