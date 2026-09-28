import { runPrintfulMappingAudit } from '@/lib/printful/audit';

const isStagingRunner =
  process.env.VERCEL_ENV === 'preview' &&
  process.env.VERCEL_GIT_COMMIT_REF === 'stripe-printful-migration-audit' &&
  process.env.VERCEL_GIT_REPO_OWNER === 'illustratedalex' &&
  process.env.VERCEL_GIT_REPO_SLUG === 'shittytees';

if (!isStagingRunner) {
  throw new Error('printful:audit is restricted to the Shitty Tees staging preview branch');
}

runPrintfulMappingAudit()
  .then((report) => console.log(JSON.stringify(report, null, 2)))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'Printful audit failed');
    process.exit(1);
  });
