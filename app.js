const appState = {
  currentDate: new Date(),
  selectedDate: new Date(),
  reportData: null,
  filteredData: [],
  sortOrder: 'rack',
  rackFilter: 'all',
  hideZero: true
};

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// DOM Elements
const dateInput = document.getElementById('dateInput');
const calendarToggle = document.getElementById('calendarToggle');
const calendarPopover = document.getElementById('calendarPopover');
const calendarLabel = document.getElementById('calendarLabel');
const calendarDays = document.getElementById('calendarDays');
const prevMonth = document.getElementById('prevMonth');
const nextMonth = document.getElementById('nextMonth');
const storeCodeInput = document.getElementById('storeCode');
const generateReportBtn = document.getElementById('generateReportBtn');
const reportTableBody = document.getElementById('reportTableBody');
const sortControl = document.querySelectorAll('.sort-btn');
const rackFilter = document.getElementById('rackFilter');
const hideZeroToggle = document.getElementById('hideZeroToggle');
const downloadExcelBtn = document.getElementById('downloadExcelBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const historyBtn = document.getElementById('historyBtn');
const statusBanner = document.getElementById('statusBanner');

document.addEventListener('DOMContentLoaded', () => {
  initializeDatePicker();
  setupEventListeners();
});

function initializeDatePicker() {
  const today = new Date();
  appState.currentDate = new Date(today);
  appState.selectedDate = new Date(today);
  updateDateInput();
  renderCalendar();
}

function updateDateInput() {
  const d = appState.selectedDate;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  dateInput.value = `${day}-${month}-${year}`;
}

function renderCalendar() {
  const year = appState.currentDate.getFullYear();
  const month = appState.currentDate.getMonth();
  const monthName = MONTH_NAMES_ID[month];
  calendarLabel.textContent = `${monthName} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  calendarDays.innerHTML = '';

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = prevMonthDays - i;
    btn.classList.add('inactive');
    btn.disabled = true;
    calendarDays.appendChild(btn);
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = day;

    const btnDate = new Date(year, month, day);
    const isSelected = btnDate.getDate() === appState.selectedDate.getDate() &&
      btnDate.getMonth() === appState.selectedDate.getMonth() &&
      btnDate.getFullYear() === appState.selectedDate.getFullYear();

    if (isSelected) btn.classList.add('selected');

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      appState.selectedDate = new Date(year, month, day);
      updateDateInput();
      renderCalendar();
      calendarPopover.classList.add('hidden');
    });

    calendarDays.appendChild(btn);
  }

  // Next month days
  const totalCells = calendarDays.children.length;
  const remainingCells = 42 - totalCells;

  for (let day = 1; day <= remainingCells; day++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = day;
    btn.classList.add('inactive');
    btn.disabled = true;
    calendarDays.appendChild(btn);
  }
}

function setupEventListeners() {
  // Calendar toggle
  calendarToggle.addEventListener('click', (e) => {
    e.preventDefault();
    calendarPopover.classList.toggle('hidden');
  });

  // Close calendar on outside click
  document.addEventListener('click', (e) => {
    const dateField = document.querySelector('.date-field-group');
    if (dateField && !dateField.contains(e.target)) {
      calendarPopover.classList.add('hidden');
    }
  });

  // Calendar navigation
  prevMonth.addEventListener('click', (e) => {
    e.preventDefault();
    appState.currentDate.setMonth(appState.currentDate.getMonth() - 1);
    renderCalendar();
  });

  nextMonth.addEventListener('click', (e) => {
    e.preventDefault();
    appState.currentDate.setMonth(appState.currentDate.getMonth() + 1);
    renderCalendar();
  });

  // Generate report
  generateReportBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const storeCode = storeCodeInput.value.trim();
    if (!storeCode || !dateInput.value.trim()) {
      showBanner('error', 'Kode Toko dan Tanggal SO wajib diisi');
      return;
    }

    showBanner('empty', 'Memuat data...');
    setTimeout(() => {
      loadDummyData(storeCode);
      updateMetadata();
      filterAndRenderTable();
      hideBanner();
    }, 500);
  });

  // Sort buttons
  sortControl.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      sortControl.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.sortOrder = btn.getAttribute('data-sort');
      filterAndRenderTable();
    });
  });

  // Rack filter
  rackFilter.addEventListener('change', (e) => {
    appState.rackFilter = e.target.value;
    filterAndRenderTable();
  });

  // Hide zero toggle
  hideZeroToggle.addEventListener('change', (e) => {
    appState.hideZero = e.target.checked;
    filterAndRenderTable();
  });

  // Download buttons
  downloadExcelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleDownloadExcel();
  });

  downloadPdfBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleDownloadPdf();
  });

  // Admin login
  adminLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showModal('adminModal');
  });

  // History button
  historyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showModal('historyModal');
  });

  // Modal close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = btn.getAttribute('data-close');
      hideModal(modalId);
    });
  });

  // Modal form submissions
  const adminForm = document.getElementById('adminForm');
  if (adminForm) {
    adminForm.addEventListener('submit', (e) => {
      e.preventDefault();
      hideModal('adminModal');
      showBanner('success', 'Login admin berhasil');
    });
  }

  const historyForm = document.getElementById('historyForm');
  if (historyForm) {
    historyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      hideModal('historyModal');
      showBanner('success', 'Riwayat laporan berhasil dibuka');
    });
  }
}

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('hidden');
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
}

function showBanner(type, message) {
  statusBanner.className = `status-banner ${type || ''}`.trim();
  statusBanner.textContent = message;
  statusBanner.classList.remove('hidden');
}

function hideBanner() {
  statusBanner.classList.add('hidden');
}

function loadDummyData(storeCode) {
  const items = [
    { plu: 403418, namaBarang: 'CADBURY DM CASHEW NUT 52G', rack: 'HA3', stockFisik: 6, stockOnhand: 6, selisihRupiah: -12566.84 },
    { plu: 109481, namaBarang: 'SILVER QUEEN CHUNKY WHT 82G', rack: 'HA3', stockFisik: 7, stockOnhand: 8, selisihRupiah: 19250.71 },
    { plu: 230258, namaBarang: 'SILVER QUEEN CHUNKY CSW 26G', rack: 'HA3', stockFisik: 13, stockOnhand: 13, selisihRupiah: -7038.91 },
    { plu: 411652, namaBarang: 'CADBURY DM CASHEW NUT 85G', rack: 'HA4', stockFisik: 0, stockOnhand: 0, selisihRupiah: -35298.5 },
    { plu: 120595, namaBarang: 'CADBURY DAIRY MILK 22G', rack: 'HA4', stockFisik: 7, stockOnhand: 8, selisihRupiah: 6655.7 },
    { plu: 131418, namaBarang: 'MENTOS FRUIT ROLL 37G', rack: 'HA4', stockFisik: 9, stockOnhand: 9, selisihRupiah: 3003.24 },
    { plu: 423911, namaBarang: 'CHUPACHUPS MELODY POPS 15G', rack: 'HA4', stockFisik: 12, stockOnhand: 12, selisihRupiah: 6765.0 },
    { plu: 429453, namaBarang: 'CHUPA CHUPS SURPRISE AST 12G', rack: 'HA4', stockFisik: 3, stockOnhand: 3, selisihRupiah: -9199.89 },
    { plu: 431475, namaBarang: 'CADBURY DAIRY MILK 85G', rack: 'HA4', stockFisik: 6, stockOnhand: 6, selisihRupiah: 35303.62 },
    { plu: 451006, namaBarang: 'CHUPACHUPS BIGBABOL PAINTER 20G', rack: 'HA4', stockFisik: 5, stockOnhand: 5, selisihRupiah: 2061.44 },
    { plu: 466370, namaBarang: 'MENTOS FEELING BERRY ROLL 37.8G', rack: 'HA4', stockFisik: 9, stockOnhand: 9, selisihRupiah: 3003.22 },
    { plu: 141013, namaBarang: 'CHUPACHUPS BIGBABOL FRUTI STK55', rack: 'HA4', stockFisik: 10, stockOnhand: 10, selisihRupiah: 10307.2 },
    { plu: 228753, namaBarang: 'MENTOS GRAPE ROLL 37G', rack: 'HA4', stockFisik: 7, stockOnhand: 7, selisihRupiah: -3003.23 },
    { plu: 408772, namaBarang: 'KOPIKO CANDY BLISTER 32G', rack: 'HA4', stockFisik: 6, stockOnhand: 6, selisihRupiah: 5000.0 },
    { plu: 466605, namaBarang: 'MARI CAFE CAPPUCCINO 35G', rack: 'HA5', stockFisik: 6, stockOnhand: 6, selisihRupiah: 6756.75 },
    { plu: 422923, namaBarang: 'HEXOS MINT 8X2.5G', rack: 'HA5', stockFisik: 12, stockOnhand: 12, selisihRupiah: 11857.45 },
    { plu: 443566, namaBarang: 'FRUTA GUMMY MIX 45G', rack: 'HA5', stockFisik: 6, stockOnhand: 4, selisihRupiah: -3198.19 },
    { plu: 123456, namaBarang: 'SAMPLE ZERO 1', rack: 'HA3', stockFisik: 5, stockOnhand: 5, selisihRupiah: 0 },
    { plu: 234567, namaBarang: 'SAMPLE ZERO 2', rack: 'HA4', stockFisik: 8, stockOnhand: 8, selisihRupiah: 0 },
    { plu: 345678, namaBarang: 'SAMPLE ZERO 3', rack: 'HA5', stockFisik: 9, stockOnhand: 9, selisihRupiah: 0 }
  ];

  items.forEach(item => {
    item.plusMinus = item.stockFisik - item.stockOnhand;
  });

  appState.reportData = {
    reportName: 'PROSENTASE STOCK OPNAME',
    storeCode: storeCode,
    storeName: `ALFAMART ${storeCode} / ${storeCode}${Math.random().toString().slice(2, 11)}`,
    dateSo: dateInput.value,
    soType: 'SO REGULAR TOKO',
    items: items
  };
}

function updateMetadata() {
  if (!appState.reportData) return;

  document.getElementById('metaReport').textContent = appState.reportData.reportName;
  document.getElementById('metaStore').textContent = appState.reportData.storeName;
  document.getElementById('metaSoDate').textContent = appState.reportData.dateSo;
  document.getElementById('metaPrintDate').textContent = formatDateId(new Date());
  document.getElementById('metaSoType').textContent = appState.reportData.soType;

  const racks = [...new Set(appState.reportData.items.map(item => item.rack))].sort();
  rackFilter.innerHTML = '<option value="all">Semua Rack</option>';
  racks.forEach(rack => {
    const option = document.createElement('option');
    option.value = rack;
    option.textContent = rack;
    rackFilter.appendChild(option);
  });
}

function filterAndRenderTable() {
  if (!appState.reportData) return;

  let data = [...appState.reportData.items];

  if (appState.hideZero) {
    data = data.filter(item => item.selisihRupiah !== 0);
  }

  if (appState.rackFilter !== 'all') {
    data = data.filter(item => item.rack === appState.rackFilter);
  }

  switch (appState.sortOrder) {
    case 'rack':
      data.sort((a, b) => a.rack.localeCompare(b.rack));
      break;
    case 'highest':
      data.sort((a, b) => Math.abs(b.selisihRupiah) - Math.abs(a.selisihRupiah));
      break;
    case 'minus-plus':
      data.sort((a, b) => a.selisihRupiah - b.selisihRupiah);
      break;
  }

  appState.filteredData = data;
  renderTable();
  updateSummary();
}

function renderTable() {
  reportTableBody.innerHTML = '';

  if (appState.filteredData.length === 0) {
    const row = reportTableBody.insertRow();
    row.innerHTML = '<td colspan="8" style="text-align:center; color:#9ca3af; padding: 40px 12px;">Tidak ada data yang sesuai dengan filter</td>';
    document.getElementById('totalDiffValue').textContent = 'Rp 0';
    return;
  }

  let totalDiff = 0;

  appState.filteredData.forEach((item, index) => {
    const row = reportTableBody.insertRow();
    const diffClass = item.selisihRupiah < 0 ? 'negative' : item.selisihRupiah > 0 ? 'positive' : 'neutral';
    const signText = item.plusMinus > 0 ? `+${item.plusMinus}` : item.plusMinus;
    totalDiff += item.selisihRupiah;

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.plu}</td>
      <td>${item.namaBarang}</td>
      <td>${item.rack}</td>
      <td>${item.stockFisik}</td>
      <td>${item.stockOnhand}</td>
      <td>${signText}</td>
      <td class="${diffClass}">${formatCurrency(item.selisihRupiah)}</td>
    `;
  });

  document.getElementById('totalDiffValue').textContent = formatCurrency(totalDiff);
  document.getElementById('totalDiffValue').className = 'total-amount ' + (totalDiff < 0 ? 'negative' : totalDiff > 0 ? 'positive' : 'neutral');
}

