const puppeteer = require('puppeteer');
const excelToJson = require('convert-excel-to-json');
const chai = require('chai');
chai.use(require('chai-string'));
global.expect = chai.expect;

let argv = require('minimist')(process.argv.slice(2));

global.URL = argv.URL;
global.EMAIL = argv.LOGIN || 'demo@prestashop.com';
global.PASSWORD = argv.PASSWD || 'prestashop_demo';
global.adminFolderName = argv.ADMIN_FOLDER_NAME || '/admin-dev';

global.getAllSelectors = [];
global.result = [];

const open = async () => {
  global.browser = await puppeteer.launch({headless: true, args: [`--window-size=${1280},${1024}`]});
};

const accessToBo = async () => {
  const pages = await browser.pages();
  global.page = await pages[0];
  await page.goto(global.URL + global.adminFolderName);
  await page._client.send('Emulation.clearDeviceMetricsOverride');
  await page.waitFor('body').then(() => console.log('should check that the authentication page is well opened'));
};

const getAllUrl = async () => {
  const hrefs = await page.evaluate(
    () => Array.from(document.body.querySelectorAll('nav.nav-bar.d-none.d-md-block ul.submenu li a.link[href]'), ({href}) => href)
  );
  return hrefs;
};

const getAllMenuUrl = async () => {
  const hrefs = await page.evaluate(
    () => Array.from(document.body.querySelectorAll('nav.nav-bar.d-none.d-md-block ul li.link-levelone a.link[href]'), ({href}) => href)
  );
  return hrefs;
};

const getAllPageTitle = async () => {
  const titles = await page.evaluate(
    () => Array.from(document.body.querySelectorAll('nav.nav-bar.d-none.d-md-block ul.submenu a.link'), ({innerText}) => {
      if (innerText.trim().toLowerCase().indexOf('&') !== -1) {
        return innerText.trim().toLowerCase().replace(' & ', '_');
      } else {
        return innerText.trim().toLowerCase().replace(' ', '_')
      }
    })
  );
  return titles;
};

const getAllSelectorsByPage = async () => {
  getAllSelectors = await page.evaluate(
    () => Array.from(document.querySelectorAll('*[id]'), ({id}) => '#' + id)
  );
};

const compareSelectorsWithExcelFile = async (pageName, sheetName = 'Back_office') => {
  let selectorsByPage = result[sheetName].filter((object) => object.page === pageName && object.isID === 1 && object.exist === 'TRUE');
  for (let i = 0; i < selectorsByPage.length; i++) {
    if (!getAllSelectors.includes(selectorsByPage[i].selector)) {
      if (selectorsByPage[i].selector.includes('%')) {
        expect(selectorsByPage[i].Default_value, "This selector '" + selectorsByPage[i].UImap_name + "' is not valid: '" + selectorsByPage[i].Default_value + "'").to.be.oneOf(getAllSelectors);
      } else {
        expect(selectorsByPage[i].selector, "This selector '" + selectorsByPage[i].UImap_name + "' is not valid: '" + selectorsByPage[i].selector + "'").to.be.oneOf(getAllSelectors);
      }
    }
  }
  getAllSelectors = [];
};

const checkSelectorPage = async (hrefs, pageTitles) => {
  for (let i = 0; i < hrefs.length; i++) {
    await page.goto(hrefs[i], {waitUntil: 'domcontentloaded'}).catch(e => console.error(e));
    await page.waitFor(2000);
    await getAllSelectorsByPage();
    await compareSelectorsWithExcelFile(pageTitles[i]).then(() => console.log('should check all selectors of "' + pageTitles[i] + '" page'));
  }
};

const readExcelFile = async (sheetName = 'Back_office') => {
  result = await excelToJson({
    sourceFile: './uimap/UI_Map_Selectors.xlsx',
    header: {
      rows: 2
    },
    columnToKey: {
      A: 'menu',
      B: 'page',
      E: 'UImap_name',
      F: 'selector',
      G: 'exist',
      I: 'isID',
      J: 'Default_value'
    },
    sheets: [sheetName]
  });
};

const signInBo = async () => {
  await page.waitFor('#email');
  await page.type('#email', global.EMAIL);
  await page.waitFor('#passwd');
  await page.type('#passwd', global.PASSWORD);
  await page.waitFor('#submit_login');
  await page.click('#submit_login').then(() => console.log('should login successfully in the Back Office'));
  await page.waitForNavigation({waitUntil: 'domcontentloaded'});
};

const run = async () => {
  await open()
    .then(() => console.log('should open the browser'))
    .then(() => readExcelFile())
    .then(async () => {
      await accessToBo()
        .then(async () => {
          await getAllSelectorsByPage();
          await compareSelectorsWithExcelFile('authentification').then(() => console.log('should check all selectors of "authentication" page'));
          await page.waitFor(5000);
          await signInBo();
        })
        .then(async () => {
          const menuUrlList = await getAllMenuUrl();
          await checkSelectorPage([menuUrlList[0], menuUrlList[23]], ['dashboard', 'stats']);
        })
        .then(async () => {
          const titlePageList = await getAllPageTitle();
          const urlList = await getAllUrl();
          await checkSelectorPage(urlList, titlePageList);
        });
      await browser.close();
    });
};
run()
  .then(value => {
    console.log("--------------- :-* the end :-* ---------------");
  })
  .catch(async e => {
    console.log(`error: ${e}`);
    await browser.close();
  });