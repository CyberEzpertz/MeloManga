export interface Tag {
  id: string;
  type: string;
  attributes: {
    name: {
      [lang: string]: string;
    };
    group: string;
    version: number;
  };
}

//cover art is optional
export interface Relationship {
  id: string;
  type: 'author' | 'artist' | 'cover_art' | string;
  attributes?: {
    name?: string;
    fileName?: string;
    [key: string]: any;
  };
}

export interface MangaAttributes {
  title: {
    [lang: string]: string;
  };
  description: {
    [lang: string]: string;
  };
  tags: Tag[];
  status?: string;
  contentRating?: string;
  publicationDemographic?: string;
  version: number;
}

export interface Manga {
  id: string;
  type: 'manga';
  attributes: MangaAttributes;
  relationships: Relationship[];
}

export interface Chapter {
  id: string
  type: "chapter"
  attributes: {
    title: string
    chapter: string
    volume: string
    translatedLanguage: string
    publishAt: string
  }
  relationships: {
    id: string
    type: "scanlation_group" | "user"
    attributes?: {
      name?: string
      username?: string
    }
  }[]
}