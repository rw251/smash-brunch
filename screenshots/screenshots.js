const puppeteer = require('puppeteer');
const fs = require('fs');

// Put your custom dimension and name Here
const devices = [
  { name: 'Android', width: 360, height: 640 },
  { name: 'Iphone', width: 375, height: 667 },
  { name: 'Ipad-Portrait', width: 768, height: 1024 },
  { name: 'Ipad-Landscape', width: 1024, height: 768 },
  { name: 'Small-Desktop', width: 1280, height: 800 },
  { name: 'Laptop-1', width: 1366, height: 768 },
  { name: 'Laptop-2', width: 1360, height: 768 },
  { name: 'Widescreen', width: 1920, height: 1080 },
];

const urls = [
  { name: 'Single - no practice selected', link: 'http://localhost:7674/practice', domItem: '#practiceList' },
  { name: 'CCG - no indicator selected', link: 'http://localhost:7674/ccg', domItem: '#indicatorList' },
  { name: 'Evidence - no indicator selected', link: 'http://localhost:7674/evidence', domItem: '#info' },
  { name: 'Help', link: 'http://localhost:7674/help', domItem: '#mainContent' },
];

// Directory Create if not exist
const getScreenshots = async (device, url, page) => {
  const newLocation = `screenshots/${device.name}(${device.width}-${device.height})`;
  fs.mkdir(newLocation, (err) => {
    if (err) { // console.log(err)
    }
  });
  console.log(`Screenshot for ${url.name} on ${device.name}`);
  await page.screenshot({
    path: `${newLocation}/${url.name}.png`,
    // fullPage: true,
  });
};

const loadPage = async (browser, url) => {
  const page = await browser.newPage();
  await page.goto(url.link);
  return page;
};

const setViewports = async (device, page) => {
  // Setting-up viewports
  await page.setViewport({
    width: device.width,
    height: device.height,
  });
};

const opts = {
  headless: false,
  // slowMo: 25,
  timeout: 10000,
};

devices.forEach(async (device) => {
  const browser = await puppeteer.launch(opts);
  const page = await loadPage(browser, { link: 'http://localhost:7674' });
  await setViewports(device, page);
  await getScreenshots(device, { name: 'Login' }, page);

  // login
  await page.waitFor('#email');
  await page.type('#email', 'willow@email.com');
  await page.waitFor('#password');
  await page.type('#password', 'password');

  // click and wait for navigation
  await Promise.all([
    await page.bringToFront(),
    await page.click('button[type="submit"]'),
    await page.waitForNavigation({ waitUntil: 'load' }),
  ]);

  for (const url of urls) {
    await page.goto(url.link);
    await page.waitFor(url.domItem);
    await page.waitFor('.loading-shade', { hidden: true });
    await getScreenshots(device, url, page);
  }

  browser.close();
});

const generateHtml = () => `
  <!doctype html>
  <html class="no-js" lang="">

  <head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Screenshots</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.css">
    <style>
      .panel {
        display:none;
      }

      .panel.active {
        display: block;
      }

      img {
        border: 1px solid yellow;
      }
    </style>
  </head>

  <body>
    <section id="dynamic-demo-toolbar">
      <nav id="dynamic-tab-bar" class="mdc-tab-bar" role="tablist">
        <a role="tab" aria-controls="panel-login" class="mdc-tab mdc-tab--active" href="#panel-login">Login</a>
        ${urls.map((url, i) => `<a role="tab" aria-controls="panel-${i}" class="mdc-tab mdc-tab--active" href="#panel-${i}">${url.name}</a>`).join('')}
        <span class="mdc-tab-bar__indicator"></span>
      </nav>
    </section>

    <section>
      <div class="panels">
        <div class="active panel" id="panel-login">${devices.map(device => `<img class="mdc-image-list__image" style="width:${device.width / 2}px" src="${device.name}(${device.width}-${device.height})/Login.png">`).join('')}</div>
        ${urls.map((url, i) => `<div class="panel" id="panel-${i}">${devices.map(device => `<img class="mdc-image-list__image" style="width:${device.width / 2}px" src="${device.name}(${device.width}-${device.height})/${url.name}.png">`).join('')}</div>`).join('')}
      </div>
    </section>

    <script src="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.js"></script>
    <script>
      var dynamicTabBar = window.dynamicTabBar = new mdc.tabs.MDCTabBar(document.querySelector('#dynamic-tab-bar'));
      var panels = document.querySelector('.panels');

      dynamicTabBar.tabs.forEach(function(tab) {
        tab.preventDefaultOnClick = true;
      });

      function updatePanel(index) {
        var activePanel = panels.querySelector('.panel.active');
        if (activePanel) {
          activePanel.classList.remove('active');
        }
        var newActivePanel = panels.querySelector('.panel:nth-child(' + (index + 1) + ')');
        if (newActivePanel) {
          newActivePanel.classList.add('active');
        }
      }

      dynamicTabBar.listen('MDCTabBar:change', function ({detail: tabs}) {
        var nthChildIndex = tabs.activeTabIndex;

        updatePanel(nthChildIndex);
      });
    </script>
  </body>

  </html>`;

fs.writeFileSync('screenshots/index.html', generateHtml());

