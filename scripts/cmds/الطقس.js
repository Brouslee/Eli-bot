const axios = require("axios");
const moment = require("moment-timezone");

function convertFtoC(F) {
    return Math.floor((F - 32) / 1.8);
}

function formatHours(hours) {
    return moment(hours).tz("Africa/Casablanca").format("HH[h]mm[p]");
}

module.exports = {
    config: {
        name: "طقس",
        version: "1.3",
        author: "NTKhang",
        countDown: 5,
        role: 0,
        longDescription: "عرض الطقس الحالي وتوقعات الخمس أيام القادمة بشكل مرتب وواضح",
        category: "أدوات",
        guide: "{pn} <اسم المدينة>",
        envGlobal: {
            weatherApiKey: "d7e795ae6a0d44aaa8abb1a0a7ac19e4"
        }
    },

    langs: {
        ar: {
            syntaxError: "▸ ◉ خطأ في الإدخال\n│ يرجى إدخال اسم المدينة",
            notFound: "▸ ◉ لم يتم العثور على المدينة\n│ الاسم المعطى: %1",
            error: "▸ ◉ حدث خطأ\n│ %1",
            today: "▸ ◉ الطقس اليوم في %1\n│ الحالة: %2\n│ 🌡 درجة الحرارة: %3°C - %4°C\n│ 🌡 الإحساس: %5°C - %6°C\n│ 🌅 شروق الشمس: %7\n│ 🌄 غروب الشمس: %8\n│ 🌃 طلوع القمر: %9\n│ 🏙️ نزول القمر: %10\n│ 🌞 النهار: %11\n│ 🌙 الليل: %12"
        }
    },

    onStart: async function ({ args, message, envGlobal, getLang }) {
        const apikey = envGlobal.weatherApiKey;
        const area = args.join(" ");
        if (!area) return message.reply(getLang("syntaxError"));

        let areaKey, dataWeather, areaName;

        try {
            const response = (await axios.get(`https://api.accuweather.com/locations/v1/cities/search.json?q=${encodeURIComponent(area)}&apikey=${apikey}&language=ar`)).data;
            if (response.length == 0) return message.reply(getLang("notFound", area));
            const data = response[0];
            areaKey = data.Key;
            areaName = data.LocalizedName;
        } catch (err) {
            return message.reply(getLang("error", err.response?.data?.Message || err.message));
        }

        try {
            dataWeather = (await axios.get(`http://api.accuweather.com/forecasts/v1/daily/10day/${areaKey}?apikey=${apikey}&details=true&language=ar`)).data;
        } catch (err) {
            return message.reply(getLang("error", err.response?.data?.Message || err.message));
        }

        const today = dataWeather.DailyForecasts[0];

        const msg = getLang("today",
            areaName,
            dataWeather.Headline.Text,
            convertFtoC(today.Temperature.Minimum.Value),
            convertFtoC(today.Temperature.Maximum.Value),
            convertFtoC(today.RealFeelTemperature.Minimum.Value),
            convertFtoC(today.RealFeelTemperature.Maximum.Value),
            formatHours(today.Sun.Rise),
            formatHours(today.Sun.Set),
            formatHours(today.Moon.Rise),
            formatHours(today.Moon.Set),
            today.Day.LongPhrase,
            today.Night.LongPhrase
        );

        return message.reply(msg);
    }
};