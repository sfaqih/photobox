// PhotoLibrary.jsx - Komponen untuk menampilkan daftar foto customer
import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Card } from "@material-tailwind/react";
import { ArrowLeftCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PhotoLibrary = ({ customerPhotos, setCustomerPhotos, handleDragStart, selectPhoto, selectedId }) => {
  const dirPath = localStorage.getItem("CustomerFolder"); // Get selected dirPath
  const navigate = useNavigate();
  
  const loadCustomerPhotos = async(dirPath) => {
    const dirReadImages = await window.electronAPI.dirReadImages(dirPath);

    Promise.all(
        dirReadImages.imageFiles.map(file => {
          return new Promise((resolve) => {
            const img = new window.Image();
            img.src = file.base64;
            
            img.onload = () => {
              resolve({
                id: uuidv4(),
                file: {
                  path: file.url,
                  name: file,
                },
                img: img,
                name: file.name,
                preview: file.base64
              });
            };            
          });
        })
      ).then(loadedImages => {
          console.debug("loadedImages", loadedImages)
        setCustomerPhotos(loadedImages);
      });
  }

  useEffect(() => {
    loadCustomerPhotos(dirPath)
  }, []);

  return (
    <div className="w-2/3 h-full">   
                <div className="p-6 h-full flex flex-col justify-center items-center ">
                    {/* <img src={"/choose_frame.png"} className="object-cover w-50 pb-4 max-h-90" /> */}
                    <Card className="cursor-pointer p-1 border-2 bg-gray-100 rounded-xl my-2 h-[80dvh]">
                        <div className="h-full overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-mint scrollbar-track-gray-200">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {customerPhotos.map((photo) => (
                                    <div
                                        key={photo.id}
                                        className="relative cursor-pointer p-1 border-0 transition-all duration-200 rounded-xl group"
                                        draggable="true"
                                        onDragStart={(e) => handleDragStart(e, photo)}
                                        onClick={() => selectPhoto(photo)}
                                        
                                        // onTouchStart={(e) => handleDragStart(e, photo)}
                                    >
                                        <img
                                            src={photo.preview}
                                            alt={photo.name}
                                            className="w-full2 rounded"
                                        />
                                        {/* Overlay */}
                                        <div
                                            className={`
                        absolute inset-0 rounded 
                        transition duration-200 
                        ${selectedId === photo.id ? "bg-black/60" : "group-hover:bg-black/20"}
                        flex items-center justify-center
                        `}
                                        >
                                            {selectedId === photo.id && (
                                                <span className="text-white font-semibold">Selected</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

      {/* <div className="grid grid-cols-2 gap-2 rounded shadow overflow-auto relative">
        {customerPhotos.map((photo) => (
          <div
            key={photo.id}
            className="relative bg-gray-200 p-1 rounded cursor-move"
            draggable="true"
            onDragStart={(e) => handleDragStart(e, photo)}
          >
            <img
              src={photo.preview}
              alt={photo.name}
              className="w-full h-32 object-cover rounded"
            />
            <p className="text-xs truncate mt-1">{photo.name}</p>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default PhotoLibrary;