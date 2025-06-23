document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('upload-form');

    // Check if fileListDiv already exists
    let fileListDiv = document.getElementById('fileList');
    if (!fileListDiv) {
        fileListDiv = document.createElement('div');
        fileListDiv.id = 'fileList';
        form.parentNode.appendChild(fileListDiv); // Append only once
    }

    async function fetchFiles() {
        const student_id = localStorage.getItem('student_id');
        if (!student_id) {
            alert("Geen student ID gevonden. Log opnieuw in.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/assignments?student_id=${encodeURIComponent(student_id)}`);
            const data = await response.json();

            fileListDiv.innerHTML = "<ul></ul>";
            const ul = fileListDiv.querySelector("ul");

            if (data.files && data.files.length > 0) {
                data.files.forEach(file => {
                    const li = document.createElement("li");
                    li.className = "file-entry";
                    li.textContent = file.file_name;
                    ul.appendChild(li);
                });
            } else {
                fileListDiv.innerHTML = "<p>Geen bestanden gevonden voor deze student.</p>";
            }
        } catch (error) {
            fileListDiv.textContent = "Fout bij het laden van bestanden.";
            console.error("Error fetching files:", error);
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const student_id = localStorage.getItem('student_id');
        if (!student_id) {
            alert("Geen student ID gevonden. Log opnieuw in.");
            return;
        }

        const fileInput = form.querySelector('input[name="file"]');
        const file = fileInput.files[0];

        if (!file) {
            alert("Selecteer een bestand om te uploaden.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('student_id', student_id);

        try {
            const response = await fetch('http://localhost:8000/assignments', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            alert(result.message || 'Upload voltooid');

            fileInput.value = '';
            fetchFiles();
        } catch (error) {
            alert("Upload mislukt. Probeer opnieuw.");
            console.error("Upload error:", error);
        }
    });

    // Laad lijst met bestanden zodra de pagina geladen is
    fetchFiles();
});
