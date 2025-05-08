// Firebase referansları
const storage = firebase.storage();

// Form elemanlarını seç
const uploadForm = document.getElementById('uploadForm');
const nameInput = document.getElementById('nameInput');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const progressContainer = document.getElementById('progressContainer');
const uploadProgress = document.getElementById('uploadProgress');

// Dosyalar seçildiğinde önizlemeyi göster
fileInput.addEventListener('change', () => {
    const files = fileInput.files;
    preview.innerHTML = ''; // Önceki önizlemeyi temizle

    if (files.length > 0) {
        for (let file of files) {
            const fileType = file.type;
            const fileURL = URL.createObjectURL(file);

            if (fileType.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = fileURL;
                preview.appendChild(img);
            } else if (fileType.startsWith('video/')) {
                const video = document.createElement('video');
                video.src = fileURL;
                video.controls = true;
                preview.appendChild(video);
            }
        }
    }
});

// Form gönderildiğinde çalışır
uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = nameInput.value.trim() || 'Anonim';
    const files = fileInput.files;

    if (files.length > 0) {
        uploadFiles(name, files);
    } else {
        alert('Lütfen bir veya daha fazla dosya seçin.');
    }
});

// Dosyaları Firebase Storage'a yükler
function uploadFiles(name, files) {
    let uploadedCount = 0;
    progressContainer.style.display = 'block';

    // İlerleme çubuğu için toplam boyut ve aktarılan boyutu takip et
    let totalBytes = 0;
    let totalTransferredBytes = 0;

    // Tüm dosyaların toplam boyutunu hesapla
    for (let file of files) {
        totalBytes += file.size;
    }

    for (let file of files) {
        const storageRef = storage.ref('uploads/' + Date.now() + '_' + file.name);
        const uploadTask = storageRef.put(file);

        uploadTask.on('state_changed',
            (snapshot) => {
                // Yükleme ilerlemesi
                const bytesTransferred = snapshot.bytesTransferred;

                // Aktarılan toplam baytları güncelle
                totalTransferredBytes += bytesTransferred;

                // İlerleme yüzdesini hesapla
                const progress = (totalTransferredBytes / totalBytes) * 100;
                uploadProgress.value = progress;
            },
            (error) => {
                console.error('Yükleme hatası:', error);
                alert('Yükleme sırasında bir hata oluştu: ' + error.message);
                progressContainer.style.display = 'none';
            },
            () => {
                uploadedCount++;
                if (uploadedCount === files.length) {
                    // Tüm dosyalar yüklendi
                    progressContainer.style.display = 'none';
                    uploadProgress.value = 0;
                    uploadForm.reset();
                    preview.innerHTML = '';
                    alert('Dosyalarınız başarıyla yüklendi!');
                }
            }
        );
    }
}
