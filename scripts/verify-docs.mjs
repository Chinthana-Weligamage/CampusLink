import { existsSync } from 'node:fs';
import { join } from 'node:path';

const requiredFiles = [
  'docs/ARCHITECTURE.md',
  'docs/API_CATALOG.md',
  'docs/TEAM_CONTRIBUTIONS.md',
  'docs/SCREENSHOT_CHECKLIST.md',
  'docs/DEMO_SCRIPT.md',
  'docs/contracts/notification-event-contract.md',
  'docs/slides/01-domain-and-scope.md',
  'docs/slides/02-user-service.md',
  'docs/slides/03-transport-service.md',
  'docs/slides/04-assignment-service.md',
  'docs/slides/05-notification-service.md',
  'docs/slides/06-api-gateway.md',
  'docs/slides/07-team-contributions.md'
];

const missing = requiredFiles.filter((file) => !existsSync(join(process.cwd(), file)));

if (missing.length > 0) {
  console.error('Missing documentation files:');
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log(`Documentation check passed for ${requiredFiles.length} files.`);
