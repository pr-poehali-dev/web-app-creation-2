# Групування параграфів-зображень

## Що це?

Параграфи-зображення тепер можна групувати так само, як комікс-фрейми. Це дозволяє:
- Показувати **кілька зображень одночасно** у вигляді галереї
- Використовувати **різні варіанти розкладок** (horizontal-2, horizontal-3, grid-2x2, magazine-1 і т.д.)
- **Послідовно додавати** зображення при переході між параграфами групи
- Редагувати всі зображення через SlideEditor (Drag & Drop, поворот, масштаб)

## Структура даних

```typescript
{
  "id": "img-para-1",
  "type": "image",
  "url": "https://example.com/single-image.jpg", // Основне зображення (опціонально якщо є imageFrames)
  "imageGroupId": "group-1", // ID групи (однаковий для всіх параграфів)
  "imageGroupIndex": 0, // Індекс параграфа в групі (0, 1, 2...)
  "imageFrames": [ // Масив зображень (тільки для imageGroupIndex === 0)
    {
      "id": "frame-1",
      "type": "image",
      "url": "https://example.com/image1.jpg",
      "alt": "Опис 1",
      "paragraphTrigger": 0, // Появляється на параграфі з індексом 0
      "animation": "fade",
      "objectFit": "cover",
      "objectPosition": "center"
    },
    {
      "id": "frame-2",
      "type": "image",
      "url": "https://example.com/image2.jpg",
      "alt": "Опис 2",
      "paragraphTrigger": 1, // Появляється на параграфі з індексом 1
      "animation": "slide-left"
    }
  ],
  "imageLayout": "horizontal-2" // Розкладка (тільки для imageGroupIndex === 0)
}
```

## Приклад використання

### Сценарій: Показати 3 зображення поетапно з текстовими описами

```json
{
  "episodes": [
    {
      "id": "ep1",
      "title": "Прогулянка парком",
      "paragraphs": [
        {
          "id": "bg-1",
          "type": "background",
          "url": "https://example.com/park-bg.jpg"
        },
        {
          "id": "img-group-1",
          "type": "image",
          "imageGroupId": "park-photos",
          "imageGroupIndex": 0,
          "imageFrames": [
            {
              "id": "photo-1",
              "type": "image",
              "url": "https://example.com/tree.jpg",
              "alt": "Старе дерево",
              "paragraphTrigger": 0,
              "animation": "fade"
            },
            {
              "id": "photo-2",
              "type": "image",
              "url": "https://example.com/fountain.jpg",
              "alt": "Фонтан",
              "paragraphTrigger": 1,
              "animation": "slide-left"
            },
            {
              "id": "photo-3",
              "type": "image",
              "url": "https://example.com/bench.jpg",
              "alt": "Лавка",
              "paragraphTrigger": 2,
              "animation": "zoom"
            }
          ],
          "imageLayout": "horizontal-3"
        },
        {
          "id": "text-1",
          "type": "text",
          "content": "Я зробив фото старого дерева.",
          "imageGroupId": "park-photos",
          "imageGroupIndex": 0
        },
        {
          "id": "text-2",
          "type": "text",
          "content": "Фонтан вражав своєю красою.",
          "imageGroupId": "park-photos",
          "imageGroupIndex": 1
        },
        {
          "id": "text-3",
          "type": "text",
          "content": "Я сів на лавку і замислився.",
          "imageGroupId": "park-photos",
          "imageGroupIndex": 2
        }
      ]
    }
  ]
}
```

### Що відбувається:

1. **Параграф text-1** (imageGroupIndex: 0):
   - Показується тільки `photo-1` (paragraphTrigger: 0)
   - Текст: "Я зробив фото старого дерева"

2. **Параграф text-2** (imageGroupIndex: 1):
   - Показуються `photo-1` + `photo-2` (triggerIndex ≤ 1)
   - Текст: "Фонтан вражав своєю красою"

3. **Параграф text-3** (imageGroupIndex: 2):
   - Показуються всі 3 фото (triggerIndex ≤ 2)
   - Текст: "Я сів на лавку і замислився"

## Варіанти розкладок

Доступні всі розкладки з `MergeLayoutType`:
- `horizontal-2` - 2 зображення в ряд
- `horizontal-3` - 3 зображення в ряд
- `vertical-2` - 2 зображення друг під другом
- `grid-2x2` - сітка 2×2
- `magazine-1` - журнальна розкладка з круглим зображенням
- `mosaic-left` - мозаїка з акцентом зліва
- І багато інших...

## Важливі моменти

1. **imageGroupId** - обов'язковий для всіх параграфів у групі
2. **imageGroupIndex** - починається з 0 і збільшується для кожного параграфа
3. **imageFrames** - тільки в першому параграфі групи (imageGroupIndex === 0)
4. **imageLayout** - тільки в першому параграфі групи (imageGroupIndex === 0)
5. **paragraphTrigger** - визначає, на якому imageGroupIndex з'являється фрейм

## Різниця з комікс-фреймами

| Функція | Комікс-фрейми | Групи зображень |
|---------|---------------|-----------------|
| Параграфи | text/dialogue | image |
| Поле групи | comicGroupId | imageGroupId |
| Поле індексу | comicGroupIndex | imageGroupIndex |
| Поле фреймів | comicFrames | imageFrames |
| Поле розкладки | frameLayout | imageLayout |
| Відображення | Зліва (фон) | Зліва (фон) |

## Редагування зображень

Всі зображення в `imageFrames` можна редагувати через SlideEditor:
- Drag & Drop переміщення
- Поворот (rotate)
- Масштаб (scale)
- Позиція (objectPosition)
- Режим заповнення (objectFit: cover/contain/fill)