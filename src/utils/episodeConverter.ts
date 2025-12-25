import type { Episode, Paragraph, ComicFrame, SubParagraph } from '@/types/novel';
import type { Presentation, Slide, TextObject, ImageObject, ShapeObject } from '@/types/presentation';

export function episodeToPresentation(episode: Episode): Presentation {
  const slides: Slide[] = [];
  
  let currentSlideObjects: Slide['objects'] = [];
  let slideCounter = 0;

  episode.paragraphs.forEach((paragraph, index) => {
    const isLastInEpisode = index === episode.paragraphs.length - 1;

    if (paragraph.type === 'text') {
      const textObj: TextObject = {
        id: `text-${paragraph.id}`,
        type: 'text',
        name: 'Text',
        content: paragraph.content,
        transform: {
          x: 50,
          y: 100,
          width: 800,
          height: 400,
          rotation: 0,
          scaleX: 1,
          scaleY: 1
        },
        style: {
          fontFamily: 'Inter',
          fontSize: 20,
          fontWeight: 'normal',
          fontStyle: 'normal',
          color: '#1f2937',
          textAlign: 'left',
          lineHeight: 1.6,
          letterSpacing: 0,
          textDecoration: 'none'
        },
        locked: false,
        hidden: false,
        opacity: 1,
        zIndex: currentSlideObjects.length,
        animations: []
      };
      currentSlideObjects.push(textObj);
    }

    if (paragraph.type === 'dialogue') {
      const dialogueObj: TextObject = {
        id: `dialogue-${paragraph.id}`,
        type: 'text',
        name: paragraph.characterName,
        content: `${paragraph.characterName}:\n${paragraph.text}`,
        transform: {
          x: 50,
          y: 100,
          width: 800,
          height: 200,
          rotation: 0,
          scaleX: 1,
          scaleY: 1
        },
        style: {
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: 'bold',
          fontStyle: 'normal',
          color: '#1f2937',
          textAlign: 'left',
          lineHeight: 1.5,
          letterSpacing: 0,
          textDecoration: 'none'
        },
        locked: false,
        hidden: false,
        opacity: 1,
        zIndex: currentSlideObjects.length,
        animations: []
      };
      currentSlideObjects.push(dialogueObj);

      if (paragraph.characterImage) {
        const imageObj: ImageObject = {
          id: `char-img-${paragraph.id}`,
          type: 'image',
          name: 'Character Image',
          url: paragraph.characterImage,
          transform: {
            x: 900,
            y: 100,
            width: 300,
            height: 400,
            rotation: 0,
            scaleX: 1,
            scaleY: 1
          },
          locked: false,
          hidden: false,
          opacity: 1,
          zIndex: currentSlideObjects.length,
          animations: []
        };
        currentSlideObjects.push(imageObj);
      }
    }

    if (paragraph.type === 'choice') {
      const choiceTextObj: TextObject = {
        id: `choice-q-${paragraph.id}`,
        type: 'text',
        name: 'Choice Question',
        content: paragraph.question,
        transform: {
          x: 50,
          y: 100,
          width: 800,
          height: 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1
        },
        style: {
          fontFamily: 'Inter',
          fontSize: 22,
          fontWeight: 'bold',
          fontStyle: 'normal',
          color: '#1f2937',
          textAlign: 'center',
          lineHeight: 1.4,
          letterSpacing: 0,
          textDecoration: 'none'
        },
        locked: false,
        hidden: false,
        opacity: 1,
        zIndex: currentSlideObjects.length,
        animations: []
      };
      currentSlideObjects.push(choiceTextObj);

      paragraph.options.forEach((option, optIndex) => {
        const optionObj: ShapeObject = {
          id: `choice-opt-${paragraph.id}-${optIndex}`,
          type: 'shape',
          name: `Option ${optIndex + 1}`,
          shapeType: 'rectangle',
          transform: {
            x: 300,
            y: 250 + optIndex * 100,
            width: 600,
            height: 80,
            rotation: 0,
            scaleX: 1,
            scaleY: 1
          },
          style: {
            fill: '#3b82f6',
            stroke: '#1e40af',
            strokeWidth: 2,
            opacity: 0.9
          },
          locked: false,
          hidden: false,
          opacity: 1,
          zIndex: currentSlideObjects.length,
          animations: []
        };
        currentSlideObjects.push(optionObj);

        const optionTextObj: TextObject = {
          id: `choice-opt-text-${paragraph.id}-${optIndex}`,
          type: 'text',
          name: `Option Text ${optIndex + 1}`,
          content: option.text,
          transform: {
            x: 320,
            y: 270 + optIndex * 100,
            width: 560,
            height: 40,
            rotation: 0,
            scaleX: 1,
            scaleY: 1
          },
          style: {
            fontFamily: 'Inter',
            fontSize: 18,
            fontWeight: 'normal',
            fontStyle: 'normal',
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.4,
            letterSpacing: 0,
            textDecoration: 'none'
          },
          locked: false,
          hidden: false,
          opacity: 1,
          zIndex: currentSlideObjects.length,
          animations: []
        };
        currentSlideObjects.push(optionTextObj);
      });
    }

    if (paragraph.type === 'item') {
      const itemTextObj: TextObject = {
        id: `item-${paragraph.id}`,
        type: 'text',
        name: paragraph.name,
        content: `${paragraph.name}\n\n${paragraph.description}`,
        transform: {
          x: 50,
          y: 100,
          width: 500,
          height: 400,
          rotation: 0,
          scaleX: 1,
          scaleY: 1
        },
        style: {
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: 'normal',
          fontStyle: 'normal',
          color: '#1f2937',
          textAlign: 'left',
          lineHeight: 1.5,
          letterSpacing: 0,
          textDecoration: 'none'
        },
        locked: false,
        hidden: false,
        opacity: 1,
        zIndex: currentSlideObjects.length,
        animations: []
      };
      currentSlideObjects.push(itemTextObj);

      if (paragraph.imageUrl) {
        const itemImageObj: ImageObject = {
          id: `item-img-${paragraph.id}`,
          type: 'image',
          name: 'Item Image',
          url: paragraph.imageUrl,
          transform: {
            x: 600,
            y: 100,
            width: 400,
            height: 400,
            rotation: 0,
            scaleX: 1,
            scaleY: 1
          },
          locked: false,
          hidden: false,
          opacity: 1,
          zIndex: currentSlideObjects.length,
          animations: []
        };
        currentSlideObjects.push(itemImageObj);
      }
    }

    const shouldCreateSlide = 
      paragraph.type === 'choice' || 
      isLastInEpisode ||
      (currentSlideObjects.length > 0 && 
       episode.paragraphs[index + 1]?.type === 'choice');

    if (shouldCreateSlide && currentSlideObjects.length > 0) {
      slides.push({
        id: `slide-${slideCounter++}`,
        name: `Слайд ${slideCounter}`,
        objects: currentSlideObjects,
        background: {
          type: 'color',
          value: '#ffffff'
        },
        transition: {
          effect: 'fade',
          duration: 500
        },
        notes: ''
      });
      currentSlideObjects = [];
    }
  });

  if (currentSlideObjects.length > 0) {
    slides.push({
      id: `slide-${slideCounter}`,
      name: `Слайд ${slideCounter + 1}`,
      objects: currentSlideObjects,
      background: {
        type: 'color',
        value: '#ffffff'
      },
      transition: {
        effect: 'fade',
        duration: 500
      },
      notes: ''
    });
  }

  return {
    id: `pres-${episode.id}`,
    title: episode.title,
    description: episode.shortDescription || '',
    slides: slides.length > 0 ? slides : [{
      id: 'slide-0',
      name: 'Пустой слайд',
      objects: [],
      background: { type: 'color', value: '#ffffff' },
      transition: { effect: 'fade', duration: 500 },
      notes: ''
    }],
    theme: {
      id: 'default',
      name: 'Default Theme',
      fonts: { heading: 'Inter', body: 'Inter' },
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#f59e0b',
        background: '#ffffff',
        text: '#1f2937'
      },
      layouts: []
    },
    settings: {
      width: 1200,
      height: 800,
      aspectRatio: '16:9',
      autoAdvance: false,
      autoAdvanceDelay: 5000
    },
    variables: {},
    metadata: {
      author: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    }
  };
}

