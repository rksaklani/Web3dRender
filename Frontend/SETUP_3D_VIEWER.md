# 3D Viewer Setup

## Installation

After adding the dependencies, run:

```bash
cd Frontend
npm install
```

## Features

The 3D viewer includes:

- ✅ **Mouse Controls:**
  - Left Click + Drag: Rotate model
  - Right Click + Drag: Pan
  - Scroll Wheel: Zoom in/out

- ✅ **Keyboard Controls:**
  - Space: Toggle auto-rotate

- ✅ **UI Controls:**
  - Zoom In/Out buttons
  - Reset View button
  - Auto-rotate toggle

- ✅ **Supported Formats:**
  - GLB/GLTF (recommended)
  - OBJ
  - FBX
  - Other formats may need conversion

## Usage

1. Upload a 3D model from the Dashboard
2. Click the "View" (eye icon) button next to any model
3. The 3D viewer will open in fullscreen
4. Interact with the model using mouse controls

## Troubleshooting

### Model doesn't load:
- Check browser console for errors
- Ensure the file format is supported
- Try converting to GLB/GLTF format for best compatibility

### CORS errors:
- Make sure backend is running on port 5000
- Check that /uploads route is properly configured

### Performance issues:
- Large models may take time to load
- Consider optimizing model file size
- Use GLB format for better compression
