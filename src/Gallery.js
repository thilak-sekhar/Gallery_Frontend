import React, { useEffect, useState } from "react";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import "./styles.css";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Load images from API (supports pagination)
  const loadImages = async (cursor = null, append = false) => {
    try {
      let url = "https://gallery-backend-8z2u.onrender.com/api/media/";
      if (cursor) url += `?cursor=${cursor}`;

      const res = await fetch(url, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (append) {
          setImages(prev => [...prev, ...data.images]);
        } else {
          setImages(data.images);
        }
        setNextCursor(data.next_cursor || null);
      } else {
        console.error("Failed to fetch images");
      }
    } catch (err) {
      console.error("Error fetching images", err);
    }
  };

  // Initial load
  useEffect(() => { loadImages(); }, []);

  // Upload files
  const uploadFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const form = new FormData();
    files.forEach(f => form.append("images", f));

    setLoading(true);
    try {
      const res = await fetch("https://gallery-backend-8z2u.onrender.com/api/upload/", {
        method: "POST",
        body: form,
        credentials: "include"
      });

      if (res.ok) {
        await loadImages(); // refresh after upload
      } else {
        const err = await res.json();
        alert("Upload failed: " + (err.error || err.detail));
      }
    } catch (err) {
      alert("Upload error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="gallery-container">
      <h1>My Private Gallery</h1>
      {loading && <div className="uploading-text">Uploading...</div>}

      {/* Image Grid */}
      <div className="gallery-grid">
        {images.map((img, index) => (
          <div
            key={index}
            className="gallery-item"
            onClick={() => { setPhotoIndex(index); setIsOpen(true); }}
          >
            <img src={img.url} alt={img.filename || `Image-${index}`} />
          </div>
        ))}
      </div>

      {/* Load More button */}
      {nextCursor && (
        <button
          onClick={() => loadImages(nextCursor, true)}
          className="btnload-more-"
        >
          Load More
        </button>
      )}

      {/* Floating Upload Button */}
      <label className="floating-upload">
        +
        <input type="file" multiple accept="image/*" onChange={uploadFiles} style={{ display: "none" }} />
      </label>

      {/* Lightbox Viewer */}
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
