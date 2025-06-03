import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stage, Layer, Image as KonvaImage, Group } from 'react-konva';
import { ArrowLeftCircle, Check, Printer } from 'lucide-react';
import { usePhotobox } from '../contexts/studio';
import { loadHtmlImage } from '../utils/Image';
import { parseCubeFile, applyLutToImage } from '../utils/Lut';
import { DefaultPaper, DefaultScale } from '../constants/template';
import { Button } from '@material-tailwind/react';

const PrintPreview = () => {
  const navigate = useNavigate();
  const stagePreviewRef = useRef(null);
  const stageRef = useRef(null);
  const { photoStudioSession } = usePhotobox();
  
  // State for display and control
  const [templateImage, setTemplateImage] = useState(null);
  const [frames, setFrames] = useState([]);
  const [resolvedImages, setResolvedImages] = useState({});
  const [filteredPhotos, setFilteredPhotos] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingFilter, setLoadingFilter] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [availablePrinters, setAvailablePrinters] = useState([]);
  const [printError, setPrintError] = useState(null);
  const [finalStage, setFinalStage] = useState({ width: 400, height: 595 }); // Default approximation for 4R (4×6″)
  const [selectedFilter, setSelectedFilter] = useState(null);

  // Access to Electron's API through window.electron
  const electron = window.electronAPI;

  // Load template, frames, and filter from localStorage
  useEffect(() => {
    const loadTemplateFrames = async () => {
      try {
        setLoading(true);
        const photoStudio = photoStudioSession;
        const selectedTemplate = JSON.parse(localStorage.getItem("selectedTemplate") || "null");
        const selectedFilter = JSON.parse(localStorage.getItem("selectedFilter") || "null");
        
        if (!photoStudio || !selectedTemplate) {
          alert("Please restart your journey...");
          navigate('/');
          return;
        }

        // Load template image
        const img = await loadHtmlImage(selectedTemplate?.base64);
        setTemplateImage(img);
        
        // 4R size in pixels (4×6″ at 300dpi = ~1200×1800 pixels)
        // Scale for preview while maintaining aspect ratio
        setFinalStage({ width: DefaultPaper.width, height: DefaultPaper.height });
        
        setFrames(photoStudio.frames);
        
        // Load filter data if available
        if (selectedFilter && selectedFilter.id !== 'original' && selectedFilter.path) {
          try {
            const response = await fetch(selectedFilter.path);
            const cubeContent = await response.text();
            const lutData = parseCubeFile(cubeContent);
            selectedFilter.lutData = lutData;
          } catch (error) {
            console.error("Failed to load filter data:", error);
          }
        }
      } catch (error) {
        console.error("Error loading template:", error);
        alert("Failed to load template. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadTemplateFrames();
    loadAvailablePrinters();
  }, [photoStudioSession, navigate]);

  // Load all photos once frames are set
  useEffect(() => {
    if (!frames || frames.length === 0) return;

    const loadAllImages = async () => {
      // console.debug("Loading images for frames:", frames);
      const results = {};
      setLoading(true);
      for (const frame of frames) {
        // console.debug(`Original Image: `, await getOriginalImage(frame));
        if (frame.photo?.preview || frame.photo?.file?.path) {
          try {
            // const img = await loadHtmlImage(frame.photo.preview);
            // console.debug(`Image: `, await getOriginalImage(frame));;
            const img = await getOriginalImage(frame);
            results[frame.id] = img;
          } catch (err) {
            console.error('Failed to load image for frame', frame.id, err);
          }
        }
      }
      setResolvedImages(results);
      
      // Apply saved filter to images if needed
      applySelectedFilter(results);
      setLoading(false);
    };

    loadAllImages();
  }, [frames]);

  const getOriginalImage = async(frame) => {
    const folderPath = localStorage.getItem("CustomerFolderOrigin");
    const fileName = frame.photo?.name;
    const filePath = `${folderPath}/${fileName}`;

    const base64 = await window.electronAPI.loadImageBase64({url: filePath, name: fileName});
    // .then((img) => {
    //   console.debug(`Loaded image for frame ${frame.id}:`, img);
    //   return img;
    // }
    // ).catch((err) => {
    //   console.error(`Failed to load original image for frame ${frame.id}:`, err);
    //   return null;
    // });

    const img = new window.Image();
    img.src = base64;
    img.crossOrigin = 'anonymous'; // Handle CORS if needed
    return img;
  };

  //Handle Printer Data Communication

  // Apply selected filter to all photos
  const applySelectedFilter = async (images) => {
    const selectedFilterData = JSON.parse(localStorage.getItem("selectedFilter") || "null");
    console.debug("set selectedFilterData: ", (selectedFilterData?.id || null))

    if (!selectedFilterData || selectedFilterData.id === 'original' || !frames) {
      return;
    }
    setSelectedFilter(selectedFilterData?.id || null);

    const lutData = selectedFilterData.lutData
    
    try {
      setLoadingFilter(true);
      const filtered = {};
      
      // Apply filter to each image
      for (const frame of frames) {
        if (frame.photo && images[frame.id]) {
          try {
            if (lutData) {
              const filteredImg = await applyLutToImage(images[frame.id], lutData);
              filtered[frame.id] = filteredImg;
            }
          } catch (error) {
            console.error(`Failed to apply filter to frame ${frame.id}:`, error);
          }
        }
      }
      setFilteredPhotos(filtered);
      setLoadingFilter(false);
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  // Load available printers
  const loadAvailablePrinters = async () => {
    try {
      // Use Electron's IPC to get printers
      const printers = await electron.getPrinters();
      setAvailablePrinters(printers);
      
      // Set EPSON L8050 as default if available
      const epsonPrinter = printers.find(printer => 
        printer.name.toLowerCase().includes('epson') && 
        printer.name.toLowerCase().includes('l8050')
      );
      
      if (epsonPrinter) {
        setSelectedPrinter(epsonPrinter.name);
      } else if (printers.length > 0) {
        setSelectedPrinter(printers[0].name);
      }
    } catch (error) {
      console.error("Failed to load printers:", error);
      setPrintError("Failed to load printers. Please check printer connections.");
    }
  };

  // Print the current canvas
  const handlePrint = async () => {
    if (!stageRef.current) {
      setPrintError("Cannot print: No printer selected or canvas not ready");
      return;
    }


    console.debug("stageRef: ", stageRef.current);
    setPrinting(true);
    setPrintError(null);
    
    try {
      // Get canvas data URL
      const dataURL = stageRef.current.toDataURL({ 
        pixelRatio: DefaultScale * 10, // Higher quality for printing
        mimeType: 'image/jpeg',
        quality: 0.95
      });
      // console.debug("dataURL: ", dataURL);
      const custFolder = photoStudioSession.printDirPath;
      // Call Electron's print function
      const payload = {
        printerName: selectedPrinter,
        imageData: dataURL,
        paperSize: {
          silent: true,
          printBackground: true,
          deviceName: selectedPrinter,
          // 4R size in mm (approximately 102mm × 152mm)
          pageSize: { width: 102000, height: 152000 }, // In microns
          landscape: false,
          marginsType: 1, // Minimum margins
          scaleFactor: 100,
        },
        custFolder
      };
      console.debug("payload: ", payload);
      const printResult = await electron.printPhoto(payload);


      console.debug("printResult: ", printResult)
      
      if (printResult.success) {
        // Navigate to success screen or show success message
        navigate('/print-success');
      } else {
        setPrintError(printResult.message || "Print failed. Please try again.");
      }
    } catch (error) {
      console.error("Print error:", error);
      setPrintError("Print failed: " + (error.message || "Unknown error"));
    } finally {
      setPrinting(false);
    }
  };

  const handleBackToFilters = () => {
    navigate('/select-filter');
  };

  const renderPreview = (frames) => {    
    return (
      <div ref={stagePreviewRef}>
        <Stage
          ref={stageRef}
          width={finalStage.width * DefaultScale}
          height={finalStage.height * DefaultScale}
          // className='scale'
          style={{ background: '#f0f0f0', margin: '0 auto' }}
        >
          <Layer>
          {frames && frames.map(frame => {
            if (!frame.photo) return null;

            const scale = (frame?.photoScale || DefaultScale);
            console.debug(`FrameID ${frame.id} Scale: ${scale}`);

            const photoImg = filteredPhotos[frame.id] || resolvedImages[frame.id];
            if (!photoImg) return null;

            console.debug(`Rendering frame ${frame.id} with photo: `, photoImg);

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
            const scaledWidth = photoWidth * scale;
            const scaledHeight = photoHeight * scale;

            // EXACT MATCH to your PhotoInFrame component positioning logic:
            // The photo position calculation from your component
            // Calculate position considering offset and scale
            const photoX = -1 * (photoPosition.x || defaultOffsetX) * scale; 
            const photoY = -1 * (photoPosition.y || defaultOffsetY) * scale;

            // Apply DefaultScale for canvas rendering
            const finalX = photoX;
            const finalY = photoY;
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
                x={frame.x * DefaultScale}
                y={frame.y * DefaultScale}
                clipFunc={(ctx) => {
                  ctx.rect(0, 0, frame.width * DefaultScale, frame.height * DefaultScale);
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
                width={templateImage.width * DefaultScale}
                height={templateImage.height * DefaultScale}
              />
            )}
          </Layer>
        </Stage>
      </div>
    );
  };

  return (
    <>
    <div className='h-full max-w-screen'>
    <div className="flex justify-between items-center mb-auto">
    <button 
      className="back-button flex items-center text-pink-500 hover:text-pink-600 px-3"
      onClick={handleBackToFilters}
      disabled={printing}
      style={{ zIndex: 10}}
    >
      <ArrowLeftCircle size={24} className="mr-2" />
      <span>Kembali ke Filter</span>
    </button>
    <h1 className="filter-title text-3xl font-bold text-center mb-6 text-black">Cetak Preview</h1>
    <div className="w-24"></div> {/* Spacer for alignment */}
    </div>
    <div className="print-preview-container max-h-screen flex items-center justify-center mx-auto min-w-screen w-full">
        <div className="preview-container relative mb-8 w-2/3">
          {Object.keys(resolvedImages).length > 0 && renderPreview(frames)}
          {loading && (
           <Button variant="text" size="lg" loading={true}>
           Loading
          </Button>
          )}
          {loadingFilter && (
            <div className="absolute inset-0 flex items-center justify-center rounded">
              <div className="loading-spinner"></div>
              <div className='mx-3'>Waiting Filter...</div>
            </div>
          )}       
        </div>
        <div className='container w-1/3'>
        <div className="printer-selection max-w-lg mx-auto mb-6 hidden">
          <h2 className="text-xl font-semibold mb-3">Pilih Printer</h2>
          {availablePrinters.length === 0 ? (
            <div className="text-red-500">No printers found. Please check printer connections.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availablePrinters.map((printer) => (
                <div 
                  key={printer.name}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedPrinter === printer.name 
                      ? 'border-pink-500 bg-pink-50' 
                      : 'border-gray-300 hover:border-pink-300'
                  }`}
                  onClick={() => setSelectedPrinter(printer.name)}
                >
                  <div className="printer-icon mr-3 text-gray-700">
                    <Printer size={24} />
                  </div>
                  <div className="flex-grow">
                    <div className="font-medium">{printer.name}</div>
                    <div className="text-sm text-gray-500">
                      {printer.status} <br/>
                      {printer.status === 'READY' ? 'Siap digunakan' : printer.status}
                    </div>
                  </div>
                  {printer.status === 'READY' && (
                    <div className="check-icon text-green-500 ml-2">
                      <Check size={20} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {printError && (
            <div className="error-message mt-3 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
              {printError}
            </div>
          )}
        </div>
        
        <div className="actions flex justify-center">
          <button 
            className="print-button bg-pink-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center"
            onClick={handlePrint}
            disabled={printing || loading}
          >
            {printing ? (
              <>
                <div className="spinner mr-2 w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                Mencetak...
              </>
            ) : (
              <>
                <Printer size={20} className="mr-2" />
                Cetak Foto
              </>
            )}
          </button>
        </div>
        </div>  
    </div>
    </div>
    </>
  );
};

export default PrintPreview;