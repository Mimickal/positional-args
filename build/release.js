// This is not strictly part of the library. This is just a janky script that
// bumps the release version and regenerates code docs.
const fs = require('fs');
const shell = require('child_process').execSync;

const newversion = process.argv[2];
if (!newversion) {
	console.error('Missing version!');
	process.exit(1);
}

function updateVersionForFile(file) {
	const file_json = require(`../${file}`);
	file_json.version = newversion;
	fs.writeFileSync(file, JSON.stringify(file_json, null, 2));
	console.log(`Wrote version ${newversion} to ${file}`);
}

updateVersionForFile('package.json');
updateVersionForFile('package-lock.json');

shell('npm run regen-docs');
console.log('Wrote out new API.md');

shell('git add package.json package-lock.json API.md');
shell(`git commit -m "Version bump to ${newversion}"`);

