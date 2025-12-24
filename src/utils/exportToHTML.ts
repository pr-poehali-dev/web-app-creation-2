import { SceneProject, Scene, Layer, Animation } from '@/types/scene';

export function exportProjectToHTML(project: SceneProject): string {
  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(project.name)}</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: ${project.settings.defaultFontFamily}, sans-serif;
      background-color: ${project.settings.backgroundColor};
      overflow: hidden;
    }
    
    #app-container {
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    #scene-container {
      position: relative;
      width: ${project.settings.width}px;
      height: ${project.settings.height}px;
      background-color: #1a1a2e;
      overflow: hidden;
    }
    
    @media (max-width: ${project.settings.width}px) {
      #scene-container {
        width: 100vw;
        height: ${(100 * project.settings.height) / project.settings.width}vw;
      }
    }
    
    .layer {
      position: absolute;
      transition: opacity 0.3s ease;
    }
    
    .layer-text {
      display: flex;
      align-items: center;
      overflow: hidden;
      word-wrap: break-word;
    }
    
    .layer-video video,
    .layer-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .choices-container {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
      max-width: 90%;
    }
    
    .choice-button {
      padding: 12px 24px;
      background: rgba(59, 130, 246, 0.9);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s ease;
    }
    
    .choice-button:hover {
      background: rgba(59, 130, 246, 1);
      transform: translateY(-2px);
    }
    
    .choice-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .highlight-animation {
      animation: highlight 0.5s ease;
    }
    
    @keyframes highlight {
      0%, 100% { filter: brightness(1); }
      50% { filter: brightness(1.5); }
    }
    
    .controls {
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      gap: 8px;
    }
    
    .control-button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div id="app-container">
    <div id="scene-container"></div>
  </div>
  
  <div class="controls">
    <button class="control-button" id="play-pause" title="Пауза/Воспроизведение">▶</button>
    <button class="control-button" id="restart" title="Начать сначала">↻</button>
  </div>

  <script>
    const projectData = ${JSON.stringify(project, null, 2)};
    
    let currentSceneIndex = 0;
    let currentTime = 0;
    let isPlaying = false;
    let animationFrame = null;
    let audioTracks = new Map();
    let globalVariables = {...projectData.globalVariables};
    
    const sceneContainer = document.getElementById('scene-container');
    const playPauseBtn = document.getElementById('play-pause');
    const restartBtn = document.getElementById('restart');

    function loadScene(sceneIndex) {
      const scene = projectData.scenes[sceneIndex];
      if (!scene) return;
      
      currentSceneIndex = sceneIndex;
      currentTime = 0;
      sceneContainer.innerHTML = '';
      
      audioTracks.forEach(track => track.unload());
      audioTracks.clear();
      
      const sortedLayers = [...scene.layers].sort((a, b) => a.order - b.order);
      
      sortedLayers.forEach(layer => {
        if (!layer.visible) return;
        
        const layerEl = document.createElement('div');
        layerEl.id = \`layer-\${layer.id}\`;
        layerEl.className = \`layer layer-\${layer.type}\`;
        layerEl.style.cssText = \`
          left: \${layer.x}px;
          top: \${layer.y}px;
          width: \${layer.width}px;
          height: \${layer.height}px;
          transform: rotate(\${layer.rotation}deg) scale(\${layer.scale});
          opacity: \${layer.opacity};
          filter: \${layer.blur ? \`blur(\${layer.blur}px)\` : 'none'};
          z-index: \${layer.order};
        \`;
        
        switch (layer.type) {
          case 'text':
            layerEl.style.fontSize = \`\${layer.fontSize}px\`;
            layerEl.style.fontFamily = layer.fontFamily || projectData.settings.defaultFontFamily;
            layerEl.style.fontWeight = layer.fontWeight || 'normal';
            layerEl.style.color = layer.color || '#ffffff';
            layerEl.style.textAlign = layer.textAlign || 'left';
            layerEl.style.justifyContent = layer.textAlign === 'center' ? 'center' : layer.textAlign === 'right' ? 'flex-end' : 'flex-start';
            layerEl.textContent = layer.textContent || '';
            break;
            
          case 'image':
            if (layer.imageUrl) {
              const img = document.createElement('img');
              img.src = layer.imageUrl;
              img.alt = layer.name;
              layerEl.appendChild(img);
            }
            break;
            
          case 'video':
            if (layer.videoUrl) {
              const video = document.createElement('video');
              video.src = layer.videoUrl;
              video.autoplay = true;
              video.loop = true;
              video.muted = true;
              layerEl.appendChild(video);
            }
            break;
            
          case 'shape':
          case 'background':
            layerEl.style.backgroundColor = layer.backgroundColor || 'transparent';
            break;
        }
        
        sceneContainer.appendChild(layerEl);
      });
      
      scene.audioTracks.forEach(track => {
        const howl = new Howl({
          src: [track.url],
          volume: track.volume,
          loop: track.loop
        });
        audioTracks.set(track.id, { howl, track });
      });
      
      if (scene.choices && scene.choices.length > 0) {
        const choicesContainer = document.createElement('div');
        choicesContainer.className = 'choices-container';
        
        scene.choices.forEach(choice => {
          const button = document.createElement('button');
          button.className = 'choice-button';
          button.textContent = choice.text;
          
          button.onclick = () => {
            if (choice.variables) {
              Object.assign(globalVariables, choice.variables);
            }
            
            if (choice.targetSceneId) {
              const targetIndex = projectData.scenes.findIndex(s => s.id === choice.targetSceneId);
              if (targetIndex !== -1) {
                pause();
                loadScene(targetIndex);
                play();
              }
            }
          };
          
          if (choice.condition) {
            try {
              const conditionFn = new Function('variables', \`return \${choice.condition}\`);
              if (!conditionFn(globalVariables)) {
                button.disabled = true;
              }
            } catch (e) {
              console.error('Invalid condition:', choice.condition, e);
            }
          }
          
          choicesContainer.appendChild(button);
        });
        
        sceneContainer.appendChild(choicesContainer);
      }
      
      initAnimations(scene);
    }

    function initAnimations(scene) {
      scene.animations.forEach(animation => {
        const element = document.getElementById(\`layer-\${animation.layerId}\`);
        if (!element) return;
        
        const timeline = gsap.timeline({
          paused: true,
          delay: animation.delay || 0
        });
        
        const keyframesByProperty = new Map();
        animation.keyframes.forEach(kf => {
          if (!keyframesByProperty.has(kf.property)) {
            keyframesByProperty.set(kf.property, []);
          }
          keyframesByProperty.get(kf.property).push(kf);
        });
        
        keyframesByProperty.forEach((keyframes, property) => {
          const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);
          
          sortedKeyframes.forEach((kf, index) => {
            const nextKf = sortedKeyframes[index + 1];
            const duration = nextKf ? (nextKf.time - kf.time) : 0;
            
            if (duration > 0) {
              const cssProperty = mapPropertyToCSS(property);
              const value = mapValueToCSS(property, kf.value);
              
              timeline.to(element, {
                [cssProperty]: value,
                duration,
                ease: mapEasingToGSAP(kf.easing)
              }, kf.time);
            }
          });
        });
        
        element._timeline = timeline;
      });
    }

    function mapPropertyToCSS(property) {
      const mapping = {
        x: 'x', y: 'y', scale: 'scale', scaleX: 'scaleX', scaleY: 'scaleY',
        rotation: 'rotation', opacity: 'opacity', blur: 'filter', width: 'width', height: 'height'
      };
      return mapping[property] || property;
    }

    function mapValueToCSS(property, value) {
      if (property === 'blur') return \`blur(\${value}px)\`;
      if (property === 'rotation') return \`\${value}deg\`;
      if (['width', 'height'].includes(property)) return \`\${value}px\`;
      return value;
    }

    function mapEasingToGSAP(easing) {
      const map = {
        'linear': 'none', 'ease-in': 'power2.in', 'ease-out': 'power2.out',
        'ease-in-out': 'power2.inOut', 'bounce': 'bounce.out', 
        'elastic': 'elastic.out', 'back': 'back.out'
      };
      return map[easing] || 'none';
    }

    function play() {
      isPlaying = true;
      playPauseBtn.textContent = '⏸';
      
      audioTracks.forEach(({ howl }) => {
        if (!howl.playing()) {
          howl.seek(currentTime);
          howl.play();
        }
      });
      
      animate();
    }

    function pause() {
      isPlaying = false;
      playPauseBtn.textContent = '▶';
      
      audioTracks.forEach(({ howl }) => howl.pause());
      
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    }

    function animate() {
      if (!isPlaying) return;
      
      currentTime += 0.016;
      
      const scene = projectData.scenes[currentSceneIndex];
      if (currentTime >= scene.duration) {
        currentTime = scene.duration;
        pause();
        return;
      }
      
      scene.layers.forEach(layer => {
        const element = document.getElementById(\`layer-\${layer.id}\`);
        if (element && element._timeline) {
          element._timeline.time(currentTime);
        }
      });
      
      animationFrame = requestAnimationFrame(animate);
    }

    function restart() {
      pause();
      loadScene(0);
      play();
    }

    playPauseBtn.onclick = () => {
      if (isPlaying) pause();
      else play();
    };

    restartBtn.onclick = restart;
    
    ${project.settings.accessibility.enableKeyboardNav ? `
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) pause();
        else play();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = currentSceneIndex + 1;
        if (nextIndex < projectData.scenes.length) {
          pause();
          loadScene(nextIndex);
          play();
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = currentSceneIndex - 1;
        if (prevIndex >= 0) {
          pause();
          loadScene(prevIndex);
          play();
        }
      }
    });
    ` : ''}
    
    loadScene(0);
    play();
  </script>
</body>
</html>`;

  return html;
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function downloadHTML(project: SceneProject) {
  const html = exportProjectToHTML(project);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
  link.click();
  URL.revokeObjectURL(url);
}
