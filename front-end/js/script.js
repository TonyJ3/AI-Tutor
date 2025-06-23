

// ===== LOGIN =====//
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;

      if (!username || !password) {
        alert("Vul gebruikersnaam en wachtwoord in.");
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
          throw new Error("Inloggen mislukt");
        }

        const data = await response.json();
        if (data.role === "teacher") {
          window.location.href = "/front-end/teacher/leraar/leraar.html";
        } else if (data.role === "student") {
          localStorage.setItem("student_id", data.id);
          window.location.href = "/front-end/student/dashboard-student/dashboard-student.html";
        } else {
          alert("Onbekende rol");
        }
      } catch (err) {
        alert("Gebruikersnaam of wachtwoord klopt niet.");
        console.error(err);
      }
    });
  }
});



// ========== KLASSEN / FILTER BUTTON ==========
const filterButton = document.querySelector('.filter-button');
const klasSelector = document.getElementById('klas');
const progressContainer = document.querySelector('.progress-scroll-container');
if (filterButton && klasSelector && progressContainer) {
  filterButton.addEventListener('click', () => {
    const selectedClass = klasSelector.value;
    if (selectedClass) {
      progressContainer.style.display = 'block';
      loadLogs();
    }
  });
}

// ========== SORTABLE HEADERS ==========
const headers = document.querySelectorAll(".sortable");
if (headers.length > 0) {
  let sortState = {};
  headers.forEach(header => {
    header.addEventListener("click", () => {
      const key = parseInt(header.dataset.key);
      const rows = Array.from(document.querySelectorAll(".progress-row"));
      const isAsc = sortState[key] === "asc";
      sortState = {};
      sortState[key] = isAsc ? "desc" : "asc";
      rows.sort((a, b) => {
        const aNum = parseFloat(a.children[key].textContent.replace("%", ""));
        const bNum = parseFloat(b.children[key].textContent.replace("%", ""));
        return isAsc ? aNum - bNum : bNum - aNum;
      });
      const container = document.querySelector(".progress-scroll-container");
      rows.forEach(row => container.appendChild(row));
    });
  });
}

// ========== DASHBOARD MESSAGE UPDATE ==========
const promptForm = document.getElementById('promptForm');
if (promptForm) {
  promptForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const promptInput = document.getElementById('userPrompt');
    const userPrompt = promptInput.value;
    sendPromptToAPI(userPrompt);
    promptInput.value = '';
  });
}

// ========== STUDENT DASHBOARD CARDS ==========
const cards = document.querySelectorAll('.card');
if (cards.length > 0) {
  cards.forEach(card => {
    card.addEventListener('click', () => {
      alert(`Je hebt geklikt op: "${card.textContent.trim()}"`);
    });
  });
}

// ========== LOAD LOGS FUNCTION ==========
async function loadLogs() {
  try {
    const response = await fetch("http://localhost:8000/logs");
    const logs = await response.json();
    const logsView = document.getElementById("logsView");
    if (!logsView) return;

    logsView.innerHTML = "";
    logs.forEach(log => {
      const logItem = document.createElement("div");
      logItem.classList.add("log-item");
      logItem.innerHTML = `
        <strong>Input:</strong> ${log.input} <br>
        <strong>Created at:</strong> ${new Date(log.datetime).toLocaleString()}
      `;
      logsView.appendChild(logItem);
    });
  } catch (error) {
    console.error("Error loading logs:", error);
  }
}

