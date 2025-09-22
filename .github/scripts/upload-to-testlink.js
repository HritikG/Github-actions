const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const testlinkUrl = process.env.TESTLINK_URL;
    const username = process.env.TESTLINK_USER;
    const password = process.env.TESTLINK_PASS;
    const folderId = process.env.FOLDER_ID; // 👈 comes from caller workflow

    if (!folderId) {
        console.error("❌ FOLDER_ID is not defined. Please pass it from caller workflow.");
        process.exit(1);
    }

    console.log("🌐 Navigating to TestLink...");
    await page.goto(testlinkUrl);

    // 🔑 Login
    await page.fill("#tl_login", username);
    await page.fill("#tl_password", password);
    await page.click("#tl_login_button");

    await page.waitForSelector("#mainframe");
    console.log("✅ Logged in to TestLink");

    // Find XML file(s) to upload
    const dir = "requirements";
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".xml"));

    for (const file of files) {
        const filePath = path.resolve(dir, file);
        console.log(`📂 Uploading ${file} to folder ${folderId}...`);

        await page.goto(`${testlinkUrl}/lib/requirements/reqImport.php?req_spec_id=${process.env.FOLDER_ID}`);
        await page.waitForSelector("input[name='uploadFile']");
        await page.selectOption("select[name='importType']", "XML");
        await page.setInputFiles("input[type='file']", filePath);
        await page.click("input[name='uploadFile']");
        
        // Check for import completion
        await page.waitForSelector("//p[@class='info']", { timeout: 10000 });
        const importMessage = await page.textContent("//p[@class='info']");
        console.log(`📋 Import result for ${file}: ${importMessage}`);

        // Print data from all <tr> elements after upload
        console.log("\n📊 Table row data after upload:");
        const tableRows = await page.locator("tr").all();
        
        for (let i = 0; i < tableRows.length; i++) {
            const rowText = await tableRows[i].textContent();
            if (rowText && rowText.trim()) {
                console.log(`Row ${i + 1}: ${rowText.trim()}`);
            }
        }
    }

    console.log("🎉 All requirement XMLs uploaded in TestLink!");
    await browser.close();
})();
