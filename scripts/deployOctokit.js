import { execSync } from "child_process";
import { Octokit } from "octokit";

console.log("[DEPLOY_PREVIEW]: START...");
const command = "yarn deploy:staging";
const output = execSync(command, { encoding: "utf8" });
const outputLines = output.split("\n");
const DEPLOY_URL = outputLines[outputLines.length - 1];

console.log("[DEPLOY_PREVIEW]: END");

// ====================================================================

console.log("[GITHUB_COMMENT]: START...");

const {
  GITHUB_TOKEN,
  GITHUB_REPOSITORY,
  GITHUB_PR_NUMBER,
  GITHUB_OWNER,
  GITHUB_REPO,
} = process.env;

const GH_COMMENT = `
- Deploy url: [${DEPLOY_URL}] (${DEPLOY_URL})
`;

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

await octokit
  .request(
    `POST /repos/${GITHUB_REPOSITORY}/issues/${GITHUB_PR_NUMBER}/comments`,
    {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      issue_number: GITHUB_PR_NUMBER,
      body: GH_COMMENT,
      headers: {
        accept: "application/vnd.github+json",
      },
    },
  )
  .then(async (response) => {
    if (response.ok) return response.json();
    const log = await response.json();
    console.log(log);
  })
  .catch((err) => {
    console.log("[COMMENT_ON_GITHUB]: ERROR");
    console.log(err);
  })
  .finally(() => {
    console.log("[COMMENT_ON_GITHUB]: END");
  });

console.log("[GITHUB_COMMENT]: END");