// show the student progress in teacher page
document.addEventListener('DOMContentLoaded', function() {
    const statusDots = document.querySelectorAll('.status-dot');
    const detailPanel = document.getElementById('detailPanel');
    const closeBtn = document.getElementById('closeDetail');
    const studentFilter = document.getElementById('studentFilter');
    const skillFilter = document.getElementById('skillFilter');
    const classFilter = document.getElementById('classFilter');

    function updateStudentFilterOptions() {
      const selectedClass = classFilter.value;
      const rows = document.querySelectorAll('tbody tr');

      const students = new Set();

      rows.forEach(row => {
        const studentName = row.cells[0].textContent.trim();
        const className = row.cells[2]?.textContent.trim(); // NEW: class from 3rd column
        if (selectedClass === 'all' || className === selectedClass) {
          students.add(studentName);
        }
      });

      const currentSelection = studentFilter.value;

      studentFilter.innerHTML = `<option value="all">Alle Leerlingen</option>`;
      students.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        studentFilter.appendChild(option);
      });

      if (students.has(currentSelection)) {
        studentFilter.value = currentSelection;
      } else {
        studentFilter.value = 'all';
      }
    }

    function applyFilters() {
      const selectedStudent = studentFilter.value;
      const selectedSkill = skillFilter.value;
      const selectedClass = classFilter.value;

      const bodyRows = document.querySelectorAll('tbody tr');

      bodyRows.forEach(row => {
        const studentName = row.cells[0].textContent.trim();
        const className = row.cells[2]?.textContent.trim(); // NEW: class from 3rd column
        const show =
          (selectedStudent === 'all' || studentName === selectedStudent) &&
          (selectedClass === 'all' || className === selectedClass);

        row.style.display = show ? '' : 'none';
      });

      const headerRow2 = document.querySelectorAll('thead tr:nth-child(2) th');

      const skillColumnMap = {
        grammar: [0, 1, 2],
        vocabulary: [3, 4, 5],
        reading: [6, 7, 8]
      };
      const allIndexes = Array.from({ length: 9 }, (_, i) => i);

      allIndexes.forEach(index => {
        const show = selectedSkill === 'all' || skillColumnMap[selectedSkill].includes(index);

        if (headerRow2[index]) {
          headerRow2[index].style.display = show ? '' : 'none';
        }

        bodyRows.forEach(row => {
          const cell = row.querySelectorAll('td')[index + 3]; // now skip 3 columns: name, prompt, class
          if (cell) cell.style.display = show ? '' : 'none';
        });
      });

      const topHeaders = document.querySelectorAll('thead tr:first-child th');
      const groupHeaderMap = {
        grammar: 3,
        vocabulary: 4,
        reading: 5
      };

      topHeaders[0].style.display = ''; // Leerling
      topHeaders[1].style.display = ''; // Prompt
      topHeaders[2].style.display = ''; // Klassen

      [3, 4, 5].forEach(i => {
        const show = selectedSkill === 'all' || i === groupHeaderMap[selectedSkill];
        topHeaders[i].style.display = show ? '' : 'none';
      });
    }

    studentFilter.addEventListener('change', applyFilters);
    skillFilter.addEventListener('change', applyFilters);
    classFilter.addEventListener('change', () => {
      updateStudentFilterOptions();
      applyFilters();
    });

   
  
    // Difficulty thresholds - now with explicit ranges
    const DIFFICULTY_LEVELS = [
        { min: 80, max: 100, color: '#4CAF50', label: 'Makkelijk', class: 'makkelijk' },
        { min: 60, max: 79, color: '#FFC107', label: 'Gemiddeld', class: 'gemiddeld' },
        { min: 40, max: 59, color: '#FF9800', label: 'Moeilijk', class: 'moeilijk' },
        { min: 0, max: 39, color: '#F44336', label: 'Zeer Moeilijk', class: 'zeer-moeilijk' }
    ];

    // Storage for stable results
    const resultsCache = {};

    function getStablePercentage(student, skill, task) {
        const cacheKey = `${student}-${skill}-${task}`;
        
        if (resultsCache[cacheKey]) {
            return resultsCache[cacheKey];
        }
        
        // Create a seed that ensures all 4 levels appear equally
        const seed = student.charCodeAt(0) + skill.charCodeAt(0) + parseInt(task);
        
        // Force equal distribution across 4 levels (0-3)
        const levelIndex = Math.abs(seed) % 4;
        const level = DIFFICULTY_LEVELS[levelIndex];
        
        // Generate percentage strictly within the level's range
        const percent = Math.floor(
            level.min + (Math.abs(Math.sin(seed)) * (level.max - level.min))
        );
        
        // Ensure we stay within bounds
        const finalPercent = Math.min(Math.max(percent, level.min), level.max);
        
        // Store in cache
        resultsCache[cacheKey] = finalPercent;
        
        return finalPercent;
    }

    function generateQuestionResults(student, skill, task) {
        const templates = {
           grammar: [
                    "Identificeer het werkwoord in: 'De kat slaapt rustig'",
                    "Wat is het meervoud van 'kind'?",
                    "Corrigeer de zin: 'Zij houdt niet van appels'",
                    "Identificeer het bijvoeglijk naamwoord in: 'De blauwe lucht is helder'",
                    "Zet in de verleden tijd: 'Hij gaat naar school'"
                ],
                vocabulary: [
                    "Synoniem voor 'blij'",
                    "Antoniem voor 'beginnen'",
                    "Definitie van 'ephemeral' (kortstondig)",
                    "Gebruik 'gregarious' in een zin",
                    "Correcte spelling: 'accommoderen'"
                ],
                reading: [
                    "Hoofdidee van alinea 1",
                    "De toon van de auteur in sectie 2",
                    "Inzichtvraag over het karakter",
                    "Woorden in context vraag",
                    "Voorspelling op basis van de tekst"
                ]

        };

        const percent = getStablePercentage(student, skill, task);
        const questions = (templates[skill] || []).map((text, i) => {
            // Create consistent correct/incorrect answers
            const answerSeed = student.charCodeAt(0) + skill.charCodeAt(0) + parseInt(task) + i;
            const threshold = percent / 100;
            const correct = Math.abs(Math.sin(answerSeed)) < threshold;
            return { id: i+1, text: text, correct: correct };
        });

        // Verify the actual percentage matches
        const correctCount = questions.filter(q => q.correct).length;
        const totalQuestions = questions.length;
        const actualPercent = Math.round((correctCount / totalQuestions) * 100);

        return { questions, percent: actualPercent, correctCount, totalQuestions };
    }

    

    statusDots.forEach(dot => {
        dot.addEventListener('click', function() {
            const student = this.dataset.student;
            const skill = this.dataset.skill;
            const task = this.dataset.task;
            
            const { questions, percent, correctCount, totalQuestions } = generateQuestionResults(student, skill, task);
            const difficulty = DIFFICULTY_LEVELS.find(level => percent >= level.min) || DIFFICULTY_LEVELS[3];
             let capitalizedStudent = student.charAt(0).toUpperCase() + student.slice(1);
             let capitalizedSkill = skill.charAt(0).toUpperCase() + skill.slice(1);
            // Update UI
            document.getElementById('studentName').textContent = capitalizedStudent;
              document.getElementById('skillName').textContent = capitalizedSkill;
              document.getElementById('taskNumber').textContent = task;
              //document.getElementById('taskStatus').textContent = difficulty.label;
              const statusElement = document.getElementById('taskStatus');
              const statusDot = document.querySelector('.status-punt');

              const label = difficulty.label.trim().toLowerCase();
              const className = label.replace(/\s+/g, '-');

              // Set text
              statusElement.textContent = difficulty.label;

              // Remove old classes
              statusElement.classList.remove(
                'text-makkelijk',
                'text-gemiddeld',
                'text-moeilijk',
                'text-zeer-moeilijk'
              );
              statusDot.classList.remove(
                'makkelijk',
                'gemiddeld',
                'moeilijk',
                'zeer-moeilijk'
              );

              // Add new classes
              statusElement.classList.add(`text-${className}`);
              statusDot.classList.add(className);

              
              document.getElementById('performancePercent').textContent = 
                  `${percent}% (${correctCount}/${totalQuestions} correct)`;

              const progressFill = document.getElementById('progressFill');
              progressFill.style.width = `${percent}%`;
              progressFill.style.backgroundColor = difficulty.color;

              const questionList = document.getElementById('questionList');
              questionList.innerHTML = questions.map(q => `
                  <div class="question-item">
                      <span class="question-text">${q.text}</span>
                      <span class="${q.correct ? 'correct' : 'incorrect'}">
                          ${q.correct ? '✓ Correct' : '✗ Onjuist'}
                      </span>
                  </div>
              `).join('');
              

              document.getElementById('detailTitle').textContent = 
                  `${skill} Taak ${ task} - ${ student}`;
              document.getElementById('detailTopic').textContent =
              `${capitalizedSkill} Taak ${task}`;

              detailPanel.classList.add('active');
        });
    });

    closeBtn.addEventListener('click', function() {
        detailPanel.classList.remove('active');
    });

 });

  let sortOrder = null; // null → asc → desc → null ...

