// CanvasEditor.jsx - Komponen untuk canvas dan manipulasi foto
import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer, Rect, Group } from 'react-konva';
import { useNavigate } from 'react-router-dom';
import { AddPreviewScale, DefaultPaper, DefaultScale } from '../../constants/template';
import { usePhotobox } from '../../contexts/studio';
import PhotoInFrame from './PhotoInFrame.jsx';
// import { handleZoomPhoto, handleZoomToggle, getCenter, getDistance, handlePhotoPositionChange, handlePhotoScaleChange } from '../../utils/ZoomCanvas';

const CanvasEditor = ({
    templateImage,
    setTemplateImage,
    canvasSize,
    setCanvasSize,
    frames,
    setFrames,
    selectedId,
    setSelectedId,
    activeDropZone,
    setActiveDropZone,
    draggingPhoto,
    setDraggingPhoto
}) => {
    // Refs
    const transformerRef = useRef(null);
    const stageRef = useRef(null); // Use 'any' for stageRef
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const scaling = DefaultScale;
    const scalingWidth = DefaultScale;

    const { photoBoxSession, setPhotoboxSession } = usePhotobox();

    const [lastTap, setLastTap] = useState(0);
    const [stageZoom, setStageZoom] = useState(1);
    const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
    const [isDraggingStage, setIsDraggingStage] = useState(false);
    const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
    const [stageSize, setStageSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    // Effect untuk menangani transformer
    useEffect(() => {
        if (selectedId && transformerRef.current) {
            // Cari node yang dipilih
            const selectedNode = stageRef.current.findOne(`#${selectedId}`);
            if (selectedNode) {
                transformerRef.current.nodes([selectedNode]);
                transformerRef.current.getLayer().batchDraw();
            } else {
                transformerRef.current.nodes([]);
                transformerRef.current.getLayer().batchDraw();
            }
        } else if (transformerRef.current) {
            transformerRef.current.nodes([]);
            transformerRef.current.getLayer().batchDraw();
        }
    }, [selectedId]);

    useEffect(() => {
        handleTemplateLoad();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const containerHeight = containerRef.current.offsetHeight;
                setStageSize({
                    width: containerWidth,
                    height: containerHeight
                });
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial sizing

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handler untuk display template dari template yang sudah dipilih pada page sebelumnya
    const handleTemplateLoad = () => {
        const selectedTemplate = localStorage.getItem("selectedTemplate") ? JSON.parse(localStorage.getItem("selectedTemplate")) : null || null;
        console.debug("Load Template selectedTemplate, ", selectedTemplate)
        console.debug("Load Template pathUrl, ", selectedTemplate?.pathUrl)

        new Promise((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
            img.src = selectedTemplate?.base64;
            img.crossOrigin = 'anonymous'; // Handle CORS if needed
        }).then(img => {
            console.debug("Load Template Image, ", img)
            setTemplateImage(img);
            console.debug("Load Template Size:", `${img.width} : ${img.height}`)
            setCanvasSize({
                width: canvasSize.width,
                height: canvasSize.height
            });
        });
        console.debug("photoBoxSession: ", photoBoxSession);
        // const frames = photoBoxSession?.frames?.length > 0 ? photoBoxSession.frames : selectedTemplate?.frames;
        const frames = selectedTemplate?.frames;
        setFrames(frames);
    };

    // Handler untuk drag over pada Stage container
    const handleDragOver = (e) => {
        e.preventDefault(); // Penting! Untuk mengizinkan drop
        e.stopPropagation();
    };

    // Handler untuk drop pada Stage container
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!draggingPhoto || !stageRef.current || !activeDropZone) return;

        // Update frame dengan foto yang di-drop
        setFrames(frames.map(frame => {
            if (frame.id === activeDropZone) {
                return {
                    ...frame,
                    photo: draggingPhoto,
                    photoOffsetX: 0,
                    photoOffsetY: 0
                };
            }
            return frame;
        }));

        setDraggingPhoto(null);
        setActiveDropZone(null);
    };

    // Handler untuk drag enter pada frame
    const handleFrameDragEnter = (frameId, e) => {
        e.preventDefault();
        setActiveDropZone(frameId);
    };

    // Handler untuk drag leave pada frame
    const handleFrameDragLeave = (e) => {
        e.preventDefault();
        setActiveDropZone(null);
    };

    // Handler untuk menggeser foto dalam frame
    const handlePhotoPositionChange = (frameId, newX, newY, scale) => {
        const updatedFrames = frames.map(frame => {
            if (frame.id === frameId && frame.photo) {
                return {
                    ...frame,
                    photoOffsetX: newX,
                    photoOffsetY: newY,
                    photoScale: scale
                };
            }
            return frame;
        });
        setFrames(updatedFrames);
        setPhotoboxSession({
            ...photoBoxSession,
            frames: updatedFrames
        })
    };

    // Handler untuk menghapus foto dari frame
    const handleRemovePhotoFromFrame = (frameId) => {
        setFrames(frames.map(frame => {
            if (frame.id === frameId) {
                return {
                    ...frame,
                    photo: null,
                    photoOffsetX: 0,
                    photoOffsetY: 0
                };
            }
            return frame;
        }));
    };


    const renderPhotoFrames = (frames) => {
        return (
          <Layer>
            {frames.map(frame => (
              frame.photo && (
                <Group
                  key={`frame-group-${frame.id}`}
                  x={frame.x * DefaultScale * AddPreviewScale}
                  y={frame.y * DefaultScale * AddPreviewScale}
                  clipFunc={(ctx) => {
                    ctx.rect(0, 0, frame.width * DefaultScale * AddPreviewScale, frame.height * DefaultScale * AddPreviewScale);
                  }}
                >
                  <PhotoInFrame
                    key={frame.id}
                    frame={frame}
                    handlePhotoPositionChange={handlePhotoPositionChange}
                    handleRemovePhoto={handleRemovePhotoFromFrame}
                    handleTapFrame={handleTapFrame}
                  />                    
                </Group>
              )
            ))}
          </Layer>
        );
    };


    // Render custom dropzone untuk setiap frame
    const renderFrameDropZone = (frame) => {
        // Calculate position relative to stage container
        const frameStyle = {
            position: 'absolute',
            left: `${frame.x * scalingWidth}px`,
            top: `${frame.y * scaling}px`,
            width: `${frame.width * scalingWidth}px`,
            height: `${frame.height * scaling}px`,
            border: activeDropZone === frame.id || draggingPhoto ? '2px dashed #4299e1' : '2px dashed transparent',
            backgroundColor: activeDropZone === frame.id || draggingPhoto ? 'rgba(66, 153, 225, 0.2)' : 'transparent',
            pointerEvents: 'all',
            zIndex: 10,
        };

        return (
            <div
                key={`dropzone-${frame.id}`}
                style={frameStyle}
                onDragEnter={(e) => handleFrameDragEnter(frame.id, e)}
                onDragLeave={handleFrameDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => draggingPhoto && handleTapFrame(frame.id)}
            />
        );
    };

    // Render custom div hover untuk setiap frame
    const renderFrameHover = (frame) => {
        // Calculate position relative to stage container
        const frameStyle = {
            position: 'absolute',
            left: `${frame.x * scalingWidth}px`,
            top: `${frame.y * scaling}px`,
            width: `${frame.width * scalingWidth}px`,
            height: `${frame.height * scaling}px`,
            border: activeDropZone === frame.id ? '2px dashed #4299e1' : '2px dashed transparent',
            backgroundColor: activeDropZone === frame.id ? 'rgba(66, 153, 225, 0.2)' : 'transparent',
            pointerEvents: 'all',
            zIndex: 15,
        };

        return frame.photo && (<div
            key={`hover-${frame.id}`}
            style={frameStyle}
            onDoubleClick={() => handleRemovePhotoFromFrame(frame.id)}
            onTouchStart={(e) => handleTap(e, frame.id)}
        />);
    };

    const resetCanvas = () => {
        setFrames(frames.map(frame => ({ ...frame, photo: null, photoOffsetX: 0, photoOffsetY: 0 })));
    };

    const checkPhotoInFrame = () => {
        let result = true;
        frames.forEach(frame => {
            if (!frame.photo) result = false;
        });

        return result;
    }

    const handleNext = () => {
        const checkPhotoFrames = checkPhotoInFrame();

        if (!checkPhotoFrames) return alert('Pastikan semua frame terisi oleh foto...');

        setPhotoboxSession({
            frames,
            dirPath: "/Users/sfaqih/Documents/Test",
            printDirPath: "/Users/sfaqih/Documents/Test/print"
        });

        return navigate('/select-filter');
    }

    const handleTap = (e, frameId) => {
        const doubleTapDelay = 300;

        const now = Date.now();
        const timeDiff = now - lastTap;
        
        if (timeDiff < doubleTapDelay && timeDiff > 0) {
            e.preventDefault();
          // Double tap detected
          handleRemovePhotoFromFrame(frameId)
        }
        
        setLastTap(now);
    };

    const handleTapFrame = (frameId) => {

        // console.debug("draggingPhoto: ", draggingPhoto);
        // console.debug("frameId: ", frameId);
        if(!draggingPhoto || !frameId) return;
        // console.log("Masukkk");
        
        // Update frame dengan foto yang di-drop
        setFrames(frames.map(frame => {
            if (frame.id === frameId) {
                return {
                    ...frame,
                    photo: draggingPhoto,
                    photoOffsetX: 0,
                    photoOffsetY: 0
                };
            }
            return frame;
        }));  
        
        setDraggingPhoto(null);
        setSelectedId(null);
    }

    return (
        <div className="w-1/3 flex justify-end h-full">
            <div className='editor-wrapper'>
            <div
                className=""
                // style={{ height: 'calc(100vh - 180px)' }}
                style={{ position: 'relative' }}
                ref={containerRef}
            >
                <Stage
                    width={canvasSize.width * DefaultScale * AddPreviewScale}
                    height={canvasSize.height * DefaultScale * AddPreviewScale}
                    ref={stageRef}
                    dragBoundFunc={(pos) => {
                        const stage = stageRef.current;
                        if (!stage) return pos;

                        const { width, height } = stage.getClientRect();
                        const zoom = stageZoom;

                        const minX = (1 - zoom) * width;
                        const minY = (1 - zoom) * height;
                        const maxX = 0;
                        const maxY = 0;

                        return {
                            x: Math.max(minX, Math.min(maxX, pos.x)),
                            y: Math.max(minY, Math.min(maxY, pos.y)),
                        };
                    }}
                    position={stagePosition}
                    scale={{ x: stageZoom, y: stageZoom }}
                    // onDragStart={() => setIsDraggingStage(true)}
                    // onDragEnd={(e) => { // Use 'any' for the event
                    //   setIsDraggingStage(false);
                    //   handleDrag(e);
                    // }}
                    // onDrag={handleDrag}
                    // onTouchStart={handleStageTouchStart}
                    // onTouchMove={handleStageTouchMove}
                    // onTouchEnd={handleStageTouchEnd}
                >

                    {/* Layer 2: Foto-foto dalam frame */}
                    {renderPhotoFrames(frames, handlePhotoPositionChange)}
                    {/* <Layer>
                        {frames.map(frame => renderPhotoInFrame(frame))}
                    </Layer> */}

                    {/* Layer 1: Background Template */}
                    <Layer>
                        {templateImage && (
                            <KonvaImage
                                image={templateImage}
                                x={0}
                                y={0}
                                width={DefaultPaper.width * scaling * AddPreviewScale}
                                height={DefaultPaper.height * scaling * AddPreviewScale}
                                listening={false}
                            />
                        )}
                    </Layer>

                    {/* Layer 3: Frame outlines dan visual indicators */}
                    <Layer>
                        {frames.map(frame => (
                            <Rect
                                key={frame.id}
                                id={frame.id}
                                x={frame.x * scaling * AddPreviewScale}
                                y={frame.y * scaling * AddPreviewScale}
                                width={frame.width * scaling * AddPreviewScale}
                                height={frame.height * scaling * AddPreviewScale}
                                stroke={activeDropZone === frame.id ? '#4299e1' : 'white'}
                                strokeWidth={2}
                                dash={[5, 5]}
                                fill="transparent"
                                // onClick={() => {
                                //     if (frame.photo) {
                                //         setSelectedId(`photo-${frame.id}`);
                                //     }
                                // }}
                                // onTap={() => {  // Add onTap for mobile
                                //   if (frame.photo) {
                                //       setSelectedId(`photo-${frame.id}`);
                                //   }
                                // }}
                                onDblClick={() => handleRemovePhotoFromFrame(frame.id)}
                            />
                        ))}
                    </Layer>

                    {/* Layer 4: Transformer untuk seleksi dan transformasi */}
                    <Layer>
                        <Transformer
                            ref={transformerRef}
                            boundBoxFunc={(oldBox, newBox) => {
                                if (newBox.width < 5 || newBox.height < 5) return oldBox;
                                return newBox;
                            }}
                            rotateEnabled={true}
                            keepRatio={false}
                        />
                    </Layer>
                </Stage>

                {/* <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                    {frames.map(frame => renderFrameHover(frame))}
                </div> */}
                {/* HTML Overlay untuk Drop Zones */}
                <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                    {frames.map(frame => renderFrameDropZone(frame))}
                </div>

                <div style={{ position: 'absolute', top: 0, left: 0 }} id='elemet-touches'>
                    {/* {frames.map(frame => renderFrameDropZone(frame))} */}
                </div>
            </div>

            <div className="mt-4 xl:mt-8 2xl:mt-10 flex space-x-4">
                {/* <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    Export Hasil
                </button> */}
                <button
                    className="px-4 py-2 bg-slate-600 text-white rounded-2xl hover:bg-slate-700"
                    style={{zIndex: '5'}}
                    onClick={resetCanvas}
                >
                    Reset
                </button>
                <button 
                    onClick={handleNext} 
                    className="bg-pink-500 hover:bg-pink-600 transition-colors disabled:opacity-50 text-white text-2xl px-12 py-5 rounded-2xl shadow-lg"
                    style={{zIndex: '5'}}
                >
                    Next (Pilih Efek Filter)
                </button>
            </div>

            <div className="mt-4 text-sm text-gray-600">
                <p>* Double klik pada foto untuk menghapus foto</p>
                {/* <p>* Klik pada foto untuk mengatur posisi dan ukurannya</p> */}
            </div>
            </div>
        </div>
    );
};

export default CanvasEditor;