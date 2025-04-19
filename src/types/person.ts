export interface Person {
  id: string;
  name: string;
  yearsOfLife: string;
  photoUrl?: string;
  description?: string;
  additionalPhotos?: Array<{
    url: string;
    caption: string;
  }>;
  fatherId?: string;
  motherId?: string;
  level?: number;
  position?: {
    x: number;
    y: number;
  };
}

export interface ProcessedPerson extends Person {
  level: number;
  position: {
    x: number;
    y: number;
  };
}

export interface PersonModalProps {
  person: Person;
  onClose: () => void;
}

export interface CardPosition {
  person: ProcessedPerson;
  x: number;
  y: number;
  relationship: string;
  level: number;
} 