function updateSummary() {
  if (!appState.reportData) return;

  const totalItemSO = appState.reportData.items.length;
  const totalItemSelisih = appState.reportData.items.filter(item => item.selisihRupiah !== 0).length;
  const percentage = totalItemSO > 0 ? ((totalItemSelisih / totalItemSO) * 100).toFixed(2) : 0;

  document.getElementById('summaryTotalItems').textContent = totalItemSO;
  document.getElementById('summaryMismatchItems').textContent = totalItemSelisih;
  document.getElementById('summaryPercentage').textContent = `${percentage}%`;
}

function handleDownloadExcel() {
  if (!appState.reportData || appState.filteredData.length === 0) {
    showBanner('error', 'Tidak ada data untuk diunduh');
    return;
  }

  const rows = [
    ['LAPORAN PROSENTASE STOCK OPNAME'],
    [],
    ['Report', appState.reportData.reportName],
    ['Toko', appState.reportData.storeName],
    ['Tanggal SO', appState.reportData.dateSo],
    ['Tanggal Cetak', formatDateId(new Date())],
    ['Jenis SO', appState.reportData.soType],
    [],
    ['No', 'PLU', 'Nama Barang', 'Rack', 'Stock Fisik', 'Stock Onhand Toko (Akhir)', 'Plus/Minus', 'Selisih Rupiah']
  ];

  appState.filteredData.forEach((item, index) => {
    rows.push([
      index + 1,
      item.plu,
      item.namaBarang,
      item.rack,
      item.stockFisik,
      item.stockOnhand,
      item.plusMinus,
      item.selisihRupiah
    ]);
  });

  const totalDiff = appState.filteredData.reduce((sum, item) => sum + item.selisihRupiah, 0);
  rows.push(['', '', '', '', '', '', 'TOTAL SELISIH RUPIAH', totalDiff]);

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Laporan SO');
  XLSX.writeFile(workbook, `Laporan_SO_${storeCodeInput.value.trim()}_${dateInput.value}.xlsx`);
  showBanner('success', 'File Excel berhasil diunduh');
}

