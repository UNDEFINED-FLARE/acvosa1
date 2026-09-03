import { DEMO_MODE, auth } from './config';

if (DEMO_MODE) {
  console.info(
    '%cIRD Connect — Demo Mode',
    'background:#111;color:#fff;padding:4px 12px;border-radius:4px;font-size:13px;'
  );
  console.info('Data is not being saved to Firebase. Configure .env to enable persistence.');
}

export { DEMO_MODE, auth };
