/**
 * Model đại diện cho trạng thái dropdown
 */
export interface DropdownState {
  tools: boolean;
  account: boolean;
  pdf?: boolean;
  image?: boolean;
  others?: boolean;
  user?: boolean;
}

/**
 * Model đại diện cho link đơn giản
 */
export interface SimpleLink {
  title: string;
  url: string;
}

/**
 * Model đại diện cho link có chứa các link con
 */
export interface NestedLink {
  title: string;
  children?: SimpleLink[];
  links?: SimpleLink[];
}

/**
 * Type đại diện cho link trong sitemap
 */
export type SectionLink = SimpleLink | NestedLink;

/**
 * Model đại diện cho section trong sitemap
 */
export interface SiteMapSection {
  title: string;
  links: SectionLink[];
}
