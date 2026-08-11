import { useState, useRef, useEffect, useLayoutEffect, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import styles from './dropdownMenu.module.scss'

/* ── Types ── */

export interface DropdownMenuItem {
    /** Unique key */
    key: string
    /** Display label */
    label: ReactNode
    /** Optional icon (left side) */
    icon?: ReactNode
    /** Nested submenu items */
    children?: DropdownMenuItem[]
    /** Click handler (leaf items) */
    onClick?: () => void
    /** Disable the item */
    disabled?: boolean
    /** Separator after this item */
    divider?: boolean
    /** Toggle mode — renders a small square checkbox */
    toggle?: boolean
    /** Radio mode — renders a circular radio indicator (mutually exclusive choice) */
    radio?: boolean
    /** Current toggle/radio state (controlled) */
    checked?: boolean
}

export type DropdownMenuPlacement = 'bottom-start' | 'bottom-end' | 'right-start' | 'left-start'

export interface DropdownMenuProps {
    /** Menu items */
    items: DropdownMenuItem[]
    /** Trigger element */
    children: ReactNode
    /** Additional className on the trigger wrapper */
    className?: string
    /** Additional className on the menu panel */
    menuClassName?: string
    /** Called after the menu opens or finishes closing */
    onOpenChange?: (open: boolean) => void
    /** Alignment relative to trigger */
    align?: 'left' | 'right'
    /**
     * Menu placement relative to the trigger. Side placements automatically
     * flip when the preferred side has insufficient viewport space.
     * `align` remains supported as the legacy bottom-placement API.
     */
    placement?: DropdownMenuPlacement
    /**
     * Submenu mode:
     * - `'hover'` (default) — submenus fly out to the side on hover
     * - `'drill'` — clicking navigates into submenu in-place with a back button
     */
    mode?: 'hover' | 'drill'
    /**
     * Whether the menu closes when a leaf item is clicked.
     * Default: `true`. Set to `false` to keep the menu open on any click.
     */
    closeOnSelect?: boolean
}

/* ── Icons ── */

function ChevronRight() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
        </svg>
    )
}

function ChevronLeft() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
        </svg>
    )
}

/** Arrow icon for drill-down items — indicates "click to enter" */
function ArrowEnter() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
        </svg>
    )
}

/** Back arrow for drill mode */
function ArrowBack() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
        </svg>
    )
}

/* ═══════════════════════════════════════════════
 *  HOVER MODE — fly-out submenus
 * ═══════════════════════════════════════════════ */

