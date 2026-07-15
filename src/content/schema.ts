import { z } from "zod";

const FULL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const PARTIAL_DATE_PATTERN = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;
const REPOSITORY_PATH_PATTERN = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))(?!.*\/\/)[\w@.+/-]+$/;
const PUBLIC_MEDIA_PATH_PATTERN = /^\/media\/(?!.*(?:^|\/)\.\.(?:\/|$))(?!.*\/\/)[\w@.+%/-]+$/;
const GIT_REVISION_PATTERN = /^[a-f0-9]{40}$/;
const HEX_COLOR_PATTERN = /^#[a-fA-F0-9]{6}$/;

function isCalendarDate(value: string): boolean {
  const match = FULL_DATE_PATTERN.exec(value);
  if (!match) return false;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  return date.toISOString().slice(0, 10) === value;
}

function isPartialCalendarDate(value: string): boolean {
  const match = PARTIAL_DATE_PATTERN.exec(value);
  if (!match) return false;

  const [, year, month, day] = match;
  if (year === "0000") return false;
  if (!month) return true;
  if (Number(month) < 1 || Number(month) > 12) return false;
  if (!day) return true;

  return isCalendarDate(value);
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function uniqueValues(values: readonly string[]): boolean {
  return new Set(values).size === values.length;
}

export const NonEmptyStringSchema = z.string().trim().min(1);
export const IdentifierSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase kebab-case identifier");
export const ProjectSlugSchema = IdentifierSchema;
export const VerificationDateSchema = z
  .string()
  .refine(isCalendarDate, "Use a complete, valid ISO date (YYYY-MM-DD)");
export const PartialDateSchema = z
  .string()
  .refine(isPartialCalendarDate, "Use YYYY, YYYY-MM, or YYYY-MM-DD");
export const HttpUrlSchema = z.string().trim().refine(isHttpUrl, "Use an absolute HTTP(S) URL");
export const RepositoryPathSchema = z
  .string()
  .trim()
  .regex(REPOSITORY_PATH_PATTERN, "Use a safe repository-relative path");
export const PublicMediaPathSchema = z
  .string()
  .trim()
  .regex(PUBLIC_MEDIA_PATH_PATTERN, "Ready media must use a path below /media/");
export const GitRevisionSchema = z
  .string()
  .trim()
  .regex(GIT_REVISION_PATTERN, "Use a complete 40-character Git revision");
export const HexColorSchema = z
  .string()
  .trim()
  .regex(HEX_COLOR_PATTERN, "Use a six-digit hexadecimal color");

export const PublicationStateSchema = z.enum(["draft", "preview", "published"]);
export const CaseStudyStateSchema = z.enum(["brief", "full"]);
export const ProjectLifecycleSchema = z.enum([
  "active",
  "beta",
  "prototype",
  "research",
  "dormant",
  "archived",
]);
export const ProjectOriginSchema = z.enum([
  "independent",
  "hackathon",
  "grant",
  "employment",
  "collaboration",
]);
export const ValidationKindSchema = z.enum([
  "award",
  "grant",
  "live-deployment",
  "testnet",
  "users",
  "tests",
  "transaction",
]);
export const ClaimKindSchema = z.enum([
  "role",
  "behavior",
  "award",
  "grant",
  "metric",
  "partnership",
  "lifecycle",
  "interpretation",
  "third-party-outcome",
]);
export const EvidenceTypeSchema = z.enum([
  "product",
  "architecture",
  "prototype",
  "agent-trace",
  "transaction",
  "test-result",
  "deployment",
  "source",
  "document",
  "moment",
]);
export const EvidenceFunctionSchema = z.enum([
  "product-reality",
  "system-reasoning",
  "verification",
]);
export const MediaKindSchema = z.enum(["image", "video", "svg", "document"]);
export const PlannedAssetStatusSchema = z.enum([
  "needs-capture",
  "needs-redaction",
  "private",
  "missing",
]);
export const MomentShowcaseModeSchema = z.enum([
  "lead",
  "contact-sheet",
  "evidence",
  "portrait",
]);
export const MomentCategorySchema = z.enum(["build", "win", "learn", "give"]);
export const BrandSurfaceSchema = z.enum(["light", "dark"]);
export const ProjectStageVariantSchema = z.enum([
  "wide-left",
  "narrow-right",
  "narrow-left",
  "wide-right",
]);

export const PublicLinkStateSchema = z
  .object({
    status: z.literal("public"),
    url: HttpUrlSchema,
    lastVerifiedAt: VerificationDateSchema,
  })
  .strict();

export const NonPublicLinkStateSchema = z
  .object({
    status: z.enum(["private", "offline", "unavailable", "not-applicable"]),
    note: NonEmptyStringSchema.optional(),
  })
  .strict();

export const LinkStateSchema = z.discriminatedUnion("status", [
  PublicLinkStateSchema,
  NonPublicLinkStateSchema,
]);

export const UrlClaimSourceSchema = z
  .object({
    kind: z.literal("url"),
    url: HttpUrlSchema,
    label: NonEmptyStringSchema,
    verifiedAt: VerificationDateSchema,
  })
  .strict();

export const EvidenceClaimSourceSchema = z
  .object({
    kind: z.literal("evidence"),
    evidenceId: IdentifierSchema,
    label: NonEmptyStringSchema,
  })
  .strict();

export const OfficialDocumentClaimSourceSchema = z
  .object({
    kind: z.literal("official-document"),
    documentId: IdentifierSchema,
    label: NonEmptyStringSchema,
  })
  .strict();

export const CollaboratorConfirmationClaimSourceSchema = z
  .object({
    kind: z.literal("collaborator-confirmation"),
    collaboratorId: IdentifierSchema,
    confirmedAt: VerificationDateSchema,
    note: NonEmptyStringSchema,
  })
  .strict();

export const OwnerAttestationClaimSourceSchema = z
  .object({
    kind: z.literal("owner-attestation"),
    confirmedAt: VerificationDateSchema,
    note: NonEmptyStringSchema,
  })
  .strict();

export const ClaimSourceSchema = z.discriminatedUnion("kind", [
  UrlClaimSourceSchema,
  EvidenceClaimSourceSchema,
  OfficialDocumentClaimSourceSchema,
  CollaboratorConfirmationClaimSourceSchema,
  OwnerAttestationClaimSourceSchema,
]);

export const VerifiedClaimSchema = z
  .object({
    id: IdentifierSchema,
    kind: ClaimKindSchema,
    text: NonEmptyStringSchema,
    sources: z.array(ClaimSourceSchema).min(1),
    scope: NonEmptyStringSchema.optional(),
  })
  .strict();

export const OwnedAssetProvenanceSchema = z
  .object({
    kind: z.literal("owned"),
    creator: NonEmptyStringSchema,
    rightsNote: NonEmptyStringSchema,
    sourceRepository: HttpUrlSchema.optional(),
    revision: GitRevisionSchema.optional(),
    sourcePath: RepositoryPathSchema.optional(),
    capturedAt: VerificationDateSchema.optional(),
  })
  .strict();

export const ThirdPartyAssetProvenanceSchema = z
  .object({
    kind: z.literal("third-party"),
    creator: NonEmptyStringSchema,
    source: HttpUrlSchema,
    license: NonEmptyStringSchema,
    attribution: NonEmptyStringSchema.optional(),
  })
  .strict();

export const DocumentaryPhotoProvenanceSchema = z
  .object({
    kind: z.literal("documentary-photo"),
    source: NonEmptyStringSchema,
    credit: NonEmptyStringSchema,
    rights: z.enum(["owned", "licensed", "permission-confirmed"]),
    consent: z.enum(["confirmed", "not-required"]),
    capturedAt: VerificationDateSchema.optional(),
  })
  .strict();

export const AssetProvenanceSchema = z.discriminatedUnion("kind", [
  OwnedAssetProvenanceSchema,
  ThirdPartyAssetProvenanceSchema,
  DocumentaryPhotoProvenanceSchema,
]);

export const IntrinsicCropSchema = z.object({ mode: z.literal("intrinsic") }).strict();

export const FocalCropSchema = z
  .object({
    mode: z.literal("focal"),
    aspectRatio: z
      .string()
      .regex(/^[1-9]\d*(?:\.\d+)?:[1-9]\d*(?:\.\d+)?$/, "Use a positive width:height ratio"),
    focalPoint: z
      .object({
        x: z.number().min(0).max(1),
        y: z.number().min(0).max(1),
      })
      .strict(),
  })
  .strict();

export const CropPolicySchema = z.discriminatedUnion("mode", [IntrinsicCropSchema, FocalCropSchema]);

export const MobileAssetDerivativeSchema = z
  .object({
    src: PublicMediaPathSchema,
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    crop: CropPolicySchema,
  })
  .strict();

const readyAssetBaseShape = {
  id: IdentifierSchema,
  status: z.literal("ready"),
  slot: NonEmptyStringSchema,
  evidenceType: EvidenceTypeSchema,
  evidenceFunctions: z
    .array(EvidenceFunctionSchema)
    .min(1)
    .refine(uniqueValues, "Evidence functions must be unique"),
  src: PublicMediaPathSchema,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  crop: CropPolicySchema,
  mobile: MobileAssetDerivativeSchema.optional(),
  caption: NonEmptyStringSchema,
  provenance: AssetProvenanceSchema,
  claimIds: z
    .array(IdentifierSchema)
    .refine(uniqueValues, "Claim references must be unique")
    .optional(),
};

export const ReadyImageAssetSchema = z
  .object({
    ...readyAssetBaseShape,
    mediaKind: z.enum(["image", "svg"]),
    alt: z.string(),
    longDescription: NonEmptyStringSchema.optional(),
  })
  .strict();

export const ReadyVideoAssetSchema = z
  .object({
    ...readyAssetBaseShape,
    mediaKind: z.literal("video"),
    poster: PublicMediaPathSchema,
    posterAlt: NonEmptyStringSchema,
    transcriptOrSteps: z.array(NonEmptyStringSchema).min(1),
    durationSeconds: z.number().positive(),
    controls: z.enum(["visible", "explicit-intent"]),
  })
  .strict();

export const ReadyDocumentAssetSchema = z
  .object({
    ...readyAssetBaseShape,
    mediaKind: z.literal("document"),
    title: NonEmptyStringSchema,
    textAlternative: NonEmptyStringSchema,
    pageCount: z.number().int().positive().optional(),
  })
  .strict();

export const ReadyAssetSchema = z.union([
  ReadyImageAssetSchema,
  ReadyVideoAssetSchema,
  ReadyDocumentAssetSchema,
]);

export const PlannedAssetSchema = z
  .object({
    id: IdentifierSchema,
    status: PlannedAssetStatusSchema,
    slot: NonEmptyStringSchema,
    evidenceFunctions: z
      .array(EvidenceFunctionSchema)
      .min(1)
      .refine(uniqueValues, "Evidence functions must be unique"),
    intendedEvidenceType: EvidenceTypeSchema,
    intendedMediaKind: MediaKindSchema.optional(),
    acquisitionNotes: NonEmptyStringSchema.optional(),
    redactionNotes: NonEmptyStringSchema.optional(),
  })
  .strict();

export const MediaAssetSchema = z.union([ReadyAssetSchema, PlannedAssetSchema]);

export const ProjectRoleSchema = z
  .object({
    label: NonEmptyStringSchema,
    scope: z.array(NonEmptyStringSchema).min(1),
    claimIds: z.array(IdentifierSchema).refine(uniqueValues, "Claim references must be unique"),
    evidenceIds: z.array(IdentifierSchema).refine(uniqueValues, "Evidence references must be unique"),
  })
  .strict();

export const CollaboratorSchema = z
  .object({
    id: IdentifierSchema,
    name: NonEmptyStringSchema,
    role: NonEmptyStringSchema.optional(),
    url: HttpUrlSchema.optional(),
  })
  .strict();

export const DecisionSchema = z
  .object({
    title: NonEmptyStringSchema,
    rationale: NonEmptyStringSchema,
    consequence: NonEmptyStringSchema,
    evidenceIds: z.array(IdentifierSchema).refine(uniqueValues, "Evidence references must be unique"),
  })
  .strict();

export const ProjectLinksSchema = z
  .object({
    live: LinkStateSchema,
    source: LinkStateSchema,
    docs: LinkStateSchema.optional(),
    demo: LinkStateSchema.optional(),
  })
  .strict();

export const DecorativeBrandAssetAccessibilitySchema = z
  .object({
    mode: z.literal("decorative"),
  })
  .strict();

export const InformativeBrandAssetAccessibilitySchema = z
  .object({
    mode: z.literal("informative"),
    label: NonEmptyStringSchema,
  })
  .strict();

export const BrandAssetAccessibilitySchema = z.discriminatedUnion("mode", [
  DecorativeBrandAssetAccessibilitySchema,
  InformativeBrandAssetAccessibilitySchema,
]);

export const BrandAssetProvenanceSchema = z
  .object({
    sourceRepository: HttpUrlSchema,
    revision: GitRevisionSchema,
    sourcePath: RepositoryPathSchema,
    creator: NonEmptyStringSchema,
    rights: NonEmptyStringSchema,
  })
  .strict();

export const ProjectBrandAssetSchema = z
  .object({
    id: IdentifierSchema,
    src: PublicMediaPathSchema,
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    suitableSurfaces: z
      .array(BrandSurfaceSchema)
      .min(1)
      .refine(uniqueValues, "Suitable surfaces must be unique"),
    accessibility: BrandAssetAccessibilitySchema,
    provenance: BrandAssetProvenanceSchema,
  })
  .strict();

export const ProjectBrandPaletteSchema = z
  .object({
    surface: HexColorSchema,
    foreground: HexColorSchema,
    accent: HexColorSchema,
    secondaryAccent: HexColorSchema.optional(),
  })
  .strict();

export const ProjectBrandingSchema = z
  .object({
    palette: ProjectBrandPaletteSchema,
    mark: ProjectBrandAssetSchema,
    wordmark: ProjectBrandAssetSchema.optional(),
  })
  .strict();

const projectCommonShape = {
  slug: ProjectSlugSchema,
  title: NonEmptyStringSchema,
  publication: PublicationStateSchema,
  socialImageAssetId: IdentifierSchema.optional(),
  lifecycle: ProjectLifecycleSchema,
  origin: z
    .array(ProjectOriginSchema)
    .min(1)
    .refine(uniqueValues, "Project origins must be unique"),
  validationKinds: z
    .array(ValidationKindSchema)
    .refine(uniqueValues, "Validation kinds must be unique"),
  startedAt: PartialDateSchema,
  endedAt: PartialDateSchema.optional(),
  lastUpdatedAt: VerificationDateSchema,
  lastVerifiedAt: VerificationDateSchema,
  oneLiner: NonEmptyStringSchema,
  branding: ProjectBrandingSchema.optional(),
  role: ProjectRoleSchema,
  collaborators: z.array(CollaboratorSchema).optional(),
  technologies: z.array(NonEmptyStringSchema).refine(uniqueValues, "Technologies must be unique"),
  claims: z.array(VerifiedClaimSchema),
  evidence: z.array(MediaAssetSchema),
  links: ProjectLinksSchema,
};

export const BriefProjectRecordSchema = z
  .object({
    ...projectCommonShape,
    caseStudyState: z.literal("brief"),
    context: NonEmptyStringSchema,
    outcome: NonEmptyStringSchema,
  })
  .strict();

export const TeamContextSchema = z
  .object({
    summary: NonEmptyStringSchema,
    collaboratorIds: z
      .array(IdentifierSchema)
      .refine(uniqueValues, "Collaborator references must be unique"),
    ownershipBoundary: NonEmptyStringSchema,
  })
  .strict();

export const FullProjectRecordSchema = z
  .object({
    ...projectCommonShape,
    caseStudyState: z.literal("full"),
    caseStudyMomentId: IdentifierSchema.optional(),
    problem: NonEmptyStringSchema,
    intendedUsers: z.array(NonEmptyStringSchema).min(1),
    teamContext: TeamContextSchema,
    constraints: z.array(NonEmptyStringSchema).min(1),
    decisions: z.array(DecisionSchema).min(1),
    systemFlow: z.array(NonEmptyStringSchema).min(1),
    limitations: z.array(NonEmptyStringSchema).min(1),
    next: z.array(NonEmptyStringSchema).min(1),
  })
  .strict();

export const ProjectRecordSchema = z.discriminatedUnion("caseStudyState", [
  BriefProjectRecordSchema,
  FullProjectRecordSchema,
]);

export const ProjectMomentContextSchema = z
  .object({
    kind: z.literal("project"),
    projectSlugs: z
      .array(ProjectSlugSchema)
      .min(1)
      .refine(uniqueValues, "Project references must be unique"),
  })
  .strict();

export const JourneyMomentContextSchema = z
  .object({
    kind: z.literal("journey"),
    label: NonEmptyStringSchema,
  })
  .strict();

export const MomentContextSchema = z.discriminatedUnion("kind", [
  ProjectMomentContextSchema,
  JourneyMomentContextSchema,
]);

export const MomentRecordSchema = z
  .object({
    id: IdentifierSchema,
    category: MomentCategorySchema,
    mode: MomentShowcaseModeSchema,
    title: NonEmptyStringSchema,
    event: NonEmptyStringSchema,
    date: VerificationDateSchema,
    place: NonEmptyStringSchema,
    context: MomentContextSchema,
    people: z.array(NonEmptyStringSchema).optional(),
    result: NonEmptyStringSchema.optional(),
    caption: NonEmptyStringSchema,
    reflection: NonEmptyStringSchema.optional(),
    claims: z.array(VerifiedClaimSchema),
    claimIds: z.array(IdentifierSchema).refine(uniqueValues, "Claim references must be unique"),
    assets: z.array(MediaAssetSchema),
    publication: PublicationStateSchema,
  })
  .strict();

export const CurrentlyBuildingRecordSchema = z
  .object({
    id: IdentifierSchema,
    projectSlug: ProjectSlugSchema.optional(),
    title: NonEmptyStringSchema,
    summary: NonEmptyStringSchema,
    startedAt: PartialDateSchema,
    expiresAt: VerificationDateSchema.optional(),
    link: LinkStateSchema,
  })
  .strict();

export const ProfileSchema = z
  .object({
    name: NonEmptyStringSchema,
    identity: NonEmptyStringSchema,
    discipline: NonEmptyStringSchema,
    researchDirection: NonEmptyStringSchema,
    headline: z
      .object({
        lead: NonEmptyStringSchema,
        continuation: NonEmptyStringSchema,
        supporting: NonEmptyStringSchema,
      })
      .strict(),
    operatingRhythm: z.tuple([
      z.literal("Researching"),
      z.literal("Building"),
      z.literal("Shipping"),
    ]),
    positioning: NonEmptyStringSchema,
    thesis: NonEmptyStringSchema,
    location: NonEmptyStringSchema,
    education: NonEmptyStringSchema.optional(),
    availability: NonEmptyStringSchema,
    email: z.string().trim().email(),
    github: LinkStateSchema,
    linkedin: LinkStateSchema,
    resume: LinkStateSchema,
    portrait: ReadyImageAssetSchema.optional(),
    portraitAssetId: IdentifierSchema.optional(),
  })
  .strict();

export const ResearchTerritorySchema = z
  .object({
    id: IdentifierSchema,
    name: NonEmptyStringSchema,
    summary: NonEmptyStringSchema,
    projectSlugs: z
      .array(ProjectSlugSchema)
      .min(1)
      .refine(uniqueValues, "Research project references must be unique"),
  })
  .strict();

export const ResearchSchema = z
  .object({
    title: NonEmptyStringSchema,
    intro: NonEmptyStringSchema,
    territories: z
      .array(ResearchTerritorySchema)
      .min(1)
      .refine(
        (territories) => uniqueValues(territories.map((territory) => territory.id)),
        "Research territory IDs must be unique",
      ),
  })
  .strict();

export const NavigationItemSchema = z
  .object({
    id: IdentifierSchema,
    label: NonEmptyStringSchema,
    href: z
      .string()
      .trim()
      .refine(
        (value) =>
          (/^\/(?!\/)(?:[^\s?#]*(?:[?#][^\s]*)?)?$/.test(value) && !value.includes("..")) ||
          /^#[A-Za-z][\w:-]*$/.test(value) ||
          /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
          isHttpUrl(value),
        "Use a safe route, fragment, mailto link, or absolute HTTP(S) URL",
      ),
    projectSlug: ProjectSlugSchema.optional(),
  })
  .strict();

export const NavigationSchema = z
  .object({
    primary: z.array(NavigationItemSchema).refine((items) => uniqueValues(items.map((item) => item.id)), {
      message: "Navigation item IDs must be unique",
    }),
    secondary: z
      .array(NavigationItemSchema)
      .refine((items) => uniqueValues(items.map((item) => item.id)), {
        message: "Navigation item IDs must be unique",
      })
      .optional(),
  })
  .strict();

export const HomepageProjectStageSchema = z
  .object({
    projectSlug: ProjectSlugSchema,
    question: NonEmptyStringSchema,
    answer: NonEmptyStringSchema,
    outcomeClaimId: IdentifierSchema,
    flowLabels: z
      .array(NonEmptyStringSchema)
      .min(4)
      .max(5)
      .refine(uniqueValues, "Project-stage flow labels must be unique"),
    artifactAssetIds: z
      .array(IdentifierSchema)
      .min(1)
      .max(3)
      .refine(uniqueValues, "Project-stage artifact references must be unique"),
    variant: ProjectStageVariantSchema,
  })
  .strict();

export const HomepageMomentRoleSchema = z.enum(["lead", "supporting"]);

export const HomepageFeaturedMomentSchema = z
  .object({
    momentId: IdentifierSchema,
    assetId: IdentifierSchema,
    role: HomepageMomentRoleSchema,
  })
  .strict();

export const HomepageSchema = z
  .object({
    projectStages: z
      .array(HomepageProjectStageSchema)
      .length(4)
      .refine(
        (stages) => uniqueValues(stages.map((stage) => stage.projectSlug)),
        "Homepage project references must be unique",
      )
      .refine(
        (stages) => uniqueValues(stages.map((stage) => stage.variant)),
        "Homepage project-stage variants must be unique",
      ),
    featuredMoments: z
      .array(HomepageFeaturedMomentSchema)
      .length(4)
      .refine(
        (moments) => uniqueValues(moments.map((moment) => moment.momentId)),
        "Homepage moment references must be unique",
      )
      .refine(
        (moments) => uniqueValues(moments.map((moment) => moment.assetId)),
        "Homepage moment asset references must be unique",
      )
      .refine(
        (moments) => moments.filter((moment) => moment.role === "lead").length === 1,
        "Homepage moments need exactly one lead",
      )
      .refine(
        (moments) => moments.filter((moment) => moment.role === "supporting").length === 3,
        "Homepage moments need exactly three supporting entries",
      ),
    currentlyBuildingIds: z
      .array(IdentifierSchema)
      .refine(uniqueValues, "Currently-building references must be unique"),
  })
  .strict();

export const CurrentlyBuildingSchema = z
  .object({
    items: z.array(CurrentlyBuildingRecordSchema).refine((items) => uniqueValues(items.map((item) => item.id)), {
      message: "Currently-building IDs must be unique",
    }),
  })
  .strict();

export const AssetLicenseEntrySchema = z
  .object({
    id: IdentifierSchema,
    name: NonEmptyStringSchema,
    creator: NonEmptyStringSchema,
    source: HttpUrlSchema,
    license: NonEmptyStringSchema,
    licenseUrl: HttpUrlSchema.optional(),
    attribution: NonEmptyStringSchema.optional(),
    usage: z.enum(["published-asset", "technique-reference", "font", "template"]),
    assetIds: z
      .array(IdentifierSchema)
      .refine(uniqueValues, "Licensed asset references must be unique"),
    lastVerifiedAt: VerificationDateSchema,
  })
  .strict();

export const AssetLicenseManifestSchema = z
  .object({
    entries: z.array(AssetLicenseEntrySchema).refine((entries) => uniqueValues(entries.map((entry) => entry.id)), {
      message: "Asset-license entry IDs must be unique",
    }),
  })
  .strict();

export const ProjectSourceMetadataSchema = z
  .object({
    slug: ProjectSlugSchema,
    recordPath: RepositoryPathSchema,
    caseStudyMdxPath: RepositoryPathSchema.optional(),
  })
  .strict();

export const ContentSourceMetadataSchema = z
  .object({
    projects: z
      .array(ProjectSourceMetadataSchema)
      .refine((items) => uniqueValues(items.map((item) => item.slug)), {
        message: "Project source metadata slugs must be unique",
      }),
  })
  .strict();

export const ContentBundleSchema = z
  .object({
    projects: z.array(ProjectRecordSchema),
    moments: z.array(MomentRecordSchema),
    profile: ProfileSchema,
    research: ResearchSchema,
    navigation: NavigationSchema,
    homepage: HomepageSchema,
    currentlyBuilding: CurrentlyBuildingSchema,
    assetLicenseManifest: AssetLicenseManifestSchema,
    sources: ContentSourceMetadataSchema,
  })
  .strict();
