import React, { useEffect, useState } from "react";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import "./styles.css";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const loadImages = async () => {
    try {
      const res = await fetch("https://gallery-cv1p.onrender.com/api/media/", { credentials: "include" });
      if (res.ok) setImages(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadImages(); }, []);

  const uploadFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const form = new FormData();
    files.forEach(f => form.append("files", f));

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/upload/", {
        method: "POST", body: form, credentials: "include"
      });
      if (res.ok) await loadImages();
      else alert("Upload failed");
    } catch { alert("Upload error"); }
    setLoading(false);
  };

  return (
    <div className="gallery-container">
      <h1>My Private Gallery</h1>
      {loading && <div className="uploading-text">Uploading...</div>}

      <div className="gallery-grid">
        {images.map((img, index) => (
          <div
            key={img.id}
            className="gallery-item"
            onClick={() => { setPhotoIndex(index); setIsOpen(true); }}
          >
            <img src={img.url} alt={img.filename} />
          </div>
        ))}
      </div>

      {/* Floating + upload button */}
      <label className="floating-upload">
        +
        <input type="file" multiple accept="image/*" onChange={uploadFiles} style={{display:"none"}} />
      </label>

      {/* Lightbox */}
      {isOpen && images.length > 0 && (
        <Lightbox
          mainSrc={images[photoIndex].url}
          nextSrc={images[(photoIndex + 1) % images.length]?.url}
          prevSrc={images[(photoIndex + images.length - 1) % images.length]?.url}
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() => setPhotoIndex((photoIndex + images.length - 1) % images.length)}
          onMoveNextRequest={() => setPhotoIndex((photoIndex + 1) % images.length)}
        />
      )}
    </div>
  );
}
