const xmlrpc = require("xmlrpc");

async function run() {
  const testlinkUrl = process.env.TESTLINK_URL;
  const apiKey = process.env.TESTLINK_API_KEY;

  if (!testlinkUrl || !apiKey) {
    console.error("❌ Environment variables TESTLINK_URL and TESTLINK_API_KEY must be set.");
    process.exit(1);
  }

  const issueTitle = process.env.ISSUE_TITLE;
  const issueBody = process.env.ISSUE_BODY || "";
  const issueNumber = process.env.ISSUE_NUMBER;

  // Create XML-RPC client with the TestLink API endpoint URL
  const client = xmlrpc.createClient({ url: testlinkUrl });

  // Prepare parameters as a single object (struct)
  const params = {
    devKey: apiKey,
    title: issueTitle,
    docid: `GH-ISSUE-${issueNumber}`,
    description: issueBody,
    status: "V",
    type: "3",
    expected_coverage: "1"
  };

  console.log("TestLink URL:", testlinkUrl);
  console.log("API Key present:", !!apiKey);
  console.log("Issue Title:", issueTitle);
  console.log("Issue Body:", issueBody);
  console.log("Issue Number:", issueNumber);
  console.log("Params to be sent:", params);

  // The second argument to methodCall must be an array of parameters.
  // TestLink's methods typically expect a single struct (object) in this array.
  client.methodCall("tl.createRequirement", [params], function (error, value) {
    if (error) {
      console.error("❌ Failed to create requirement:", error.message);
      process.exit(1);
    } else {
      console.log("✅ Requirement created in TestLink");
      console.log(value);
    }
  });
}

run();

