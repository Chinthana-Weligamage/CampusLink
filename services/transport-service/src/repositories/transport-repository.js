const { AppError } = require('@campuslink/shared');
const { getDb } = require('../db/connection');

function listRoutes() {
  return getDb().prepare('SELECT * FROM routes ORDER BY origin').all();
}

function listSchedulesByRouteId(routeId) {
  return getDb().prepare('SELECT * FROM schedules WHERE routeId = ? ORDER BY departureTime').all(routeId);
}

function getScheduleById(scheduleId) {
  return getDb().prepare(`
    SELECT schedules.*, routes.name AS routeName, routes.origin, routes.destination
    FROM schedules
    JOIN routes ON routes.id = schedules.routeId
    WHERE schedules.id = ?
  `).get(scheduleId);
}

function createBooking(booking) {
  const db = getDb();

  db.exec('BEGIN IMMEDIATE');

  try {
    const schedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(booking.scheduleId);

    if (!schedule) {
      throw new AppError(404, 'SCHEDULE_NOT_FOUND', 'Schedule not found');
    }

    if (schedule.availableSeats <= 0) {
      throw new AppError(409, 'NO_SEATS_AVAILABLE', 'No seats are available for this schedule');
    }

    db.prepare(`
      INSERT INTO bookings (id, scheduleId, userId, status, createdAt, cancelledAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      booking.id,
      booking.scheduleId,
      booking.userId,
      booking.status,
      booking.createdAt,
      null
    );

    db.prepare('UPDATE schedules SET availableSeats = availableSeats - 1 WHERE id = ?').run(booking.scheduleId);
    db.exec('COMMIT');

    return getBookingById(booking.id);
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function listBookingsByUser(userId) {
  return getDb().prepare(`
    SELECT bookings.*, schedules.departureTime, schedules.travelDate, routes.name AS routeName,
           routes.origin, routes.destination
    FROM bookings
    JOIN schedules ON schedules.id = bookings.scheduleId
    JOIN routes ON routes.id = schedules.routeId
    WHERE bookings.userId = ?
    ORDER BY bookings.createdAt DESC
  `).all(userId);
}

function getBookingById(bookingId) {
  return getDb().prepare(`
    SELECT bookings.*, schedules.departureTime, schedules.travelDate, routes.name AS routeName,
           routes.origin, routes.destination
    FROM bookings
    JOIN schedules ON schedules.id = bookings.scheduleId
    JOIN routes ON routes.id = schedules.routeId
    WHERE bookings.id = ?
  `).get(bookingId);
}

function cancelBooking(bookingId, userId) {
  const db = getDb();
  db.exec('BEGIN IMMEDIATE');

  try {
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);

    if (!booking) {
      throw new AppError(404, 'BOOKING_NOT_FOUND', 'Booking not found');
    }

    if (booking.userId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You can only cancel your own bookings');
    }

    if (booking.status === 'cancelled') {
      throw new AppError(409, 'BOOKING_ALREADY_CANCELLED', 'Booking is already cancelled');
    }

    const cancelledAt = new Date().toISOString();

    db.prepare(`
      UPDATE bookings
      SET status = 'cancelled', cancelledAt = ?
      WHERE id = ?
    `).run(cancelledAt, bookingId);

    db.prepare('UPDATE schedules SET availableSeats = availableSeats + 1 WHERE id = ?').run(booking.scheduleId);
    db.exec('COMMIT');

    return getBookingById(bookingId);
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function createAnnouncement(announcement) {
  getDb().prepare(`
    INSERT INTO announcements (id, routeId, targetUserId, title, message, type, createdBy, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    announcement.id,
    announcement.routeId || null,
    announcement.targetUserId || null,
    announcement.title,
    announcement.message,
    announcement.type,
    announcement.createdBy,
    announcement.createdAt
  );

  return getDb().prepare('SELECT * FROM announcements WHERE id = ?').get(announcement.id);
}

module.exports = {
  cancelBooking,
  createAnnouncement,
  createBooking,
  getScheduleById,
  listBookingsByUser,
  listRoutes,
  listSchedulesByRouteId
};
