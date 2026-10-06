'use strict';


// -----------------------------------
// GRADE SCALE
// -----------------------------------

const gradeToPoints = {
    'A+': 4,
    'A': 4,
    'A-': 3.67,
    'B+': 3.33,
    'B': 3,
    'B-': 2.67,
    'C+': 2.33,
    'C': 2,
    'C-': 1.67,
    'D+': 1.33,
    'D': 1,
    'D-': 0.67,
    'F': 0
};


// Name used when saving calculator data in the browser
const STORAGE_KEY = 'muhais-gpa-calculator-v2';


// -----------------------------------
// VARIABLES
// -----------------------------------

let courses = [];
let editingId = null;
let announcementTimer;


// -----------------------------------
// VALIDATE A COURSE
// -----------------------------------

function validCourse(course) {

    // Make sure the course exists
    if (!course) {
        return false;
    }

    // Course name cannot be empty
    if (course.name.trim() === '') {
        return false;
    }

    // Course name cannot be longer than 80 characters
    if (course.name.length > 80) {
        return false;
    }

    // Grade must exist in our grade scale
    if (!(course.grade in gradeToPoints)) {
        return false;
    }

    // Credits must be a real number
    if (!Number.isFinite(course.credits)) {
        return false;
    }

    // Credits must be greater than 0
    if (course.credits <= 0) {
        return false;
    }

    // Credits cannot be more than 30
    if (course.credits > 30) {
        return false;
    }

    return true;
}


// -----------------------------------
// ACCESSIBILITY ANNOUNCEMENT
// -----------------------------------

function announce(text) {

    clearTimeout(announcementTimer);

    announcementTimer = setTimeout(function () {
        document.getElementById('announcement').textContent = text;
    }, 250);
}


// -----------------------------------
// SAVE DATA
// -----------------------------------

function save() {

    try {

        const data = {
            version: 2,
            courses: courses,
            previousGpa: document.getElementById('previous_gpa').value,
            previousHours: document.getElementById('previous_gpa_hours').value
        };

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

        document.getElementById('saveStatus').textContent =
            'Saved on this device';

    } catch (error) {

        document.getElementById('saveStatus').textContent =
            'Storage unavailable. Keep this page open.';
    }
}


// -----------------------------------
// RESTORE SAVED DATA
// -----------------------------------

function restore() {

    try {

        const raw = localStorage.getItem(STORAGE_KEY);

        // If nothing has been saved yet, stop here
        if (!raw) {
            return;
        }

        const data = JSON.parse(raw);

        // Make sure the saved data has courses
        if (!Array.isArray(data.courses)) {
            throw new Error('Invalid saved data');
        }

        // Check every saved course
        for (const course of data.courses) {

            if (!validCourse(course)) {
                throw new Error('Invalid saved course');
            }
        }

        courses = data.courses;

        document.getElementById('previous_gpa').value =
            data.previousGpa || '';

        document.getElementById('previous_gpa_hours').value =
            data.previousHours || '';

    } catch (error) {

        document.getElementById('saveStatus').textContent =
            'Saved data unavailable. Start a new calculation.';
    }
}


// -----------------------------------
// GET PREVIOUS GPA INFORMATION
// -----------------------------------

function history() {

    const gpaInput =
        document.getElementById('previous_gpa');

    const hoursInput =
        document.getElementById('previous_gpa_hours');


    const gpaValue = gpaInput.value;
    const hoursValue = hoursInput.value;


    let message = '';


    // If both boxes are empty
    if (gpaValue === '' && hoursValue === '') {

        return {
            gpa: 0,
            hours: 0,
            provided: false,
            message: ''
        };
    }


    // If one field is empty but the other is not
    if (gpaValue === '' || hoursValue === '') {

        message =
            'Enter both previous GPA and GPA hours, or leave both blank.';
    }


    const previousGpa = Number(gpaValue);
    const previousHours = Number(hoursValue);


    // Validate GPA
    if (
        gpaValue !== '' &&
        (
            !Number.isFinite(previousGpa) ||
            previousGpa < 0 ||
            previousGpa > 4
        )
    ) {

        message =
            'Previous GPA must be between 0.00 and 4.00.';
    }


    // Validate GPA hours
    if (
        hoursValue !== '' &&
        (
            !Number.isFinite(previousHours) ||
            previousHours < 0 ||
            previousHours > 10000
        )
    ) {

        message =
            'Previous GPA hours must be between 0 and 10,000.';
    }


    return {
        gpa: previousGpa,
        hours: previousHours,
        provided: true,
        message: message
    };
}


