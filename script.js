'use strict';
// State owns the data; the table is only a view of that data.
const gradeToPoints = Object.freeze({
    'A+': 4,
    A: 4,
    'A-': 3.67,
    'B+': 3.33,
    B: 3,
    'B-': 2.67,
    'C+': 2.33,
    C: 2,
    'C-': 1.67,
    'D+': 1.33,
    D: 1,
    'D-': 0.67,
    F: 0
});
const STORAGE_KEY = 'muhais-gpa-calculator-v2';
const $ = id => document.getElementById(id);
let courses = [];
let editingId = null;
let announcementTimer;
const validCourse = c => c && typeof c.id === 'string' && typeof c.name === 'string' && c.name.trim().length > 0 && c.name.length <= 80 && Object.hasOwn(gradeToPoints, c.grade) && Number.isFinite(c.credits) && c.credits > 0 && c.credits <= 30;
function announce(text) {
    clearTimeout(announcementTimer);
    announcementTimer = setTimeout(() => {
        $('announcement').textContent = text;
    }, 250);
}
function save() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            version: 2, courses, previousGpa: $('previous_gpa').value, previousHours: $('previous_gpa_hours').value
        }));
        $('saveStatus').textContent = 'Saved on this device';
    }
    catch {
        $('saveStatus').textContent = 'Storage unavailable. Keep this page open.';
    }
}
function restore() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return;
        const data = JSON.parse(raw);
        if (data.version !== 2 || !Array.isArray(data.courses) || !data.courses.every(validCourse) || new Set(data.courses.map(c => c.id)).size !== data.courses.length || typeof data.previousGpa !== 'string' || typeof data.previousHours !== 'string')
            throw new Error('Invalid saved data');
        courses = data.courses;
        $('previous_gpa').value = data.previousGpa;
        $('previous_gpa_hours').value = data.previousHours;
    }
    catch {
        $('saveStatus').textContent = 'Saved data unavailable. Start a new calculation.';
    }
}
function history() {
    const g = $('previous_gpa'), h = $('previous_gpa_hours');
    const emptyG = g.value === '' && !g.validity.badInput;
    const emptyH = h.value === '' && !h.validity.badInput;
    let message = '';
    if (emptyG && emptyH)
        return {
            gpa: 0, hours: 0, provided: false, message
        };
    if (g.validity.badInput || h.validity.badInput)
        message = 'Enter valid numbers for your previous GPA and GPA hours.';
    else if (emptyG || emptyH)
        message = 'Enter both previous GPA and GPA hours, or leave both blank.';
    else if (!Number.isFinite(Number(g.value)) || Number(g.value) < 0 || Number(g.value) > 4)
        message = 'Previous GPA must be between 0.00 and 4.00.';
    else if (!Number.isFinite(Number(h.value)) || Number(h.value) < 0 || Number(h.value) > 10000)
        message = 'Previous GPA hours must be between 0 and 10,000.';
    return {
        gpa: Number(g.value), hours: Number(h.value), provided: true, message
    };
}
function updateResults() {
    const credits = courses.reduce((sum, c) => sum + c.credits, 0);
    const points = courses.reduce((sum, c) => sum + gradeToPoints[c.grade] * c.credits, 0);
    const semester = credits > 0 ? points / credits : null;
    const prev = history();
    const cumulative = !prev.message && credits + prev.hours > 0 ? (points + prev.gpa * prev.hours) / (credits + prev.hours) : null;
    $('semesterGpa').textContent = semester === null ? '—' : semester.toFixed(2);
    $('cumulativeGpa').textContent = cumulative === null ? '—' : cumulative.toFixed(2);
    $('totalCredits').textContent = Number(credits.toFixed(2)).toString();
    $('qualityPoints').textContent = points.toFixed(2);
    $('gpaMeter').style.width = `${(semester ?? 0) / 4 * 100}%`;
    $('previousError').textContent = prev.message;
    $('previousError').hidden = !prev.message;
    for (const id of ['previous_gpa', 'previous_gpa_hours'])
        $(id).setAttribute('aria-invalid', String(Boolean(prev.message)));
    $('resultNote').textContent = prev.message ? 'Complete your previous GPA details for a cumulative result.' : credits === 0 ? (prev.hours > 0 ? 'Showing your previous GPA. Add courses to explore this semester.' : 'Add a course to get started.') : !prev.provided || prev.hours === 0 ? 'Add previous semesters to include your academic history.' : `Based on ${Number((credits + prev.hours).toFixed(2))} total GPA hours.`;
    $('clearAll').disabled = courses.length === 0 && !$('previous_gpa').value && !$('previous_gpa_hours').value;
    announce(`Semester GPA: ${semester === null ? 'not yet available' : semester.toFixed(2)}. Cumulative GPA: ${cumulative === null ? 'not yet available' : cumulative.toFixed(2)}.`);
}
function render() {
    const body = $('gradesTable').querySelector('tbody');
    body.replaceChildren();
    for (const c of courses) {
        const row = document.createElement('tr');
        const name = row.insertCell();
        name.textContent = c.name;
        const grade = row.insertCell();
        const chip = document.createElement('span');
        chip.className = 'grade-chip';
        chip.textContent = c.grade;
        grade.append(chip);
        row.insertCell().textContent = String(c.credits);
        const actions = row.insertCell();
        for (const action of ['Edit', 'Delete']) {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = action;
            button.dataset.action = action.toLowerCase();
            button.dataset.id = c.id;
            button.setAttribute('aria-label', `${action} ${c.name}`);
            actions.append(button);
        }
        body.append(row);
    }
    $('courseCount').textContent = `${courses.length} course${courses.length === 1 ? '' : 's'}`;
    $('emptyState').hidden = courses.length > 0;
    $('tableWrap').hidden = courses.length === 0;
    updateResults();
}
function clearForm(focus = true) {
    editingId = null;
    $('gradeForm').reset();
    $('addButton').textContent = '+ Add course';
    $('cancelEdit').hidden = true;
    $('error').hidden = true;
    if (focus)
        $('course').focus();
}
$('gradeForm').addEventListener('submit', event => {
    event.preventDefault();
    const course = {
        id: editingId ?? `course-${Date.now()}-${Math.random().toString(36).slice(2)}`, name: $('course').value.trim(), grade: $('grade').value, credits: Number($('credit_hours').value)
    };
    if (!validCourse(course)) {
        $('error').textContent = 'Enter a course name, grade, and credit hours greater than 0 and no more than 30.';
        $('error').hidden = false;
        return;
    }
    if (editingId)
        courses = courses.map(c => c.id === editingId ? course : c);
    else
        courses.push(course);
    clearForm();
    render();
    save();
});
$('cancelEdit').addEventListener('click', () => clearForm());
$('gradesTable').addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button)
        return;
    const c = courses.find(c => c.id === button.dataset.id);
    if (!c)
        return;
    if (button.dataset.action === 'edit') {
        editingId = c.id;
        $('course').value = c.name;
        $('grade').value = c.grade;
        $('credit_hours').value = c.credits;
        $('addButton').textContent = 'Save changes';
        $('cancelEdit').hidden = false;
        $('error').hidden = true;
        $('course').focus();
    }
    else {
        const index = courses.findIndex(item => item.id === c.id);
        courses = courses.filter(item => item.id !== c.id);
        if (editingId === c.id)
            clearForm(false);
        render();
        save();
        const remaining = $('gradesTable').querySelectorAll('button[data-action="delete"]');
        (remaining[Math.min(index, remaining.length - 1)] ?? $('course')).focus();
    }
});
for (const id of ['previous_gpa', 'previous_gpa_hours'])
    $(id).addEventListener('input', () => {
        updateResults();
        save();
    });
$('clearAll').addEventListener('click', () => $('resetDialog').showModal());
$('keepData').addEventListener('click', () => $('resetDialog').close());
$('confirmReset').addEventListener('click', () => {
    courses = [];
    $('previous_gpa').value = '';
    $('previous_gpa_hours').value = '';
    clearForm(false);
    render();
    try {
        localStorage.removeItem(STORAGE_KEY);
        $('saveStatus').textContent = 'Saved data cleared';
    }
    catch {
        $('saveStatus').textContent = 'Could not clear saved data. Browser storage is unavailable.';
    }
    $('resetDialog').close();
    $('course').focus();
});
for (const [grade, points] of Object.entries(gradeToPoints)) {
    const span = document.createElement('span');
    span.textContent = `${grade} = ${points.toFixed(2)}`;
    $('gradeScale').append(span);
}
restore();
render();
