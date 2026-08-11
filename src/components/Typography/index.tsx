import { createElement, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'
import styles from './typography.module.scss'

export type TypographyVariant =
    | 'heading1'
    | 'heading2'
    | 'heading3'
    | 'heading4'
    | 'heading5'
    | 'body'
    | 'bodySmall'
    | 'caption'
    | 'overline'

export type TypographyTone = 'primary' | 'secondary' | 'muted' | 'disabled' | 'inherit'

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
    /** Semantic/visual scale from the PulseSync V4 typography system. */
    variant?: TypographyVariant
    /** Text color from the shared token palette. */
    tone?: TypographyTone
    /** Override the semantic element while preserving the visual variant. */
    as?: ElementType
    children: ReactNode
}

const defaultElements: Record<TypographyVariant, ElementType> = {
    heading1: 'h1',
    heading2: 'h2',
    heading3: 'h3',
    heading4: 'h4',
    heading5: 'h5',
    body: 'p',
    bodySmall: 'p',
    caption: 'span',
    overline: 'span',
}

/** Renders the canonical PulseSync V4 type scale with semantic tag overrides. */
export function Typography({
    variant = 'body',
    tone = 'primary',
    as,
    className,
    children,
    ...rest
}: TypographyProps) {
    return createElement(
        as ?? defaultElements[variant],
        {
            className: clsx(styles.typography, styles[variant], styles[`tone-${tone}`], className),
            ...rest,
        },
        children,
    )
}

