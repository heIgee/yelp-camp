const forms = document.querySelectorAll('form');
forms.forEach((form) => {
    form.addEventListener('submit', (ev) => {
        if (!form.checkValidity()) {
            ev.preventDefault();
            ev.stopPropagation();
        }
        // bootstrap validation takeover
        form.classList.add('was-validated');
    });
})