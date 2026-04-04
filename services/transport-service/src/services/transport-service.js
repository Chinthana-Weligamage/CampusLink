const { AppError, postInternalEvent } = require('@campuslink/shared');
const { env } = require('../config/env');
const {
  cancelBooking,
  createAnnouncement,
  createBooking,
  getRouteById,
  listBookingsByUser,
  listRoutes,
  listSchedulesByRouteId
} = require('../repositories/transport-repository');
const { createId } = require('../utils/id');

async function emitEvent(event, logger) {
  try {
    await postInternalEvent(env.notificationServiceUrl, env.internalServiceToken, event, logger);
  } catch (error) {
    logger.warn('notification_emit_skipped', {
      eventType: event.eventType,
      reason: error.message
    });
  }
}

function getRoutes() {
  return listRoutes();
}

function getSchedules(routeId) {
  return listSchedulesByRouteId(routeId);
}

async function bookSeat(user, payload, logger) {
  const createdAt = new Date().toISOString();
  const booking = createBooking({
    id: createId('BKG'),
    scheduleId: payload.scheduleId,
    userId: user.sub,
    status: 'confirmed',
    createdAt
  });

  await emitEvent({
    eventType: 'transport.booking.created',
    sourceService: 'transport-service',
    userId: user.sub,
    title: 'Shuttle booking confirmed',
    message: `Your shuttle booking for ${booking.routeName} at ${booking.departureTime} is confirmed.`,
    payload: {
      bookingId: booking.id,
      scheduleId: booking.scheduleId
    },
    occurredAt: createdAt
  }, logger);

  return booking;
}

function getUserBookings(userId) {
  return listBookingsByUser(userId);
}

async function cancelUserBooking(bookingId, user, logger) {
  const booking = cancelBooking(bookingId, user.sub);

  await emitEvent({
    eventType: 'transport.booking.cancelled',
    sourceService: 'transport-service',
    userId: user.sub,
    title: 'Shuttle booking cancelled',
    message: `Your booking for ${booking.routeName} at ${booking.departureTime} was cancelled.`,
    payload: {
      bookingId: booking.id
    },
    occurredAt: booking.cancelledAt
  }, logger);

  return booking;
}

async function publishAnnouncement(user, payload, logger) {
  if (payload.routeId && !getRouteById(payload.routeId)) {
    throw new AppError(404, 'ROUTE_NOT_FOUND', 'Route not found');
  }

  const announcement = createAnnouncement({
    id: createId('ANN'),
    routeId: payload.routeId,
    targetUserId: payload.targetUserId || user.sub,
    title: payload.title,
    message: payload.message,
    type: payload.type,
    createdBy: user.sub,
    createdAt: new Date().toISOString()
  });

  await emitEvent({
    eventType: 'transport.announcement.created',
    sourceService: 'transport-service',
    userId: announcement.targetUserId,
    title: announcement.title,
    message: announcement.message,
    payload: {
      announcementId: announcement.id,
      routeId: announcement.routeId
    },
    occurredAt: announcement.createdAt
  }, logger);

  return announcement;
}

module.exports = {
  bookSeat,
  cancelUserBooking,
  getRoutes,
  getSchedules,
  getUserBookings,
  publishAnnouncement
};
