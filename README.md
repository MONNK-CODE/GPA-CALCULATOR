# GPA Calculator

## Overview

This GPA Calculator is a web-based application designed to simplify the process of calculating both current and cumulative GPAs. Unlike calculators that require students to manually calculate intermediate values like quality points and GPA hours, this tool automates the entire process, ensuring accuracy and ease of use.

I was inspired to create this after noticing that the UIUC GPA Calculator required users to do most of the calculations themselves, which I found inconvenient and time-consuming. My goal was to build a user-friendly solution that empowers students to focus on their academic performance rather than manual calculations.

## Features

- **Add Courses**: Input course names, grades, and credit hours.
- **Edit and Delete Entries**: Modify or remove entries dynamically from the course list.
- **Automatic GPA Calculation**:
    - Calculates **Current GPA** based on the courses entered for the term.
    - Calculates **Cumulative GPA** using the provided previous GPA and GPA hours.
- **Validations**:
    - Ensures grades, credit hours, and previous GPA inputs are within valid ranges.
- **Error Handling**: Displays informative error messages for invalid inputs.

## How It Works

1. **Input Fields**:
    - **Course Name**: Enter the name of the course (e.g., "CHEM 101").
    - **Grade**: Select the grade received from a dropdown (e.g., "A", "B+").
    - **Credit Hours**: Enter the credit hours for the course (e.g., 3).
    - **Previous GPA**: Enter your GPA from prior terms (e.g., 3.42).
    - **Previous GPA Hours**: Enter the total GPA hours from prior terms (e.g., 14).

2. **Add Courses**:
    - Click the "Add" button to add a course to the table.

3. **Calculate GPA**:
    - Click the "Calculate GPA" button to compute:
        - **Current GPA**: Based on the entered courses.
        - **Cumulative GPA**: Combining the previous GPA and the current term's GPA.

4. **Edit or Delete**:
    - Use the "Edit" button to update a course entry.
    - Use the "Delete" button to remove a course.

## Why I Built This

As a student at UIUC, I noticed that the official GPA calculator required users to manually calculate quality points and other intermediate values. I found this process inefficient and user-unfriendly. I decided to create my own GPA calculator that automates these calculations, providing a much smoother and more efficient experience for students.

## Technologies Used

- **HTML**: For creating the structure of the web page.
- **CSS**: For styling and ensuring a responsive, visually appealing design.
- **JavaScript**: For dynamic functionality and GPA calculations.
- **Bootstrap**: For responsive UI components and consistent styling.


## Sample Inputs and Calculation

### Example:
| **Course** | **Grade** | **Grade Points** | **Credit Hours** | **Quality Points**            |
|------------|-----------|------------------|------------------|-------------------------------|
| CHEM 102   | B+        | 3.33             | 3                | \( 3.33 $\times$ 3 = 9.99 \)  |
| CS 225     | A         | 4.00             | 1                | \( 4.00 $\times$ 1 = 4.00 \)  |
| ECON 102   | C-        | 1.67             | 3                | \( 1.67 $\times$ 3 = 5.01 \)  |
| MATH 221   | F         | 0.00             | 5                | \( 0.00 $\times$ 5 = 0.00 \)  |
| PSYCH 100  | A+        | 4.00             | 4                | \( 4.00 $\times$ 4 = 16.00 \) |

**Previous GPA**: 3.42  
**Previous GPA Hours**: 14

**Cumulative GPA Calculation**:
$$
\text{Cumulative GPA} = \frac{(3.42 \times 14) + (4.00 \times 1)}{14 + 1} = 3.46
$$

## Note on Development

This project was created with the help of AI to accelerate the development process.The entire bootstrap UI was done by AI, AI provided assistance in generating the code, debugging, and structuring the application. However, the design choices, problem-solving approach, and implementation reflect my personal initiative and goals.

## Future Improvements

- Add support for additional grading scales (e.g., percentage-based grades).
- Allow users to export their course list and GPA calculations as a PDF.
- Add dark mode for a better user experience.

## Acknowledgment

This GPA Calculator is a tool built for students who value efficiency and simplicity. By automating manual steps, it saves time and helps users stay focused on their academic goals.

---

Feel free to use and customize this tool to suit your needs. Feedback is always welcome! 😊