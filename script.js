const addButton = document.querySelector('#addButton');
const calculateButton = document.querySelector('#calculateButton');
const courseInput = document.querySelector('#course');
const gradeSelect = document.querySelector('#grade');
const creditHoursInput = document.querySelector('#credit_hours');
const gradesTable = document.querySelector('#gradesTable tbody');
const gpaDisplay = document.querySelector('#gpaDisplay');
const error = document.querySelector('#error');

// Map of grades to grade points based on the standard GPA scale
const gradeToPoints = {
    'A+': 4.0,
    'A': 4.0,
    'A-': 3.67,
    'B+': 3.33,
    'B': 3.00,
    'B-': 2.67,
    'C+': 2.33,
    'C': 2.00,
    'C-': 1.67,
    'D+': 1.33,
    'D': 1.00,
    'D-': 0.67,
    'F': 0.00,
};

// This function displays the error messages to the user
const showError = (message) => {
    error.textContent = message; // It sets the error message text
    error.classList.remove('d-none'); // It makes the error message visible

    // Automatically hides the error message after 5 seconds
    setTimeout(() => error.classList.add('d-none'), 5000);
};

// This function clears the form inputs after adding or editing a course entry
const clearForm = () => {
    courseInput.value = ''; // Reset course input field
    gradeSelect.selectedIndex = 0; // It resets the grade dropdown to default selection
    creditHoursInput.value = '1'; // It resets the credit hours input to default value
};

// Event listener to handle adding a new course entry
addButton.addEventListener('click', () => {
    const course = courseInput.value.trim(); // Get course input value
    const grade = gradeSelect.value; // Get selected grade value
    const creditHours = Number(creditHoursInput.value); // Convert credit hours to a number

    // Validates inputs: all fields must be filled correctly
    if (!course || !grade || creditHours <= 0 || creditHours > 5) {
        showError('Please fill in all fields correctly. Credit hours must be between 1 and 5.');
        return; // Stop execution if validation fails
    }

    // Creates a new row in the table for the course entry
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${course}</td> <!-- Course subject -->
        <td>${grade}</td> <!-- Course grade -->
        <td>${creditHours}</td> <!-- Credit hours -->
        <td>
            <button class="btn btn-warning btn-sm edit-btn">Edit</button> <!-- Edit button -->
            <button class="btn btn-danger btn-sm delete-btn">Delete</button> <!-- Delete button -->
        </td>
    `;

    gradesTable.appendChild(newRow); // Append the new row to the table
    clearForm(); // Clear form inputs
});

// Event listener to handle editing and deleting course entries
gradesTable.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        // this deletes the row associated with the clicked delete button
        e.target.closest('tr').remove();
    } else if (e.target.classList.contains('edit-btn')) {
        const row = e.target.closest('tr'); // Gets the row to be edited
        const cells = row.querySelectorAll('td'); // Gets all the cells in the row

        // Pre-filled form inputs with the row's data for editing
        courseInput.value = cells[0].textContent; // this sets the course
        gradeSelect.value = cells[1].textContent; // this sets the grade
        creditHoursInput.value = cells[2].textContent; // this sets credit hours

        row.remove(); // Removes the row from the table (will be added back after editing)
    }
});

// Event listener for calculating cumulative GPA
calculateButton.addEventListener('click', () => {
    let totalGradePoints = 0; // Initialize the total grade points for the current term
    let totalCreditHours = 0; // Initialize the total credit hours for the current term

    // Iterate through each course in the table
    gradesTable.querySelectorAll('tr').forEach((row) => {
        const grade = row.cells[1].textContent; // Get grade
        const creditHours = Number(row.cells[2].textContent); // Get credit hours

        // Only include valid grades
        if (gradeToPoints[grade] !== undefined) {
            totalGradePoints += gradeToPoints[grade] * creditHours; // This adds the quality points
            totalCreditHours += creditHours; // this adds the credit hours
        }
    });

    // Validates that there are valid courses to calculate GPA
    if (totalCreditHours === 0) {
        showError('No valid entries to calculate GPA.');
        return;
    }

    // Calculates the current GPA for the term
    const currentGpa = totalGradePoints / totalCreditHours;

    // Gets previous GPA and GPA hours
    const previousGpa = Number(document.querySelector('#previous_gpa').value || 0); // Previous GPA
    const previousGpaHours = Number(document.querySelector('#previous_gpa_hours').value || 0); // Previous GPA hours

    // Validates the previous GPA inputs
    if (previousGpa < 0 || previousGpa > 4.0) {
        showError('Previous GPA must be between 0.00 and 4.00.');
        return;
    }
    if (previousGpaHours < 0) {
        showError('Previous GPA hours must be non-negative.');
        return;
    }

    // Calculate cumulative GPA
    const cumulativeGpa = (
        (previousGpa * previousGpaHours) + (currentGpa * totalCreditHours)
    ) / (previousGpaHours + totalCreditHours);

    // Displays the cumulative GPA
    gpaDisplay.textContent = `Your Cumulative GPA: ${cumulativeGpa.toFixed(2)}`;
    gpaDisplay.classList.add('alert-success'); // Apply success styling
});

