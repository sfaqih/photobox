import React, { useRef } from 'react';
import { Stage, Layer, Transformer } from 'react-konva';
import PhotoInFrame from './PhotoInFrame.jsx';

export const FrameStage = (frame, {
  scalingWidth,
  scaling,
  activeDropZone,
  selectedFrame,
  selectedId,
  setSelectedId,
  handleDragOver,
  handleDrop,
  handleFrameDragEnter,
  handleFrameDragLeave,
  handleTapFrame,
  handleRemovePhotoFromFrame,
  handlePhotoPositionChange,
  handlePhotoScaleChange,
  handleStageClick,
  handleTap,
  frameStageRefs,
  transformerRefs,
  calculateContainerScale
}) => {
  const containerScale = 1;
  const scaledWidth = frame.width * scalingWidth * containerScale;
  const scaledHeight = frame.height * scaling * containerScale;
  const scaledX = frame.x * scalingWidth * containerScale;
  const scaledY = frame.y * scaling * containerScale;

  return (
    <div 
      key={`frame-container-${frame.id}`}
      style={{
        position: 'absolute',
        left: `${scaledX}px`,
        top: `${scaledY}px`,
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        border: activeDropZone === frame.id || selectedFrame === frame.id 
          ? '2px solid #4299e1' 
          : '1px dashed #cccccc',
        zIndex: frame.photo ? 1 : 5,
      }}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, frame.id)}
      onDragEnter={(e) => handleFrameDragEnter(frame.id, e)}
      onDragLeave={handleFrameDragLeave}
      onClick={() => handleTapFrame(frame.id)}
      onDoubleClick={() => handleRemovePhotoFromFrame(frame.id)}
      onTouchStart={(e) => handleTap(e, frame.id)}
    >
      <Stage
        width={scaledWidth}
        height={scaledHeight}
        ref={(node) => { frameStageRefs.current[frame.id] = node; }}
        onClick={(e) => handleStageClick(frame.id, e)}
      >
        {/* Layer for the photo */}
        <Layer>
          {frame.photo && (
            <PhotoInFrame
              frame={{
                ...frame,
                x: 0, // Relative to this stage
                y: 0, // Relative to this stage
                width: frame.width * containerScale,
                height: frame.height * containerScale
              }}
              containerScale={containerScale}
              handlePhotoPositionChange={(frameId, x, y) => 
            handlePhotoPositionChange(frameId, x / containerScale, y / containerScale)}
              handlePhotoScaleChange={handlePhotoScaleChange}
              isSelected={selectedId === `photo-${frame.id}`}
              onSelect={() => setSelectedId(`photo-${frame.id}`)}
            />
          )}
        </Layer>
        
        {/* Layer for the transformer */}
        <Layer>
          <Transformer
            ref={(node) => { transformerRefs.current[frame.id] = node; }}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) return oldBox;
              return newBox;
            }}
            rotateEnabled={true}
            keepRatio={false}
            visible={selectedId === `photo-${frame.id}`}
          />
        </Layer>
      </Stage>
      
      {/* Frame dropzone indicator */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: activeDropZone === frame.id 
            ? 'rgba(66, 153, 225, 0.2)' 
            : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        {!frame.photo && (
          <div
            style={{
              color: '#4299e1',
              fontWeight: 'bold',
              padding: '10px',
              borderRadius: '5px',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              pointerEvents: 'none'
            }}
          >
            Tap to place photo
          </div>
        )}
      </div>
    </div>
  );
};