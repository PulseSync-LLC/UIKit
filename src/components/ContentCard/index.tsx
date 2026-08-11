import {
    createElement,
    type AnchorHTMLAttributes,
    type CSSProperties,
    type ElementType,
    type HTMLAttributes,
    type ReactNode,
} from 'react'
import clsx from 'clsx'
import styles from './contentCard.module.scss'

export type ContentCardVariant = 'article' | 'compact'

type ContentCardBaseProps = {
    variant?: ContentCardVariant
    media?: ReactNode
    meta?: ReactNode
    title: ReactNode
    subtitle?: ReactNode
    description?: ReactNode
    action?: ReactNode
    /** Accent color used by the compact V4 card treatment. */
    accent?: string
    /** Override the article media height while preserving the card layout. */
    mediaHeight?: number | string
    contentClassName?: string
}

type ContentCardElementProps = ContentCardBaseProps &
    Omit<HTMLAttributes<HTMLElement>, 'title' | 'children'> & {
        as?: ElementType
        href?: never
        action?: ReactNode
    }

type ContentCardLinkProps = ContentCardBaseProps &
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'title' | 'children' | 'href'> & {
        as?: 'a'
        href: string
        /** Linked cards cannot contain a nested interactive action. */
        action?: never
    }

export type ContentCardProps = ContentCardElementProps | ContentCardLinkProps

type CardStyle = CSSProperties & {
    '--ps-card-accent'?: string
    '--ps-card-media-height'?: string
}

/** Shared V4 card for article/news and compact component rows. */
export function ContentCard({
    variant = 'article',
    as = 'article',
    href,
    media,
    meta,
    title,
    subtitle,
    description,
    action,
    accent,
    mediaHeight,
    className,
    contentClassName,
    style,
    ...rest
}: ContentCardProps) {
    const cardStyle: CardStyle = {
        ...style,
        ...(accent ? { '--ps-card-accent': accent } : {}),
        ...(mediaHeight !== undefined
            ? {
                  '--ps-card-media-height':
                      typeof mediaHeight === 'number' ? `${mediaHeight}px` : mediaHeight,
              }
            : {}),
    }

    return createElement(
        href ? 'a' : as,
        {
            className: clsx(styles.card, styles[variant], accent && styles.accented, className),
            style: cardStyle,
            ...(href ? { href } : {}),
            ...rest,
        },
        <>
            {media && <div className={styles.media}>{media}</div>}
            <div className={clsx(styles.content, contentClassName)}>
                <div className={styles.copy}>
                    {meta && <div className={styles.meta}>{meta}</div>}
                    <div className={styles.title}>{title}</div>
                    {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
                    {description && <div className={styles.description}>{description}</div>}
                </div>
                {action && <div className={styles.action}>{action}</div>}
            </div>
        </>,
    )
}
