document.addEventListener('DOMContentLoaded', function () {
    // Initialize sortable library
    new Sortable(document.getElementById('taskList'), {
        animation: 150,
    });
});