function HoverMenuItem({
    item,
    onClose,
    openDirection,
    closeOnSelect,
    isOpen,
    isClosing,
    onActivate,
    onDeactivate,
    onSubAnimationEnd,
}: {
    item: DropdownMenuItem
    onClose: () => void
    openDirection: 'right' | 'left'
    closeOnSelect: boolean
    isOpen: boolean
    isClosing: boolean
    onActivate: (key: string | null) => void
    onDeactivate: (key: string) => void
    onSubAnimationEnd: (event: React.AnimationEvent<HTMLDivElement>) => void
}) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const itemRef = useRef<HTMLDivElement>(null)
    const subRef = useRef<HTMLDivElement>(null)

    const hasChildren = item.children && item.children.length > 0
    const isLeft = openDirection === 'left'

    const openSub = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        onActivate(hasChildren ? item.key : null)
    }

    const closeSub = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        onDeactivate(item.key)
    }

    const handleMouseEnter = () => openSub()

    /* When mouse leaves the parent .item entirely (to outside), schedule close */
    const handleItemLeave = (e: React.MouseEvent) => {
        if (!hasChildren) return
        const related = e.relatedTarget as Node | null
        // If mouse went into the submenu, don't close
        if (related && subRef.current && subRef.current.contains(related)) return
        timeoutRef.current = setTimeout(closeSub, 80)
    }

    /* When mouse leaves the submenu, check if it went back to the parent item */
    const handleSubLeave = (e: React.MouseEvent) => {
        const related = e.relatedTarget as Node | null
        // If mouse went back to parent item row, keep submenu open
        if (related && itemRef.current && itemRef.current.contains(related)) {
            // Don't close — mouse is back on parent
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            return
        }
        timeoutRef.current = setTimeout(closeSub, 80)
    }

    const handleClick = () => {
        if (item.disabled) return
        if ((item.toggle || item.radio) && item.onClick) { item.onClick(); return }
        if (!hasChildren && item.onClick) {
            item.onClick()
            if (closeOnSelect) onClose()
        }
    }

    useEffect(() => {
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
    }, [])

    const selectorEl = (item.toggle || item.radio) && (
        <span className={clsx(
            item.radio ? styles.radio : styles.toggle,
            item.checked && (item.radio ? styles.radioChecked : styles.toggleChecked),
        )}>
            <span className={item.radio ? styles.radioDot : styles.toggleDot} />
        </span>
    )

    const chevronEl = hasChildren && (
        <span className={clsx(
            styles.itemChevron,
            isLeft && styles.itemChevronLeft,
            isOpen && !isClosing && styles.itemChevronOpen,
        )}>
            {isLeft ? <ChevronLeft /> : <ChevronRight />}
        </span>
    )

    return (
        <>
            <div
                ref={itemRef}
                className={clsx(
                    styles.item,
                    item.disabled && styles.itemDisabled,
                    isOpen && styles.itemActive,
                )}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleItemLeave}
            >
                {/* Left-direction: chevron on the left */}
                {isLeft && chevronEl}

                {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
                <span className={styles.itemLabel}>{item.label}</span>

                {selectorEl}

                {/* Right-direction: chevron on the right */}
                {!isLeft && chevronEl}

                {isOpen && hasChildren && (
                    <div
                        ref={subRef}
                        className={clsx(
                            styles.submenu,
                            isLeft && styles.submenuLeft,
                            isClosing && (isLeft ? styles.submenuClosingLeft : styles.submenuClosing),
                        )}
                        onAnimationEnd={onSubAnimationEnd}
                        onMouseEnter={openSub}
                        onMouseLeave={handleSubLeave}
                    >
                        <HoverMenuLevel items={item.children!} onClose={onClose} openDirection={openDirection} closeOnSelect={closeOnSelect} />
                    </div>
                )}
            </div>
            {item.divider && <div className={styles.divider} />}
        </>
    )
}

function HoverMenuLevel({
    items,
    onClose,
    openDirection,
    closeOnSelect,
}: {
    items: DropdownMenuItem[]
    onClose: () => void
    openDirection: 'right' | 'left'
    closeOnSelect: boolean
}) {
    const [activeKey, setActiveKey] = useState<string | null>(null)
    const [closing, setClosing] = useState(false)
    const activeKeyRef = useRef<string | null>(null)
    const pendingKeyRef = useRef<string | null>(null)
    const closingRef = useRef(false)

    const updateActiveKey = useCallback((key: string | null) => {
        activeKeyRef.current = key
        setActiveKey(key)
    }, [])

    const updatePendingKey = useCallback((key: string | null) => {
        pendingKeyRef.current = key
    }, [])

    const updateClosing = useCallback((value: boolean) => {
        closingRef.current = value
        setClosing(value)
    }, [])

    const activate = useCallback((key: string | null) => {
        const currentKey = activeKeyRef.current

        if (key === currentKey) {
            updatePendingKey(null)
            updateClosing(false)
            return
        }

        if (currentKey !== null) {
            updatePendingKey(key)
            updateClosing(true)
            return
        }

        updateActiveKey(key)
    }, [updateActiveKey, updateClosing, updatePendingKey])

    const deactivate = useCallback((key: string) => {
        // Item leave is delayed. Read current refs so an older timer cannot
        // cancel a submenu selected by a newer sibling hover.
        if (activeKeyRef.current === key && pendingKeyRef.current === null) {
            activate(null)
        }
    }, [activate])

    const handleSubAnimationEnd = useCallback((event: React.AnimationEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget || !closingRef.current) return

        const nextKey = pendingKeyRef.current
        updateActiveKey(nextKey)
        updatePendingKey(null)
        updateClosing(false)
    }, [updateActiveKey, updateClosing, updatePendingKey])

    return items.map(item => (
        <HoverMenuItem
            key={item.key}
            item={item}
            onClose={onClose}
            openDirection={openDirection}
            closeOnSelect={closeOnSelect}
            isOpen={activeKey === item.key}
            isClosing={activeKey === item.key && closing}
            onActivate={activate}
            onDeactivate={deactivate}
            onSubAnimationEnd={handleSubAnimationEnd}
        />
    ))
}

