import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { ArrowLeftCircle, ArrowRightCircle, Group } from 'lucide-react';
import '../styles/SelectFilter.css';
import { DefaultScale, AddPreviewScale, DefaultPaper } from '../constants/template';
import { usePhotobox } from '../contexts/studio';

// Utility function to load an image
const loadHtmlImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
    img.crossOrigin = 'anonymous';
  });
};

// Helper functions for LUT filter processing
const parseCubeFile = (cubeContent) => {
  const lines = cubeContent.split('\n');
  let size = 0;
  const lut = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('LUT_3D_SIZE')) {
      size = parseInt(trimmedLine.split(' ')[1], 10);
    } else if (trimmedLine && !trimmedLine.startsWith('#') && !trimmedLine.startsWith('LUT') && !trimmedLine.startsWith('TITLE')) {
      const values = trimmedLine.split(' ').filter(v => v.trim() !== '').map(parseFloat);
      if (values.length === 3) {
        lut.push(values);
      }
    }
  }

  return { size, lut };
};

const applyLutToImage = (image, lutDataFile, outputType = 'image') => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
    
      // DRAW image to canvas first!
      ctx.drawImage(image, 0, 0);
    
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
    
      const { size, lut } = lutDataFile; // pastikan `lut` benar
      const lutData = lut;
    
      const getLUTIndex = (r, g, b) => {
        const ir = Math.min(Math.floor(r * (size - 1)), size - 1);
        const ig = Math.min(Math.floor(g * (size - 1)), size - 1);
        const ib = Math.min(Math.floor(b * (size - 1)), size - 1);
        return ir + ig * size + ib * size * size;
      };
    
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i] / 255;
        let g = data[i + 1] / 255;
        let b = data[i + 2] / 255;
    
        // Clamp values
        r = Math.max(0, Math.min(1, r));
        g = Math.max(0, Math.min(1, g));
        b = Math.max(0, Math.min(1, b));
    
        const index = getLUTIndex(r, g, b);
        const [nr, ng, nb] = lutData[index] || [r, g, b];
    
        data[i] = Math.min(255, Math.max(0, nr * 255));
        data[i + 1] = Math.min(255, Math.max(0, ng * 255));
        data[i + 2] = Math.min(255, Math.max(0, nb * 255));
      }
    
      ctx.putImageData(imgData, 0, 0);
    
      if (outputType === 'url') {
        resolve(canvas.toDataURL('image/png'));
      } else {
        const newImg = new window.Image();
        newImg.onload = () => resolve(newImg);
        newImg.onerror = (err) => reject(err);
        newImg.src = canvas.toDataURL('image/png');
      }
    } catch (error) {
      reject(error);
    }    
  });
};

