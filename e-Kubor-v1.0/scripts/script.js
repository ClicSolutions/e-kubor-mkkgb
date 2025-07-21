const map = L.map('map').setView([2.936, 101.698], 17);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const markers = [];

async function loadKuburData() {
  const res = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQInz5SadmPwbADdecXdpcz1PDMzqVnKhXsFxNAXrbUBo8iWXWyIAOSb8hpsejlVOOT9Rxxd20hDHgZ/pub?output=csv');
  const csv = await res.text();
  return csv.split('\n').slice(1).map(line => {
    const [nama, tarikh, lat, lng, url] = line.split(',');
    return { nama, tarikh, lat: parseFloat(lat), lng: parseFloat(lng), url };
  });
}

loadKuburData().then(data => {
  if (data.length === 0) {
    alert('Tiada data kubur ditemui.');
    return;
  }

  data.forEach(e => {
    const m = L.marker([e.lat, e.lng], { title: e.nama }).addTo(map);
    m.bindPopup(`
      <div style="text-align:center;">
        <b>${e.nama}</b><br>${e.tarikh}<br>
        <canvas id="qr-${e.nama.replace(/\s+/g, '')}"></canvas>
      </div>
    `).on('popupopen', () => {
      const id = `qr-${e.nama.replace(/\s+/g, '')}`;
      QRCode.toCanvas(document.getElementById(id), e.url, { width: 100 });
    });
    markers.push(m);
  });
});

document.getElementById('search').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  markers.forEach(m => {
    if (m.options.title.toLowerCase().includes(q)) m.addTo(map);
    else m.remove();
  });
});
