const MasehiDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MasehiMonths = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const masehiTime = new Date().getTime();
const masehiDay = new Date().getDay()
const masehiDate = (new Date().getDate()).toString();
const masehiMonth = (new Date().getMonth() + 1).toString();
const masehiYear = (new Date().getFullYear()).toString();
const masehiFullDate = `${masehiYear}/${masehiMonth.length == 1 ? '0' + masehiMonth : masehiMonth}/${masehiDate.length == 1 ? '0' + masehiDate : masehiDate}`;

const hijriyahTime = new HijriDate().getTime();
const hijriyahDate = new HijriDate().getDate();
const hijriyahMonth = new HijriDate().getMonthName();
const hijriyahYear = new HijriDate().getFullYear();

// Set tanggal masehi dan hijriyah
$('.tanggal .masehi').text(`${MasehiDays[masehiDay]}, ${masehiDate} ${MasehiMonths[masehiMonth-1]} ${masehiYear}`)
$('.tanggal .hijriyah').text(`${hijriyahDate} ${hijriyahMonth} ${hijriyahYear} H`)


// Set lokasi default pada bagian jadwal sholat
let lokasiDefault = JSON.parse(localStorage.getItem('kota-pilihan'));
if (!lokasiDefault) {
   lokasiDefault = {
      name: 'Trenggalek',
      id: 1627
   }
}
$('.kota-pilihan').html(lokasiDefault.name);
$('.kota-pilihan').attr('data-id-kota', lokasiDefault.id);

$.ajax({
   url: `https://api.myquran.com/v2/sholat/jadwal/${lokasiDefault.id}/${masehiFullDate}`,
   success: results => {
      const jadwalSholat = results.data.jadwal;
      $('.imsak').text(jadwalSholat.imsak)
      $('.jadwal.subuh .waktu').text(jadwalSholat.subuh)
      $('.jadwal.terbit .waktu').text(jadwalSholat.terbit)
      $('.jadwal.dhuha .waktu').text(jadwalSholat.dhuha)
      $('.jadwal.dzuhur .waktu').text(jadwalSholat.dzuhur)
      $('.jadwal.ashar .waktu').text(jadwalSholat.ashar)
      $('.jadwal.maghrib .waktu').text(jadwalSholat.maghrib)
      $('.jadwal.isya .waktu').text(jadwalSholat.isya)
   }
});

// Set modal daftar kota
$.ajax({
   url: 'https://api.myquran.com/v2/sholat/kota/semua',
   success: results => {
      const daftarKota = results;
      let fragmentDaftarKota = '';
      daftarKota.forEach(kota => {
         let namaKota = kota.lokasi.split(' ');
         for (let i = 0; i < namaKota.length; i++) {
            namaKota[i] = namaKota[i].toLowerCase();
            namaKota[i] = namaKota[i].replace(namaKota[i][0], namaKota[i][0].toUpperCase())
         }

         fragmentDaftarKota += '            <div class="kota m-0 p-2" data-id-kota="${kota.id}" data-bs-dismiss="modal">
              <h6 class="name m-0" style="font-weight: 400;">${namaKota.join(' ')}</h6>
            </div>'
      });
      $('.daftar-kota .daftar').html(fragmentDaftarKota);

      // Set List.js
      new List('daftar-kota', {
         valueNames: ['name'],
      });

      // Ubah kota pilihan saat daftar kota di klik
      $('.kota').on('click', function () {
         $('.kota-pilihan').html($(this).text())
         $('.kota-pilihan').attr('data-id-kota', $(this).data('idKota'))

         localStorage.setItem('kota-pilihan', JSON.stringify({
            name: $(this).text(),
            id: $(this).data('idKota')
         }))

         gantiJadwalSholatDaerah($(this).data('idKota'), masehiFullDate);
      })
   }
});