const SelectFilter = () => {
  const navigate = useNavigate();
  const stageRef = useRef(null);
  const sliderRef = useRef(null);

  // State for display and control
  const [currentFilterIndex, setCurrentFilterIndex] = useState(0);
  const [templateImage, setTemplateImage] = useState(null);
  const [frames, setFrames] = useState([]);
  const [resolvedImages, setResolvedImages] = useState({});
  const [filteredPhotos, setFilteredPhotos] = useState({});
  const [filters, setFilters] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [loadingFilter, setLoadingFilter] = useState(false);
  const [finalStage, setFinalStage] = useState({ width: 400, height: 595 });
  const { photoStudioSession } = usePhotobox();

  // Load template and frames from localStorage
  useEffect(() => {
    const loadTemplateFrames = async () => {
      try {
        const photoStudio = photoStudioSession;
        console.debug("photoStudio: ", photoStudio);
        const selectedTemplate = JSON.parse(localStorage.getItem("selectedTemplate") || "null");
        if (!photoStudio || !selectedTemplate) {
          alert("Please restart your journey...");
          return;
        }

        // Load template image
        const img = await loadHtmlImage(selectedTemplate?.base64);
        setTemplateImage(img);
        setFinalStage({ width: DefaultPaper.width * DefaultScale, height: DefaultPaper.height * DefaultScale });
        setFrames(photoStudio.frames);
      } catch (error) {
        console.error("Error loading template:", error);
        alert("Failed to load template. Please try again.");
      }
    };

    loadTemplateFrames();
  }, [photoStudioSession]);

  // Load all photos once frames are set
  useEffect(() => {
    if (!frames || frames.length === 0) return;

    const loadAllImages = async () => {
      const results = {};
      for (const frame of frames) {
        if (frame.photo?.preview || frame.photo?.file?.path) {
          try {
            const img = await loadHtmlImage(frame.photo.preview);
            results[frame.id] = img;
          } catch (err) {
            console.error('Failed to load image for frame', frame.id, err);
          }
        }
      }
      setResolvedImages(results);
    };

    loadAllImages();
  }, [frames]);

  // Load filters
  useEffect(() => {
    const loadFilters = async () => {
      setLoadingFilter(true);
      try {
        const availableFilters = [
          { id: 'original', name: 'Original', path: null },
          { id: 'blue', name: 'Blue', path: './filters/blue.CUBE' },
          { id: 'fresh', name: 'Fresh', path: './filters/fresh.CUBE' },
          { id: 'green', name: 'Green', path: './filters/green.CUBE' },
          { id: 'pink', name: 'Pink', path: './filters/pink.CUBE' },
          { id: 'pink_blue', name: 'Pink & Blue', path: './filters/pink_blue.CUBE' },
          { id: '8', name: 'Going for a walk', path: './filters/Going for a walk.CUBE' },
          { id: '9', name: 'Good morning', path: './filters/Good morning.CUBE' },
          { id: '10', name: 'Nah', path: './filters/Nah.CUBE' },
          { id: '11', name: 'Once upon a time', path: './filters/Once upon a time.CUBE' },
          { id: '12', name: 'Passing by', path: './filters/Passing by.CUBE' },
          { id: '13', name: 'Serenity', path: './filters/Serenity.CUBE' },
          { id: '14', name: 'smooth-sailing', path: './filters/smooth-sailing.CUBE' },
          { id: '15', name: 'Undeniable 2', path: './filters/Undeniable 2.CUBE' },
          { id: '16', name: 'Undeniable', path: './filters/Undeniable.CUBE' },
          { id: '17', name: 'Urban cowboy', path: './filters/Urban cowboy.CUBE' },
          { id: '18', name: 'well-see', path: './filters/well-see.CUBE' },
          { id: '19', name: 'BnW Bright', path: './filters/BnW Bright.CUBE' },
          { id: '20', name: 'BnW Dark', path: './filters/BnW Dark.CUBE' },
          { id: '21', name: 'Bright', path: './filters/Bright.CUBE' },
          { id: '22', name: 'Candlelight', path: './filters/Candlelight.CUBE' },
        ];

        // Use the first frame image as sample if available, otherwise use a default image
        const sampleKey = frames && frames.length > 0 && frames[0].photo && resolvedImages[frames[0].id]
          ? frames[0].id
          : null;

        const sampleImage = sampleKey
          ? resolvedImages[sampleKey]
          : await loadHtmlImage("/water.png");

        const loadedFilters = [...availableFilters];

        // Load thumbnail for original filter

        // Load and process other filters
        for (let i = 0; i < loadedFilters.length; i++) {
          try {
            const response = await fetch(loadedFilters[i].path);
            const cubeContent = await response.text();

            loadedFilters[i].lutData = parseCubeFile(cubeContent);

            if (sampleImage) {
              const filteredImageUrl = await applyLutToImage(sampleImage, loadedFilters[i].lutData, 'url');
              loadedFilters[i].sampleImg = filteredImageUrl;
            } else {
              loadedFilters[i].sampleImg = frames[0].photo.preview;
            }

          } catch (error) {
            console.error(`Failed to load filter ${loadedFilters[i].name}:`, error);
            // Set a placeholder for failed filters
            loadedFilters[i].sampleImg = sampleImage.src;
          }
        }

        setFilters(loadedFilters);
        // Set default filter
        setSelectedFilter(loadedFilters[0]);
      } catch (error) {
        console.error("Error loading filters:", error);
      } finally {
        setLoadingFilter(false);
      }
    };

    // Only load filters when we have images to apply them to
    if (Object.keys(resolvedImages).length > 0) {
      loadFilters();
    }
  }, [resolvedImages, frames]);

  // Apply selected filter to all photos
  useEffect(() => {
    if (!selectedFilter || !frames || Object.keys(resolvedImages).length === 0) {
      return;
    }

    const applyFilterToPhotos = async () => {
      setLoadingFilter(true);
      try {
        const filtered = {};

        // If original filter selected, use original images
        if (selectedFilter.id === 'original') {
          setFilteredPhotos({});
          return;
        }

        // Apply filter to each image
        for (const frame of frames) {
          if (frame.photo && resolvedImages[frame.id]) {
            try {
              const filteredImg = await applyLutToImage(resolvedImages[frame.id], selectedFilter.lutData);
              filtered[frame.id] = filteredImg;
            } catch (error) {
              console.error(`Failed to apply filter to frame ${frame.id}:`, error);
            }
          }
        }
        setFilteredPhotos(filtered);
      } catch (error) {
        console.error("Error applying filters:", error);
      } finally {
        setLoadingFilter(false);
      }
    };

    applyFilterToPhotos();
  }, [selectedFilter, frames, resolvedImages]);

  // Handle slider navigation
  useEffect(() => {
    if (sliderRef.current && filters.length > 0) {
      // Calculate the position to center the current filter in the slider
      const itemWidth = 100; // Approximate width of each filter item
      const sliderWidth = sliderRef.current.clientWidth;
      const scrollPosition = (currentFilterIndex * itemWidth) - (sliderWidth / 2) + (itemWidth / 2);

      sliderRef.current.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    }
  }, [currentFilterIndex, filters.length]);

  const handlePrevious = () => {
    if (currentFilterIndex > 0) {
      setCurrentFilterIndex(currentFilterIndex - 1);
      setSelectedFilter(filters[currentFilterIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentFilterIndex < filters.length - 1) {
      setCurrentFilterIndex(currentFilterIndex + 1);
      setSelectedFilter(filters[currentFilterIndex + 1]);
    }
  };

  const handleFilterSelect = (index) => {
    setCurrentFilterIndex(index);
    setSelectedFilter(filters[index]);
  };

  const handleContinue = () => {
    // Save selected filter
    if (selectedFilter) {
      localStorage.setItem("selectedFilter", JSON.stringify(selectedFilter));
    }
    navigate('/print-preview');
  };

  const handleBack = () => {
    return navigate('/select-photos');
  };

  const renderCompositeImage = (frames) => {
    return (
      <Stage
        ref={stageRef}
        width={finalStage.width * AddPreviewScale}
        height={finalStage.height * AddPreviewScale}
        style={{ background: '#f0f0f0', margin: '0 auto', maxWidth: '100%' }}
      >
        <Layer>
          {frames && frames.map(frame => {
            if (!frame.photo) return null;

            const scale = frame?.photoScale || DefaultScale;
            console.debug(`FrameID ${frame.id} Scale: ${scale}`);

            const photoImg = filteredPhotos[frame.id] || resolvedImages[frame.id];
            if (!photoImg) return null;

            const photoRatio = photoImg.width / photoImg.height;
            const frameRatio = frame.width / frame.height;

            // Calculate photo dimensions to fit in frame (before scaling)
            let photoWidth, photoHeight;

            if (photoRatio > frameRatio) {
              // Photo is wider than frame (fit by height)
              photoHeight = frame.height;
              photoWidth = photoHeight * photoRatio;
            } else {
              // Photo is taller than frame (fit by width)
              photoWidth = frame.width;
              photoHeight = photoWidth / photoRatio;
            }

            // Calculate default centering offset (this is what your PhotoInFrame uses)
            const defaultOffsetX = (photoWidth - frame.width) / 2;
            const defaultOffsetY = (photoHeight - frame.height) / 2;

            // CRITICAL: Get the stored position from frame state
            // If no position is stored, use the default centering position
            const photoPosition = {
              x: frame.photoOffsetX,
              y: frame.photoOffsetY
            };

            // Calculate final dimensions with scaling applied
            const scaledWidth = photoWidth * scale * AddPreviewScale;
            const scaledHeight = photoHeight * scale * AddPreviewScale;

            // EXACT MATCH to your PhotoInFrame component positioning logic:
            // The photo position calculation from your component
            // Calculate position considering offset and scale
            const photoX = -1 * (photoPosition.x || defaultOffsetX) * scale; 
            const photoY = -1 * (photoPosition.y || defaultOffsetY) * scale;

            // Apply DefaultScale for canvas rendering
            const finalX = photoX * AddPreviewScale;
            const finalY = photoY * AddPreviewScale;
            const finalWidth = scaledWidth;
            const finalHeight = scaledHeight;

            console.debug(`Frame ${frame.id}:`, {
              photoWidth,
              photoHeight,
              scale,
              scaledWidth,
              scaledHeight,
              defaultOffsetX,
              defaultOffsetY,
              storedOffsetX: frame.photoOffsetX,
              storedOffsetY: frame.photoOffsetY,
              photoPosition,
              photoX,
              photoY,
              finalX,
              finalY
            });

            return (
              <Group
                key={frame.id}
                x={frame.x * DefaultScale * AddPreviewScale}
                y={frame.y * DefaultScale * AddPreviewScale}
                clipFunc={(ctx) => {
                  ctx.rect(0, 0, frame.width * DefaultScale * AddPreviewScale, frame.height * DefaultScale * AddPreviewScale);
                }}
              >
                <KonvaImage
                  image={photoImg}
                  x={finalX}
                  y={finalY}
                  width={finalWidth}
                  height={finalHeight}
                />
              </Group>
            );
          })}
        </Layer>
        <Layer>
          {templateImage && (
            <KonvaImage
              image={templateImage}
              width={templateImage.width * DefaultScale * AddPreviewScale}
              height={templateImage.height * DefaultScale * AddPreviewScale}
            />
          )}
        </Layer>
      </Stage>
    );
  };

  return (
    <div className="filter-selection-container min-h-screen flex flex-col items-center justify-center mx-auto min-w-screen px-4 py-6">
      <div className='self-start'>
        <button
          className="back-button flex items-center text-pink-500 hover:text-pink-600"
          onClick={handleBack}
        >
          <ArrowLeftCircle size={24} className="mr-2" />
          <span>Kembali</span>
        </button>
      </div>
      <div className='justify-content-between'>
        <h1 className="filter-title text-3xl text-black font-bold text-center mb-6">Pilih Filter!</h1>

        <div className="preview-container relative mb-8">
          {renderCompositeImage(frames)}
          {loadingFilter && (
            <div className="absolute inset-0 flex items-center justify-center rounded">
              <div className="loading-spinner"></div>
            </div>
          )}
        </div>

        <div className="filter-navigation flex items-center mb-4">
          <button
            className="arrow-button left focus:outline-none disabled:opacity-50"
            onClick={handlePrevious}
            disabled={currentFilterIndex === 0 || loadingFilter}
          >
            <ArrowLeftCircle size={40} color="#C93B8A" />
          </button>

          <div className="filter-slider-wrapper flex-grow mx-4 overflow-hidden max-w-[75vw]">
            <div
              className="filter-slider flex space-x-4 py-2 overflow-x-auto no-scrollbar"
              ref={sliderRef}
            >
              {filters.map((filter, index) => (
                <div
                  key={filter.id}
                  className={`filter-item flex-shrink-0 cursor-pointer transition-all duration-200 ${index === currentFilterIndex ? 'scale-110 border-2 border-pink-500' : ''
                    }`}
                  onClick={() => handleFilterSelect(index)}
                >
                  {filter.sampleImg ? (
                    <div className="filter-preview w-20 h-20 overflow-hidden rounded">
                      <img
                        src={filter.sampleImg}
                        alt={filter.name}
                        className="filter-image w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="filter-preview w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                      <span>Loading</span>
                    </div>
                  )}
                  <p className="filter-name text-center mt-2 font-medium">{filter.name}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            className="arrow-button right focus:outline-none disabled:opacity-50"
            onClick={handleNext}
            disabled={currentFilterIndex === filters.length - 1 || loadingFilter}
          >
            <ArrowRightCircle size={40} color="#C93B8A" />
          </button>
        </div>

        <div className="slider-progress relative h-2 bg-gray-200 rounded-full mb-8">
          <div
            className="progress-indicator absolute h-full bg-pink-500 rounded-full transition-all duration-300"
            style={{
              width: `${100 / filters.length}%`,
              left: `${(currentFilterIndex / (filters.length - 1)) * (100 - (100 / filters.length))}%`
            }}
          ></div>
        </div>

        <div className="actions flex justify-center">
          <button
            className="print-button bg-pink-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
            onClick={handleContinue}
            disabled={loadingFilter}
          >
            {loadingFilter ? 'Processing...' : 'Cetak'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectFilter;