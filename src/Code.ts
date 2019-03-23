// 型定義
var webhookURL: string = "https://hooks.slack.com/services/xxxxxxxxxxxxxxxxxxxxxxxxxxx";
var username: string = "weather-bot";  // 通知時に表示されるユーザー名
var icon: string = ":hatching_chick:";  // 通知時に表示されるアイコン
// var datas: object[] = [
//     { 'place': '練馬', 'url': 'https://tenki.jp/amedas/3/16/44071.html' },
//     { 'place': '東京', 'url': 'https://tenki.jp/amedas/3/16/44132.html' }
// ];


function alert(): void {
    var message = scrape("練馬", "https://tenki.jp/amedas/3/16/44071.html");

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

    if (message !== 'fine') {
        UrlFetchApp.fetch(webhookURL, options);
    }
}

function scrape(place: string, url: string): string {
    Logger.log(place);
    var resHTML = UrlFetchApp.fetch(url).getContentText();

    var regPrecipitation = /<li>.*10分値.*mm<\/li>/;
    var precipitationTag = resHTML.match(regPrecipitation)!;
    var precipitation = precipitationTag.toString().match(/\d*\.\d*/)![0];

    var regDate = /<time.*現在<\/time>/;
    var dateTag = resHTML.match(regDate)!;
    var date = dateTag.toString().match(/\d*日\d*:\d*現在/)![0];

    Logger.log(precipitation);

    if (precipitation !== '0.0') {
        return (place + ': (' + date + ') 降水量 ' + precipitation + 'mm');
    }

    else if (precipitation === '0.0') {
        return 'fine';
    }

    else {
        return 'err';
    }
}