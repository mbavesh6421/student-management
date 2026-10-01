// ======================================================
// STUDENT MANAGEMENT SYSTEM
// Complete JavaScript
// ======================================================


// ======================================================
// GLOBAL VARIABLES
// ======================================================

let studentData = [];

let editingRegisterNo = null;

const statusBox = document.getElementById("status");

const navLinks = document.querySelectorAll(".sidebar nav a");

const views = document.querySelectorAll(".view");

const sidebar = document.getElementById("sidebar");

const menuBtn = document.getElementById("menuBtn");


// ======================================================
// SEMESTER ORDER
// ======================================================

const semOrder = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
    VIII: 8
};


// ======================================================
// NAVIGATION
// ======================================================

navLinks.forEach(link => {

    link.addEventListener("click", function(event) {

        event.preventDefault();

        const targetView = this.dataset.view;

        showView(targetView);

    });

});


function showView(viewName) {

    // Remove active class
    navLinks.forEach(link => {
        link.classList.remove("active");
    });


    // Add active class
    const activeLink =
        document.querySelector(`[data-view="${viewName}"]`);

    if (activeLink) {
        activeLink.classList.add("active");
    }


    // Hide all views
    views.forEach(view => {
        view.hidden = true;
    });


    // Show selected view
    const selectedView =
        document.getElementById(viewName);

    if (selectedView) {
        selectedView.hidden = false;
    }


    // Close mobile sidebar
    sidebar.classList.remove("open");


    // Render appropriate page

    if (viewName === "dashboard") {
        renderDashboard();
    }

    if (viewName === "students") {
        renderStudents();
    }

    if (viewName === "add") {
        editingRegisterNo = null;
        renderStudentForm();
    }

}


// ======================================================
// MOBILE MENU
// ======================================================

menuBtn.addEventListener("click", function() {

    sidebar.classList.toggle("open");

});


// ======================================================
// LOAD STUDENTS
// ======================================================

async function loadStudents() {

    statusBox.innerHTML = `
        <p class="loading">
            ⏳ Loading student data...
        </p>
    `;


    try {

        const response =
            await fetch("students.json");


        if (!response.ok) {

            throw new Error(
                "Could not load students.json"
            );

        }


        // Check local storage first

        const savedData =
            localStorage.getItem("studentData");


        if (savedData) {

            studentData =
                JSON.parse(savedData);

        } else {

            studentData =
                await response.json();

        }


        statusBox.innerHTML = "";


        renderDashboard();

        renderStudents();


    } catch (error) {

        console.error(error);


        statusBox.innerHTML = `
            <p class="error">
                ⚠️ Could not load student data.
                Please check students.json.
            </p>
        `;

    }

}


// ======================================================
// SAVE TO LOCAL STORAGE
// ======================================================

function saveToLocalStorage() {

    localStorage.setItem(
        "studentData",
        JSON.stringify(studentData)
    );

}


// ======================================================
// DASHBOARD
// ======================================================

function renderDashboard() {

    const departmentCount = {};

    const yearSemesterCount = {};


    studentData.forEach(student => {

        // Department count

        if (!departmentCount[student.department]) {

            departmentCount[student.department] = 0;

        }

        departmentCount[student.department]++;


        // Year + semester count

        const key =
            `${student.year}|${student.semester}`;


        if (!yearSemesterCount[key]) {

            yearSemesterCount[key] = 0;

        }

        yearSemesterCount[key]++;

    });


    // Department cards

    const departmentCards =
        Object.entries(departmentCount)
            .map(([department, count]) => {

                return `
                    <div class="card stat">

                        <h3>${department}</h3>

                        <p>${count}</p>

                    </div>
                `;

            })
            .join("");


    // Year/Semester rows

    const yearRows =
        Object.entries(yearSemesterCount)

            .sort((a, b) => {

                const semA =
                    a[0].split("|")[1];

                const semB =
                    b[0].split("|")[1];

                return (
                    semOrder[semA] -
                    semOrder[semB]
                );

            })

            .map(([key, count]) => {

                const [year, semester] =
                    key.split("|");


                return `
                    <tr>

                        <td>
                            Year ${year}
                        </td>

                        <td>
                            Semester ${semester}
                        </td>

                        <td>
                            ${count}
                        </td>

                    </tr>
                `;

            })

            .join("");


    // Dashboard HTML

    document.getElementById("dashboard").innerHTML = `

        <h1>Dashboard</h1>

        <p class="dashboard-subtitle">
            Overview of student records
        </p>


        <div class="stats-grid">


            <!-- Total -->

            <div class="card stat total">

                <h3>Total Students</h3>

                <p>
                    ${studentData.length}
                </p>

            </div>


            <!-- Departments -->

            ${departmentCards}


        </div>


        <!-- Year Semester -->

        <div class="card">

            <h2>
                Year / Semester Summary
            </h2>


            <div class="table-wrap">

                <table>

                    <thead>

                        <tr>

                            <th>Year</th>

                            <th>Semester</th>

                            <th>Students</th>

                        </tr>

                    </thead>


                    <tbody>

                        ${yearRows}

                    </tbody>

                </table>

            </div>

        </div>

    `;

}


