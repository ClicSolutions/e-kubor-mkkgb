const map = L.map('map').setView([2.936, 101.698], 17);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const markers = [];

async function loadData() {
  const res = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQInz5SadmPwbADdecXdpcz1PDMzqVnKhXsFxNAXrbUBo8iWXWyIAOSb8hpsejlVOOT9Rxxd20hDHgZ/pub?output=csv');
  const text = await res.text();
  const data = text.split('\n').slice(1).map(line => {
    const [nama, tarikh, lat, lng, url] = line.split(',');
    return { nama, tarikh, lat: parseFloat(lat), lng: parseFloat(lng), url };
  });
  return data;
}

loadData().then(data => {
  data.forEach(entry => {
    const marker = L.marker([entry.lat, entry.lng], { title: entry.nama }).addTo(map);
    marker.bindPopup(`
      <div>
        <b>${entry.nama}</b><br>
        ${entry.tarikh}<br>
        <div id="qr-${entry.nama.replace(/\s+/g, '')}"></div>
      </div>
    `).on('popupopen', () => {
      const qrid = `qr-${entry.nama.replace(/\s+/g, '')}`;
      QRCode.toCanvas(document.getElementById(qrid), entry.url, { width: 100 });
    });
    markers.push(marker);
  });
});

document.getElementById('search').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  markers.forEach(m => {
    const match = m.options.title.toLowerCase().includes(q);
    if (match) m.addTo(map);
    else map.removeLayer(m);
  });
});