function handleDownloadPdf() {
  if (!appState.reportData || appState.filteredData.length === 0) {
    showBanner('error', 'Tidak ada data untuk diunduh');
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  pdf.setFontSize(16);
  pdf.text('LAPORAN PROSENTASE STOCK OPNAME', 20, 18);

  pdf.setFontSize(10);
  let y = 28;
  pdf.text(`Report : ${appState.reportData.reportName}`, 20, y);
  y += 6;
  pdf.text(`Toko : ${appState.reportData.storeName}`, 20, y);
  y += 6;
  pdf.text(`Tanggal SO : ${appState.reportData.dateSo}`, 20, y);
  y += 6;
  pdf.text(`Tanggal Cetak : ${formatDateId(new Date())}`, 20, y);
  y += 6;
  pdf.text(`Jenis SO : ${appState.reportData.soType}`, 20, y);

  const tableData = appState.filteredData.map((item, index) => [
    index + 1,
    item.plu,
    item.namaBarang,
    item.rack,
    item.stockFisik,
    item.stockOnhand,
    item.plusMinus,
    formatCurrency(item.selisihRupiah)
  ]);

  pdf.autoTable({
    head: [['No', 'PLU', 'Nama Barang', 'Rack', 'Stock Fisik', 'Stock Onhand', 'Plus/Minus', 'Selisih Rupiah']],
    body: tableData,
    startY: y + 10,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] }
  });

  pdf.save(`Laporan_SO_${storeCodeInput.value.trim()}_${dateInput.value}.pdf`);
  showBanner('success', 'File PDF berhasil diunduh');
}

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function formatDateId(date) {
  const day = date.getDate();
  const month = MONTH_NAMES_ID[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
