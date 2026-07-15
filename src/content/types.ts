import type { z } from "zod";

import type {
  AssetLicenseEntrySchema,
  AssetLicenseManifestSchema,
  AssetProvenanceSchema,
  BriefProjectRecordSchema,
  BrandAssetAccessibilitySchema,
  BrandAssetProvenanceSchema,
  BrandSurfaceSchema,
  CaseStudyStateSchema,
  ClaimKindSchema,
  ClaimSourceSchema,
  CollaboratorSchema,
  ContentBundleSchema,
  ContentSourceMetadataSchema,
  CropPolicySchema,
  CurrentlyBuildingRecordSchema,
  CurrentlyBuildingSchema,
  DecisionSchema,
  EvidenceFunctionSchema,
  EvidenceTypeSchema,
  BriefProjectEditorialSchema,
  FullProjectEditorialSchema,
  ProjectArchiveEditorialSchema,
  ProjectCaseOpeningSchema,
  ProjectMetadataEditorialSchema,
  FullProjectRecordSchema,
  HomepageSchema,
  HomepageFeaturedMomentSchema,
  HomepageMomentRoleSchema,
  HomepageProjectStageSchema,
  LinkStateSchema,
  MediaAssetSchema,
  MediaKindSchema,
  MobileAssetDerivativeSchema,
  MomentContextSchema,
  MomentCategorySchema,
  MomentRecordSchema,
  MomentShowcaseModeSchema,
  NavigationItemSchema,
  NavigationSchema,
  PlannedAssetSchema,
  PlannedAssetStatusSchema,
  ProfileSchema,
  ProjectBrandAssetSchema,
  ProjectBrandingSchema,
  ProjectBrandPaletteSchema,
  ProjectLifecycleSchema,
  ProjectLinksSchema,
  ProjectOriginSchema,
  ProjectRecordSchema,
  ProjectRoleSchema,
  ProjectStageVariantSchema,
  ProjectSourceMetadataSchema,
  PublicationStateSchema,
  ReadyAssetSchema,
  ReadyDocumentAssetSchema,
  ReadyImageAssetSchema,
  ReadyVideoAssetSchema,
  ResearchSchema,
  ResearchTerritorySchema,
  TeamContextSchema,
  ValidationKindSchema,
  VerifiedClaimSchema,
} from "./schema";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type PublicationState = z.infer<typeof PublicationStateSchema>;
export type CaseStudyState = z.infer<typeof CaseStudyStateSchema>;
export type ProjectLifecycle = z.infer<typeof ProjectLifecycleSchema>;
export type ProjectOrigin = z.infer<typeof ProjectOriginSchema>;
export type ValidationKind = z.infer<typeof ValidationKindSchema>;
export type ClaimKind = z.infer<typeof ClaimKindSchema>;
export type ClaimSource = z.infer<typeof ClaimSourceSchema>;
export type VerifiedClaim = z.infer<typeof VerifiedClaimSchema>;
export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;
export type EvidenceFunction = z.infer<typeof EvidenceFunctionSchema>;
export type MediaKind = z.infer<typeof MediaKindSchema>;
export type PlannedAssetStatus = z.infer<typeof PlannedAssetStatusSchema>;
export type LinkState = z.infer<typeof LinkStateSchema>;
export type AssetProvenance = z.infer<typeof AssetProvenanceSchema>;
export type CropPolicy = z.infer<typeof CropPolicySchema>;
export type MobileAssetDerivative = z.infer<typeof MobileAssetDerivativeSchema>;
export type ReadyImageAsset = z.infer<typeof ReadyImageAssetSchema>;
export type ReadyVideoAsset = z.infer<typeof ReadyVideoAssetSchema>;
export type ReadyDocumentAsset = z.infer<typeof ReadyDocumentAssetSchema>;
export type ReadyAsset = z.infer<typeof ReadyAssetSchema>;
export type PlannedAsset = z.infer<typeof PlannedAssetSchema>;
export type MediaAsset = z.infer<typeof MediaAssetSchema>;
export type ProjectRole = z.infer<typeof ProjectRoleSchema>;
export type ProjectArchiveEditorial = z.infer<
  typeof ProjectArchiveEditorialSchema
