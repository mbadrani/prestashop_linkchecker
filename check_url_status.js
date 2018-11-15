'use strict';

const puppeteer = require('puppeteer');
require('events').EventEmitter.prototype._maxListeners = Infinity;

let argv = require('minimist')(process.argv.slice(2));

let URL_BO = argv.URL || 'http://localhost:8080/admin-dev/';
let EMAIL = argv.LOGIN || 'demo@prestashop.com';
let PASSWORD = argv.PASSWD || 'prestashop_demo';


const getAllUrl = async (browser, page) => {

	const hrefs = await page.evaluate(
		() => Array.from(document.body.querySelectorAll('nav.nav-bar.d-none.d-md-block ul li a.link[href]'), ({ href }) => href)
    );

	return hrefs
}


const checkStatusUrls = async (browser, page, hrefs) => {

	for (const href of hrefs) {
    await page.goto(href, { waitUntil: 'domcontentloaded' }).catch(e => console.error(e))
    page.on('response', response => {
    	if(response.status().toString().startsWith("4") || response.status().toString().startsWith("5")) {
    		const urlStatus = ["--HTTP CODE--", response.status(),"URL:" ,response.url()];
    	//	await page.evaluate(()=> {throw new Error('page error catched:'+ urlStatus)});
      //  throw new Error('page error catched:'+ urlStatus)  
      	throw ('page error catched:'+ urlStatus)    		
      	}
    	});
	}	
}


const run = async () => {
	const browser = await puppeteer.launch({ headless: false })
	const page = await browser.newPage()

	await page.goto(URL_BO, { waitUntil: 'networkidle0' });
	await page.type('#email', EMAIL)
  	await page.type('#passwd', PASSWORD)
  	await page.click('#submit_login')
  	await page.waitForNavigation({ waitUntil: 'domcontentloaded' })

  	const urlList = await getAllUrl(browser, page)
  	const checkUrls = await checkStatusUrls(browser, page, urlList)

  	browser.close()
}


run()
  .then(value => {
    console.log("--------the end :-* --------")
  })
  .catch(e => console.log(`error: ${e}`))
