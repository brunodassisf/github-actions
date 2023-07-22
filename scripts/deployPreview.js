import { execSync } from "child_process";
import fetch from "node-fetch";

console.log("[DEPLOY_PREVIEW]: START...");
const command = "yarn deploy:staging";
const output = execSync(command, { encoding: "utf8" });
const outputLines = output.split("\n");
const DEPLOY_URL = outputLines[outputLines.length - 1];

console.log("[DEPLOY_PREVIEW]: END");

// ====================================================================

console.log("[GITHUB_COMMENT]: START...");
const { GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_PR_NUMBER } = process.env;

const GH_COMMENT = `
- Deploy url: [${DEPLOY_URL}] (${DEPLOY_URL})
`;

console.log("GITHUB_TOKEN", GITHUB_TOKEN);
console.log("GITHUB_REPOSITORY", GITHUB_REPOSITORY);
console.log("GITHUB_PR_NUMBER", GITHUB_PR_NUMBER);
console.log("GH_COMMENT", GH_COMMENT);

const defaultHeaders = {};
defaultHeaders["authorization"] = `token ${GITHUB_TOKEN}`;
defaultHeaders["accept"] =
  "application/vnd.github.v3+json; application/vnd.github.antiope-preview+json";
defaultHeaders["content-type"] = "application/json";
console.log(
  "URL_COMMENTS:",
  `https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${GITHUB_PR_NUMBER}/comments`,
);

fetch(
  `https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${GITHUB_PR_NUMBER}/comments`,
  {
    headers: defaultHeaders,
    method: "POST",
    body: JSON.stringify({
      body: GH_COMMENT,
    }),
  },
)
  .then(async (response) => {
    if (response.ok) return response.json();
    const log = await response.json();
    console.log(log);
    // throw new Error(response.statusText);
  })
  .catch((err) => {
    console.log("[COMMENT_ON_GITHUB]: ERROR");
    console.log(err);
  })
  .finally(() => {
    console.log("[COMMENT_ON_GITHUB]: END");
  });

console.log("[GITHUB_COMMENT]: END");