// ======================================================
// STUDENT LIST
// ======================================================

function renderStudents(filteredStudents = studentData) {

    const studentsView =
        document.getElementById("students");


    // Empty state

    if (filteredStudents.length === 0) {

        studentsView.innerHTML = `

            <div class="page-header">

                <div>

                    <h1>Students</h1>

                    <p>
                        Manage all student records
                    </p>

                </div>

            </div>


            <div class="empty-state">

                <div class="empty-icon">
                    👨‍🎓
                </div>

                <h2>
                    No Students Found
                </h2>

                <p>
                    No student records match your search or filter.
                </p>

                <br>

                <button
                    class="primary-btn"
                    onclick="openAddStudent()">

                    ➕ Add Student

                </button>

            </div>

        `;

        return;

    }


    // Student rows

    const rows =
        filteredStudents.map(student => {

            return `

                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(student.registerNo)}
                        </strong>
                    </td>


                    <td>
                        ${escapeHTML(student.name)}
                    </td>


                    <td>

                        <span class="department-badge">

                            ${escapeHTML(student.department)}

                        </span>

                    </td>


                    <td>

                        Year ${escapeHTML(student.year)}

                        <br>

                        <small>
                            Semester ${escapeHTML(student.semester)}
                        </small>

                    </td>


                    <td>
                        ${escapeHTML(student.email)}
                    </td>


                    <td>
                        ${escapeHTML(student.phone)}
                    </td>


                    <td>

                        <div class="action-buttons">

                            <button
                                class="edit-btn"
                                onclick="editStudent('${escapeHTML(student.registerNo)}')">

                                ✏️ Edit

                            </button>


                            <button
                                class="delete-btn"
                                onclick="deleteStudent('${escapeHTML(student.registerNo)}')">

                                🗑️ Delete

                            </button>

                        </div>

                    </td>

                </tr>

            `;

        })

        .join("");


    // Students page

    studentsView.innerHTML = `

        <div class="page-header">

            <div>

                <h1>
                    Students
                </h1>

                <p>
                    Manage all student records
                </p>

            </div>


            <button
                class="primary-btn"
                onclick="openAddStudent()">

                ➕ Add Student

            </button>

        </div>


        <!-- SEARCH AND FILTERS -->

        <div class="card filter-card">

            <div class="filter-grid">


                <!-- Search -->

                <div class="filter-group">

                    <label>
                        Search Student
                    </label>

                    <input
                        type="text"
                        id="searchInput"
                        placeholder="Search by name or register number..."
                    >

                </div>


                <!-- Department -->

                <div class="filter-group">

                    <label>
                        Department
                    </label>

                    <select id="departmentFilter">

                        <option value="">
                            All Departments
                        </option>

                        <option value="IT">
                            IT
                        </option>

                        <option value="CSE">
                            CSE
                        </option>

                        <option value="ECE">
                            ECE
                        </option>

                        <option value="MECH">
                            MECH
                        </option>

                    </select>

                </div>


                <!-- Year -->

                <div class="filter-group">

                    <label>
                        Year
                    </label>

                    <select id="yearFilter">

                        <option value="">
                            All Years
                        </option>

                        <option value="I">
                            Year I
                        </option>

                        <option value="II">
                            Year II
                        </option>

                        <option value="III">
                            Year III
                        </option>

                        <option value="IV">
                            Year IV
                        </option>

                    </select>

                </div>


                <!-- Sort -->

                <div class="filter-group">

                    <label>
                        Sort
                    </label>

                    <select id="sortSelect">

                        <option value="">
                            Default
                        </option>

                        <option value="name-asc">
                            Name A → Z
                        </option>

                        <option value="name-desc">
                            Name Z → A
                        </option>

                        <option value="register-asc">
                            Register A → Z
                        </option>

                        <option value="register-desc">
                            Register Z → A
                        </option>

                    </select>

                </div>

            </div>


            <button
                class="secondary-btn"
                id="clearFilters">

                Clear Filters

            </button>

        </div>


        <!-- TABLE -->

        <div class="card">

            <div class="table-wrap">

                <table class="student-table">

                    <thead>

                        <tr>

                            <th>
                                Register Number
                            </th>

                            <th>
                                Name
                            </th>

                            <th>
                                Department
                            </th>

                            <th>
                                Year / Semester
                            </th>

                            <th>
                                Email
                            </th>

                            <th>
                                Phone Number
                            </th>

                            <th>
                                Actions
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${rows}

                    </tbody>

                </table>

            </div>

        </div>

    `;


    // Setup search/filter events

    setupFilters();

}


