export interface TrackPhotoMeta {
  src: string;
  alt: string;
}

const TRACK_PHOTOS: Record<string, TrackPhotoMeta> = {
  "ai-automation": {
    src: "/images/track-ai-automation.webp",
    alt: "Engineer working with a tablet beside server racks in a bright tech workspace"
  },
  "web-dev": {
    src: "/images/track-web-dev.webp",
    alt: "Developer writing HTML and CSS in a code editor on a laptop with classmates nearby"
  },
  "product-design": {
    src: "/images/track-product-design.webp",
    alt: "Two collaborators reviewing work together at a dual-monitor workstation"
  },
  cybersecurity: {
    src: "/images/track-cybersecurity.webp",
    alt: "Learner holding a Python for Unix and Linux System Administration book"
  }
};

const DEFAULT_TRACK_PHOTO: TrackPhotoMeta = {
  src: "/images/hero-coding-lagos.webp",
  alt: "Two young developers collaborating over code on a laptop and monitor"
};

export function getTrackPhoto(slugOrId?: string | null): TrackPhotoMeta {
  if (!slugOrId) return DEFAULT_TRACK_PHOTO;
  return TRACK_PHOTOS[slugOrId] ?? DEFAULT_TRACK_PHOTO;
}
