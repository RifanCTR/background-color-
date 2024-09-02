document.getElementById('fileButton').addEventListener('click', function() {
    document.getElementById('fileInput').click();
});

document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const fileInput = document.getElementById('fileInput').files[0];
    const bgColor = document.getElementById('bgColor').value;
    const photoSize = document.getElementById('photoSize').value;
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const downloadButton = document.getElementById('downloadButton');

    const loading = document.getElementById('loading');
    const loadingBar = document.getElementById('loadingBar');
    const result = document.getElementById('result');
    const processButton = document.getElementById('processButton');
    
    // Convert photo size to canvas dimensions
    let width, height;
    switch (photoSize) {
        case '2x3':
            width = 200;
            height = 300;
            break;
        case '3x4':
            width = 300;
            height = 400;
            break;
        case '4x6':
            width = 400;
            height = 600;
            break;
    }
    
    // Function to animate the loading bar
    function animateLoading() {
        const frames = [
            '[          ]',
            '[■         ]',
            '[■■        ]',
            '[■■■       ]',
            '[■■■■      ]',
            '[■■■■■     ]',
            '[■■■■■■    ]',
            '[■■■■■■■   ]',
            '[■■■■■■■■  ]',
            '[■■■■■■■■■ ]',
            '[■■■■■■■■■■]'
        ];
        let frame = 0;
        const interval = setInterval(() => {
            loadingBar.textContent = frames[frame % frames.length];
            frame++;
        }, 100);
        return interval;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const base64Image = event.target.result.split(',')[1];
        
        loading.style.display = 'block';
        result.style.display = 'none';
        const interval = animateLoading();

        processButton.disabled = true; // Disable the button to prevent multiple clicks
        processButton.textContent = 'Memproses...';

        fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': 'NzHi4DhMf6GmS2aMtp3WKcQq'
            },
            body: JSON.stringify({ image_file_b64: base64Image })
        })
        .then(response => response.blob())
        .then(blob => {
            clearInterval(interval);
            loading.style.display = 'none';
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = function() {
                canvas.width = width;
                canvas.height = height;

                // Menghapus latar belakang (gambar dari remove.bg sudah tanpa latar belakang)
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Menggambar gambar dengan latar belakang baru
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, width, height);

                result.style.display = 'block';
                processButton.disabled = false; // Enable the button again
                processButton.textContent = 'Proses';
            }
            img.src = url;

            // Set up download button
            downloadButton.onclick = function() {
                const link = document.createElement('a');
                link.download = 'processed-image.png';
                link.href = canvas.toDataURL();
                link.click();
            };
        })
        .catch(error => {
            clearInterval(interval);
            loading.style.display = 'none';
            processButton.disabled = false; // Enable the button again
            processButton.textContent = 'Proses';
            console.error('Error:', error);
        });
    }
    reader.readAsDataURL(fileInput);
});
