import React, { useEffect, useState } from 'react';
import CameraSession from '../components/PhotoSession/CameraSession';
import CanvasEditor from '../components/SelectPhoto/CanvasEditor';
import { usePhotobox } from '../contexts/studio';
import Background from '../components/Background';
import { HeaderPage } from '../components/Header';

const PhotoSession = () => {
  const { photoboxSession, setPhotoboxSession } = usePhotobox();
  const [templateImage, setTemplateImage] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 1800 });
  const [frames, setFrames] = useState([]);
  const [currentShot, setCurrentShot] = useState(0); // urutan photoshoot
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [draggingPhoto, setDraggingPhoto] = useState(null);

  useEffect(() => {
    if (photoboxSession?.frames || 4) {
      setFrames(photoboxSession.frames);
    }
  }, [photoboxSession]);

  const handlePhotoCaptured = (photoImg) => {
    // Simpan ke frame berdasarkan currentShot
    const targetFrame = frames[currentShot];
    if (!targetFrame) return;

    const updatedFrames = frames.map((frame, index) => {
      if (index === currentShot) {
        return {
          ...frame,
          photo: {
            id: `photo-${Date.now()}`,
            img: photoImg,
            file: {
              name: `photo-${Date.now()}.jpg`,
              path: '', // opsional
              preview: ''
            }
          },
          photoOffsetX: 0,
          photoOffsetY: 0,
          photoScale: 1,
        };
      }
      return frame;
    });

    setFrames(updatedFrames);
    setCurrentShot((prev) => prev + 1);
  };

  return (
    <Background>
      <HeaderPage title={""}></HeaderPage>
      <div className="flex h-[80dvh] w-screen px-10">
      {/* Kamera Live Preview */}
      <div className="w-2/3 bg-black flex items-center justify-center rounded-2xl">
        {currentShot < frames.length ? (
          <CameraSession
            frameIndex={currentShot}
            totalFrames={frames.length}
            onCapture={handlePhotoCaptured}
          />
        ) : (
          <div className="text-white text-xl">Sesi foto selesai</div>
        )}
      </div>

      {/* Canvas Editor */}
        <CanvasEditor
          templateImage={templateImage}
          setTemplateImage={setTemplateImage}
          canvasSize={canvasSize}
          setCanvasSize={setCanvasSize}
          frames={frames}
          setFrames={setFrames}
          selectedId={null}
          setSelectedId={() => {}}
          activeDropZone={null}
          setActiveDropZone={() => {}}
          draggingPhoto={draggingPhoto}
          setDraggingPhoto={setDraggingPhoto}
        />
    </div>

    </Background>
  );
};

export default PhotoSession;
