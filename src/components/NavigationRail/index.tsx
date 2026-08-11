import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'
import styles from './navigationRail.module.scss'

export interface NavigationRailProps {
    children: ReactNode
    footer?: ReactNode
    className?: string
    'aria-label'?: string
}

type NavigationRailItemBase = {
    icon: ReactNode
    label: string
    active?: boolean
    badge?: ReactNode
    className?: string
}

type NavigationRailItemButton = NavigationRailItemBase &
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> & {
        href?: never
    }

type NavigationRailItemLink = NavigationRailItemBase &
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'href' | 'aria-label'> & {
        href: string
    }

export type NavigationRailItemProps = NavigationRailItemButton | NavigationRailItemLink

/** Vertical V4 navigation rail with a pinned footer slot. */
export function NavigationRail({
    children,
    footer,
    className,
    'aria-label': ariaLabel = 'Primary navigation',
}: NavigationRailProps) {
    return (
        <nav className={clsx(styles.rail, className)} aria-label={ariaLabel}>
            <div className={styles.items}>{children}</div>
            {footer && <div className={styles.footer}>{footer}</div>}
        </nav>
    )
}

/** Icon-only rail action supporting both button and anchor navigation. */
export function NavigationRailItem(props: NavigationRailItemProps) {
    const { icon, label, active = false, badge, className, ...rest } = props
    const classes = clsx(styles.item, active && styles.active, className)
    const content = (
        <>
            <span className={styles.icon}>{icon}</span>
            {badge && <span className={styles.badge}>{badge}</span>}
        </>
    )

    if ('href' in props && props.href) {
        const { href, ...anchorProps } = rest as NavigationRailItemLink
        return (
            <a
                href={href}
                className={classes}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                title={label}
                {...anchorProps}
            >
                {content}
            </a>
        )
    }

    return (
        <button
            type="button"
            className={classes}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            title={label}
            {...(rest as NavigationRailItemButton)}
        >
            {content}
        </button>
    )
}

