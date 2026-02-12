import puppeteer from 'puppeteer';

export class WebCrawlerService {
    async crawl(url: string): Promise<string> {
        console.log(`Crawling ${url}...`);
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Safer for some environments
        });
        const page = await browser.newPage();

        try {
            await page.goto(url, { waitUntil: 'networkidle2' });

            // Simple text extraction
            // We could use cheerio, but page.evaluate is enough for now
            const content = await page.evaluate(() => {
                // Remove scripts and styles
                const scripts = document.querySelectorAll('script, style');
                scripts.forEach(script => script.remove());
                return document.body.innerText;
            });

            await browser.close();
            return content;
        } catch (error) {
            console.error(`Failed to crawl ${url}:`, error);
            await browser.close();
            return "";
        }
    }
}