// -----------------------------------
// CALCULATE GPA
// -----------------------------------

function updateResults() {

    let totalCredits = 0;
    let totalPoints = 0;


    // Go through each course
    for (const course of courses) {

        totalCredits =
            totalCredits + course.credits;

        totalPoints =
            totalPoints +
            gradeToPoints[course.grade] * course.credits;
    }


    // -------------------------------
    // SEMESTER GPA
    // -------------------------------

    let semesterGpa = null;

    if (totalCredits > 0) {

        semesterGpa =
            totalPoints / totalCredits;
    }


    // -------------------------------
    // PREVIOUS GPA
    // -------------------------------

    const previous = history();


    // -------------------------------
    // CUMULATIVE GPA
    // -------------------------------

    let cumulativeGpa = null;

    const allHours =
        totalCredits + previous.hours;


    if (
        previous.message === '' &&
        allHours > 0
    ) {

        const previousQualityPoints =
            previous.gpa * previous.hours;

        const allQualityPoints =
            previousQualityPoints + totalPoints;

        cumulativeGpa =
            allQualityPoints / allHours;
    }


    // -------------------------------
    // DISPLAY SEMESTER GPA
    // -------------------------------

    if (semesterGpa === null) {

        document.getElementById('semesterGpa').textContent =
            '—';

    } else {

        document.getElementById('semesterGpa').textContent =
            semesterGpa.toFixed(2);
    }


    // -------------------------------
    // DISPLAY CUMULATIVE GPA
    // -------------------------------

    if (cumulativeGpa === null) {

        document.getElementById('cumulativeGpa').textContent =
            '—';

    } else {

        document.getElementById('cumulativeGpa').textContent =
            cumulativeGpa.toFixed(2);
    }


    // -------------------------------
    // DISPLAY CREDITS AND POINTS
    // -------------------------------

    document.getElementById('totalCredits').textContent =
        totalCredits.toFixed(2);

    document.getElementById('qualityPoints').textContent =
        totalPoints.toFixed(2);


    // -------------------------------
    // GPA BAR
    // -------------------------------

    let meterPercent = 0;

    if (semesterGpa !== null) {

        meterPercent =
            semesterGpa / 4 * 100;
    }

    document.getElementById('gpaMeter').style.width =
        meterPercent + '%';


    // -------------------------------
    // PREVIOUS GPA ERROR MESSAGE
    // -------------------------------

    const previousError =
        document.getElementById('previousError');


    previousError.textContent =
        previous.message;


    if (previous.message) {

        previousError.hidden = false;

        document
            .getElementById('previous_gpa')
            .setAttribute('aria-invalid', 'true');

        document
            .getElementById('previous_gpa_hours')
            .setAttribute('aria-invalid', 'true');

    } else {

        previousError.hidden = true;

        document
            .getElementById('previous_gpa')
            .setAttribute('aria-invalid', 'false');

        document
            .getElementById('previous_gpa_hours')
            .setAttribute('aria-invalid', 'false');
    }


    // -------------------------------
    // RESULT MESSAGE
    // -------------------------------

    let resultMessage = '';


    if (previous.message) {

        resultMessage =
            'Complete your previous GPA details for a cumulative result.';

    } else if (
        totalCredits === 0 &&
        previous.hours > 0
    ) {

        resultMessage =
            'Showing your previous GPA. Add courses to explore this semester.';

    } else if (totalCredits === 0) {

        resultMessage =
            'Add a course to get started.';

    } else if (
        previous.provided === false ||
        previous.hours === 0
    ) {

        resultMessage =
            'Add previous semesters to include your academic history.';

    } else {

        resultMessage =
            'Based on ' +
            allHours.toFixed(2) +
            ' total GPA hours.';
    }


    document.getElementById('resultNote').textContent =
        resultMessage;


    // -------------------------------
    // RESET BUTTON
    // -------------------------------

    const previousGpaValue =
        document.getElementById('previous_gpa').value;

    const previousHoursValue =
        document.getElementById('previous_gpa_hours').value;


    if (
        courses.length === 0 &&
        previousGpaValue === '' &&
        previousHoursValue === ''
    ) {

        document.getElementById('clearAll').disabled =
            true;

    } else {

        document.getElementById('clearAll').disabled =
            false;
    }


    // -------------------------------
    // SCREEN READER ANNOUNCEMENT
    // -------------------------------

    let semesterAnnouncement =
        'not yet available';

    let cumulativeAnnouncement =
        'not yet available';


    if (semesterGpa !== null) {

        semesterAnnouncement =
            semesterGpa.toFixed(2);
    }


    if (cumulativeGpa !== null) {

        cumulativeAnnouncement =
            cumulativeGpa.toFixed(2);
    }


    announce(
        'Semester GPA: ' +
        semesterAnnouncement +
        '. Cumulative GPA: ' +
        cumulativeAnnouncement +
        '.'
    );
}


