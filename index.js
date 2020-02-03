'use strict';

const os = require('os');
const path = require('path');

const verifyFile = require('./lib/verify-file');

let platform = os.platform();
let arch = os.arch(); 

if (arch === 'arm') {
	var archspec = require('child_process').execSync(
    'dpkg --print-architecture').toString();
	if (archspec.replace(/(\r\n|\n|\r)/gm, "") !== 'armhf') {
		console.log('archspec: ', archspec.replace(/(\r\n|\n|\r)/gm, ""))
		throw new Error('Unsupported platform/architecture: ' + `${platform}-${arch}`);
	} else {
		arch = archspec.replace(/(\r\n|\n|\r)/gm, "");
	}
}

platform = `${platform}-${arch}`;

let packageName = ''
packageName = `@ffprobe-installer/${platform}`;
if (arch === 'armhf') {
	packageName = 'linux-armhf-bin'
} else {
	console.log(arch)
}

if (!require('./package.json').optionalDependencies[packageName]) {
	throw new Error('Unsupported platform/architecture: ' + platform);
}

const binary = os.platform() === 'win32' ? 'ffprobe.exe' : 'ffprobe';

const npm3Path = path.resolve(__dirname, '..', platform);
const npm2Path = path.resolve(__dirname, 'node_modules', '@ffprobe-installer', platform);

const npm3Binary = path.join(npm3Path, binary);
const npm2Binary = path.join(npm2Path, binary);

const npm3Package = path.join(npm3Path, 'package.json');
const npm2Package = path.join(npm2Path, 'package.json');

let ffprobePath;
let packageJson;

if (verifyFile(npm3Binary)) {
	ffprobePath = npm3Binary;
	packageJson = require(npm3Package);
} else if (verifyFile(npm2Binary)) {
	ffprobePath = npm2Binary;
	packageJson = require(npm2Package);
} else {
	throw new Error('Could not find ffprobe executable, tried "' + npm3Binary + '" and "' + npm2Binary + '"');
}

const version = packageJson.ffprobe || packageJson.version;
const url = packageJson.homepage;

module.exports = {
	path: ffprobePath,
	version,
	url
};
