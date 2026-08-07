const SCHEDULE_DAYS = Object.freeze(['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);

const SCHEDULE = Object.freeze([
    { code: 'CCC211-18', title: 'Information Management 1', room: 'T.B.A.', day: 'Tuesday', time: '7:00 PM–9:00 PM', start: 1140, end: 1260, lectureUnits: 2, labUnits: 0, units: 2, category: 'core' },
    { code: 'CIT213-18', title: 'Human Computer Interaction', room: 'T.B.A.', day: 'Wednesday', time: '5:00 PM–7:00 PM', start: 1020, end: 1140, lectureUnits: 2, labUnits: 0, units: 2, category: 'core' },
    { code: 'CITEL1-18', title: 'IT Elective 1', room: 'T.B.A.', day: 'Wednesday', time: '7:00 PM–9:00 PM', start: 1140, end: 1260, lectureUnits: 2, labUnits: 0, units: 2, category: 'core' },
    { code: 'GECETH-18', title: 'Ethics', room: 'T.B.A.', day: 'Thursday', time: '7:00 AM–10:00 AM', start: 420, end: 600, lectureUnits: 3, labUnits: 0, units: 3, category: 'general' },
    { code: 'PE3 ID-18', title: 'Individual/Dual Sports/Games', room: 'MPH5', day: 'Thursday', time: '10:00 AM–12:00 PM', start: 600, end: 720, lectureUnits: 2, labUnits: 0, units: 2, category: 'pe' },
    { code: 'CCL211-18', title: 'Information Management 1 (Lab)', room: 'M101', day: 'Thursday', time: '1:00 PM–4:00 PM', start: 780, end: 960, lectureUnits: 0, labUnits: 1, units: 1, category: 'lab' },
    { code: 'ITLEL-18', title: 'IT Elective 1 (Lab)', room: 'M101', day: 'Thursday', time: '4:00 PM–7:00 PM', start: 960, end: 1140, lectureUnits: 0, labUnits: 1, units: 1, category: 'lab' },
    { code: 'ITL213-18', title: 'Human Computer Interaction (Lab)', room: 'M110', day: 'Friday', time: '1:00 PM–4:00 PM', start: 780, end: 960, lectureUnits: 0, labUnits: 1, units: 1, category: 'lab' },
    { code: 'CCL212-18', title: 'Data Structures and Algorithm (Lab)', room: 'M108', day: 'Friday', time: '4:00 PM–7:00 PM', start: 960, end: 1140, lectureUnits: 0, labUnits: 1, units: 1, category: 'lab' },
    { code: 'CCC212-18', title: 'Data Structures and Algorithm', room: 'T.B.A.', day: 'Friday', time: '7:00 PM–9:00 PM', start: 1140, end: 1260, lectureUnits: 2, labUnits: 0, units: 2, category: 'core' },
    { code: 'SOSLIT-18', title: 'Sosyedad at Literatura/Panitikang Panlipunan', room: 'T.B.A.', day: 'Saturday', time: '7:00 AM–10:00 AM', start: 420, end: 600, lectureUnits: 3, labUnits: 0, units: 3, category: 'general' },
    { code: 'GECPCO-18', title: 'Purposive Communication', room: 'T.B.A.', day: 'Saturday', time: '10:00 AM–1:00 PM', start: 600, end: 780, lectureUnits: 3, labUnits: 0, units: 3, category: 'general' }
]);

function getScheduleState(dayIndex, minutes) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const current = SCHEDULE.find(subject => subject.day === dayNames[dayIndex] && minutes >= subject.start && minutes < subject.end);

    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
        const day = dayNames[(dayIndex + dayOffset) % 7];
        const next = SCHEDULE.find(subject => subject.day === day && (dayOffset > 0 || subject.start > minutes));
        if (next) return { current, next, dayOffset };
    }

    return { current, next: null, dayOffset: null };
}

if (typeof module !== 'undefined') module.exports = { SCHEDULE, SCHEDULE_DAYS, getScheduleState };
