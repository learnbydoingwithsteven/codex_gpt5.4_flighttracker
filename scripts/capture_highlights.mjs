import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "media_assets", "captures");
const FRAMES_DIR = path.join(OUTPUT_DIR, "frames");
const APP_URL = "http://localhost:4173";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function captureFrameSequence(page, count, delayMs) {
  for (let index = 0; index < count; index += 1) {
    await page.screenshot({
      path: path.join(FRAMES_DIR, `frame-${String(index).padStart(3, "0")}.png`),
    });
    await sleep(delayMs);
  }
}

async function waitForApp(page) {
  await page.goto(APP_URL, { waitUntil: "networkidle2", timeout: 120000 });
  await page.waitForSelector("canvas", { timeout: 30000 });
  await page.waitForFunction(
    () => !document.body.innerText.includes("Acquiring feed"),
    { timeout: 30000 },
  ).catch(() => {});
  await sleep(5000);
}

async function setRegion(page, label) {
  await page.select("select", label.toLowerCase().replace(/\s+/g, "-"));
  await sleep(3500);
}

async function setAircraftCap(page, value) {
  await page.$eval(
    'input[type="range"]',
    (element, next) => {
      element.value = String(next);
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
    },
    value,
  );
  await sleep(2000);
}

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: "new",
  defaultViewport: { width: 1600, height: 900, deviceScaleFactor: 1 },
  args: ["--disable-web-security", "--no-sandbox"],
});

try {
  await ensureDir(OUTPUT_DIR);
  await ensureDir(FRAMES_DIR);

  const page = await browser.newPage();
  await waitForApp(page);

  await page.screenshot({ path: path.join(OUTPUT_DIR, "dashboard-global.png") });

  await setRegion(page, "europe");
  await page.screenshot({ path: path.join(OUTPUT_DIR, "dashboard-europe.png") });

  await setAircraftCap(page, 180);
  await page.screenshot({ path: path.join(OUTPUT_DIR, "dashboard-europe-180.png") });

  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 1 });
  await sleep(1200);
  await page.screenshot({ path: path.join(OUTPUT_DIR, "mobile-view.png") });

  await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 1 });
  await sleep(1200);
  await setRegion(page, "global");
  await setAircraftCap(page, 260);
  await captureFrameSequence(page, 20, 250);
} finally {
  await browser.close();
}
