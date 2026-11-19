import assert from 'node:assert/strict';
import { MAP_BOUNDS, MAP_CENTER, project, unproject } from '../../geo.ts';
import { DEFECT_CATEGORY, DEFECT_STATUS } from '../../labels.ts';
import { validateReport } from '../../../routes/maengelmelder/melden/validation.ts';

function testProjection() {
	console.log('Testing Map projection & unprojection...');
	const centerProj = project(MAP_CENTER.lat, MAP_CENTER.lng);
	assert(Math.abs(centerProj.x - 50) < 0.001, 'Center X should be 50%');
	assert(Math.abs(centerProj.y - 50) < 0.001, 'Center Y should be 50%');

	const unproj = unproject(50, 50);
	assert(Math.abs(unproj.lat - MAP_CENTER.lat) < 0.0001, 'Unproject lat should match');
	assert(Math.abs(unproj.lng - MAP_CENTER.lng) < 0.0001, 'Unproject lng should match');

	// Corner tests
	const nw = project(MAP_BOUNDS.north, MAP_BOUNDS.west);
	assert(Math.abs(nw.x - 0) < 0.001, 'North West X should be 0%');
	assert(Math.abs(nw.y - 0) < 0.001, 'North West Y should be 0%');

	const se = project(MAP_BOUNDS.south, MAP_BOUNDS.east);
	assert(Math.abs(se.x - 100) < 0.001, 'South East X should be 100%');
	assert(Math.abs(se.y - 100) < 0.001, 'South East Y should be 100%');

	console.log('Projection assertions passed successfully.');
}

function testLabels() {
	console.log('Testing Defect categories and status labels...');
	assert(DEFECT_CATEGORY.schlagloch === 'Schlagloch', 'Category label match');
	assert(DEFECT_STATUS.gemeldet.label === 'Gemeldet', 'Status label match');
	assert(DEFECT_STATUS.in_bearbeitung.label === 'In Bearbeitung', 'Status label match');
	assert(DEFECT_STATUS.behoben.label === 'Behoben', 'Status label match');
	console.log('Labels assertions passed successfully.');
}

testProjection();
testLabels();

const report = new FormData();
for (const [key, value] of Object.entries({
	category: 'schlagloch',
	title: 'Schlagloch am Marktplatz',
	description: 'Tiefe Beschädigung der Fahrbahn.',
	address: 'Marktplatz 1',
	lat: String(MAP_CENTER.lat),
	lng: String(MAP_CENTER.lng),
	photoName: 'schaden.jpg'
}))
	report.set(key, value);
assert.deepEqual(validateReport(report).errors, {});
for (const lat of ['51.05garbage', '', 'Infinity', 'NaN', String(MAP_BOUNDS.north + 0.001)]) {
	report.set('lat', lat);
	assert(validateReport(report).errors.coords, `Must reject coordinate: ${lat}`);
}
report.set('lat', String(MAP_CENTER.lat));
report.set('title', new File(['invalid'], 'title.txt'));
assert(validateReport(report).errors.title);
report.set('title', 'Schlagloch am Marktplatz');
report.set('photoName', '../secret.txt');
assert(validateReport(report).errors.photoName);
report.set('photoName', new File(['invalid'], 'schaden.jpg'));
assert(validateReport(report).errors.photoName);
console.log('All maengelmelder checks passed!');
