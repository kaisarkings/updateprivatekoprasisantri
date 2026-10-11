const fetch = require('node-fetch');

async function test() {
  try {
    const res = await fetch('https://equran.id/api/v2/shalat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provinsi: "Jawa Tengah",
        kabkota: "Kab. Banyumas",
        bulan: 9,
        tahun: 2026
      })
    });
    const data = await res.text();
    console.log(data.substring(0, 500));
  } catch (e) {
    console.error(e);
  }
}
test();
