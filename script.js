const downloadBtn = document.getElementById('downloadBtn');
const videoUrlInput = document.getElementById('videoUrl');
const formatsContainer = document.getElementById('formatsContainer');

downloadBtn.addEventListener('click', async () => {
    const videoUrl = videoUrlInput.value;
    if (!videoUrl) {
        alert('Please enter a video URL.');
        return;
    }

    formatsContainer.innerHTML = 'Loading...';

    try {
        const response = await fetch('/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ videoUrl }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get video info');
        }

        const formats = await response.json();
        displayFormats(formats, videoUrl);
    } catch (error) {
        formatsContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        console.error(error);
    }
});

function displayFormats(formats, videoUrl) {
    formatsContainer.innerHTML = '';

    if (formats.length === 0) {
        formatsContainer.innerHTML = '<p>No video and audio formats found.</p>';
        return;
    }

    const formatsList = document.createElement('div');
    formatsList.classList.add('formats-list');

    formats.forEach(format => {
        const formatButton = document.createElement('button');
        formatButton.classList.add('format-button');
        formatButton.innerText = `${format.qualityLabel} (${format.container})`;
        formatButton.addEventListener('click', () => {
            const downloadUrl = `/download?url=${encodeURIComponent(videoUrl)}&quality=${format.itag}`;
            window.location.href = downloadUrl;
        });
        formatsList.appendChild(formatButton);
    });

    formatsContainer.appendChild(formatsList);
}