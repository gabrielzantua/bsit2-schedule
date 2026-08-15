const dayNav = document.querySelector('#day-nav');
const scheduleGrid = document.querySelector('#schedule-grid');
const searchInput = document.querySelector('#schedule-search');
const emptyState = document.querySelector('#empty-state');
const subjectDialog = document.querySelector('#subject-dialog');
let selectedDay = 'All days';

function classesForDay(day) {
    return SCHEDULE.filter(subject => subject.day === day).sort((a, b) => a.start - b.start);
}

function renderDayNavigation() {
    ['All days', ...SCHEDULE_DAYS].forEach(day => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = day;
        button.dataset.day = day;
        button.setAttribute('aria-pressed', String(day === selectedDay));
        button.addEventListener('click', () => {
            selectedDay = day;
            dayNav.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
            filterSchedule();
        });
        dayNav.append(button);
    });
}

function renderSchedule() {
    SCHEDULE_DAYS.forEach(day => {
        const dayClasses = classesForDay(day);
        const column = document.createElement('section');
        column.className = 'day-column';
        column.dataset.day = day;
        column.setAttribute('aria-labelledby', `day-${day.toLowerCase()}`);

        const heading = document.createElement('header');
        heading.className = 'day-header';
        heading.innerHTML = `<div><span>${day.slice(0, 3).toUpperCase()}</span><h3 id="day-${day.toLowerCase()}">${day}</h3></div><span>${dayClasses.length} ${dayClasses.length === 1 ? 'class' : 'classes'}</span>`;
        column.append(heading);

        const list = document.createElement('ol');
        list.className = 'class-list';
        dayClasses.forEach(subject => list.append(createSubjectCard(subject)));
        column.append(list);
        scheduleGrid.append(column);
    });
}

function createSubjectCard(subject) {
    const item = document.createElement('li');
    item.dataset.search = `${subject.code} ${subject.title} ${subject.room}`.toLowerCase();

    const button = document.createElement('button');
    button.type = 'button';
    button.className = `subject-card ${subject.category}${subject.category === 'core' && subject.delivery ? ' async' : ''}`;
    button.dataset.code = subject.code;
    button.setAttribute('aria-label', `${subject.code}, ${subject.title}, ${subject.time}, room ${subject.room}`);

    const time = document.createElement('span');
    time.className = 'class-time';
    time.textContent = subject.delivery || subject.time;
    const code = document.createElement('strong');
    code.textContent = subject.code;
    const title = document.createElement('span');
    title.className = 'subject-title';
    title.textContent = subject.title;
    const room = document.createElement('span');
    room.className = 'room';
    room.innerHTML = `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 21h16M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M9 8h.01M9 12h.01M9 16h.01M14 8h1M14 12h1M14 16h1"/></svg>`;
    room.append(document.createTextNode(subject.room));

    button.append(time, code, title, room);
    button.addEventListener('click', () => showSubjectDetails(subject));
    item.append(button);
    return item;
}

function filterSchedule() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleSubjects = 0;

    document.querySelectorAll('.day-column').forEach(column => {
        const dayMatches = selectedDay === 'All days' || column.dataset.day === selectedDay;
        let daySubjects = 0;

        column.querySelectorAll('.class-list > li').forEach(item => {
            const matches = dayMatches && item.dataset.search.includes(query);
            item.hidden = !matches;
            if (matches) daySubjects += 1;
        });

        column.hidden = !dayMatches || daySubjects === 0;
        visibleSubjects += daySubjects;
    });

    scheduleGrid.classList.toggle('single-day', selectedDay !== 'All days');
    emptyState.hidden = visibleSubjects !== 0;
}

function showSubjectDetails(subject) {
    document.querySelector('#dialog-code').textContent = subject.code;
    document.querySelector('#dialog-title').textContent = subject.title;
    document.querySelector('#dialog-schedule').textContent = `${subject.day}, ${subject.time}`;
    document.querySelector('#dialog-room').textContent = subject.room;
    document.querySelector('#dialog-type').textContent = subject.labUnits ? 'Laboratory' : 'Lecture';
    document.querySelector('#dialog-units').textContent = `${subject.units.toFixed(1)} total (${subject.lectureUnits.toFixed(1)} lecture, ${subject.labUnits.toFixed(1)} lab)`;
    subjectDialog.showModal();
}

function formatCountdown(totalMinutes) {
    if (totalMinutes <= 0) return 'Starting now';
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    const parts = [];

    if (days) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    if (hours) parts.push(`${hours} hr`);
    if (!days && minutes) parts.push(`${minutes} min`);
    return `Starts in ${parts.join(' ')}`;
}

function updateRealtimeSchedule(now = new Date()) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const jsDay = dayNames[now.getDay()];
    const minutes = now.getHours() * 60 + now.getMinutes();
    const { current, next, dayOffset } = getScheduleState(now.getDay(), minutes);
    const currentCard = document.querySelector('#current-subject-card');
    const liveDateTime = document.querySelector('#live-date-time');

    liveDateTime.dateTime = now.toISOString();
    liveDateTime.textContent = new Intl.DateTimeFormat(undefined, {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
    }).format(now);

    document.querySelectorAll('.day-column.is-today').forEach(column => column.classList.remove('is-today'));
    document.querySelectorAll('.subject-card.is-current, .subject-card.is-next').forEach(card => card.classList.remove('is-current', 'is-next'));
    document.querySelector(`.day-column[data-day="${jsDay}"]`)?.classList.add('is-today');
    currentCard.classList.toggle('has-current', Boolean(current));

    if (current) {
        document.querySelector(`[data-code="${current.code}"]`)?.classList.add('is-current');
        document.querySelector('#current-state').textContent = 'In class now';
        document.querySelector('#current-code').textContent = current.code;
        document.querySelector('#current-title').textContent = current.title;
        document.querySelector('#current-time').textContent = `${current.day} · ${current.time}`;
        document.querySelector('#current-room').textContent = `Room ${current.room}`;
        document.querySelector('#current-room').hidden = false;
    } else {
        document.querySelector('#current-state').textContent = 'No class right now';
        document.querySelector('#current-code').textContent = 'Schedule clear';
        document.querySelector('#current-title').textContent = 'You are between scheduled classes.';
        document.querySelector('#current-time').textContent = `No active subject on ${jsDay}`;
        document.querySelector('#current-room').hidden = true;
    }

    if (next) {
        document.querySelector(`[data-code="${next.code}"]`)?.classList.add('is-next');
        document.querySelector('#next-day').textContent = dayOffset === 0 ? 'Today' : dayOffset === 1 ? 'Tomorrow' : next.day;
        document.querySelector('#next-countdown').textContent = formatCountdown(dayOffset * 1440 + next.start - minutes);
        document.querySelector('#next-code').textContent = next.code;
        document.querySelector('#next-title').textContent = next.title;
        document.querySelector('#next-time').textContent = `${next.day} · ${next.time}`;
        document.querySelector('#next-room').textContent = `Room ${next.room}`;
    }
}

renderDayNavigation();
renderSchedule();
updateRealtimeSchedule();
setInterval(updateRealtimeSchedule, 30000);

searchInput.addEventListener('input', filterSchedule);
document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => subjectDialog.close()));
document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInput.focus();
    }
});
