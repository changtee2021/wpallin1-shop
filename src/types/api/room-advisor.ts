import type { ConfiguratorProductType } from "@/domain/configurator";

export type RoomAdvisorStatus =
  | "draft"
  | "analyzing"
  | "ready"
  | "shared"
  | "customer_responded";

export type RoomAnalysisDto = {
  roomType: string;
  lightLevel: string;
  interiorStyle: string[];
  moodTags: string[];
  styleTags: string[];
  customerNeeds: string[];
  colorSuggestions: string[];
  constraints: string[];
  reasoning: string;
  confidence: number;
};

export type StyleRecommendationDto = {
  rank: number;
  title: string;
  productType: ConfiguratorProductType | null;
  fabricId: string | null;
  fabricName: string | null;
  fabricSwatchUrl: string | null;
  colorHint: string;
  benefits: string[];
  description: string;
};

export type RoomAdvisorPhotoDto = {
  id: string;
  publicUrl: string;
  roomLabel: string | null;
  sortOrder: number;
  isHero: boolean;
};

export type RoomAdvisorSessionDto = {
  id: string;
  shareToken: string;
  clientName: string | null;
  clientPhone: string | null;
  roomTypeHint: string | null;
  customerNotes: string | null;
  status: RoomAdvisorStatus;
  analysis: RoomAnalysisDto | null;
  recommendations: StyleRecommendationDto[];
  similarRoomSlugs: string[];
  shareExpiresAt: string | null;
  customerSelectedRanks: number[];
  customerFeedback: string | null;
  customerViewedAt: string | null;
  customerRespondedAt: string | null;
  photos: RoomAdvisorPhotoDto[];
  createdAt: string;
  updatedAt: string;
};

export type RoomAdvisorSessionSummaryDto = {
  id: string;
  shareToken: string;
  clientName: string | null;
  roomTypeHint: string | null;
  status: RoomAdvisorStatus;
  heroPhotoUrl: string | null;
  recommendationCount: number;
  customerSelectedRanks: number[];
  shareExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};