// ======================================================
// SEARCH / FILTER / SORT
// ======================================================

function setupFilters() {

    const searchInput =
        document.getElementById("searchInput");

    const departmentFilter =
        document.getElementById("departmentFilter");

    const yearFilter =
        document.getElementById("yearFilter");

    const sortSelect =
        document.getElementById("sortSelect");

    const clearFilters =
        document.getElementById("clearFilters");


    function applyFilters() {

        let results =
            [...studentData];


        // Search

        const search =
            searchInput.value
                .trim()
                .toLowerCase();


        if (search) {

            results =
                results.filter(student =>

                    student.name
                        .toLowerCase()
                        .includes(search)

                    ||

                    student.registerNo
                        .toLowerCase()
                        .includes(search)

                );

        }


        // Department

        if (departmentFilter.value) {

            results =
                results.filter(student =>
                    student.department ===
                    departmentFilter.value
                );

        }


        // Year

        if (yearFilter.value) {

            results =
                results.filter(student =>
                    student.year ===
                    yearFilter.value
                );

        }


        // Sorting

        switch (sortSelect.value) {


            case "name-asc":

                results.sort((a, b) =>
                    a.name.localeCompare(b.name)
                );

                break;


            case "name-desc":

                results.sort((a, b) =>
                    b.name.localeCompare(a.name)
                );

                break;


            case "register-asc":

                results.sort((a, b) =>
                    a.registerNo.localeCompare(
                        b.registerNo
                    )
                );

                break;


            case "register-desc":

                results.sort((a, b) =>
                    b.registerNo.localeCompare(
                        a.registerNo
                    )
                );

                break;

        }


        // Only update table

        updateStudentTable(results);

    }


    searchInput.addEventListener(
        "input",
        applyFilters
    );


    departmentFilter.addEventListener(
        "change",
        applyFilters
    );


    yearFilter.addEventListener(
        "change",
        applyFilters
    );


    sortSelect.addEventListener(
        "change",
        applyFilters
    );


    clearFilters.addEventListener(
        "click",
        function() {

            searchInput.value = "";

            departmentFilter.value = "";

            yearFilter.value = "";

            sortSelect.value = "";

            updateStudentTable(
                studentData
            );

        }
    );

}


// ======================================================
// UPDATE TABLE ONLY
// ======================================================