export function presentationToEpisode(
  presentation: Presentation,
  originalEpisode?: Episode
): Episode {
  const paragraphs: Paragraph[] = [];

  presentation.slides.forEach((slide, slideIndex) => {
    const textObjects = slide.objects.filter(obj => obj.type === 'text') as TextObject[];
    
    textObjects.forEach((textObj) => {
      if (textObj.content.includes(':\n')) {
        const [characterName, ...textParts] = textObj.content.split(':\n');
        const text = textParts.join(':\n').trim();
        
        paragraphs.push({
          id: textObj.id,
          type: 'dialogue',
          characterName: characterName.trim(),
          text
        });
      } else {
        paragraphs.push({
          id: textObj.id,
          type: 'text',
          content: textObj.content
        });
      }
    });
  });

  return {
    id: originalEpisode?.id || `ep-${Date.now()}`,
    title: presentation.title,
    shortDescription: presentation.description,
    paragraphs: paragraphs.length > 0 ? paragraphs : [
      { id: `p-${Date.now()}`, type: 'text', content: 'Новый параграф' }
    ],
    position: originalEpisode?.position || { x: 0, y: 0 },
    backgroundMusic: originalEpisode?.backgroundMusic,
    nextEpisodeId: originalEpisode?.nextEpisodeId,
    nextParagraphIndex: originalEpisode?.nextParagraphIndex,
    requiredPath: originalEpisode?.requiredPath,
    requiredPaths: originalEpisode?.requiredPaths,
    unlockedForAll: originalEpisode?.unlockedForAll,
    timeframes: originalEpisode?.timeframes,
    pastelColor: originalEpisode?.pastelColor,
    pathNextEpisodes: originalEpisode?.pathNextEpisodes
  };
}
