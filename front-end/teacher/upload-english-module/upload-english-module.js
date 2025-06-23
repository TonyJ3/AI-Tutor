document.querySelectorAll(".subject-card").forEach(card => {
    card.addEventListener("click", () => {
        const vectorId = card.getAttribute("data-vector-id");
        const title = card.dataset.title;

        localStorage.setItem("vector_store_id", vectorId);
        localStorage.setItem("upload_title", title);
    });
});