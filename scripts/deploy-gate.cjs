const disabledValues = new Set(["0", "disabled", "false", "no", "off"]);
const rawValue = process.env.DEPLOYMENT_ENABLED;
const normalizedValue = String(rawValue ?? "true").trim().toLowerCase();
const deploymentDisabled = disabledValues.has(normalizedValue);

if (deploymentDisabled) {
  console.log(
    `Deployment skipped because DEPLOYMENT_ENABLED=${JSON.stringify(rawValue)}.`,
  );
  process.exit(0);
}

console.log("Deployment enabled. Continuing build.");
process.exit(1);
