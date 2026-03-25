const { sendSuccess } = require('@campuslink/shared');
const transportService = require('../services/transport-service');

function health(req, res) {
  return sendSuccess(res, {
    service: 'transport-service',
    status: 'ok',
    time: new Date().toISOString()
  });
}

function getRoutes(req, res, next) {
  try {
    return sendSuccess(res, transportService.getRoutes());
  } catch (error) {
    return next(error);
  }
}

function getSchedules(req, res, next) {
  try {
    return sendSuccess(res, transportService.getSchedules(req.params.routeId));
  } catch (error) {
    return next(error);
  }
}

async function createBooking(req, res, next) {
  try {
    const booking = await transportService.bookSeat(req.auth, req.body, req.logger);
    return sendSuccess(res, booking, 201);
  } catch (error) {
    return next(error);
  }
}

function getBookings(req, res, next) {
  try {
    return sendSuccess(res, transportService.getUserBookings(req.params.userId));
  } catch (error) {
    return next(error);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const booking = await transportService.cancelUserBooking(req.params.bookingId, req.auth, req.logger);
    return sendSuccess(res, booking);
  } catch (error) {
    return next(error);
  }
}

async function createAnnouncement(req, res, next) {
  try {
    const announcement = await transportService.publishAnnouncement(req.auth, req.body, req.logger);
    return sendSuccess(res, announcement, 201);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  cancelBooking,
  createAnnouncement,
  createBooking,
  getBookings,
  getRoutes,
  getSchedules,
  health
};
