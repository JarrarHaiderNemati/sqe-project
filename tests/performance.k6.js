import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.05'], //Less than 5% requests should fail
    http_req_duration: ['p(95)<2000'], //95% requests should be under 2000ms (2 sec)
  },
};

const BASE_URL = __ENV.APP_URL || 'http://localhost:3000';

export default function () {
  const paths = ['/', '/login', '/signup', '/emergency', '/news'];

  for (const path of paths) {
    const response = http.get(`${BASE_URL}${path}`);

    check(response, {
      [`${path} returns success`]: (res) => res.status >= 200 && res.status < 500,
      [`${path} responds under 2s`]: (res) => res.timings.duration < 2000,
    });
  }

  sleep(1);
}
