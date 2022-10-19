/*
 * Contributed 2022 by Aaron Huggins under the MIT license.
 */
import { parse } from "https://deno.land/std@0.160.0/flags/mod.ts";
import { basename } from "https://deno.land/std@0.160.0/path/mod.ts";
import { inc as increment } from "https://deno.land/x/semver@v1.4.1/mod.ts";
import {
  build,
  BuildOptions,
  emptyDir,
} from "https://deno.land/x/dnt@0.31.0/mod.ts";

await emptyDir("./npm");

function versionHandler(current: string, inputs: typeof args): string {
  switch (true) {
    case inputs.major:
      return increment(current, "major") ?? current;
    case inputs.minor:
      return increment(current, "minor") ?? current;
    case inputs.patch:
      return increment(current, "patch") ?? current;
    case inputs.premajor:
      return increment(current, "premajor") ?? current;
    case inputs.preminor:
      return increment(current, "preminor") ?? current;
    case inputs.prepatch:
      return increment(current, "prepatch") ?? current;
    case inputs.prerelease:
      return increment(current, "prerelease") ?? current;
  }

  return current;
}

const scriptName = basename(import.meta.url, ".ts");
const logTag = `[${scriptName}]`;
const packageFile = `./scripts/${scriptName}.json`;
const packageText = await Deno.readTextFile(packageFile);
const packageJSON = <BuildOptions["package"]> JSON.parse(packageText);
const { version } = packageJSON;
const args = parse(Deno.args, {
  boolean: [
    "major",
    "minor",
    "patch",
    "premajor",
    "preminor",
    "prepatch",
    "prerelease",
  ],
  default: {
    major: false,
    minor: false,
    patch: false,
    premajor: false,
    preminor: false,
    prepatch: false,
    prerelease: false,
  },
});
packageJSON.version = versionHandler(version, args);

await build({
  entryPoints: ["./mod.ts", "./polyfill.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  package: {
    ...packageJSON,
  },
});

// post build steps
await Deno.copyFile("LICENSE.md", "npm/LICENSE.md");
await Deno.copyFile("README.md", "npm/README.md");

if (packageJSON.version === version) {
  console.log(
    `${logTag} Version did not change; nothing to deploy. ${packageJSON.name} v${version}`,
  );
} else {
  await Deno.writeTextFile(packageFile, JSON.stringify(packageJSON, null, 2));
  console.log(
    `${logTag} ${packageJSON.name} v${packageJSON.version} ready to deploy!`,
  );
}
