export interface Person {
  id: string;
  lastName?: string;
  firstName?: string;
  middleName?: string;
  birthDate?: string;
  deathDate?: string;
  fatherId?: string;
  motherId?: string;
  photoUrl?: string;
  description?: string;
  additionalPhotos?: Array<{
    url: string;
    caption: string;
  }>;
}

export interface ProcessedPerson {
  id: string;
  name: string;
  yearsOfLife: string;
  photoUrl?: string;
  father?: ProcessedPerson;
  mother?: ProcessedPerson;
  description?: string;
  additionalPhotos?: Array<{
    url: string;
    caption: string;
  }>;
}

export interface PersonModalProps {
  person: ProcessedPerson;
  onClose: () => void;
}

export interface CardPosition {
  person: ProcessedPerson;
  x: number;
  y: number;
  relationship: string;
  level: number;
}

export interface CardProps {
  name: string;
  yearsOfLife: string;
  photoUrl?: string;
  relationship: string;
  defaultPosition: { x: number; y: number };
  onClick?: () => void;
}

export interface TooltipPosition {
  x: number;
  y: number;
} 