/* ═══════════════════════════════════════════════
 *  DRILL MODE — in-place submenu navigation
 * ═══════════════════════════════════════════════ */

interface DrillLevel {
    title: string
    items: DropdownMenuItem[]
}

function DrillPanel({
    items,
    onClose,
    closeOnSelect,
}: {
    items: DropdownMenuItem[]
    onClose: () => void
    closeOnSelect: boolean
}) {
    const [stack, setStack] = useState<DrillLevel[]>([])
    const [slideDir, setSlideDir] = useState<'in' | 'out' | null>(null)

    const currentItems = stack.length > 0 ? stack[stack.length - 1].items : items
    const currentTitle = stack.length > 0 ? stack[stack.length - 1].title : null

    const drillIn = (item: DropdownMenuItem) => {
        if (!item.children || item.children.length === 0) return
        setSlideDir('in')
        setStack(prev => [...prev, { title: String(item.label), items: item.children! }])
    }

    const drillOut = () => {
        if (stack.length === 0) return
        setSlideDir('out')
        setStack(prev => prev.slice(0, -1))
    }

    const handleClick = (item: DropdownMenuItem) => {
        if (item.disabled) return
        if ((item.toggle || item.radio) && item.onClick) { item.onClick(); return }
        if (item.children && item.children.length > 0) {
            drillIn(item)
            return
        }
        if (item.onClick) {
            item.onClick()
            if (closeOnSelect) onClose()
        }
    }

    const handleAnimEnd = () => { setSlideDir(null) }

    return (
        <div
            className={clsx(
                styles.drillContent,
                slideDir === 'in' && styles.drillSlideIn,
                slideDir === 'out' && styles.drillSlideOut,
            )}
            onAnimationEnd={handleAnimEnd}
        >
            {currentTitle && (
                <div className={styles.drillBack} onClick={drillOut}>
                    <span className={styles.drillBackIcon}><ArrowBack /></span>
                    <span className={styles.drillBackLabel}>{currentTitle}</span>
                </div>
            )}
            {currentItems.map(item => (
                <div key={item.key}>
                    <div
                        className={clsx(
                            styles.item,
                            item.disabled && styles.itemDisabled,
                        )}
                        onClick={() => handleClick(item)}
                    >
                        {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
                        <span className={styles.itemLabel}>{item.label}</span>

                        {(item.toggle || item.radio) && (
                            <span className={clsx(
                                item.radio ? styles.radio : styles.toggle,
                                item.checked && (item.radio ? styles.radioChecked : styles.toggleChecked),
                            )}>
                                <span className={item.radio ? styles.radioDot : styles.toggleDot} />
                            </span>
                        )}

                        {item.children && item.children.length > 0 && (
                            <span className={styles.drillChevron}>
                                <ArrowEnter />
                            </span>
                        )}
                    </div>
                    {item.divider && <div className={styles.divider} />}
                </div>
            ))}
        </div>
    )
}

/* ═══════════════════════════════════════════════
 *  MAIN COMPONENT
 * ═══════════════════════════════════════════════ */

export function DropdownMenu({
    items,
    children,
    className,
    menuClassName,
    onOpenChange,
    align = 'left',
    placement,
    mode = 'hover',
    closeOnSelect = true,
}: DropdownMenuProps) {
    const [open, setOpen] = useState(false)
    const [closing, setClosing] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})
    const [openDirection, setOpenDirection] = useState<'right' | 'left'>(align === 'right' ? 'left' : 'right')
    const wrapRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    const showMenu = open || closing
    const resolvedPlacement = placement ?? (align === 'right' ? 'bottom-end' : 'bottom-start')

    useEffect(() => setMounted(true), [])

    const updatePosition = useCallback(() => {
        const trigger = triggerRef.current
        const menu = menuRef.current
        if (!trigger || !menu) return

        const rect = trigger.getBoundingClientRect()
        const menuRect = menu.getBoundingClientRect()
        const menuWidth = menuRect.width
        const menuHeight = menuRect.height
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const gap = 6
        const viewportPadding = 8
        const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max))

        let left = rect.left
        let top = rect.bottom + gap
        let actualSide: 'right' | 'left' | 'bottom' = 'bottom'

        if (resolvedPlacement === 'right-start' || resolvedPlacement === 'left-start') {
            const preferRight = resolvedPlacement === 'right-start'
            const fitsRight = rect.right + gap + menuWidth <= viewportWidth - viewportPadding
            const fitsLeft = rect.left - gap - menuWidth >= viewportPadding
            const useRight = preferRight ? (fitsRight || !fitsLeft) : (!fitsLeft && fitsRight)

            actualSide = useRight ? 'right' : 'left'
            left = useRight ? rect.right + gap : rect.left - gap - menuWidth
            top = rect.top
        } else {
            left = resolvedPlacement === 'bottom-end' ? rect.right - menuWidth : rect.left

            const fitsBelow = rect.bottom + gap + menuHeight <= viewportHeight - viewportPadding
            const fitsAbove = rect.top - gap - menuHeight >= viewportPadding
            top = !fitsBelow && fitsAbove ? rect.top - gap - menuHeight : rect.bottom + gap
        }

        left = clamp(left, viewportPadding, viewportWidth - menuWidth - viewportPadding)
        top = clamp(top, viewportPadding, viewportHeight - menuHeight - viewportPadding)

        const style: React.CSSProperties = {
            position: 'fixed',
            top,
            left,
            zIndex: 10100,
        }

        const rightSpace = viewportWidth - (left + menuWidth)
        const leftSpace = left
        const nextDirection = actualSide === 'left' || (actualSide === 'bottom' && leftSpace > rightSpace) ? 'left' : 'right'

        setMenuStyle(style)
        setOpenDirection(nextDirection)
    }, [resolvedPlacement])

    useLayoutEffect(() => {
        if (open) updatePosition()
    }, [open, items, updatePosition])

    useEffect(() => {
        if (!open) return
        updatePosition()
        window.addEventListener('scroll', updatePosition, true)
        window.addEventListener('resize', updatePosition)

        const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updatePosition)
        if (triggerRef.current) resizeObserver?.observe(triggerRef.current)
        if (menuRef.current) resizeObserver?.observe(menuRef.current)

        return () => {
            window.removeEventListener('scroll', updatePosition, true)
            window.removeEventListener('resize', updatePosition)
            resizeObserver?.disconnect()
        }
    }, [open, updatePosition])

    const closeMenu = useCallback(() => {
        if (!open || closing) return
        setClosing(true)
    }, [closing, open])

    const handleAnimEnd = useCallback((event: React.AnimationEvent<HTMLDivElement>) => {
        // Submenu animations bubble through the portal menu. Only the main
        // panel's own animation may finish the main panel close lifecycle.
        if (event.target !== event.currentTarget || !closing) return

        setClosing(false)
        setOpen(false)
        onOpenChange?.(false)
    }, [closing, onOpenChange])

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as Node
            if (wrapRef.current && !wrapRef.current.contains(target) &&
                menuRef.current && !menuRef.current.contains(target)) {
                closeMenu()
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [closeMenu])

    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [open, closeMenu])

    const toggle = () => {
        if (closing) {
            setClosing(false)
            return
        }

        if (open) {
            closeMenu()
            return
        }

        setOpen(true)
        onOpenChange?.(true)
    }

    const menuContent = showMenu && (
        <div
            ref={menuRef}
            className={clsx(
                styles.menu,
                styles.menuPortal,
                closing && styles.menuClosing,
                openDirection === 'left' && styles.menuRight,
                mode === 'drill' && styles.menuDrill,
                menuClassName,
            )}
            style={menuStyle}
            onAnimationEnd={handleAnimEnd}
        >
            {mode === 'drill' ? (
                <DrillPanel items={items} onClose={closeMenu} closeOnSelect={closeOnSelect} />
            ) : (
                <HoverMenuLevel items={items} onClose={closeMenu} openDirection={openDirection} closeOnSelect={closeOnSelect} />
            )}
        </div>
    )

    return (
        <div ref={wrapRef} className={clsx(styles.wrapper, className)}>
            <div ref={triggerRef} className={styles.trigger} onClick={toggle}>{children}</div>

            {mounted && menuContent && createPortal(menuContent, document.body)}
        </div>
    )
}
