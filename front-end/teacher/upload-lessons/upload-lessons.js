const form = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const resultDisplay = document.getElementById("result");
const vectorStoreId = localStorage.getItem("vector_store_id");
const title = localStorage.getItem("upload_title");

window.addEventListener('DOMContentLoaded', () => {
    //const title = localStorage.getItem("selectedTitle");

    if (title) {
        // Set the dynamic title
        const h2 = document.querySelector('h2');
        h2.textContent = title;
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    formData.append("vector_store_id", vectorStoreId);

    try {
        const response = await fetch("http://127.0.0.1:8000/lessons", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        resultDisplay.textContent = data.message;

        // Clear file input after upload
        fileInput.value = '';

        // Fetch files
        fetchFiles();

        setTimeout(() => {
            resultDisplay.textContent = '';
        }, 5000);

    } catch (error) {
        resultDisplay.textContent = `Error: ${error.message}`;
    }
});

async function fetchFiles() {
    try {
        const response = await fetch(`http://127.0.0.1:8000/lessons?vector_store_id=${vectorStoreId}`);
        const data = await response.json();

        const fileListDiv = document.getElementById("fileList");
        fileListDiv.classList.remove("loading");
        fileListDiv.innerHTML = "<ul></ul>";

        const ul = fileListDiv.querySelector("ul");

        if (data.files && data.files.length > 0) {
            data.files.forEach(file => {
                const li = document.createElement("li");
                li.className = "file-entry";
                li.innerHTML = `${file.filename}`;
                ul.appendChild(li);
            });
        } else {
            fileListDiv.innerHTML = "<p>No files found in the vector store.</p>";
        }
    } catch (error) {
        document.getElementById("fileList").textContent = "Failed to load files.";
        console.error("Error fetching files:", error);
    }
}

// Fetch files
fetchFiles();