const clients = new Map();

function addClient(userId, res) {
  const existing = clients.get(userId) || new Set();
  existing.add(res);
  clients.set(userId, existing);
}

function removeClient(userId, res) {
  const existing = clients.get(userId);

  if (!existing) {
    return;
  }

  existing.delete(res);

  if (existing.size === 0) {
    clients.delete(userId);
  }
}

function pushEvent(userId, eventName, data, logger) {
  const recipients = clients.get(userId);

  if (!recipients) {
    return 0;
  }

  for (const res of recipients) {
    res.write(`id: ${data.id || Date.now()}\n`);
    res.write(`event: ${eventName}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  if (logger) {
    logger.info('sse_push_sent', {
      userId,
      eventName,
      recipientCount: recipients.size
    });
  }

  return recipients.size;
}

function getClientCount(userId) {
  return clients.get(userId)?.size || 0;
}

module.exports = {
  addClient,
  getClientCount,
  pushEvent,
  removeClient
};
