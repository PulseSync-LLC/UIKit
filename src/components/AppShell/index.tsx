import type { HTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'
import styles from './appShell.module.scss'

export interface AppShellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    /** Content rendered in the 48px desktop title bar. */
    topBar: ReactNode
    /** Navigation rendered in the 54px left rail. */
    navigation: ReactNode
    children: ReactNode
    contentClassName?: string
    /** Center content at the V4 1200px design width. */
    contained?: boolean
}

export interface AppShellGridProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
}

/** Slot-based desktop shell matching the V4 title bar and navigation rail geometry. */
export function AppShell({
    topBar,
    navigation,
    children,
    className,
    contentClassName,
    contained = true,
    ...rest
}: AppShellProps) {
    return (
        <div className={clsx(styles.shell, className)} {...rest}>
            <header className={styles.topBar}>{topBar}</header>
            <aside className={styles.navigation}>{navigation}</aside>
            <main className={styles.content}>
                <div
                    className={clsx(
                        styles.contentInner,
                        contained && styles.contentContained,
                        contentClassName,
                    )}
                >
                    {children}
                </div>
            </main>
        </div>
    )
}

/** Responsive two-column content grid using the 733/417 V4 column ratio. */
export function AppShellGrid({ children, className, ...rest }: AppShellGridProps) {
    return (
        <div className={clsx(styles.contentGrid, className)} {...rest}>
            {children}
        </div>
    )
}

