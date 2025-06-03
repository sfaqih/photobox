import React, { useRef, useState, useEffect } from 'react';
import { Image as KonvaImage, Group } from 'react-konva';
import { useGesture } from '@use-gesture/react';

const PhotoInFrame = ({ 
  frame, 
  handlePhotoPositionChange, 
  handleRemovePhoto, 
  handleTapFrame 
}) => {
  const DefaultScale = 0.4; // Your existing constant
  const MAX_SCALE = 1.0; // Maximum scale for pinch zoom
  const imageRef = useRef(null);
  const gestureTargetRef = useRef(null);
  
  // Initialize scale from frame or default to 1
  const [scale, setScale] = useState(frame.photoScale || DefaultScale);
  
  // Initialize photo position from frame or default to center
  const [photoPosition, setPhotoPosition] = useState({
    x: frame.photoOffsetX || 0,
    y: frame.photoOffsetY || 0
  });

  // Track tap for double-tap detection
  const lastTapRef = useRef(0);
  const tapTimeout = 300; // milliseconds

  // Return null for frames without photos
  if (!frame.photo || !frame.photo.img) return null;
  
  const photoImg = frame.photo.img;
  const photoRatio = photoImg.width / photoImg.height;
  const frameRatio = frame.width / frame.height;

  // Calculate photo dimensions to fit in frame
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

  // Calculate default centering offset if not already set
  const defaultOffsetX = (photoWidth - frame.width) / 2;
  const defaultOffsetY = ((photoHeight - frame.height) / 2);
  
  // Calculate final dimensions and positions with scaling
  const scaledWidth = photoWidth * scale;
  const scaledHeight = photoHeight * scale;
  
  // Calculate position considering offset and scale
  const photoX = -1 * (photoPosition.x || defaultOffsetX) * scale; 
  const photoY = -1 * (photoPosition.y || defaultOffsetY) * scale;
  
  // Track active gesture to prevent conflicts
  const [activeGesture, setActiveGesture] = useState(null);
  
  // Setup gesture handling with useGesture
  useGesture(
    {
      onDrag: ({ pinching, tap, cancel, offset: [x, y], first, last, memo, touches }) => {
        // Cancel drag if we're pinching
        if (pinching || tap) return cancel();
        
        // Determine if this is a multi-touch drag (part of pinch) or single-touch drag
        const isMultiTouch = touches > 1;
        if (isMultiTouch) return cancel();
        
        if (first) {
          setActiveGesture('drag');
          memo = {
            initialX: photoPosition.x || defaultOffsetX,
            initialY: photoPosition.y || defaultOffsetY
          };

          return memo;
        }
        
        // Calculate new position (inverse movement because we're moving the photo inside the frame)
        // Normalize movement by scale for consistent feel
        const dragSensitivity = 0.85 / scale;
        const deltaX = x * dragSensitivity;
        const deltaY = y * dragSensitivity;
        
        const newX = memo.initialX - deltaX;
        const newY = memo.initialY - deltaY;
        
        // Calculate boundaries to prevent dragging photo too far outside frame
        const minX = -scaledWidth + (frame.width * 0.25);
        const maxX = frame.width * 0.75;
        const minY = -scaledHeight + (frame.height * 0.25);
        const maxY = frame.height * 0.75;
        
        // Apply constraints
        const constrainedX = newX;
        const constrainedY = newY;
        
        setPhotoPosition({
          x: constrainedX,
          y: constrainedY
        });
        
        if (last) {
          // Only update parent state when gesture ends
          handlePhotoPositionChange(frame.id, constrainedX, constrainedY, scale);
          setActiveGesture(null);
        }
        
        return memo;
      },
      
      onPinch: ({ origin: [ox, oy], first, movement: [ms], offset: [s, a], memo }) => {
        if (first) {
          setActiveGesture('pinch');
          // Store initial scale and position for pinch calculations
          return {
            initialScale: scale,
            initialX: photoPosition.x || defaultOffsetX,
            initialY: photoPosition.y || defaultOffsetY
          };
        }
        
        // Apply the scale from useGesture offset (s is the scale value)
        const newScale = Math.max(DefaultScale, Math.min(MAX_SCALE, s));
        console.log(`Pinch scale: ${newScale}`);
        setScale(newScale);
        
        // Optional: Handle pinch-to-zoom with position adjustment
        // This keeps the zoom centered around the pinch point
        // You can remove this if you don't want position adjustment during pinch
        const scaleDiff = newScale / memo.initialScale;
        if (scaleDiff !== 1) {
          // Calculate offset adjustment based on pinch origin
          const frameRect = gestureTargetRef.current?.getBoundingClientRect();
          if (frameRect) {
            const frameCenterX = frameRect.width / 2;
            const frameCenterY = frameRect.height / 2;
            
            // Convert origin to frame-relative coordinates
            const relativeOx = ox - frameRect.left;
            const relativeOy = oy - frameRect.top;
            
            // Calculate offset from frame center
            const offsetFromCenterX = (relativeOx - frameCenterX) / DefaultScale;
            const offsetFromCenterY = (relativeOy - frameCenterY) / DefaultScale;
            
            // Adjust position to zoom around pinch point
            const positionAdjustX = offsetFromCenterX * (1 - scaleDiff);
            const positionAdjustY = offsetFromCenterY * (1 - scaleDiff);
            
            const newX = memo.initialX + positionAdjustX;
            const newY = memo.initialY + positionAdjustY;
            
            setPhotoPosition({
              x: newX,
              y: newY
            });
          }
        }
        
        return memo;
      },
      
      onPinchEnd: ({ offset: [s] }) => {
        // Finalize the scale and position changes
        const finalScale = Math.max(DefaultScale, Math.min(MAX_SCALE, s));
        console.log(`Final scale after pinch: ${finalScale}`);
        // handlePhotoScaleChange(frame.id, finalScale);
        handlePhotoPositionChange(frame.id, photoPosition.x, photoPosition.y, finalScale);
        setActiveGesture(null);
      },
      
      onClick: ({ event }) => {
        const now = Date.now();
        const timeSinceLastTap = now - lastTapRef.current;
        
        if (timeSinceLastTap < tapTimeout) {
          // This is a double tap - remove photo
          handleRemovePhoto(frame.id);
        } else {
          // Single tap - select frame
          handleTapFrame(frame.id);
        }
        
        lastTapRef.current = now;
      },
      
      // Add wheel support for desktop testing
      // onWheel: ({ delta: [_, deltaY], event }) => {
      //   event.preventDefault();
        
      //   // Determine zoom direction from wheel delta
      //   const wheelSensitivity = 0.001;
      //   const zoomFactor = 1 - (deltaY * wheelSensitivity);
        
      //   const newScale = scale * zoomFactor;
      //   const limitedScale = Math.max(DefaultScale, Math.min(2.0, newScale));
        
      //   setScale(limitedScale);
      //   handlePhotoScaleChange(frame.id, limitedScale);
      // }
    },
    {
      target: gestureTargetRef,
      eventOptions: { passive: false },
      // Configure gesture options following the documentation
      drag: {
        from: () => [0, 0], // Start from origin for each drag
        filterTaps: true,
        threshold: 6,
        rubberband: true,
        bounds: () => ({
          left: -100,
          right: 100,
          top: -50,
          bottom: 50
        })
      },
      pinch: {
        scaleBounds: { min: DefaultScale, max: MAX_SCALE },
        rubberband: true,
        from: () => [scale, 0], // Start from current scale
        //threshold: 0
      }
    }
  );

  // Create and manage the DOM overlay element for gesture handling
  useEffect(() => {
    // Find the stage container
    const stage = imageRef.current?.getStage();
    if (!stage) return;
    
    const container = stage.container().parentElement;
    if (!container) return;
    
    // Calculate the position of this frame in the DOM
    const stageRect = stage.container().getBoundingClientRect();
    const absX = frame.x * DefaultScale + stageRect.left;
    const absY = frame.y * DefaultScale + stageRect.top;
    
    // Create gesture tracking element
    const gestureElement = document.createElement('div');
    gestureElement.style.position = 'absolute';
    gestureElement.style.top = `${absY}px`;
    gestureElement.style.left = `${absX}px`;
    gestureElement.style.width = `${frame.width * DefaultScale}px`;
    gestureElement.style.height = `${frame.height * DefaultScale}px`;
    gestureElement.style.zIndex = '1000';
    gestureElement.style.touchAction = 'none'; // Critical for touch devices
    gestureElement.style.cursor = 'grab';
    gestureElement.style.userSelect = 'none';
    gestureElement.style.webkitTouchCallout = 'none';
    
    // Debug helper - uncomment to make the gesture element visible during development
    // gestureElement.style.border = '2px solid rgba(255, 0, 0, 0.5)';
    // gestureElement.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
    
    // Add to DOM
    document.body.appendChild(gestureElement);
    gestureTargetRef.current = gestureElement;
    
    // Update position if stage is resized or scrolled
    const updatePosition = () => {
      const newStageRect = stage.container().getBoundingClientRect();
      const newX = frame.x * DefaultScale + newStageRect.left;
      const newY = frame.y * DefaultScale + newStageRect.top;
      
      gestureElement.style.top = `${newY}px`;
      gestureElement.style.left = `${newX}px`;
    };
    
    // Add resize and scroll listeners
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    
    // Clean up
    return () => {
      if (document.body.contains(gestureElement)) {
        document.body.removeChild(gestureElement);
      }
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [frame.id, frame.x, frame.y, frame.width, frame.height, DefaultScale]);

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [gestureTargetRef.current]);

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

  return (
    <KonvaImage
      ref={imageRef}
      id={`photo-${frame.id}`}
      image={photoImg}
      x={photoX}
      y={photoY}
      width={scaledWidth}
      height={scaledHeight}
      draggable={false}
      listening={false} // Let the DOM element handle events
    />
  );
};

export default PhotoInFrame;