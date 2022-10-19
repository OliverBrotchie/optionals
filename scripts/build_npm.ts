/*
 * Contributed 2022 by Aaron Huggins under the MIT license.
 */
import { parse } from "https://deno.land/std@0.160.0/flags/mod.ts";
import { basename } from "https://deno.land/std@0.160.0/path/mod.ts";
import {
  inc as increment,
  ReleaseType,
} from "https://deno.land/std@0.160.0/semver/mod.ts";
import {
  build,
  BuildOptions,
  emptyDir,
} from "https://deno.land/x/dnt@0.31.0/mod.ts";

await emptyDir("./npm");

function versionHandler(current: string, releaseType: ReleaseType): string {
  const releaseTypes: ReleaseType[] = [
    "major",
    "minor",
    "patch",
    "pre",
    "premajor",
    "preminor",
    "prepatch",
    "prerelease",
  ];

  if (releaseTypes.includes(releaseType)) {
    return increment(current, releaseType) ?? current;
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
  string: ["cp", "release"],
  default: {
    cp: "",
    release: "",
  },
});
const release = <ReleaseType> args.release;
packageJSON.version = versionHandler(version, release);

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  package: {
    ...packageJSON,
  },
});

// post build steps
for (const filepath of args.cp.split(/,/g)) {
  await Deno.copyFile(filepath, `npm/${filepath}`);
}

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
