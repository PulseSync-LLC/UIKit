# PulseSync UIKit

Библиотека UI-компонентов для экосистемы PulseSync. React-компоненты с SCSS-модулями, дизайн-токенами и анимациями.

## Установка

```bash
npm install @pulsesync/uikit
```

**Peer-зависимости:** `react`, `react-dom`, `framer-motion` (опционально).

## Использование

```tsx
import { Button } from '@pulsesync/uikit/actions'
import { AppShell, AppShellGrid, Typography } from '@pulsesync/uikit/layout'
import { NavigationRail, NavigationRailItem } from '@pulsesync/uikit/navigation'
import { ContentCard } from '@pulsesync/uikit/data-display'
import { Input } from '@pulsesync/uikit/inputs'
import '@pulsesync/uikit/styles'

function App() {
  return (
    <>
      <Button variant="primary">Кнопка</Button>
      <Input placeholder="Поле ввода" />
    </>
  )
}
```

## Entry points

- `@pulsesync/uikit/actions`
- `@pulsesync/uikit/layout`
- `@pulsesync/uikit/navigation`
- `@pulsesync/uikit/inputs`
- `@pulsesync/uikit/feedback`
- `@pulsesync/uikit/data-display`
- `@pulsesync/uikit/styles`

## Компоненты

| Компонент | Описание |
|-----------|----------|
| **Accordion** | Раскрывающиеся секции |
| **AppShell** | Desktop shell V4 с title bar, navigation rail и content area |
| **Avatar** | Аватар с группой и индикатором статуса |
| **Badge** | Бейджи и теги |
| **Button** | Кнопки: primary, secondary, ghost, outline |
| **ContentCard** | Карточки V4: article/news и compact component row |
| **ColorPicker** | Выбор цвета |
| **ConfirmModal** | Модальное окно подтверждения |
| **Breadcrumbs** | Хлебные крошки |
| **DropdownMenu** | Вложенное выпадающее меню |
| **FilePicker** | Выбор файлов |
| **FilterButton** | Кнопка фильтра |
| **IconButton** | Кнопка-иконка |
| **Input** | Поле ввода |
| **NavigationRail** | Компактная вертикальная навигация V4 |
| **OptionPicker** | Выбор опций |
| **Pagination** | Пагинация |
| **PromptModal** | Модальное окно с вводом |
| **SearchBox** | Поле поиска |
| **Select** | Выпадающий список |
| **Skeleton** | Заглушка загрузки |
| **Slider** | Слайдер |
| **Tabs** | Вкладки |
| **TextInput** | contentEditable-поле |
| **TitleText** | Заголовок секции |
| **Toast** | Уведомления |
| **Toggle** | Переключатель |
| **Tooltip** | Всплывающая подсказка |
| **Typography** | Heading 1–5, body, caption и overline из шкалы V4 |
| **ViewToggle** | Переключатель вида |

## Дизайн-токены

Библиотека использует CSS-переменные из `tokens.css`. Их можно переопределить в своём приложении.

Размеры desktop shell и типографика V4 также доступны через `--ps-shell-*`,
`--ps-font-size-*`, `--ps-line-height-*` и `--ps-font-weight-*`.

## Лицензия

MIT
