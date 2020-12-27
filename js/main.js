
const getAQILevelDetails = (no) => {
    if (no <= 50) return { level: 'Good', desc: 'Air quality is satisfactory, and air pollution poses little or no risk.', color: 'green' };
    if (no <= 100) return { level: 'Moderate', desc: 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.', color: 'yellow' };
    if (no <= 150) return { level: 'Unhealthy for Sensitive Groups', desc: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.', color: 'orange' };
    if (no <= 200) return { level: 'Unhealthy', desc: 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.', color: 'red' };
    if (no <= 300) return { level: 'Very Unhealthy', desc: 'Health alert: The risk of health effects is increased for everyone.', color: 'purple' };
    return { level: 'Hazardous', desc: 'Health warning of emergency conditions: everyone is more likely to be affected.', color: 'maroon' };
}


const updateScreen = (data) => {
    const location = document.querySelector('.location');
    const pmValues = document.querySelector('.pm-values');
    const aqiElement = document.querySelector('.aqi');
    const levelElement = document.querySelector('.level');
    const aqiDesc = document.querySelector('.aqi-desc');
    const date = new Date(data.lastUpdated);
    location.innerText = `${data.city} - Published at ${date.getHours()}:${date.getMinutes()}`;
    let pmHTML = '';
    let aqi = 0;
    data.measures.forEach((value, key) => {
        if (key === 'pm25' || key === 'pm10') {
            if (value > aqi) aqi = value;
        }
        const colorItem = getAQILevelDetails(Math.floor(value)).color;
        pmHTML = pmHTML + `<div>
        <h4 class="is-marginless" style="color: ${colorItem}">${value}</h4>
        <h6 class="is-marginless text-uppercase is-center">${key}</h6>
    </div>`
    })
    pmValues.innerHTML = pmHTML;
    const flooredAQI = Math.floor(aqi);
    const flooredAQIDetails = getAQILevelDetails(Math.floor(aqi))
    aqiElement.innerText = flooredAQI;
    aqiElement.style.color = flooredAQIDetails.color;
    levelElement.innerText = flooredAQIDetails.level;
    aqiDesc.innerText = flooredAQIDetails.desc
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        // TODO: manual Entry
        const aqiDesc = document.querySelector('.aqi-desc');
        aqiDesc.innerText = "Geolocation is not supported.";
    }
}

const fetchAQI = async (position) => {
    const response = await fetch(`https://api.openaq.org/v1/latest?coordinates=${position.coords.latitude},${position.coords.longitude}&radius=5000&limit=10&order_by=distance`);
    const myJson = await response.json();
    return myJson
}

mostupdatedRecord = (weatherData) => {
    const weatherArray = weatherData.results;
    let updatedWeather = weatherArray[0];
    weatherArray.forEach((e, i) => {
        if (new Date(updatedWeather.measurements[0].lastUpdated) < new Date(e.measurements[0].lastUpdated)) {
            updatedWeather = e;
        }

    });
    console.log(updatedWeather);
}

async function showPosition(position) {
    const weatherData = await fetchAQI(position);
    if (weatherData.results) {
        mostupdatedRecord(weatherData);
        const weather = weatherData.results[1];
        const city = weather.city
        const lastUpdated = weather.measurements[0].lastUpdated;
        const measures = new Map();
        weather.measurements.forEach(element => {
            measures.set(element.parameter, element.value);
        });
        updateScreen({ city, lastUpdated, measures })
    }
    console.log(weatherData);
}


window.onload = () => {
    if (window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark');
    }
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("/serviceWorker.js")
            .then(res => console.log("service worker registered"))
            .catch(err => console.log("service worker not registered", err))

    }
    getLocation()
};