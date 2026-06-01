const fetch = global.fetch || require('node-fetch');
(async () => {
  try {
    const res = await fetch('http://localhost:3001/users/auth/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'carlos.mendoza@empresa.com', password: 'admin123' }),
    });
    console.log('status:', res.status);
    console.log('body:', await res.text());
  } catch (error) {
    console.error('error', error);
    process.exit(1);
  }
})();