function updateStudentTable(results) {

    const tableBody =
        document.querySelector(
            ".student-table tbody"
        );


    if (!tableBody) {
        return;
    }


    if (results.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center; padding:40px;">

                    🔍 No matching students found.

                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =
        results.map(student => {

            return `

                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(student.registerNo)}
                        </strong>
                    </td>


                    <td>
                        ${escapeHTML(student.name)}
                    </td>


                    <td>

                        <span class="department-badge">
                            ${escapeHTML(student.department)}
                        </span>

                    </td>


                    <td>

                        Year ${escapeHTML(student.year)}

                        <br>

                        <small>
                            Semester ${escapeHTML(student.semester)}
                        </small>

                    </td>


                    <td>
                        ${escapeHTML(student.email)}
                    </td>


                    <td>
                        ${escapeHTML(student.phone)}
                    </td>


                    <td>

                        <div class="action-buttons">

                            <button
                                class="edit-btn"
                                onclick="editStudent('${escapeHTML(student.registerNo)}')">

                                ✏️ Edit

                            </button>


                            <button
                                class="delete-btn"
                                onclick="deleteStudent('${escapeHTML(student.registerNo)}')">

                                🗑️ Delete

                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }).join("");

}


// ======================================================
// OPEN ADD STUDENT
// ======================================================

function openAddStudent() {

    editingRegisterNo = null;

    showView("add");

    renderStudentForm();

}


// ======================================================
// SHOW STUDENTS
// ======================================================

function showStudents() {

    editingRegisterNo = null;

    showView("students");

    renderStudents();

}


// ======================================================
// STUDENT FORM
// ======================================================

function renderStudentForm() {

    const addView =
        document.getElementById("add");


    const editingStudent =
        editingRegisterNo
            ? studentData.find(
                student =>
                    student.registerNo ===
                    editingRegisterNo
            )
            : null;


    const isEditing =
        editingStudent !== null;


    addView.innerHTML = `

        <div class="page-header">

            <div>

                <h1>
                    ${isEditing
                        ? "Edit Student"
                        : "Add Student"}
                </h1>

                <p>

                    ${isEditing
                        ? "Update student information"
                        : "Add a new student to the system"}

                </p>

            </div>

        </div>


        <div class="card form-card">

            <form id="studentForm">


                <!-- Register Number -->

                <div class="form-group">

                    <label for="registerNo">

                        Register Number
                        <span>*</span>

                    </label>


                    <input
                        type="text"
                        id="registerNo"
                        placeholder="Example: 23CSE004"
                        value="${isEditing
                            ? escapeHTML(editingStudent.registerNo)
                            : ""}"
                    >


                    <small
                        class="field-error"
                        id="registerNoError">
                    </small>

                </div>


                <!-- Name -->

                <div class="form-group">

                    <label for="studentName">

                        Student Name
                        <span>*</span>

                    </label>


                    <input
                        type="text"
                        id="studentName"
                        placeholder="Enter student name"
                        value="${isEditing
                            ? escapeHTML(editingStudent.name)
                            : ""}"
                    >


                    <small
                        class="field-error"
                        id="studentNameError">
                    </small>

                </div>


                <!-- Email -->

                <div class="form-group">

                    <label for="email">

                        Email
                        <span>*</span>

                    </label>


                    <input
                        type="email"
                        id="email"
                        placeholder="student@example.com"
                        value="${isEditing
                            ? escapeHTML(editingStudent.email)
                            : ""}"
                    >


                    <small
                        class="field-error"
                        id="emailError">
                    </small>

                </div>


                <!-- Phone -->

                <div class="form-group">

                    <label for="phone">

                        Phone Number
                        <span>*</span>

                    </label>


                    <input
                        type="tel"
                        id="phone"
                        maxlength="10"
                        placeholder="10-digit phone number"
                        value="${isEditing
                            ? escapeHTML(editingStudent.phone)
                            : ""}"
                    >


                    <small
                        class="field-error"
                        id="phoneError">
                    </small>

                </div>


                <!-- Department -->

                <div class="form-group">

                    <label for="department">

                        Department
                        <span>*</span>

                    </label>


                    <select id="department">

                        <option value="">
                            Select Department
                        </option>


                        <option value="IT"
                            ${isEditing &&
                            editingStudent.department === "IT"
                                ? "selected"
                                : ""}>
                            IT
                        </option>


                        <option value="CSE"
                            ${isEditing &&
                            editingStudent.department === "CSE"
                                ? "selected"
                                : ""}>
                            CSE
                        </option>


                        <option value="ECE"
                            ${isEditing &&
                            editingStudent.department === "ECE"
                                ? "selected"
                                : ""}>
                            ECE
                        </option>


                        <option value="MECH"
                            ${isEditing &&
                            editingStudent.department === "MECH"
                                ? "selected"
                                : ""}>
                            MECH
                        </option>

                    </select>


                    <small
                        class="field-error"
                        id="departmentError">
                    </small>

                </div>


                <!-- Year -->

                <div class="form-group">

                    <label for="year">

                        Year
                        <span>*</span>

                    </label>


                    <select id="year">

                        <option value="">
                            Select Year
                        </option>


                        <option value="I"
                            ${isEditing &&
                            editingStudent.year === "I"
                                ? "selected"
                                : ""}>
                            I
                        </option>


                        <option value="II"
                            ${isEditing &&
                            editingStudent.year === "II"
                                ? "selected"
                                : ""}>
                            II
                        </option>


                        <option value="III"
                            ${isEditing &&
                            editingStudent.year === "III"
                                ? "selected"
                                : ""}>
                            III
                        </option>


                        <option value="IV"
                            ${isEditing &&
                            editingStudent.year === "IV"
                                ? "selected"
                                : ""}>
                            IV
                        </option>

                    </select>


                    <small
                        class="field-error"
                        id="yearError">
                    </small>

                </div>


                <!-- Semester -->

                <div class="form-group">

                    <label for="semester">

                        Semester
                        <span>*</span>

                    </label>


                    <select id="semester">

                        <option value="">
                            Select Semester
                        </option>


                        <option value="I"
                            ${isEditing &&
                            editingStudent.semester === "I"
                                ? "selected"
                                : ""}>
                            I
                        </option>


                        <option value="II"
                            ${isEditing &&
                            editingStudent.semester === "II"
                                ? "selected"
                                : ""}>
                            II
                        </option>


                        <option value="III"
                            ${isEditing &&
                            editingStudent.semester === "III"
                                ? "selected"
                                : ""}>
                            III
                        </option>


                        <option value="IV"
                            ${isEditing &&
                            editingStudent.semester === "IV"
                                ? "selected"
                                : ""}>
                            IV
                        </option>


                        <option value="V"
                            ${isEditing &&
                            editingStudent.semester === "V"
                                ? "selected"
                                : ""}>
                            V
                        </option>


                        <option value="VI"
                            ${isEditing &&
                            editingStudent.semester === "VI"
                                ? "selected"
                                : ""}>
                            VI
                        </option>


                        <option value="VII"
                            ${isEditing &&
                            editingStudent.semester === "VII"
                                ? "selected"
                                : ""}>
                            VII
                        </option>


                        <option value="VIII"
                            ${isEditing &&
                            editingStudent.semester === "VIII"
                                ? "selected"
                                : ""}>
                            VIII
                        </option>

                    </select>


                    <small
                        class="field-error"
                        id="semesterError">
                    </small>

                </div>


                <!-- Buttons -->

                <div class="form-actions">

                    <button
                        type="button"
                        class="secondary-btn"
                        onclick="showStudents()">

                        Cancel

                    </button>


                    <button
                        type="submit"
                        class="primary-btn">

                        ${isEditing
                            ? "💾 Update Student"
                            : "➕ Add Student"}

                    </button>

                </div>


            </form>

        </div>

    `;


    // Form submit

    document
        .getElementById("studentForm")
        .addEventListener(
            "submit",
            function(event) {

                event.preventDefault();

                saveStudent();

            }
        );

}


// ======================================================
// SAVE STUDENT
// ======================================================

function saveStudent() {

    const registerNo =
        document.getElementById("registerNo")
            .value
            .trim()
            .toUpperCase();


    const name =
        document.getElementById("studentName")
            .value
            .trim();


    const email =
        document.getElementById("email")
            .value
            .trim();


    const phone =
        document.getElementById("phone")
            .value
            .trim();


    const department =
        document.getElementById("department")
            .value;


    const year =
        document.getElementById("year")
            .value;


    const semester =
        document.getElementById("semester")
            .value;


    // Clear errors

    document
        .querySelectorAll(".field-error")
        .forEach(error => {

            error.textContent = "";

        });


    let isValid = true;


    // ==================================================
    // REGISTER NUMBER VALIDATION
    // ==================================================

    if (!registerNo) {

        document.getElementById(
            "registerNoError"
        ).textContent =
            "Register number is required.";

        isValid = false;

    } else {

        const duplicate =
            studentData.some(student =>

                student.registerNo
                    .toLowerCase() ===
                registerNo.toLowerCase()

                &&

                student.registerNo !==
                editingRegisterNo

            );


        if (duplicate) {

            document.getElementById(
                "registerNoError"
            ).textContent =
                "This register number already exists.";

            isValid = false;

        }

    }


    // ==================================================
    // NAME VALIDATION
    // ==================================================

    if (!name) {

        document.getElementById(
            "studentNameError"
        ).textContent =
            "Student name is required.";

        isValid = false;

    }


    // ==================================================
    // EMAIL VALIDATION
    // ==================================================

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!email) {

        document.getElementById(
            "emailError"
        ).textContent =
            "Email is required.";

        isValid = false;

    } else if (!emailPattern.test(email)) {

        document.getElementById(
            "emailError"
        ).textContent =
            "Enter a valid email address.";

        isValid = false;

    }


    // ==================================================
    // PHONE VALIDATION
    // ==================================================

    const phonePattern =
        /^[0-9]{10}$/;


    if (!phone) {

        document.getElementById(
            "phoneError"
        ).textContent =
            "Phone number is required.";

        isValid = false;

    } else if (!phonePattern.test(phone)) {

        document.getElementById(
            "phoneError"
        ).textContent =
            "Phone number must contain exactly 10 digits.";

        isValid = false;

    }


    // ==================================================
    // DEPARTMENT VALIDATION
    // ==================================================

    if (!department) {

        document.getElementById(
            "departmentError"
        ).textContent =
            "Please select a department.";

        isValid = false;

    }


    // ==================================================
    // YEAR VALIDATION
    // ==================================================

    if (!year) {

        document.getElementById(
            "yearError"
        ).textContent =
            "Please select a year.";

        isValid = false;

    }


    // ==================================================
    // SEMESTER VALIDATION
    // ==================================================

    if (!semester) {

        document.getElementById(
            "semesterError"
        ).textContent =
            "Please select a semester.";

        isValid = false;

    }


    // Stop if invalid

    if (!isValid) {

        return;

    }


    // ==================================================
    // CREATE STUDENT OBJECT
    // ==================================================

    const newStudent = {

        registerNo,

        name,

        email,

        phone,

        department,

        year,

        semester

    };


    // ==================================================
    // EDIT
    // ==================================================

    if (editingRegisterNo) {

        const index =
            studentData.findIndex(
                student =>
                    student.registerNo ===
                    editingRegisterNo
            );


        if (index !== -1) {

            studentData[index] =
                newStudent;

        }


        alert(
            "Student updated successfully! ✅"
        );

    }

    // ==================================================
    // ADD
    // ==================================================

    else {

        studentData.push(
            newStudent
        );


        alert(
            "Student added successfully! ✅"
        );

    }


    // Save

    saveToLocalStorage();


    // Reset editing mode

    editingRegisterNo = null;


    // Refresh dashboard

    renderDashboard();


    // Go to Students

    showStudents();

}


// ======================================================
// EDIT STUDENT
// ======================================================

function editStudent(registerNo) {

    const student =
        studentData.find(
            student =>
                student.registerNo ===
                registerNo
        );


    if (!student) {

        alert(
            "Student not found."
        );

        return;

    }


    editingRegisterNo =
        registerNo;


    showView("add");

    renderStudentForm();

}


// ======================================================
// DELETE STUDENT
// ======================================================

function deleteStudent(registerNo) {

    const student =
        studentData.find(
            student =>
                student.registerNo ===
                registerNo
        );


    if (!student) {

        alert(
            "Student not found."
        );

        return;

    }


    // Confirmation

    const confirmed =
        confirm(
            `Are you sure you want to delete ${student.name} (${student.registerNo})?`
        );


    if (!confirmed) {

        return;

    }


    // Remove student

    studentData =
        studentData.filter(
            student =>
                student.registerNo !==
                registerNo
        );


    // Save

    saveToLocalStorage();


    // Refresh

    renderDashboard();

    renderStudents();


    alert(
        "Student deleted successfully! 🗑️"
    );

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


// ======================================================
// START APPLICATION
// ======================================================

loadStudents();