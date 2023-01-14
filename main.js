const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
const MinMaxPlugin = require('puppeteer-extra-plugin-minmax')
const { executablePath } = require('puppeteer');
const chrome = require('chrome-cookies-secure');
const { loadFile, getCities, setData } = require('./util/excel');
const chromePath = process.argv[2];

if (chromePath) {
    process.env.PUPPETEER_EXECUTABLE_PATH = chromePath;
}

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
puppeteer.use(MinMaxPlugin());

let host = "https://aun.kr/wiki/index.php";
let regHost = "https://aun.kr/charainfo/";
let cityNames = null;
let ownerIds = [];
const args = ["--window-size=50,50"];
// const args = ["--window-size=800,600"];

const headless = false;
const minimized = true;

async function startApp() {
    let page;
    let $;

    /**
     * Excel(xlsx) Load
     */
    var workbook = await loadFile();
    var worksheet = workbook.getWorksheet("Sheet1")
    cityNames = await getCities(worksheet);

    /**
     * Puppeteer launch
     */
    getCookies(async (cookies) => {
        await puppeteer.launch({ headless, executablePath: executablePath(), args }).then(async browser => {
            page = await browser.newPage();

            await page.minimize();
            await page.setViewport({ width: 800, height: 600 });
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'en'
            });
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36');
            await page.setCookie(...cookies);

            $ = await moveTo(page, host, "#p-banner", minimized);

            for (var i = 0; i < cityNames.length; i++) {
                $ = await moveTo(page, host + encodeURI("/틀:" + cityNames[i].val), "#mw-content-text > div > table > tbody > tr:nth-child(3) > td > a:nth-child(3)", minimized);
                let cityOwner = $("#mw-content-text > div > table > tbody > tr:nth-child(3) > td > a:nth-child(3)").attr();

                $ = await moveTo(page, host + "?title=" + cityOwner.title + "&action=edit", "#p-banner", minimized);

                let text = $("#wpTextbox1").val().split('\n');

                let id = extractText(text.find(getId).split(" = ")[1]);
                let name = extractText(text.find(getName).split(" = ")[1]);

                $ = await moveTo(page, regHost + id, "body > div", minimized);

                let result = $("body > div > center > table > tbody > tr > td > div:nth-child(1) > div.col-md-5 > table > tbody > tr:nth-child(1) > td:nth-child(2)").html();

                result = extractLogin(result);

                if (name.indexOf("<") != -1) {
                    name = name.split("<")[0];
                }

                ownerIds.push({ idx: cityNames[i].idx, id, name, city: cityNames[i].val, result });
            }

            await setData(workbook, worksheet, ownerIds);

            close(browser);

            /**
             * Excel Data Create
             */
        });
    });
}

function extractLogin(el) {
    let startWith = el.indexOf("전 접속");

    if (startWith != -1) {
        let str = el.substring(startWith - 6);
        str = str.split("</span>")[0];
        str = str.split(">")[1];

        return str;
    } else {
        return "접속중";
    }
}

function extractText(el) {
    if (el.substring(0, 1) == "<") {
        const startWith = el.indexOf(">") + 1;
        const endWith = el.substring(startWith).indexOf("<");

        return el.substring(startWith, (startWith + endWith));
    } else {
        return el;
    }
}

function getId(el) {
    if (el.indexOf('| id') == 0) {
        return true;
    }
}

function getName(el) {
    if (el.indexOf('| name') == 0) {
        return true;
    }
}

const getCookies = (callback) => {
    chrome.getCookies(host, 'puppeteer', function (err, cookies) {
        if (err) {
            console.error("err = ", err);
            return
        }
        callback(cookies);
    }, 'Default') // e.g. 'Profile 2'
}

async function moveTo(page, url, waitFor, minimize) {
    await page.goto(url);

    if (minimize) {
        await page.minimize();
    }

    if (typeof waitFor == 'number') {
        await page.waitForTimeout(waitFor);
    } else if (typeof waitFor === 'string') {
        if (waitFor.substring(0, 1) == "/") {
            // TODO XPATH
            await page.waitForXPath(waitFor);
        } else {
            // TODO Selector
            await page.waitForSelector(waitFor);
        }
    }

    const content = await page.content();

    return cheerio.load(content);
}

async function close(browser) {
    await browser.close();
}

startApp();