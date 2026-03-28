const gateway = process.env.GATEWAY_URL || 'http://localhost:8080';

async function expectOk(path, label) {
  const response = await fetch(`${gateway}${path}`);

  if (!response.ok) {
    throw new Error(`${label} failed with ${response.status}`);
  }

  return response;
}

async function main() {
  const targets = [
    ['/', 'gateway root'],
    ['/user/health', 'user health'],
    ['/transport/health', 'transport health'],
    ['/assignment/health', 'assignment health'],
    ['/notification/health', 'notification health']
  ];

  for (const [path, label] of targets) {
    await expectOk(path, label);
  }

  console.log('Basic smoke checks passed.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
