const { AppError } = require('./response');

async function postInternalEvent(baseUrl, token, event, logger) {
  const response = await fetch(`${baseUrl}/internal/events`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify(event)
  });

  if (!response.ok) {
    const body = await response.text();

    if (logger) {
      logger.warn('internal_event_failed', {
        status: response.status,
        body,
        eventType: event.eventType
      });
    }

    throw new AppError(502, 'INTERNAL_EVENT_FAILED', 'Failed to deliver internal event', {
      status: response.status,
      body
    });
  }

  if (logger) {
    logger.info('internal_event_sent', {
      eventType: event.eventType,
      userId: event.userId
    });
  }

  return response.json();
}

module.exports = {
  postInternalEvent
};
