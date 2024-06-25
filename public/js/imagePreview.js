document.querySelector('input#images').addEventListener('change', function (ev) {
    const preview = document.querySelector('#image-preview');
    preview.innerHTML = '';
    for (i = 0; i < images.files.length; i++) {
        let url = URL.createObjectURL(ev.target.files[i]);
        preview.innerHTML += `
            <div class="d-inline-block position-relative p-0">
                <img src="${url}" style="height: 6rem; width: 8rem; margin: 0 0.6rem 0.6rem 0; object-fit: cover; border-radius: 0.4rem">
            </div>
            `;
    }
});