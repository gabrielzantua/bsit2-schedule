const assert = require('node:assert/strict');
const { SCHEDULE, SCHEDULE_DAYS, getScheduleState } = require('./schedule-data');

const expected = [
    'CCC211-18|Information Management 1|M101|Tuesday|7:00 PM–9:00 PM|2|0|2|7:00 PM–9:00 PM | Asynchronous',
    'CIT213-18|Human Computer Interaction|M110|Wednesday|5:00 PM–7:00 PM|2|0|2|5:00 PM–7:00 PM | Asynchronous',
    'CITEL1-18|IT Elective 1|M101|Wednesday|7:00 PM–9:00 PM|2|0|2|7:00 PM–9:00 PM | Asynchronous',
    'GECETH-18|Ethics|M312|Thursday|7:00 AM–10:00 AM|3|0|3|7:00 AM–8:30 AM Synchronous | 8:30 AM–10:00 AM Asynchronous',
    'PE3 ID-18|Individual/Dual Sports/Games|MPH5|Thursday|10:00 AM–12:00 PM|2|0|2|',
    'CCL211-18|Information Management 1 (Lab)|M101|Thursday|1:00 PM–4:00 PM|0|1|1|',
    'ITLEL-18|IT Elective 1 (Lab)|M101|Thursday|4:00 PM–7:00 PM|0|1|1|',
    'ITL213-18|Human Computer Interaction (Lab)|M110|Friday|1:00 PM–4:00 PM|0|1|1|',
    'CCL212-18|Data Structures and Algorithm (Lab)|M108|Friday|4:00 PM–7:00 PM|0|1|1|',
    'CCC212-18|Data Structures and Algorithm|M108|Friday|7:00 PM–9:00 PM|2|0|2|7:00 PM–9:00 PM | Asynchronous',
    'SOSLIT-18|Sosyedad at Literatura/Panitikang Panlipunan|M402|Saturday|7:00 AM–10:00 AM|3|0|3|7:00 AM–8:30 AM Synchronous | 8:30 AM–10:00 AM Asynchronous',
    'GECPCO-18|Purposive Communication|M402|Saturday|10:00 AM–1:00 PM|3|0|3|10:00 AM–11:30 AM Synchronous | 11:30 AM–1:00 PM Asynchronous'
];

const actual = SCHEDULE.map(({ code, title, room, day, time, lectureUnits, labUnits, units, delivery = '' }) =>
    [code, title, room, day, time, lectureUnits, labUnits, units, delivery].join('|')
);

assert.deepEqual(actual, expected, 'schedule entries must match the official image');
assert.equal(new Set(SCHEDULE.map(subject => subject.code)).size, 12, 'subject codes must be unique');
assert.equal(SCHEDULE.reduce((sum, subject) => sum + subject.units, 0), 23, 'total load must be 23 units');
assert.deepEqual([...new Set(SCHEDULE.map(subject => subject.day))], SCHEDULE_DAYS, 'days must be complete and ordered');
assert.ok(SCHEDULE.every(subject => subject.start < subject.end), 'every class must end after it starts');
for (const day of SCHEDULE_DAYS) {
    const times = SCHEDULE.filter(subject => subject.day === day).map(subject => subject.start);
    assert.deepEqual(times, [...times].sort((a, b) => a - b), `${day} classes must be chronological`);
}

let state = getScheduleState(5, 810);
assert.equal(state.current.code, 'ITL213-18', 'Friday 1:30 PM must show the active lab');
assert.equal(state.next.code, 'CCL212-18', 'Friday 1:30 PM must show the following lab');
assert.equal(state.dayOffset, 0, 'the next Friday class must be today');

state = getScheduleState(5, 960);
assert.equal(state.current.code, 'CCL212-18', 'the next class must become current at its exact start');
assert.equal(state.next.code, 'CCC212-18', 'the later Friday lecture must become next');

state = getScheduleState(6, 780);
assert.equal(state.current, undefined, 'a class must stop being current at its exact end');
assert.equal(state.next.code, 'CCC211-18', 'after Saturday classes, next must wrap to Tuesday');
assert.equal(state.dayOffset, 3, 'Saturday-to-Tuesday countdown must span three days');

console.log('Schedule verified: exact data, chronological days, and realtime boundaries.');
