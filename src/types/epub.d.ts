declare module 'epubjs' {
  export interface PackagingMetadataObject {
    title: string;
    creator: string;
    description: string;
    pubdate: string;
    publisher: string;
    identifier: string;
    language: string;
    rights: string;
    modified_date: string;
    layout: string;
    orientation: string;
    flow: string;
    viewport: string;
    spread: string;
    direction: string | null;
  }

  export interface NavItem {
    id: string;
    href: string;
    label: string;
    subitems?: NavItem[];
    parent?: string;
  }

  export interface Location {
    start: {
      index: number;
      href: string;
      cfi: string;
      displayed: { page: number; total: number };
      percentage: number;
      location: number;
    };
    end: {
      index: number;
      href: string;
      cfi: string;
      displayed: { page: number; total: number };
      percentage: number;
      location: number;
    };
    atStart: boolean;
    atEnd: boolean;
  }

  export interface DisplayedLocation {
    start: { cfi: string; percentage: number; location: number; href: string; index: number };
    end: { cfi: string; percentage: number; location: number; href: string; index: number };
  }

  export interface Contents {
    document: Document;
    window: Window;
    content: HTMLElement;
  }

  export interface Themes {
    default(styles: Record<string, Record<string, string>>): void;
    fontSize(size: string): void;
    font(font: string): void;
    override(name: string, value: string, priority?: boolean): void;
    register(name: string, styles: Record<string, Record<string, string>>): void;
    select(name: string): void;
  }

  export interface Annotations {
    highlight(
      cfiRange: string,
      data?: Record<string, unknown>,
      cb?: (e: Event) => void,
      className?: string,
      styles?: Record<string, string>,
    ): void;
    remove(cfiRange: string, type: string): void;
  }

  export interface Rendition {
    display(target?: string | number): Promise<void>;
    next(): Promise<void>;
    prev(): Promise<void>;
    destroy(): void;
    on(event: string, callback: (...args: unknown[]) => void): void;
    off(event: string, callback: (...args: unknown[]) => void): void;
    themes: Themes;
    annotations: Annotations;
    flow(mode: string): void;
    spread(mode: string): void;
    currentLocation(): DisplayedLocation;
    hooks: {
      content: { register(fn: (contents: Contents) => void): void };
    };
  }

  export interface SpineItem {
    find(query: string): Promise<Array<{ cfi: string; excerpt: string }>>;
  }

  export interface Spine {
    each(fn: (item: SpineItem) => void): void;
    items: SpineItem[];
    spineItems: Array<{ index: number; href: string; cfi: string }>;
  }

  export interface Navigation {
    toc: NavItem[];
  }

  export interface Book {
    renderTo(
      element: HTMLElement | string,
      options?: {
        width?: string | number;
        height?: string | number;
        flow?: 'paginated' | 'scrolled-doc' | 'scrolled';
        spread?: 'none' | 'always' | 'auto';
        manager?: string;
        snap?: boolean;
      },
    ): Rendition;
    loaded: {
      navigation: Promise<Navigation>;
      metadata: Promise<PackagingMetadataObject>;
      cover: Promise<string>;
      spine: Promise<Spine>;
    };
    coverUrl(): Promise<string | null>;
    destroy(): void;
    spine: Spine;
    locations: {
      generate(chars?: number): Promise<string[]>;
      percentageFromCfi(cfi: string): number;
      cfiFromPercentage(percentage: number): string;
    };
    key(): string;
  }

  export default function ePub(urlOrData: string | ArrayBuffer, options?: Record<string, unknown>): Book;
}

declare module 'epubjs/types/book' {
  export { Book } from 'epubjs';
}
