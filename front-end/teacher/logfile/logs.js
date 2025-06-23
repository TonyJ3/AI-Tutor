document.addEventListener('DOMContentLoaded', () => {
    const logsView = document.getElementById("logsView");
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");

    const newestButton = document.getElementById("newestButton");
    const oldestButton = document.getElementById("oldestButton");

        

    let allLogs = [];
    let filteredLogs = [];
    

    // Initial load
    loadLogs();
    
     newestButton?.addEventListener('click', () => {
        filteredLogs.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
        renderLogs();
    });
    oldestButton?.addEventListener('click', () => {
        filteredLogs.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        renderLogs();
    });

    // Search functionality
    searchButton.addEventListener('click', filterLogs);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') filterLogs();
    });

    async function loadLogs() {
        try {
            // Show loading state
            logsView.innerHTML = `
                <div class="loading-indicator">
                    <div class="spinner"></div>
                    <p>Logs laden...</p>
                </div>
            `;

            // const response = await fetch("http://localhost:8000/logs");
            const userId = localStorage.getItem("student_id");
            const response = await fetch(`http://localhost:8000/logs?user_id=${userId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            allLogs = await response.json();
            filteredLogs = [...allLogs];
             filteredLogs = [...allLogs].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
            renderLogs();
            
        } catch (error) {
            console.error("Error loading logs:", error);
            showError("Kan logs niet laden. Probeer het later opnieuw.");
        }
    }

    function filterLogs() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const hint = document.getElementById('searchHint');
    const datePattern = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/; // Match DD/MM/YYYY or DD-MM-YYYY

    // Reset styles
    searchInput.style.borderColor = "";
    hint.style.color = "gray";
    const isDateSearch = datePattern.test(searchTerm);

    if (isDateSearch) {
        const matchDate = (logDateStr) => {
            const parts = searchTerm.split(/[-\/]/);
            let normalized;
            // Normalize date format to YYYY-MM-DD
            if (parts.length === 3) {
                // Format is DD/MM/YYYY
                normalized = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            return logDateStr.startsWith(normalized); 
        };

        filteredLogs = allLogs.filter(log =>
            matchDate(log.datetime) 
        );
    } else {
        // If it's not a date search, reset filtered logs
        filteredLogs = [...allLogs];
    }

    renderLogs();
}




    function renderLogs() {
        if (filteredLogs.length === 0) {
            logsView.innerHTML = `
                <div class="empty-state">
                    <p>Geen logs gevonden</p>
                </div>
            `;
            return;
        }

        // // Sort by datetime (newest first)
        // filteredLogs.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
        // filteredLogs.sort((a, b) => new Date(a.datetime) - new Date(b.datetime)); // Oldest first


        logsView.innerHTML = '';
        
        filteredLogs.forEach(log => {
            const logItem = document.createElement("div");
            logItem.classList.add("log-item");
            
            const datetime = new Date(log.datetime).toLocaleString('nl-NL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Format the input log and output log
            const formattedInput = formatLogResponse(log.input || '');
            const formattedOutput = log.output ? formatLogResponse(log.output) : '';
            
           logItem.innerHTML = `
            <div class="log-header">
                <strong class="log-fonts">Tijd:</strong><br/> ${datetime}
            </div>
            <div class="log-content">
                ${log.user_id ? `<p><strong class="log-fonts">ID:</strong> ${log.user_id}</p>` : ''}
                <p><strong class="log-fonts">Vraag:</strong> ${formattedInput}
                ${formattedOutput ? `<p><strong class="log-fonts">Antwoord:</strong> ${formattedOutput}</p>` : ''}
            </div>
            `;
            
            logsView.appendChild(logItem);
        });
    }

    function showError(message) {
        logsView.innerHTML = `
            <div class="empty-state">
                <p style="color: var(--error)">${message}</p>
                <button id="retryButton" class="refresh-btn" style="margin-top: 1rem;">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                    </svg>
                    Probeer opnieuw
                </button>
            </div>
        `;
        
        document.getElementById('retryButton')?.addEventListener('click', loadLogs);
    }

    // Format log
    function formatLogResponse(log) {
    // Format log
    const formattedLog = marked.parse(log);
    // Sanitize fromatted log
    const clean = DOMPurify.sanitize(formattedLog);
    return clean;
    }
});