document.getElementById('promptHeader').addEventListener('click', () => {
    const tbody = document.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Toggle sort order
    if (sortOrder === 'asc') sortOrder = 'desc';
    else sortOrder = 'asc';

    // Sort based on prompt column (index 1)
    rows.sort((a, b) => {
        const valA = parseFloat(a.children[1].textContent) || 0;
        const valB = parseFloat(b.children[1].textContent) || 0;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    rows.forEach(row => tbody.appendChild(row));

    // Update sort icon
    document.getElementById('sortIcon').textContent = sortOrder === 'asc' ? '▲' : '▼';
});
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize filter elements
  const studentFilter = document.getElementById("studentFilter");
  const skillFilter = document.getElementById("skillFilter");
  
  // Store the original student names (static + dynamic)
  let allStudents = [];

  try {
    // 1. First, load static student names from the HTML dropdown
    const staticOptions = Array.from(studentFilter.options)
      .map(opt => opt.value)
      .filter(val => val !== "all");

    // 2. Fetch dynamic student data from API
    const response = await fetch("http://localhost:8000/prompt-counts");
    const apiData = await response.json();
    const dynamicNames = apiData.map(student => student.name);

    // 3. Combine static and dynamic names, removing duplicates
    allStudents = [...new Set([...staticOptions, ...dynamicNames])];

    // 4. Rebuild the student dropdown
    studentFilter.innerHTML = '<option value="all">Alle Leerlingen</option>';
    allStudents.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      studentFilter.appendChild(option);
    });

    // 5. Update the table with API data
    const rows = document.querySelectorAll(".dashboard tbody tr");
    apiData.forEach((studentData, index) => {
      if (rows[index]) {
        const { name, prompt_count } = studentData;
        const cells = rows[index].querySelectorAll("td");

        // Update name cell
        if (cells[0]) cells[0].textContent = name;

        // Update/create prompt count cell
        if (cells[1]?.classList.contains("prompt-cell")) {
          cells[1].textContent = `${prompt_count}`;
        } else {
          const promptCell = document.createElement("td");
          promptCell.classList.add("prompt-cell");
          promptCell.textContent = prompt_count;
          rows[index].insertBefore(promptCell, cells[1]);
        }

        // Update data-student attributes for filtering
        rows[index].querySelectorAll(".status-dot").forEach(dot => {
          dot.setAttribute("data-student", name.toLowerCase());
        });
      }
    });

  } catch (error) {
    console.error("Error loading student data:", error);
    // Fallback to static names if API fails
    allStudents = Array.from(studentFilter.options)
      .map(opt => opt.value)
      .filter(val => val !== "all");
  }
  // Add percentage column sorting
    let percentageSortOrder = null;
    document.getElementById('percentageHeader').addEventListener('click', function() {
        const tbody = document.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));

        // Toggle sort direction
        percentageSortOrder = percentageSortOrder === 'asc' ? 'desc' : 'asc';

        // Sort rows based on average percentage of visible dots
        rows.sort((a, b) => {
            const studentA = a.cells[0].textContent;
            const studentB = b.cells[0].textContent;
            
            // Calculate average percentage for each student's visible dots
            const avgA = getStudentAveragePercentage(studentA);
            const avgB = getStudentAveragePercentage(studentB);
            
            return percentageSortOrder === 'asc' ? avgA - avgB : avgB - avgA;
        });

        // Re-append rows in sorted order
        rows.forEach(row => tbody.appendChild(row));
        
        // Update sort indicator
        document.getElementById('percentageSortIcon').textContent = 
            percentageSortOrder === 'asc' ? '▲' : '▼';
    });

    // Helper function to calculate average percentage for a student's visible dots
    function getStudentAveragePercentage(studentName) {
        const dots = document.querySelectorAll(
            `.status-dot[data-student="${studentName.toLowerCase()}"]`
        );
        
        let total = 0;
        let count = 0;
        
        dots.forEach(dot => {
            if (dot.style.display !== 'none') { // Only count visible dots
                const skill = dot.dataset.skill;
                const task = dot.dataset.task;
                const percent = getStablePercentage(studentName, skill, task);
                total += percent;
                count++;
            }
        });
        
        return count > 0 ? total / count : 0;
    }
  
});

