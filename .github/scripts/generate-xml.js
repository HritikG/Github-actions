const fs = require("fs");
const path = require("path");

(async () => {
    try {
        const issueNumber = process.env.ISSUE_NUMBER;
        const issueTitle = process.env.ISSUE_TITLE;
        const issueBody = process.env.ISSUE_BODY || "";
        const issueAuthor = process.env.ISSUE_AUTHOR;
        const repoUrl = process.env.REPO_URL;

        if (!issueNumber || !issueTitle) {
            throw new Error("Missing issue data from GitHub context");
        }

        const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<requirements>
  <requirement>
    <docid><![CDATA[${issueNumber}]]></docid>
    <title><![CDATA[${issueTitle}]]></title>
    <version>1</version>
    <revision>1</revision>
    <node_order>${issueNumber}</node_order>
    <description><![CDATA[
      <p><b>Description:</b> ${issueBody}</p>
      <p><b>Author:</b> ${issueAuthor}</p>
      <p><b>Repository:</b> ${repoUrl}</p>
    ]]></description>
    <status><![CDATA[D]]></status>
    <type><![CDATA[2]]></type>
    <expected_coverage><![CDATA[1]]></expected_coverage>
  </requirement>
</requirements>`;

        const dir = path.join("requirements");
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        const filePath = path.join(dir, `requirement-${issueNumber}.xml`);
        fs.writeFileSync(filePath, xmlContent, "utf8");

        console.log(`✅ Generated XML file at: ${filePath}`);
    } catch (err) {
        console.error("❌ Error generating XML:", err);
        process.exit(1);
    }
})();
