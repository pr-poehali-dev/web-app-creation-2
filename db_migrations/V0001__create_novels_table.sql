-- Create table for storing visual novel data
CREATE TABLE novels (
  id SERIAL PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on updated_at for faster queries
CREATE INDEX idx_novels_updated_at ON novels(updated_at DESC);

-- Insert default novel data
INSERT INTO novels (data) VALUES ('{
  "title": "Визуальная новелла",
  "currentEpisodeId": "ep1",
  "episodes": [
    {
      "id": "ep1",
      "title": "Начало",
      "position": {"x": 100, "y": 100},
      "paragraphs": [
        {
          "id": "p1",
          "type": "text",
          "content": "Добро пожаловать в визуальную новеллу!"
        }
      ]
    }
  ],
  "library": {
    "characters": [],
    "items": [],
    "choices": []
  },
  "homePage": {
    "greeting": "Добро пожаловать",
    "news": []
  }
}'::jsonb);