// -----------------------------------
// DISPLAY COURSES
// -----------------------------------

function render() {

    const tableBody =
        document
            .getElementById('gradesTable')
            .querySelector('tbody');


    // Remove old rows
    tableBody.replaceChildren();


    // Create one row for each course
    for (const course of courses) {

        const row =
            document.createElement('tr');


        // Course name
        const nameCell =
            row.insertCell();

        nameCell.textContent =
            course.name;


        // Grade
        const gradeCell =
            row.insertCell();

        const gradeChip =
            document.createElement('span');

        gradeChip.className =
            'grade-chip';

        gradeChip.textContent =
            course.grade;

        gradeCell.appendChild(
            gradeChip
        );


        // Credits
        const creditsCell =
            row.insertCell();

        creditsCell.textContent =
            course.credits;


        // Actions
        const actionsCell =
            row.insertCell();


        // Edit button
        const editButton =
            document.createElement('button');

        editButton.type =
            'button';

        editButton.textContent =
            'Edit';

        editButton.dataset.action =
            'edit';

        editButton.dataset.id =
            course.id;

        editButton.setAttribute(
            'aria-label',
            'Edit ' + course.name
        );


        // Delete button
        const deleteButton =
            document.createElement('button');

        deleteButton.type =
            'button';

        deleteButton.textContent =
            'Delete';

        deleteButton.dataset.action =
            'delete';

        deleteButton.dataset.id =
            course.id;

        deleteButton.setAttribute(
            'aria-label',
            'Delete ' + course.name
        );


        actionsCell.appendChild(
            editButton
        );

        actionsCell.appendChild(
            deleteButton
        );


        tableBody.appendChild(
            row
        );
    }


    // -------------------------------
    // COURSE COUNT
    // -------------------------------

    let courseText =
        courses.length + ' courses';


    if (courses.length === 1) {

        courseText =
            '1 course';
    }


    document.getElementById('courseCount').textContent =
        courseText;


    // -------------------------------
    // EMPTY STATE
    // -------------------------------

    if (courses.length === 0) {

        document.getElementById('emptyState').hidden =
            false;

        document.getElementById('tableWrap').hidden =
            true;

    } else {

        document.getElementById('emptyState').hidden =
            true;

        document.getElementById('tableWrap').hidden =
            false;
    }


    updateResults();
}


// -----------------------------------
// CLEAR FORM
// -----------------------------------

function clearForm(focusCourseInput) {

    editingId = null;


    document
        .getElementById('gradeForm')
        .reset();


    document
        .getElementById('addButton')
        .textContent = '+ Add course';


    document
        .getElementById('cancelEdit')
        .hidden = true;


    document
        .getElementById('error')
        .hidden = true;


    if (focusCourseInput === true) {

        document
            .getElementById('course')
            .focus();
    }
}


// -----------------------------------
// FORM SUBMIT
// -----------------------------------

document
    .getElementById('gradeForm')
    .addEventListener(
        'submit',
        function (event) {

            event.preventDefault();


            // ---------------------------
            // CREATE COURSE ID
            // ---------------------------

            let courseId;


            // If editing, keep existing ID
            if (editingId !== null) {

                courseId =
                    editingId;

            } else {

                courseId =
                    'course-' +
                    Date.now() +
                    '-' +
                    Math.random()
                        .toString(36)
                        .slice(2);
            }


            // ---------------------------
            // CREATE COURSE OBJECT
            // ---------------------------

            const course = {

                id: courseId,

                name:
                    document
                        .getElementById('course')
                        .value
                        .trim(),

                grade:
                document
                    .getElementById('grade')
                    .value,

                credits:
                    Number(
                        document
                            .getElementById('credit_hours')
                            .value
                    )
            };


            // ---------------------------
            // VALIDATE
            // ---------------------------

            if (!validCourse(course)) {

                const error =
                    document.getElementById('error');

                error.textContent =
                    'Enter a course name, grade, and credit hours greater than 0 and no more than 30.';

                error.hidden =
                    false;

                return;
            }


            // ---------------------------
            // EDIT EXISTING COURSE
            // ---------------------------

            if (editingId !== null) {

                for (
                    let i = 0;
                    i < courses.length;
                    i++
                ) {

                    if (
                        courses[i].id === editingId
                    ) {

                        courses[i] =
                            course;
                    }
                }

            }

                // ---------------------------
                // ADD NEW COURSE
            // ---------------------------

            else {

                courses.push(
                    course
                );
            }


            clearForm(true);

            render();

            save();
        }
    );