>;
export type ProjectMetadataEditorial = z.infer<
  typeof ProjectMetadataEditorialSchema
>;
export type ProjectCaseOpening = z.infer<typeof ProjectCaseOpeningSchema>;
export type BriefProjectEditorial = z.infer<
  typeof BriefProjectEditorialSchema
>;
export type FullProjectEditorial = z.infer<typeof FullProjectEditorialSchema>;
export type Collaborator = z.infer<typeof CollaboratorSchema>;
export type Decision = z.infer<typeof DecisionSchema>;
export type ProjectLinks = z.infer<typeof ProjectLinksSchema>;
export type TeamContext = z.infer<typeof TeamContextSchema>;
export type BriefProjectRecord = z.infer<typeof BriefProjectRecordSchema>;
export type FullProjectRecord = z.infer<typeof FullProjectRecordSchema>;
export type ProjectRecord = z.infer<typeof ProjectRecordSchema>;
export type MomentContext = z.infer<typeof MomentContextSchema>;
export type MomentCategory = z.infer<typeof MomentCategorySchema>;
export type MomentShowcaseMode = z.infer<typeof MomentShowcaseModeSchema>;
export type BrandSurface = z.infer<typeof BrandSurfaceSchema>;
export type BrandAssetAccessibility = z.infer<
  typeof BrandAssetAccessibilitySchema
>;
export type BrandAssetProvenance = z.infer<
  typeof BrandAssetProvenanceSchema
>;
export type ProjectBrandAsset = z.infer<typeof ProjectBrandAssetSchema>;
export type ProjectBrandPalette = z.infer<typeof ProjectBrandPaletteSchema>;
export type ProjectBranding = z.infer<typeof ProjectBrandingSchema>;
export type ProjectStageVariant = z.infer<typeof ProjectStageVariantSchema>;
export type MomentRecord = z.infer<typeof MomentRecordSchema>;
export type CurrentlyBuildingRecord = z.infer<typeof CurrentlyBuildingRecordSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type ResearchTerritory = z.infer<typeof ResearchTerritorySchema>;
export type Research = z.infer<typeof ResearchSchema>;
export type NavigationItem = z.infer<typeof NavigationItemSchema>;
export type Navigation = z.infer<typeof NavigationSchema>;
export type Homepage = z.infer<typeof HomepageSchema>;
export type HomepageFeaturedMoment = z.infer<
  typeof HomepageFeaturedMomentSchema
>;
export type HomepageMomentRole = z.infer<typeof HomepageMomentRoleSchema>;
export type HomepageProjectStage = z.infer<
  typeof HomepageProjectStageSchema
>;
export type CurrentlyBuilding = z.infer<typeof CurrentlyBuildingSchema>;
export type AssetLicenseEntry = z.infer<typeof AssetLicenseEntrySchema>;
export type AssetLicenseManifest = z.infer<typeof AssetLicenseManifestSchema>;
export type ProjectSourceMetadata = z.infer<typeof ProjectSourceMetadataSchema>;
export type ContentSourceMetadata = z.infer<typeof ContentSourceMetadataSchema>;
export type ContentBundle = z.infer<typeof ContentBundleSchema>;
export type ContentBundleInput = z.input<typeof ContentBundleSchema>;

export type ContentDiagnosticSeverity = "error" | "warning";

export type ContentDiagnostic = {
  severity: ContentDiagnosticSeverity;
  code: string;
  path: string;
  message: string;
};

export type FilePresenceAdapter =
  | ((repositoryPath: string) => boolean)
  | { exists(repositoryPath: string): boolean }
  | { has(repositoryPath: string): boolean };

export type ContentValidationResult = {
  content: ContentBundle;
  diagnostics: ContentDiagnostic[];
};
