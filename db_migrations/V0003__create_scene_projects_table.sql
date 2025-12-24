-- Create scene_projects table for Scene Editor projects
CREATE TABLE IF NOT EXISTS scene_projects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_scene_projects_created_at ON scene_projects(created_at DESC);

-- Insert sample project
INSERT INTO scene_projects (name, data) VALUES (
    'Демо-проект',
    '{
        "id": "project-1",
        "name": "Демо-проект",
        "scenes": [{
            "id": "scene-1",
            "name": "Сцена 1",
            "duration": 5,
            "layers": [{
                "id": "layer-1",
                "name": "Заголовок",
                "type": "text",
                "order": 0,
                "visible": true,
                "locked": false,
                "x": 300,
                "y": 250,
                "width": 400,
                "height": 100,
                "rotation": 0,
                "opacity": 1,
                "scale": 1,
                "textContent": "Scene Editor MVP",
                "fontSize": 48,
                "fontFamily": "Inter",
                "fontWeight": 700,
                "color": "#ffffff",
                "textAlign": "center"
            }],
            "animations": [{
                "id": "anim-1",
                "layerId": "layer-1",
                "name": "Появление",
                "keyframes": [
                    {
                        "id": "kf-1",
                        "time": 0,
                        "property": "opacity",
                        "value": 0,
                        "easing": "linear"
                    },
                    {
                        "id": "kf-2",
                        "time": 1,
                        "property": "opacity",
                        "value": 1,
                        "easing": "ease-out"
                    }
                ],
                "duration": 1,
                "delay": 0,
                "trigger": "onLoad"
            }],
            "audioTracks": [],
            "choices": [],
            "variables": {}
        }],
        "globalVariables": {},
        "currentSceneId": "scene-1",
        "settings": {
            "width": 1000,
            "height": 600,
            "backgroundColor": "#1a1a2e",
            "defaultFontFamily": "Inter",
            "accessibility": {
                "enableKeyboardNav": true,
                "enableAriaLabels": true
            }
        }
    }'::jsonb
);