// -----------------------------------
// CANCEL EDIT
// -----------------------------------

document
    .getElementById('cancelEdit')
    .addEventListener(
        'click',
        function () {

            clearForm(true);
        }
    );


// -----------------------------------
// EDIT AND DELETE BUTTONS
// -----------------------------------

document
    .getElementById('gradesTable')
    .addEventListener(
        'click',
        function (event) {

            const button =
                event.target.closest(
                    'button[data-action]'
                );


            if (!button) {
                return;
            }


            const courseId =
                button.dataset.id;


            let selectedCourse = null;


            // Find the course that was clicked
            for (const course of courses) {

                if (
                    course.id === courseId
                ) {

                    selectedCourse =
                        course;

                    break;
                }
            }


            if (!selectedCourse) {
                return;
            }


            // ---------------------------
            // EDIT
            // ---------------------------

            if (
                button.dataset.action ===
                'edit'
            ) {

                editingId =
                    selectedCourse.id;


                document
                    .getElementById('course')
                    .value =
                    selectedCourse.name;


                document
                    .getElementById('grade')
                    .value =
                    selectedCourse.grade;


                document
                    .getElementById('credit_hours')
                    .value =
                    selectedCourse.credits;


                document
                    .getElementById('addButton')
                    .textContent =
                    'Save changes';


                document
                    .getElementById('cancelEdit')
                    .hidden =
                    false;


                document
                    .getElementById('error')
                    .hidden =
                    true;


                document
                    .getElementById('course')
                    .focus();
            }


                // ---------------------------
                // DELETE
            // ---------------------------

            else if (
                button.dataset.action ===
                'delete'
            ) {

                const newCourses = [];


                for (const course of courses) {

                    if (
                        course.id !==
                        selectedCourse.id
                    ) {

                        newCourses.push(
                            course
                        );
                    }
                }


                courses =
                    newCourses;


                // If we deleted the course
                // we were editing
                if (
                    editingId ===
                    selectedCourse.id
                ) {

                    clearForm(false);
                }


                render();

                save();


                document
                    .getElementById('course')
                    .focus();
            }
        }
    );


// -----------------------------------
// PREVIOUS GPA INPUTS
// -----------------------------------

document
    .getElementById('previous_gpa')
    .addEventListener(
        'input',
        function () {

            updateResults();
            save();
        }
    );


document
    .getElementById('previous_gpa_hours')
    .addEventListener(
        'input',
        function () {

            updateResults();
            save();
        }
    );


// -----------------------------------
// RESET CALCULATOR
// -----------------------------------

document
    .getElementById('clearAll')
    .addEventListener(
        'click',
        function () {

            document
                .getElementById('resetDialog')
                .showModal();
        }
    );


// Keep data button
document
    .getElementById('keepData')
    .addEventListener(
        'click',
        function () {

            document
                .getElementById('resetDialog')
                .close();
        }
    );


// Confirm reset
document
    .getElementById('confirmReset')
    .addEventListener(
        'click',
        function () {

            courses = [];


            document
                .getElementById('previous_gpa')
                .value = '';


            document
                .getElementById('previous_gpa_hours')
                .value = '';


            clearForm(false);

            render();


            try {

                localStorage.removeItem(
                    STORAGE_KEY
                );

                document
                    .getElementById('saveStatus')
                    .textContent =
                    'Saved data cleared';

            } catch (error) {

                document
                    .getElementById('saveStatus')
                    .textContent =
                    'Could not clear saved data. Browser storage is unavailable.';
            }


            document
                .getElementById('resetDialog')
                .close();


            document
                .getElementById('course')
                .focus();
        }
    );


// -----------------------------------
// DISPLAY GRADE SCALE
// -----------------------------------

for (const grade in gradeToPoints) {

    const points =
        gradeToPoints[grade];


    const span =
        document.createElement('span');


    span.textContent =
        grade +
        ' = ' +
        points.toFixed(2);


    document
        .getElementById('gradeScale')
        .appendChild(span);
}


// -----------------------------------
// START THE CALCULATOR
// -----------------------------------

restore();

render();