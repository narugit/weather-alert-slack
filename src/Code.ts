// 型定義
var webhookURL: string = "https://hooks.slack.com/services/xxxxxxxxxxxxxxxxxxxxxxxxxxx";
var username: string = "weather-bot";  // 通知時に表示されるユーザー名
var icon: string = ":rain_cloud:";  // 通知時に表示されるアイコン
var datas: any = [
    { "place": "練馬", "url": "https://tenki.jp/amedas/3/16/44071.html" },
    { "place": "東京", "url": "https://tenki.jp/amedas/3/16/44132.html" }
];


function alert(message: string): void {
    var jsonData: any =
    {
        "username": username,
        "icon_emoji": icon,
        "text": message
    };

    var payload: string = JSON.stringify(jsonData);

    var options: any =
    {
        "method": "post",
        "contentType": "application/json",
        "payload": payload
    };

    UrlFetchApp.fetch(webhookURL, options);
}

function CheckRain() {
    Object.keys(datas).forEach(function (key) {
        var message: string = scrape(datas[key].place, datas[key].url);
        if (message !== "fine") {
            alert(message);
        }
    });
}

function NoticeError(err: string, logResHTML: string, logPrecipitationTag: any, logPrecipitation: any): void {
    var jsonData: any =
    {
        "username": username,
        "icon_emoji": icon,
        "text": "\n********************************\n" +
            "error message: \n" + err +
            "\n********************************\n" +
            "HTML: \n" + logResHTML +
            "\n********************************\n" +
            "precipitationTag: \n" + logPrecipitationTag +
            "\n********************************\n" +
            "precipitation: \n" + logPrecipitation +
            "\n********************************\n"
    };

    var payload: string = JSON.stringify(jsonData);

    var options: any =
    {
        "method": "post",
        "contentType": "application/json",
        "payload": payload
    };

    UrlFetchApp.fetch(webhookURL, options);
}

function scrape(place: string, url: string): string {
    var resHTML = UrlFetchApp.fetch(url).getContentText();

    var regPrecipitation = /<li>.*10分値.*mm<\/li>/;
    var precipitationTag;
    var precipitation = "";

    try {
        precipitationTag = resHTML.match(regPrecipitation)!;
        precipitation = precipitationTag.toString().match(/\d*\.\d*/)![0];
    }
    catch (e) {
        NoticeError(e, resHTML, precipitationTag, precipitation);
    }

    var regDate = /<time.*現在<\/time>/;
    var dateTag = resHTML.match(regDate)!;
    var date = dateTag.toString().match(/\d*日\d*:\d*現在/)![0];

    Logger.log(precipitation);

    if (precipitation !== "0.0") {
        return (place + ": (" + date + ") 降水量 " + precipitation + "mm");
    }

    else if (precipitation === "0.0") {
        return "fine";
    }

    else {
        return "err";
    }
}