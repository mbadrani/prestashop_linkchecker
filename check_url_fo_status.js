'use strict';

const puppeteer = require('puppeteer');
require('events').EventEmitter.prototype._maxListeners = Infinity;

let argv = require('minimist')(process.argv.slice(2));

let URLFO = argv.URLFO || 'http://localhost/pshop5.1b1/';

const getAllUrl = async (browser, page) => {

	const hrefs = await page.evaluate(
    () => Array.from(document.body.querySelectorAll('a[href]'), ({ href }) => href)
    );

	return hrefs
}


const checkStatusUrls = async (browser, page, hrefs) => {

	for (const href of hrefs) {

		if(href !== "mailto:demo@prestashop.com"){
			await page.goto(href, { waitUntil: 'domcontentloaded' }).catch(e => console.error(e))
	    page.on('response', response => {
	    	if(response.status().toString().startsWith("4") || response.status().toString().startsWith("5")) {
	    		const urlStatus = ["--HTTP CODE--", response.status(),"URL:" ,response.url(), "From:", href];
	      	throw ('page error catched:'+ urlStatus)
	      	}
	    	});
		}
	}
}

const run = async () => {
	const browser = await puppeteer.launch({ headless: false })
	const page = await browser.newPage()
	await page.goto(URLFO, { waitUntil: 'networkidle0' });
  const urlList = await getAllUrl(browser, page)
  const checkUrls = await checkStatusUrls(browser, page, urlList)

  browser.close()
}

run()
  .then(value => {
    console.log("--------everything is fine ... the end :-* --------")
  })
  .catch(e => console.log(`error: ${e}`))