// Set hari berikutnya dan hari sebelumnya pada jadwal sholat
let changedHijriyahTime = hijriyahTime;
let changedMasehiTime = masehiTime;
$('.tanggal-wrapper .prev-date').on('click', function () {
   changedHijriyahTime -= 86400000;
   changedMasehiTime -= 86400000;
   const changedHijriyahDate = new HijriDate(changedHijriyahTime).getDate();
   const changedHijriyahMonth = new HijriDate(changedHijriyahTime).getMonthName();
   const changedHijriyahYear = new HijriDate(changedHijriyahTime).getFullYear();

   const changedMasehiDay = (new Date(changedMasehiTime).getDay()).toString();
   const changedMasehiDate = (new Date(changedMasehiTime).getDate()).toString();
   const changedMasehiMonth = (new Date(changedMasehiTime).getMonth() + 1).toString();
   const changedMasehiYear = (new Date(changedMasehiTime).getFullYear()).toString();
   const changedMasehiFullDate = '${changedMasehiYear}/${changedMasehiMonth.length == 1 ? '0' + changedMasehiMonth : changedMasehiMonth}/${changedMasehiDate.length == 1 ? '0' + changedMasehiDate : changedMasehiDate}'

   $('.tanggal .masehi').text('${MasehiDays[changedMasehiDay]}, ${changedMasehiDate} ${MasehiMonths[changedMasehiMonth - 1]} ${changedMasehiYear}')
   $('.tanggal .hijriyah').text('${changedHijriyahDate} ${changedHijriyahMonth} ${changedHijriyahYear} H')

   gantiJadwalSholatDaerah($('.kota-pilihan').data('idKota'), changedMasehiFullDate)
})

$('.tanggal-wrapper .next-date').on('click', function () {
   changedHijriyahTime += 86400000;
   changedMasehiTime += 86400000;

   const changedHijriyahDate = new HijriDate(changedHijriyahTime).getDate();
   const changedHijriyahMonth = new HijriDate(changedHijriyahTime).getMonthName();
   const changedHijriyahYear = new HijriDate(changedHijriyahTime).getFullYear();

   const changedMasehiDay = (new Date(changedMasehiTime).getDay()).toString();
   const changedMasehiDate = (new Date(changedMasehiTime).getDate()).toString();
   const changedMasehiMonth = (new Date(changedMasehiTime).getMonth() + 1).toString();
   const changedMasehiYear = (new Date(changedMasehiTime).getFullYear()).toString();
   const changedMasehiFullDate = '${changedMasehiYear}/${changedMasehiMonth.length == 1 ? '0' + changedMasehiMonth : changedMasehiMonth}/${changedMasehiDate.length == 1 ? '0' + changedMasehiDate : changedMasehiDate}'

   $('.tanggal .masehi').text('${MasehiDays[changedMasehiDay]}, ${changedMasehiDate} ${MasehiMonths[changedMasehiMonth - 1]} ${changedMasehiYear}')
   $('.tanggal .hijriyah').text('${changedHijriyahDate} ${changedHijriyahMonth} ${changedHijriyahYear} H')

   gantiJadwalSholatDaerah($('.kota-pilihan').data('idKota'), changedMasehiFullDate)
})


function gantiJadwalSholatDaerah(idKota, tanggal) {
   console.log(idKota, tanggal);

   $('.jadwal.imsak .waktu').text('-')
   $('.jadwal.subuh .waktu').text('-')
   $('.jadwal.terbit .waktu').text('-')
   $('.jadwal.dhuha .waktu').text('-')
   $('.jadwal.dzuhur .waktu').text('-')
   $('.jadwal.ashar .waktu').text('-')
   $('.jadwal.maghrib .waktu').text('-')
   $('.jadwal.isya .waktu').text('-')

   // Set waktu sholat di kota pilihan
   $.ajax({
      url: 'https://api.myquran.com/v2/sholat/jadwal/${idKota}/${tanggal}',
      success: results => {
         const jadwalSholat = results.data.jadwal;
         $('.imsak').text(jadwalSholat.imsak)
         $('.jadwal.subuh .waktu').text(jadwalSholat.subuh)
         $('.jadwal.terbit .waktu').text(jadwalSholat.terbit)
         $('.jadwal.dhuha .waktu').text(jadwalSholat.dhuha)
         $('.jadwal.dzuhur .waktu').text(jadwalSholat.dzuhur)
         $('.jadwal.ashar .waktu').text(jadwalSholat.ashar)
         $('.jadwal.maghrib .waktu').text(jadwalSholat.maghrib)
         $('.jadwal.isya .waktu').text(jadwalSholat.isya)
      }
   })
}


function copyLink() {
   navigator.clipboard.writeText('https://www.jurnals.com')
}