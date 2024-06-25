//VARIABEL
const Variabel_element = {
    getTimeHtml: document.querySelectorAll('.my-5 :nth-child(2)'),
    getTrHtml: document.querySelectorAll('.my-5 > div'),
    labelTanggal: document.getElementById('tgl'),
    display: document.querySelector('.display'),
    kota: document.getElementById('h1kota'),
    container_select_city: document.querySelector('.select-city-container'),
    select_city: document.getElementById('select-city'),
    search_city: document.getElementById('search-city')
}

const Variabel_js = {
    hari: ['Minggu',
        'Senin',
        'Selasa',
        'Rabu',
        'Kamis',
        'Jum\'at',
        'Sabtu'],
    bulan: ['Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember']
}



//EVENT LISTENER
Variabel_element.kota.addEventListener('click', () => {
    search_city()
    search()
})




//STORAGE
const Local_storage = {
    getId: () => localStorage.getItem('city') || 1301,
    setId: (data) => {
        localStorage.setItem('city', data)
        fetchAPI()
    },
    getData: () => {
        let data = JSON.parse(localStorage.getItem('prayer'))

        if ((data && new Date(Local_storage.getDate()).getDate() != new Date().getDate()) || !data) {
            fetchAPI()
        }
        return JSON.parse(localStorage.getItem('prayer'))
    },
    setData: (data) => {
        localStorage.setItem('prayer', `
            {
            "imsak": "${data.imsak}",
            "subuh": "${data.subuh}",
            "terbit": "${data.terbit}",
            "dzuhur": "${data.dzuhur}",
            "ashar": "${data.ashar}",
            "maghrib": "${data.maghrib}",
            "isya": "${data.isya}"
            }`);
    },
    getLocId: () => {
        const data = JSON.parse(localStorage.getItem('locId'))
        if (!data) {
            fetch('https://api.myquran.com/v2/sholat/kota/semua')
            .then(x => x.json()).then(result => {

                if(result.data) {
                    localStorage.setItem('locId', JSON.stringify(result.data))
                    window.location.reload()
                }
            })
        }
        return data
    },
    setLocation: (data) => localStorage.setItem('location', data),
    getLocation: () => localStorage.getItem('location'),
    setDate: (data) => localStorage.setItem('date', data),
    getDate: () => localStorage.getItem('date')
}

function fetchAPI() {
    fetch(`https://api.myquran.com/v2/sholat/jadwal/${Local_storage.getId()}/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`)
    .then(x => x.json())
    .then(i => {
        const root = i.data.jadwal

        const data_dummy = {
            imsak: root.imsak,
            subuh: root.subuh,
            terbit: root.terbit,
            dzuhur: root.dzuhur,
            ashar: root.ashar,
            maghrib: root.maghrib,
            isya: root.isya
        }

        Local_storage.setData(data_dummy)
        Local_storage.setLocation(i.data.lokasi)
        Local_storage.setDate(i.data.jadwal.date)
        location.reload()
    })
}



//FUNCTION
///DOM
function innerHTMLTop() {
    Local_storage.getLocId()
    const data = Local_storage.getData()

    if (data) {
        const dateLS = new Date(Local_storage.getDate());
        const makeDateNow = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 7);

        Object.values(data).forEach((x, i) => {
            Variabel_element.getTimeHtml[i].innerHTML = x
        })

        Variabel_element.labelTanggal.innerHTML = `${Variabel_js.hari[dateLS.getDay()]}, ${dateLS.getDate()} ${Variabel_js.bulan[dateLS.getMonth()]} ${dateLS.getFullYear()}`;

        Variabel_element.kota.innerHTML = Local_storage.getLocation()

        if (makeDateNow.getTime() == dateLS.getTime()) {
            Variabel_element.labelTanggal.style.color = '#9BFF34'
        }

        innerHTMLBot(data)
        setInterval(() => innerHTMLBot(data), 7500)

    }
}

function innerHTMLBot(data) {

    const extractOBJ = Object.entries(data)

    const getTime = extractOBJ
    .map(e => {
        return [e[0], new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), parseInt(e[1].substring(0, 2)), parseInt(e[1].substring(3, 5)), new Date().getSeconds(), new Date().getMilliseconds()).getTime()]
    })
    .sort((x, y) => x[1] - y[1])

    const nexTime = getTime.find(e => e[1] > Date.now()) || ['imsak',
        getTime[0][1] + 86400000]

    const result = convertToHours(nexTime[1] - Date.now())

    Variabel_element.display.innerHTML = `${result.trim()} ${result.trim() ? 'Lagi Menuju': 'Sekarang Waktu'} ${nexTime[0].replace(nexTime[0][0], nexTime[0][0].toUpperCase())}`

}

function search_city() {
    const container = document.createElement('div')
    container.classList.add('select-city-container')
    document.body.insertBefore(container, document.getElementById('top'))

    const input = document.createElement('input')
    input.type = 'text'
    input.classList.add('search-city')
    input.id = "search-city"
    input.placeholder = "Cari Nama Kota"
    input.autocomplete = "off"
    container.appendChild(input)

    input.addEventListener('input', () => {
        search()
    })

    const select = document.createElement('div')
    select.id = "select-city"
    select.classList.add('select-city')
    container.appendChild(select)

    const close = document.createElement('div')
    close.classList.add('btn-close')
    close.classList.add('bi-x-circle-fill')
    close.id = 'btn-close'
    container.appendChild(close)
}


///LOGIC
function convertToHours(jarak) {
    const time = jarak / 3.6e+6
    const jam = ~~time
    const menit = ~~((time - jam) * 60);

    return `${jam != 0 ? jam + ' Jam': ''} ${menit != 0 ? menit + ' Menit': ''}`
}

function search() {

    const select_city_container = document.querySelector('.select-city-container')

    const search_city = document.getElementById('search-city')
    const select_city = document.getElementById('select-city')
    const close = document.getElementById('btn-close')

    close.addEventListener('click', () => {
        select_city_container.remove()
    })

    const result = Local_storage.getLocId().filter(x => x.lokasi.toLowerCase().includes(search_city.value.toLowerCase()))

    select_city.innerHTML = ''
    
    if (!result.length) {
        const p = document.createElement('p');
        p.innerText = 'Tidak Ada Hasil'
        select_city.appendChild(p)
    } else {
        result.forEach((x, i) => {
            let tag = document.createElement('p');
            tag.innerText = x.lokasi
            tag.value = x.id

            tag.addEventListener('click', function() {
                Local_storage.setId(this.value)
            })
            select_city.appendChild(tag)
        })
    }
}



innerHTMLTop()