let lastSortedColumn = -1; // To track the last sorted column for toggling sort direction
let lastSortDirection = true; // true = ascending, false = descending

function sortTable(columnIndex) {
    var table = document.querySelector("table tbody"); // Get the table body
    var rows = Array.from(table.rows); // Convert rows to an array to make them sortable

    // If the same column is clicked, toggle the sort direction
    if (lastSortedColumn === columnIndex) {
        lastSortDirection = !lastSortDirection;
    } else {
        lastSortedColumn = columnIndex;
        lastSortDirection = true; // Default to ascending
    }

    // Get the sorting icon for the clicked column
    var icon = document.querySelector(`.sort-icon[data-column='${columnIndex}']`);
    icon.textContent = lastSortDirection ? "▲" : "▼"; // Toggle icon based on sort direction

    // Sort rows based on the clicked column's percentage values
    rows.sort(function(a, b) {
        var aText = a.cells[columnIndex].querySelector('.percentage-label').textContent;
        var bText = b.cells[columnIndex].querySelector('.percentage-label').textContent;

        // Extract numerical value by removing '%' and converting to number
        aText = parseFloat(aText.replace('%', '').trim());
        bText = parseFloat(bText.replace('%', '').trim());

        // Handle sorting direction
        if (lastSortDirection) {
            return aText - bText; // Ascending order
        } else {
            return bText - aText; // Descending order
        }
    });

    // Reorder the rows in the table body
    rows.forEach(row => table.appendChild(row));
}


// //==========Filter classes========
document.getElementById('classFilter').addEventListener('change', function () {
    const selectedClass = this.value;
    const rows = document.querySelectorAll('tbody tr');

    rows.forEach(row => {
        const rowClass = row.getAttribute('data-class');

        row.style.display = (selectedClass === 'all' || rowClass === selectedClass)
            ? ''
            : 'none';
    });
});

