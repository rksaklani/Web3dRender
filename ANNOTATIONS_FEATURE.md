# Annotations & Markers Feature

## Overview

This feature allows users to mark specific points on 3D models (like cracks or damaged areas) and link related images to those markers, similar to Web3DRender

## Setup Steps

### 1. Run SQL Schema

Copy and paste the contents of `Backend/annotations_tables_only.sql` into your PostgreSQL query tool, or run:

```bash
psql -U postgres -d nira_db -f Backend/annotations_tables_only.sql
```

This creates:
- `annotations` table - stores markers on 3D models
- `annotation_images` table - links images to annotations
- `camera_viewpoints` table - stores camera positions for photogrammetry

### 2. Backend is Ready

The backend API routes are already created at `/api/annotations`. No additional setup needed.

### 3. Frontend Components

The following components have been created:
- `AnnotationViewer.jsx` - Enhanced 3D viewer with annotation support
- `AnnotationMarker.jsx` - Renders markers on 3D models
- `AnnotationImages.jsx` - Displays related images when clicking markers

## How to Use

### Adding a Marker

1. Open a 3D model in the viewer
2. Click the "+" button in the left sidebar (turns blue when active)
3. Click anywhere on the 3D model
4. Enter a title for the annotation (e.g., "Crack Detection")
5. The marker will appear on the model

### Viewing Related Images

1. Click on any marker (red/orange circle) on the 3D model
2. If the annotation has linked images, they will appear at the bottom
3. Use the thumbnail strip to navigate between images
4. Click the X to close the image panel

### Adding Images to Annotations

Currently, images need to be added via API. Future enhancement: Add UI for uploading images to annotations.

## API Endpoints

### Get annotations for a model
```
GET /api/annotations/model/:modelId
```

### Get single annotation with images
```
GET /api/annotations/:id
```

### Create annotation
```
POST /api/annotations
Body: {
  model_id: 1,
  title: "Crack Detection",
  description: "Found crack on building",
  position_x: 5.2,
  position_y: 10.5,
  position_z: 3.1,
  color: "#FF0000",
  annotation_type: "marker",
  measurement_value: 10.81,
  measurement_unit: "m"
}
```

### Add image to annotation
```
POST /api/annotations/:id/images
Body: {
  image_path: "/uploads/images/crack_photo.jpg",
  image_name: "Crack Photo 1",
  image_identifier: "P0002111",
  display_order: 1
}
```

## Features Implemented

✅ Mark points on 3D models  
✅ Click markers to view related images  
✅ Image thumbnail strip at bottom  
✅ Left sidebar with tools  
✅ Add marker mode  
✅ Color-coded markers (red, orange, etc.)  
✅ Measurement labels  
✅ Camera viewpoint support  

## Next Steps (Future Enhancements)

- [ ] UI for uploading images to annotations
- [ ] Edit/delete annotations from UI
- [ ] Measurement tools
- [ ] Export annotations as PDF reports
- [ ] Camera viewpoint navigation
- [ ] Show cameras toggle
- [ ] Callouts/notes panel

## Testing

1. Run the SQL schema
2. Restart backend server
3. Open a 3D model
4. Click the "+" button
5. Click on the model to add a marker
6. Test clicking markers to see images (once images are added via API)
