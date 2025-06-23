document.querySelectorAll('.subject-card').forEach(card => {
    card.addEventListener('click', function (e) {
        const title = this.dataset.title;
        const assistantId = this.dataset.assistantId;

        localStorage.setItem('tutor_title', title);
        localStorage.setItem('assistant_id', assistantId);
    });
});