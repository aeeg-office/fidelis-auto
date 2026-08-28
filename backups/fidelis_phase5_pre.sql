--
-- PostgreSQL database dump
--

\restrict cjOUppdmZcYtEN80MaxTn09GqN8PamXpl0NSyy34fkCGwDD2Lb4th1fnSHdOhGL

-- Dumped from database version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AccountRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AccountRole" AS ENUM (
    'BUYER',
    'SELLER',
    'DEALER',
    'ADMINISTRATOR',
    'SUPER_ADMIN'
);


ALTER TYPE public."AccountRole" OWNER TO postgres;

--
-- Name: AuditAction; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AuditAction" AS ENUM (
    'SUPER_ADMIN_BOOTSTRAPPED',
    'ROLE_CHANGED',
    'ACCOUNT_SUSPENDED',
    'ACCOUNT_RESTORED',
    'DEALER_APPROVED',
    'DEALER_REJECTED',
    'SESSION_REVOKED',
    'LISTING_APPROVED',
    'LISTING_REJECTED'
);


ALTER TYPE public."AuditAction" OWNER TO postgres;

--
-- Name: DealerApprovalStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DealerApprovalStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'CHANGES_REQUESTED',
    'REJECTED'
);


ALTER TYPE public."DealerApprovalStatus" OWNER TO postgres;

--
-- Name: LeadSource; Type: TYPE; Schema: public; Owner: hermes_car
--

CREATE TYPE public."LeadSource" AS ENUM (
    'FACEBOOK_MARKETPLACE',
    'DUBIZZLE',
    'HATLA2EE',
    'GOOGLE_SEARCH',
    'DIRECT',
    'REFERRAL',
    'INSTAGRAM',
    'TIKTOK',
    'OTHER'
);


ALTER TYPE public."LeadSource" OWNER TO hermes_car;

--
-- Name: PreferredChannel; Type: TYPE; Schema: public; Owner: hermes_car
--

CREATE TYPE public."PreferredChannel" AS ENUM (
    'EMAIL',
    'SMS',
    'WHATSAPP',
    'PHONE'
);


ALTER TYPE public."PreferredChannel" OWNER TO hermes_car;

--
-- Name: PromotionStatus; Type: TYPE; Schema: public; Owner: hermes_car
--

CREATE TYPE public."PromotionStatus" AS ENUM (
    'ACTIVE',
    'EXPIRED',
    'CANCELLED'
);


ALTER TYPE public."PromotionStatus" OWNER TO hermes_car;

--
-- Name: PromotionTier; Type: TYPE; Schema: public; Owner: hermes_car
--

CREATE TYPE public."PromotionTier" AS ENUM (
    'FEATURED',
    'PREMIUM',
    'HOMEPAGE'
);


ALTER TYPE public."PromotionTier" OWNER TO hermes_car;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    action public."AuditAction" NOT NULL,
    "actorId" text,
    "targetId" text,
    metadata text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO postgres;

--
-- Name: AuthSession; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuthSession" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "tokenHash" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastSeenAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuthSession" OWNER TO postgres;

--
-- Name: Conversation; Type: TABLE; Schema: public; Owner: hermes_car
--

CREATE TABLE public."Conversation" (
    id text NOT NULL,
    "participant1Id" text NOT NULL,
    "participant2Id" text NOT NULL,
    "lastMessageAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Conversation" OWNER TO hermes_car;

--
-- Name: Dealer; Type: TABLE; Schema: public; Owner: hermes_car
--

CREATE TABLE public."Dealer" (
    id text NOT NULL,
    "dealershipName" text NOT NULL,
    "contactPerson" text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    country text NOT NULL,
    city text NOT NULL,
    description text,
    website text,
    "logoUrl" text,
    status text DEFAULT 'pending'::text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Dealer" OWNER TO hermes_car;

--
-- Name: DealerProfile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DealerProfile" (
    id text NOT NULL,
    "ownerId" text NOT NULL,
    "businessName" text NOT NULL,
    "contactPerson" text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    country text NOT NULL,
    description text NOT NULL,
    website text,
    "logoUrl" text,
    "approvalStatus" public."DealerApprovalStatus" DEFAULT 'PENDING'::public."DealerApprovalStatus" NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "approvedById" text,
    "moderationNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DealerProfile" OWNER TO postgres;

--
-- Name: Document; Type: TABLE; Schema: public; Owner: hermes_car
--

CREATE TABLE public."Document" (
    id text NOT NULL,
    "vehicleId" text NOT NULL,
    title text NOT NULL,
    description text,
    "filePath" text NOT NULL,
    "fileType" text NOT NULL,
    "fileSize" integer,
    category text DEFAULT 'service'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Document" OWNER TO hermes_car;

--
-- Name: Favorite; Type: TABLE; Schema: public; Owner: hermes_car
--

CREATE TABLE public."Favorite" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "vehicleId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Favorite" OWNER TO hermes_car;

--
-- Name: Inquiry; Type: TABLE; Schema: public; Owner: hermes_car
--

CREATE TABLE public."Inquiry" (
    id text NOT NULL,
    "vehicleId" text,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    message text NOT NULL,
    source text DEFAULT 'contact-form'::text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Inquiry" OWNER TO hermes_car;

--
-- Name: JournalEntry; Type: TABLE; Schema: public; Owner: hermes_car
--

CREATE TABLE public."JournalEntry" (
    id text NOT NULL,
    "vehicleId" text,
    slug text NOT NULL,
    title text NOT NULL,
    "contentEn" text,
    "contentAr" text,
    excerpt text,
    "coverImage" text,
    "isPublished" boolean DEFAULT false NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    author text DEFAULT 'Fidelis Auto'::text NOT NULL
);


ALTER TABLE public."JournalEntry" OWNER TO hermes_car;

--
-- Name: ListingRequest; Type: TABLE; Schema: public; Owner: hermes_car
--

CREATE TABLE public."ListingRequest" (
    id text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    year integer NOT NULL,
    make text NOT NULL,
    model text NOT NULL,
    "trim" text,
    mileage integer,
    "exteriorColor" text,
    "interiorColor" text,
    engine text,
    transmission text,
    description text,
    "photoUrls" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text,
    "videoUrls" text,
    city text,
    country text,
    state text,
    "zipCode" text,
    "moderateNotes" text,
    "submissionStatus" text DEFAULT 'pending_review'::text NOT NULL
);


ALTER TABLE public."ListingRequest" OWNER TO hermes_car;

--
-- Name: Message; Type: TABLE; Schema: public; Owner: hermes_car
--

CREATE TABLE public."Message" (
    id text NOT NULL,
    "senderId" text NOT NULL,
    "receiverId" text NOT NULL,
    "conversationId" text NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Message" OWNER TO hermes_car;

--
-- Name: ModerationLog; Type: TABLE; Schema: public; Owner: hermes_car
--

CREATE TABLE public."ModerationLog" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "vehicleId" text,
    "listingRequestId" text,
    "moderatorId" text,
    "targetUserId" text,
    action text NOT NULL,
    notes text,
    "previousStatus" text,
    "newStatus" text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."ModerationLog" OWNER TO hermes_car;

--
-- Name: NewsletterSubscription; Type: TABLE; Schema: public; Owner: hermes_car
--

CREATE TABLE public."NewsletterSubscription" (
    id text NOT NULL,
    email text NOT NULL,
    subscribed boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."NewsletterSubscription" OWNER TO hermes_car;

--
-- Name: Promotion; Type: TABLE; Schema: public; Owner: hermes_car
--

CREATE TABLE public."Promotion" (
    id text NOT NULL,
    "vehicleId" text NOT NULL,
    tier public."PromotionTier" DEFAULT 'FEATURED'::public."PromotionTier" NOT NULL,
    status public."PromotionStatus" DEFAULT 'ACTIVE'::public."PromotionStatus" NOT NULL,
    "isFree" boolean DEFAULT true NOT NULL,
    "priceCents" integer,
    currency text DEFAULT 'USD'::text,
    "startsAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "grantedBy" text,
    "campaignId" text,
    metadata text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Promotion" OWNER TO hermes_car;

--
-- Name: ProvenanceMilestone; Type: TABLE; Schema: public; Owner: hermes_car
--

CREATE TABLE public."ProvenanceMilestone" (
    id text NOT NULL,
    "vehicleId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    title text NOT NULL,
    description text,
    icon text DEFAULT 'purchase'::text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ProvenanceMilestone" OWNER TO hermes_car;

--
-- Name: ServiceListing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ServiceListing" (
    id text NOT NULL,
    "ownerId" text NOT NULL,
    "businessName" text NOT NULL,
    category text NOT NULL,
    description text NOT NULL,
    phone text,
    website text,
    city text,
    country text,
    "isPublished" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ServiceListing" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: hermes_car
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "verificationCode" text,
    "verificationCodeExpiry" timestamp(3) without time zone,
    verified boolean DEFAULT false NOT NULL,
    "emailResendCount" integer DEFAULT 0 NOT NULL,
    phone text,
    "phoneVerificationCode" text,
    "phoneVerificationCodeExpiry" timestamp(3) without time zone,
    "phoneVerified" boolean DEFAULT false NOT NULL,
    city text,
    country text,
    "isActive" boolean DEFAULT true NOT NULL,
    role public."AccountRole" DEFAULT 'BUYER'::public."AccountRole" NOT NULL,
    "firstName" text,
    "lastName" text,
    "whatsappNumber" text,
    "preferredLanguage" text DEFAULT 'en'::text NOT NULL,
    "marketingConsent" boolean DEFAULT false NOT NULL,
    "preferredChannels" text,
    "leadSource" text,
    "customerNotes" text,
    tags text,
    "isDisabled" boolean DEFAULT false NOT NULL,
    "isLocked" boolean DEFAULT false NOT NULL,
    "lockedUntil" timestamp with time zone,
    "lockedReason" text,
    "emailVerifiedAt" timestamp with time zone,
    "passwordResetToken" text,
    "passwordResetExpiry" timestamp with time zone,
    "lastLogin" timestamp with time zone,
    "lastLoginIp" text,
    "loginCount" integer DEFAULT 0 NOT NULL,
    "lastActivityAt" timestamp with time zone
);


ALTER TABLE public."User" OWNER TO hermes_car;

--
-- Name: UserActivity; Type: TABLE; Schema: public; Owner: hermes_car
--

CREATE TABLE public."UserActivity" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text NOT NULL,
    action text NOT NULL,
    details text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."UserActivity" OWNER TO hermes_car;

--
-- Name: UserNote; Type: TABLE; Schema: public; Owner: hermes_car
--

CREATE TABLE public."UserNote" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text NOT NULL,
    "authorId" text,
    content text NOT NULL,
    "isPrivate" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."UserNote" OWNER TO hermes_car;

--
-- Name: Vehicle; Type: TABLE; Schema: public; Owner: hermes_car
--

CREATE TABLE public."Vehicle" (
    id text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    year integer NOT NULL,
    make text NOT NULL,
    model text NOT NULL,
    "trim" text,
    vin text,
    mileage integer,
    "mileageUnit" text DEFAULT 'mi'::text NOT NULL,
    "exteriorColor" text,
    "interiorColor" text,
    engine text,
    transmission text,
    drivetrain text,
    price text,
    status text DEFAULT 'available'::text NOT NULL,
    "descriptionEn" text,
    "descriptionAr" text,
    "storyEn" text,
    "storyAr" text,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "isPublished" boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    category text DEFAULT 'Other'::text NOT NULL,
    "featuredUntil" timestamp(3) without time zone,
    "ownerId" text
);


ALTER TABLE public."Vehicle" OWNER TO hermes_car;

--
-- Name: VehicleImage; Type: TABLE; Schema: public; Owner: hermes_car
--

CREATE TABLE public."VehicleImage" (
    id text NOT NULL,
    "vehicleId" text NOT NULL,
    src text NOT NULL,
    alt text,
    width integer,
    height integer,
    size integer,
    "isPrimary" boolean DEFAULT false NOT NULL,
    category text DEFAULT 'exterior'::text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "exifData" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."VehicleImage" OWNER TO hermes_car;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AuditLog" (id, action, "actorId", "targetId", metadata, "createdAt") FROM stdin;
cmsprb7tz000dsql87nx34jel	LISTING_APPROVED	cmspr9ecz0006bel8apzlurh6	cmspr9ebn0002bel8u5wojl70	{"listingRequestId":"cmsprb7lz000asql8b0x4u3xc","result":"approved"}	2026-08-12 07:17:22.92
cmsprb8do000esql8tsp0366e	DEALER_APPROVED	cmspr9ecz0006bel8apzlurh6	cmspr9ebn0002bel8u5wojl70	{"dealerProfileId":"cmspr9ecg0003bel8l2zfnew9"}	2026-08-12 07:17:23.628
cmsps1g390001ozl898rpno1s	SUPER_ADMIN_BOOTSTRAPPED	\N	cmsps1g280000ozl8fsybflw0	{"source":"user-requested super admin access"}	2026-08-12 07:37:46.677
cmsycuslx000isql89m141kl4	LISTING_APPROVED	cmsfost8t00001fl8c67l72sy	cmsdg9ehs000056l8o6r64gb3	{"listingRequestId":"cmsf9meck00009nl85hx34ret","result":"approved"}	2026-08-18 07:42:37.653
cmsyfxjfp00025kl8unnir6o0	LISTING_APPROVED	cmsfost8t00001fl8c67l72sy	cmsdg9ehs000056l8o6r64gb3	{"listingRequestId":"cmsf9meck00009nl85hx34ret","result":"approved"}	2026-08-18 09:08:44.581
cmsypaxa00000owl85s6y7o1b	SUPER_ADMIN_BOOTSTRAPPED	cmsfost8t00001fl8c67l72sy	cmsfost8t00001fl8c67l72sy	{"email":"admin@fidelisauto.com","action":"updated"}	2026-08-18 13:31:05.592
cmtcl5cro000507l82i1ot7xt	DEALER_APPROVED	cmsdg9ehs000056l8o6r64gb3	cmsdg9ehs000056l8o6r64gb3	{"dealerProfileId":"p4test_dealer_001"}	2026-08-28 06:43:33.732
\.


--
-- Data for Name: AuthSession; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AuthSession" (id, "userId", "tokenHash", "expiresAt", "createdAt", "lastSeenAt") FROM stdin;
cmtblkpqa000007l8o4gs6a2u	cmsdg9ehs000056l8o6r64gb3	20eaa3eabfb8ddef26325def2dd3e6f5b8e12ab37b58ca028bedc3ae73fd955a	2026-09-03 14:07:44.1	2026-08-27 14:07:44.194	2026-08-27 14:07:56.19
cmsyqb5ey00006dl8r5iqg93j	cmsfost8t00001fl8c67l72sy	2d22cc025a223aad91cf94a352b878338ef1fb4bc0ed2afc713f091344d284d7	2026-08-25 13:59:15.745	2026-08-18 13:59:15.754	2026-08-18 13:59:16.026
cmsycr9fd000hsql8tkyzv4ru	cmsfost8t00001fl8c67l72sy	7089e519d7cc84b64c4379eee8b93dfc65440d295c21b1fd2a47c206fa9cfe91	2026-08-25 07:39:52.824	2026-08-18 07:39:52.825	2026-08-18 07:42:37.764
cmsyqgtb80000ywl8xb59irsr	cmsfost8t00001fl8c67l72sy	f6525d697952119466c1552e09c3b3f8919357b5ec367b3adfeaf98e257c9b65	2026-08-25 14:03:39.995	2026-08-18 14:03:40.004	2026-08-18 14:03:40.383
cmtclzwpu000008l85em3y2cv	cmsdg9ehs000056l8o6r64gb3	b21eb8089e940ece2c765481e1f92f32217040bf4fa7f8f9988c1c91acd36721	2026-09-04 07:07:19.252	2026-08-28 07:07:19.266	2026-08-28 07:07:19.97
cmsyfxbf500005kl8xryunw6x	cmsfost8t00001fl8c67l72sy	9b085d4596a955318e8a11f139af86a551270c3a663413375676a3d2986f8dab	2026-08-25 09:08:34.179	2026-08-18 09:08:34.193	2026-08-18 09:08:44.54
cmtbllqug000207l8r0myrxcx	cmsdg9ehs000056l8o6r64gb3	23a4a9d5ab37d821991b1de87110720eedac66fbbf4aac984daa74cb2b67fbc7	2026-09-03 14:08:32.295	2026-08-27 14:08:32.296	2026-08-27 14:08:32.384
cmtcku8rr000007l8vpk1st7u	cmsdg9ehs000056l8o6r64gb3	b0f0abca2bfd78aefcbdb9b705cb445dce28b744d3828822d9e122507d97460d	2026-09-04 06:34:55.274	2026-08-28 06:34:55.335	2026-08-28 06:34:55.335
cmsyqo9am0000d6l8r493uvjy	cmsfost8t00001fl8c67l72sy	25cb12f54c716c5b1101599cfcde62c8fb41409d645c2c8345310539c8f0ff3f	2026-08-25 14:09:27.302	2026-08-18 14:09:27.31	2026-08-18 14:09:27.973
cmtcl0xuo000107l8jxwoxfzj	cmsdg9ehs000056l8o6r64gb3	7c53bb2c4d29e94bd8e3dea452c0e9afedba87dcf817bca3e625846b63f1b57d	2026-09-04 06:40:07.776	2026-08-28 06:40:07.777	2026-08-28 06:40:07.777
cmtcl1u1d000207l8p8yc705a	cmsdg9ehs000056l8o6r64gb3	0197346571305dce78dd0db430e7dbbaf4e3408d33bacaebe52c7b3a1add9b5b	2026-09-04 06:40:49.489	2026-08-28 06:40:49.489	2026-08-28 06:40:49.68
cmsypb77z0001owl8x9p7i6nt	cmsfost8t00001fl8c67l72sy	0ee5fdeb7a34c9d7fda365b6f3b7c58320c0b3f2d5fecf55567b6411be295a52	2026-08-25 13:31:18.475	2026-08-18 13:31:18.479	2026-08-18 13:31:19.765
cmtaobkw7000007l8z1ryn0kw	cmsfost8t00001fl8c67l72sy	e818b7a2cf85f27fbc9ba9e20d6e4cfc6dbde8842e1dceb79988b37fbff40697	2026-09-02 22:36:50.605	2026-08-26 22:36:50.695	2026-08-26 22:36:50.695
cmsps1oz6000fsql8kxodd7p2	cmsps1g280000ozl8fsybflw0	1fe92087850fe789b50e1cb3c98bea939fd50395946f9859944377f7ad6e2ad0	2026-08-19 07:37:58.194	2026-08-12 07:37:58.195	2026-08-12 07:37:58.263
cmsypogs200005fl8tfy6gvqk	cmsfost8t00001fl8c67l72sy	d94abf967a8af256dff642a9028c09a484b2ed606330c9cc0793cf5dc30d7b50	2026-08-25 13:41:37.374	2026-08-18 13:41:37.394	2026-08-18 13:43:06.893
cmt1nes6d0002t8l80lbc1brf	cmt1nenj90000t8l8eyq7f5nf	62cf72048eb10bcad0bb4d6ff2a6311772e1b48efc962b2c2167a6228289ef00	2026-08-27 15:01:24.899	2026-08-20 15:01:24.901	2026-08-20 15:01:24.901
cmt1nez4l0003t8l8vymoh5vn	cmt1nenj90000t8l8eyq7f5nf	c0f027e868c12edd0004455b0f5becefe226b689814a9f523e32f385cde64a36	2026-08-27 15:01:33.908	2026-08-20 15:01:33.909	2026-08-20 15:01:33.909
cmt1nqm6s0007t8l806fbwgzc	cmt1nqez70005t8l8oth71yqx	0cccb80cab32183205604452f73aa231a22de3851ed58a25eb0b1752e4c2a302	2026-08-27 15:10:37.012	2026-08-20 15:10:37.012	2026-08-20 15:10:37.012
cmt1nqmpw0008t8l8jrdrz7rs	cmt1nqez70005t8l8oth71yqx	9155925d6c4f5c4fb9d62d0038f719626083344bb8c4bdf8ea515d9cb45f5aa2	2026-08-27 15:10:37.7	2026-08-20 15:10:37.7	2026-08-20 15:10:37.7
cmt1o5h3t000at8l8dcnsej7l	cmsfost8t00001fl8c67l72sy	ce9a5241643a3ebac1b8faec00142c9a86ed0ce8ac4381ae8201d1a46ce89869	2026-08-27 15:22:10.264	2026-08-20 15:22:10.265	2026-08-20 15:22:10.265
cmt1o5hnb000ct8l8jbawqg9y	cmsfost8t00001fl8c67l72sy	2226c952ef3cf2074b9a3b36ce6de48b1b406d11beebbd4006256a9f314d202c	2026-08-27 15:22:10.967	2026-08-20 15:22:10.967	2026-08-20 15:22:20.081
cmt1o6ltj000et8l8ndwurjpk	cmsfost8t00001fl8c67l72sy	af295329eb4b9364e48f0b15b9a0ad30f93e0a40830cb34b290c63f6a1d39168	2026-08-27 15:23:03.03	2026-08-20 15:23:03.031	2026-08-20 15:23:03.84
cmsypfkm80000qtl8zxndtkd9	cmsfost8t00001fl8c67l72sy	979e814a6e9d82d5fa6c752c36541647ad1e459baf968cf88f38c75a977cac3c	2026-08-25 13:34:42.456	2026-08-18 13:34:42.464	2026-08-18 13:34:54.937
cmt1o6vc2000gt8l8w24ftd94	cmsfost8t00001fl8c67l72sy	d0d0b4c883965be25959cac722f6ce449cb6ec75cc3ab9549c1a2068017becd9	2026-08-27 15:23:15.362	2026-08-20 15:23:15.363	2026-08-20 15:23:15.88
cmt1tuodr0000o2l8olveaw8n	cmsdg9ehs000056l8o6r64gb3	4a943bd0c6795ec7bd14d2d814f49d66ed9184a563cf1e6e33e7e1b4be58c4e0	2026-08-27 18:01:44.169	2026-08-20 18:01:44.175	2026-08-20 18:01:44.296
cmsypvca60000wwl84g2hpvoy	cmsfost8t00001fl8c67l72sy	4c503debb415b70d28339549f804314d06e5d3c85f86db671e07548416c90a72	2026-08-25 13:46:58.149	2026-08-18 13:46:58.158	2026-08-18 13:47:30.214
cmtaobx0j000207l8ar93hdqd	cmsfost8t00001fl8c67l72sy	b700bfde829e4a1abe8c6db6f9dc7f88173841b829660408b94e71c0632e230a	2026-09-02 22:37:06.402	2026-08-26 22:37:06.403	2026-08-26 22:37:07.811
cmtaobpgk000107l8zmkr65t0	cmsdg9ehs000056l8o6r64gb3	f0564a6935c7f80242f644282b89f038c2663efdb3e04e639dc39db7d196a225	2026-09-02 22:36:56.611	2026-08-26 22:36:56.612	2026-08-26 22:37:27.1
cmtcmb2hv000508l8dx762sls	cmsdg9ehs000056l8o6r64gb3	cb2c2798e2998a2f7c90e21b2327035ed217b510632ff9eb44c36ae43ed91148	2026-09-04 07:15:59.97	2026-08-28 07:15:59.971	2026-08-28 07:16:04.47
cmtcl2zb0000307l8ayazntjy	cmsdg9ehs000056l8o6r64gb3	119b4d7b1af1c660bc332577c6cec1074be0b2fdfde827c9335ea6dc998360dd	2026-09-04 06:41:42.971	2026-08-28 06:41:42.972	2026-08-28 06:41:51.774
cmtcm2doe000108l8h4sy81cw	cmsdg9ehs000056l8o6r64gb3	69d0ca99767dc365ff588d3740dc5bf3d0fa9ae7b1fc4dbb994d9157668c1f3e	2026-09-04 07:09:14.558	2026-08-28 07:09:14.558	2026-08-28 07:09:24.473
cmtcl5133000407l8jvag2ndu	cmsdg9ehs000056l8o6r64gb3	0738b96545d6ab57470750d72221478ec35ad4b265fee6ad86edf7bb86c2389b	2026-09-04 06:43:18.59	2026-08-28 06:43:18.591	2026-08-28 06:43:56.476
\.


--
-- Data for Name: Conversation; Type: TABLE DATA; Schema: public; Owner: hermes_car
--

COPY public."Conversation" (id, "participant1Id", "participant2Id", "lastMessageAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: Dealer; Type: TABLE DATA; Schema: public; Owner: hermes_car
--

COPY public."Dealer" (id, "dealershipName", "contactPerson", email, phone, address, country, city, description, website, "logoUrl", status, notes, "createdAt", "updatedAt") FROM stdin;
cmsfost9g00031fl8nh4ykw3o	Fidelis Auto Gallery	Test Dealer	dealer@fidelisauto.com	+1-555-0100	123 Luxury Lane, Beverly Hills	United States	Beverly Hills	Premium dealership specializing in classic and exotic automobiles.	https://fidelisauto.com	\N	approved	\N	2026-08-05 06:09:23.236	2026-08-05 06:09:23.236
\.


--
-- Data for Name: DealerProfile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DealerProfile" (id, "ownerId", "businessName", "contactPerson", email, phone, address, city, country, description, website, "logoUrl", "approvalStatus", "approvedAt", "approvedById", "moderationNotes", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Document; Type: TABLE DATA; Schema: public; Owner: hermes_car
--

COPY public."Document" (id, "vehicleId", title, description, "filePath", "fileType", "fileSize", category, "createdAt") FROM stdin;
\.


--
-- Data for Name: Favorite; Type: TABLE DATA; Schema: public; Owner: hermes_car
--

COPY public."Favorite" (id, "userId", "vehicleId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Inquiry; Type: TABLE DATA; Schema: public; Owner: hermes_car
--

COPY public."Inquiry" (id, "vehicleId", name, email, phone, message, source, "isRead", "createdAt") FROM stdin;
\.


--
-- Data for Name: JournalEntry; Type: TABLE DATA; Schema: public; Owner: hermes_car
--

COPY public."JournalEntry" (id, "vehicleId", slug, title, "contentEn", "contentAr", excerpt, "coverImage", "isPublished", "publishedAt", "createdAt", "updatedAt", author) FROM stdin;
cmselxf620000fsl8ire5h8jr	\N	how-to-inspect-a-used-porsche-911	How to Inspect a Used Porsche 911	Buying a used Porsche 911 is exciting, but the thrill of the hunt can blur your judgment. A disciplined inspection is your best protection against a costly surprise. Here is the checklist we use at Fidelis Auto whenever we evaluate a 911.\n\nStart with the paperwork. A complete service history tells you more than almost any single component. Look for consistent oil changes, and confirm the timing chain or IMS-related work was done on the generations that need it. Matching VIN numbers on the body, engine, and transmission are a strong sign of originality.\n\nNext, the body. Run a paint gauge over the panels and check the seams for signs of repair. 911s are unibody cars, so a bent or carbon-filled chassis is a serious red flag. Look for rust in the sills, the kidney bowls, and around the battery tray — these are the classic trouble spots.\n\nThen the engine. A cold start is the best test. Listen for a steady idle, no metallic tapping, and no smoke on a warm up. The flat-six is durable, but it is sensitive to oil-neglect. Pull the dipstick and check the oil condition; burned, gritty oil is a warning sign.\n\nDrive the car. The 911's steering is communicative and direct. Any clunking over bumps, wandering at speed, or odd vibrations could point to worn suspension bushings or a subframe issue. Brake the car hard from 60 mph and make sure it pulls straight.\n\nFinally, lift the car and inspect the underside. Oil leaks, cracked CV boots, and corroded brake lines are all magnified by the cost of a 911's labor. In total, budget for a pre-purchase inspection by an independent specialist. It is a few hundred dollars that can save you tens of thousands.	\N	A practical, hands-on checklist for evaluating a used 911 before you buy — from the flat-six to the body panels.	\N	t	2026-05-12 09:00:00	2026-08-04 12:01:13.226	2026-08-04 12:01:13.226	Fidelis Auto
cmselxf710001fsl8iscuntzs	\N	mercedes-benz-pagoda-what-to-know-before-buying	Mercedes-Benz Pagoda: What to Know Before Buying	The Mercedes-Benz 230SL, 250SL, and 280SL — known collectively as the W113 Pagoda for its concave hardtop — have earned a devoted following for good reason. They are beautiful, robust, and deeply satisfying to drive. But before you buy, a few things are worth knowing.\n\nFirst, the three generations differ in more than displacement. The 230SL (1963–1967) is the most nimble and now the most collectible. The 250SL (1967–1968) was a short-lived transition car. The 280SL (1968–1971) has the most powerful engine and the most comfort features, making it the best daily driver of the three.\n\nRust is the Pagoda's greatest enemy. The floor pans, the spare wheel well, the rocker panels, and the area around the rear shock mounts all corrode. Pay close attention to the front fenders and the area where the hardtop seals. A rusty Pagoda is expensive to make right, so factor restoration cost into your offer.\n\nThe engine is generally reliable. The 2.3 and 2.8 litre straight-sixes are tough, but check the injection pump and the fuel system for leaks, and confirm the cooling system has been properly maintained. The automatic transmission is smooth but requires a specialist for service.\n\nInterior trim is another factor. Original wood, gauges, and upholstery are increasingly hard to source, so a well-preserved cabin adds real value. Finally, drive the car. The Pagoda rewards a relaxed, confident driver. It is not a sharp sports car — it is a grand tourer that feels wonderful over a long journey.\n\nIf you buy one, maintain it through a Mercedes specialist who knows the W113. A well-sorted Pagoda is a joy for life.	\N	The W113 Pagoda is one of the most elegant roadsters ever built. Here is what buyers should know before taking the plunge.	\N	t	2026-05-28 09:00:00	2026-08-04 12:01:13.261	2026-08-04 12:01:13.261	Fidelis Auto
cmselxf750002fsl8g57ccyop	\N	complete-guide-to-vehicle-provenance-checks	The Complete Guide to Vehicle Provenance Checks	Provenance is the documented history of a vehicle — who owned it, where it lived, how it was maintained, and whether it has ever been damaged or restored. For collectors, provenance can be worth more than the car itself. Here is how to check it properly.\n\nBegin with the VIN. The vehicle identification number is the backbone of any history. Verify it against the registration documents, the title, and the stamped locations on the chassis and engine. A mismatch is a serious concern that should be resolved before any money changes hands.\n\nNext, look for ownership records. Original purchase documents, service booklets, and titled history traces a chain of ownership. Gaps are not always a problem, but long unexplained gaps merit a question. Ask the seller directly about where the car was kept and how it was used.\n\nCheck the service records in detail. A complete, dated history with invoices and stamps is the strongest evidence of a well-maintained car. Look for consistent, timely maintenance and any warranty or recall work that was performed.\n\nFor imported or restored cars, demand documentation. Import certificates, customs forms, and restoration photographs with dated invoices build a credible file. If the seller cannot produce them, treat the claim with caution.\n\nFinally, run a background check. In many markets, you can pull a history report that flags odometer rollbacks, total-loss write-offs, and outstanding finance. Combine all of this with an independent inspection, and you will have a provenance file you can trust.\n\nAt Fidelis Auto, we treat provenance as part of the car itself. We document every vehicle we present so you can buy with confidence.	\N	Provenance is the difference between a great car and a great story. Here is how to verify a vehicle's history properly.	\N	t	2026-06-09 09:00:00	2026-08-04 12:01:13.265	2026-08-04 12:01:13.265	Fidelis Auto
cmselxf770003fsl88bwcfg1j	\N	5-essential-tools-every-car-enthusiast-should-own	5 Essential Tools Every Car Enthusiast Should Own	You do not need an industrial workshop to work on your own car. A handful of well-chosen tools will get you through the vast majority of enthusiast jobs — and save you a fortune in labour in the process. Here are the five we would not be without.\n\n1. A quality socket set. Buy a 3/8-inch drive set with both metric and SAE sockets, a ratchet, and a breaker bar. Add a set of extensions and a universal joint. This single kit handles most fasteners on most cars and is the foundation of everything else.\n\n2. A torque wrench. Over-tightening is as damaging as under-tightening. A torque wrench lets you set wheel bolts, suspension hardware, and engine fasteners to the manufacturer's specification. It is essential for any job where you are removing and refitting critical parts.\n\n3. A good jack and axle stands. Never just crawl under a car supported by a jack alone. A proper floor jack paired with a pair of rated axle stands makes wheel, brake, and suspension work safe and comfortable. Buy stands with a generous weight rating.\n\n4. A multimeter. Electrical faults are the most common source of frustration in modern cars. A basic digital multimeter lets you test battery voltage, check fuses, trace wiring, and diagnose sensors. You will wonder how you managed without it.\n\n5. A code reader. A simple OBD-II scanner reads and clears engine fault codes in seconds. Paired with a phone app, it turns baffling warning lights into a clear diagnosis. It pays for itself the first time it saves you a trip to the shop.\n\nWith these five tools, a set of screwdrivers, and a few basics, you are equipped for most maintenance and many repairs. Start small, work safely, and enjoy the process.	\N	You do not need a full workshop to enjoy your car. These five tools cover the vast majority of enthusiast jobs.	\N	t	2026-06-21 09:00:00	2026-08-04 12:01:13.267	2026-08-04 12:01:13.267	Fidelis Auto
cmselxf790004fsl83wnxwyi6	\N	road-trip-cairo-to-the-red-sea	Road Trip: Cairo to the Red Sea in a Convertible	There is a stretch of road that every Egyptian car enthusiast knows: the long, straight run from Cairo east to the Red Sea coast. In a convertible, with the roof down and the desert on either side, it becomes something more than a drive — it is an escape.\n\nWe left Cairo early, before the city fully woke, and headed down the Suez Road. The sky was a pale gold, and the air still carried the cool of the night. With the top down, the morning was a blessing. The first hour is the busiest, as trucks and commuters share the highway, so we kept a steady pace and let the convertible do the talking.\n\nPast Suez, the road opens up. The desert rolls out in every direction, empty and enormous, and the horizon becomes a clean line of heat shimmer. The engine settled into a relaxed cruise, and the wind filled the cabin. This is the heart of the trip — hours of open road, the radio tuned low, and nothing but time.\n\nWe stopped at a roadside café for strong tea and watched the desert stretch away. The sun climbed, and the light grew brilliant and white. Convertible driving at midday is an art: we kept the speed up to keep the breeze moving, and the cabin stayed comfortable even as the heat rose.\n\nBy late afternoon the mountains of the Red Sea range appeared, and the road began to twist toward the coast. The colours changed — ochre, then deep red rock, then the first glimpse of brilliant blue water. We pulled into the resort town as the sun turned the sea to gold.\n\nThe drive back is a mirror image, but the memory is not. Six hours of open road, a car that loved every mile, and a coastline that rewards the journey. If you own a convertible, this is the run to make.	\N	Six hours of open road, desert light, and a coastal payoff. A first-hand account of the classic Cairo to Red Sea run.	\N	t	2026-07-03 09:00:00	2026-08-04 12:01:13.269	2026-08-04 12:01:13.269	Fidelis Auto
cmselxf7c0005fsl8veokwz0v	\N	understanding-vehicle-import-rules-egypt-and-gcc	Understanding Vehicle Import Rules in Egypt and the GCC	Importing a vehicle into Egypt or the Gulf Cooperation Council (GCC) countries is a rewarding but rule-heavy process. Understanding the regulations before you buy a car abroad will save you time, money, and frustration. Here is a practical overview.\n\nIn Egypt, the import rules for personal vehicles are defined by age and engine size. The government generally restricts or heavily taxes imports of older cars, and customs duties rise steeply with engine capacity. Importers must be Egyptian nationals or residents with the proper documentation, including a valid import license, proof of ownership, and the original bill of sale. All vehicles must pass customs inspection and comply with national emission and safety standards.\n\nIn the GCC, the rules are more permissive but still strict. Each country — the UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, and Oman — has its own import code, but common requirements apply. The vehicle must not be older than the specified age limit (often five years), must meet the GCC's emission and safety standards, and must be accompanied by the original title, invoices, and a certificate of origin. A good-condition inspection at the port is mandatory.\n\nThe GCC Spec standard is the key phrase to know. GCC-spec vehicles are built or adapted for the region's climate and fuel, and they are the easiest to register. Cars imported from other markets may require modification to the air conditioning, cooling system, and lighting before they pass inspection.\n\nAcross the region, the golden rule is the same: get every document in order, and confirm the vehicle's age and specifications against the destination country's rules before you commit. The right preparation turns a complex import into a smooth one.	\N	Importing a car into Egypt or the GCC involves specific rules, taxes, and paperwork. Here is what you need to know.	\N	t	2026-07-14 09:00:00	2026-08-04 12:01:13.272	2026-08-04 12:01:13.272	Fidelis Auto
cmselxf7f0006fsl82lgl3v9h	\N	how-to-sell-your-car-online-step-by-step	How to Sell Your Car Online: A Step-by-Step Guide	Selling your car online no longer means weeks of waiting and haggling. With the right approach, you can reach serious buyers and close a fair deal quickly. Here is a step-by-step guide.\n\nStep 1: Prepare the car. A clean car sells faster and for more money. Wash it inside and out, clear the cabin of personal items, and address any small, cheap-to-fix issues like a burnt-out bulb or a cracked mirror. A full service and oil change adds confidence and value.\n\nStep 2: Gather your paperwork. Have the title, registration, service history, and any repair invoices ready. Photograph every document. A complete file makes your car look credible and keeps the buyer's questions to a minimum.\n\nStep 3: Take great photos. Shoot in daylight, in a clean location, and capture all angles: front, rear, both sides, interior, engine bay, and wheels. Include close-ups of the odometer and any notable features. A dozen good photos outperform fifty blurry ones.\n\nStep 4: Write an honest listing. Describe the car accurately — the condition, the maintenance history, any known issues, and the reason for selling. Being upfront about flaws builds trust and reduces wasted viewings. Price it realistically by researching comparable cars.\n\nStep 5: Publish and respond. List on the major platforms and respond to enquiries promptly. A quick, courteous reply is often the difference between a sale and a missed opportunity.\n\nStep 6: Meet safely and complete the transfer. Arrange viewings in a safe public place, bring a friend, and complete the paperwork and payment securely. On a platform like Fidelis Auto, the process is handled cleanly and transparently.\n\nFollow these steps and you will sell your car faster, for a better price, and with far less stress.	\N	Selling your car online is easier than ever — if you do it right. Here is a step-by-step guide to a faster, fairer sale.	\N	t	2026-07-24 09:00:00	2026-08-04 12:01:13.275	2026-08-04 12:01:13.275	Fidelis Auto
cmselxf7k0007fsl8z39ur3qp	\N	best-weekend-cars-under-50000	The Best Weekend Cars Under $50,000	A weekend car is not about practicality — it is about joy. And you do not need a fortune to have one. Under $50,000, there has never been a better selection of cars that deliver pure driving pleasure. Here are our favourites.\n\nThe Mazda MX-5 is the perennial answer. Rear-wheel drive, a light body, and a near-perfect balance make it the most fun car you can buy for the money. It is affordable, reliable, and endlessly enjoyable whether on a twisty road or a coastal cruise.\n\nIf you want rear-seat practicality with real pace, the Ford Mustang GT is hard to beat. A naturally aspirated V8, a manual gearbox, and a soundtrack that justifies the whole purchase — it is a muscle car that also handles its business in the corners.\n\nFor refinement, the BMW M240i is a planted, fast, and comfortable gran tourer. Its turbocharged six-cylinder hauls it to 60 mph in well under five seconds, yet it remains a relaxed car to drive every day. It is the sensible enthusiast's choice.\n\nThe Toyota GR86 and its Subaru BRZ sibling are the purest handling cars in the class. Light, low, and wonderfully communicative, they reward a skilled driver and are cheap to maintain. They are proof that horsepower is not everything.\n\nFinally, the Porsche Boxster — even an older one — delivers the mid-engined balance and badge prestige that nothing else at this price matches. A well-maintained 987-generation Boxster is an incredible value.\n\nWhichever you choose, buy the best example you can afford, keep it maintained, and drive it. A weekend car is a promise to yourself — and the open road is waiting.	\N	You do not need a fortune to have a brilliant weekend car. Here are the best enthusiast picks under $50,000.	\N	t	2026-08-01 09:00:00	2026-08-04 12:01:13.28	2026-08-04 12:01:13.28	Fidelis Auto
\.


--
-- Data for Name: ListingRequest; Type: TABLE DATA; Schema: public; Owner: hermes_car
--

COPY public."ListingRequest" (id, status, name, email, phone, year, make, model, "trim", mileage, "exteriorColor", "interiorColor", engine, transmission, description, "photoUrls", notes, "createdAt", "updatedAt", "userId", "videoUrls", city, country, state, "zipCode", "moderateNotes", "submissionStatus") FROM stdin;
cmsf9meck00009nl85hx34ret	approved	Qadir Baqi	qadirbaqi@gmail.com	+201110008165	1956	Volkswagen	Beetle	\N	\N	Red	Beige	1.2	Manual	Very nice car	\N	\N	2026-08-04 23:04:29.732	2026-08-18 09:08:44.564	cmsdg9ehs000056l8o6r64gb3	\N	5th Settlement	Egypt	Cairo	11865	\N	pending_review
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: hermes_car
--

COPY public."Message" (id, "senderId", "receiverId", "conversationId", subject, content, read, "createdAt") FROM stdin;
\.


--
-- Data for Name: ModerationLog; Type: TABLE DATA; Schema: public; Owner: hermes_car
--

COPY public."ModerationLog" (id, "vehicleId", "listingRequestId", "moderatorId", "targetUserId", action, notes, "previousStatus", "newStatus", "createdAt") FROM stdin;
\.


--
-- Data for Name: NewsletterSubscription; Type: TABLE DATA; Schema: public; Owner: hermes_car
--

COPY public."NewsletterSubscription" (id, email, subscribed, "createdAt") FROM stdin;
cmseprfk30000eal8o998983w	test@test.com	t	2026-08-04 13:48:32.259
\.


--
-- Data for Name: Promotion; Type: TABLE DATA; Schema: public; Owner: hermes_car
--

COPY public."Promotion" (id, "vehicleId", tier, status, "isFree", "priceCents", currency, "startsAt", "expiresAt", "grantedBy", "campaignId", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProvenanceMilestone; Type: TABLE DATA; Schema: public; Owner: hermes_car
--

COPY public."ProvenanceMilestone" (id, "vehicleId", date, title, description, icon, "sortOrder", "createdAt") FROM stdin;
\.


--
-- Data for Name: ServiceListing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ServiceListing" (id, "ownerId", "businessName", category, description, phone, website, city, country, "isPublished", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: hermes_car
--

COPY public."User" (id, name, email, "passwordHash", "createdAt", "updatedAt", "verificationCode", "verificationCodeExpiry", verified, "emailResendCount", phone, "phoneVerificationCode", "phoneVerificationCodeExpiry", "phoneVerified", city, country, "isActive", role, "firstName", "lastName", "whatsappNumber", "preferredLanguage", "marketingConsent", "preferredChannels", "leadSource", "customerNotes", tags, "isDisabled", "isLocked", "lockedUntil", "lockedReason", "emailVerifiedAt", "passwordResetToken", "passwordResetExpiry", "lastLogin", "lastLoginIp", "loginCount", "lastActivityAt") FROM stdin;
cmsfost9300011fl8ofimknqp	Test Dealer	dealer@fidelisauto.com	$2b$10$JnOauLQctaRt1ghUpZ2i.uYfP1OPAvI1.yWvqrBOyWY0MA7G3uxMu	2026-08-05 06:09:23.224	2026-08-05 06:09:23.224	\N	\N	t	0	\N	\N	\N	f	\N	\N	t	DEALER	\N	\N	\N	en	f	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	0	\N
cmsps1g280000ozl8fsybflw0	Super Admin	superadmin@fidelisauto.com	$2b$12$mt0SopTfAa1756OvTMG9bOi9S08WnL62OWv6pJyJEpKNQyApphnJO	2026-08-12 07:37:46.64	2026-08-12 07:37:46.64	\N	\N	t	0	\N	\N	\N	f	\N	\N	t	SUPER_ADMIN	\N	\N	\N	en	f	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	0	\N
cmsyqgtxk0002ywl8hzuq9r39	CRM Test	test-crm5@test.com	$2b$12$ODu1paBqwE7C/0bY1fjjV.VSWMRv7iHOukUViP39thXLXab/nrLqG	2026-08-18 14:03:40.808	2026-08-18 14:03:40.808	785078	2026-08-18 14:13:40.804	f	0	+20123456789	\N	\N	f	Cairo	Egypt	t	SELLER	CRM	Test	\N	en	t	\N	Google Search	\N	\N	f	f	\N	\N	\N	\N	\N	2026-08-18 14:03:40.804+00	\N	1	2026-08-18 14:03:40.804+00
cmsyqgub60004ywl8609tm8od	CRM Test	test-crm6@test.com	$2b$12$CeTuvTqnQ7EdDL6voYDIXOvbyfDO/9Flhi9eThvMwbF9tylmbZWkK	2026-08-18 14:03:41.298	2026-08-18 14:03:41.298	319414	2026-08-18 14:13:41.295	f	0	+20123456789	\N	\N	f	Cairo	Egypt	t	SELLER	CRM	Test	\N	en	f	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	2026-08-18 14:03:41.295+00	\N	1	2026-08-18 14:03:41.295+00
cmsfost8t00001fl8c67l72sy	Fidelis Admin	admin@fidelisauto.com	$2b$12$ziHEfaaPHJnocDcwQgCBmuZ1FPOu.U9TkoY4gNR2lF2V.MAquFtUa	2026-08-05 06:09:23.213	2026-08-20 15:23:15.367	\N	\N	t	0	\N	\N	\N	f	\N	\N	t	SUPER_ADMIN	\N	\N	\N	en	f	\N	\N	\N	\N	f	f	\N	\N	2026-08-18 13:31:05.574+00	\N	\N	2026-08-20 15:23:15.362+00	102.43.228.253	11	2026-08-20 15:23:15.362+00
cmt1jx60h0000jdl82lya5av2	Rania Thabet	raniathabet1100@gmail.com	$2b$12$9VBCTfYxVx9Q9fAhZzZqzu3o4xITWXOYyg3mRNiW3ETu.A8BBxI1C	2026-08-20 13:23:44.177	2026-08-20 13:25:19.376	877601	2026-08-20 13:35:19.36	f	0	+201128068386	\N	\N	f	Cairo	Egypt	t	SELLER	Rania	Thabet	\N	en	t	["EMAIL"]	GOOGLE_SEARCH	\N	\N	f	f	\N	\N	\N	\N	\N	2026-08-20 13:23:44.142+00	\N	1	2026-08-20 13:23:44.142+00
cmt1msqw10000o6l8kh4azl8k	TestUser Registration	fidelis-test-20260820@temp-mail.org	$2b$12$s3eeEmInihIquEqyJB8osumpKn0WVyCs4DJJNc4Wk1w1yql3De.ji	2026-08-20 14:44:16.801	2026-08-20 14:44:16.801	670408	2026-08-20 14:54:16.793	f	0	+201001234567	\N	\N	f	Cairo	Egypt	t	SELLER	TestUser	Registration	\N	en	t	\N	OTHER	\N	\N	f	f	\N	\N	\N	\N	\N	2026-08-20 14:44:16.793+00	\N	1	2026-08-20 14:44:16.793+00
cmt1n256e0000wul809rzl49j	Email TestTwo	fidelis-email-test-two@temp-mail.org	$2b$12$NzJ0QdrfQ.dFx6OXrfIIg.HJ1iXihrLP7XJjjtDqdqHDqyqQtGLg.	2026-08-20 14:51:35.222	2026-08-20 14:51:35.222	583607	2026-08-20 15:01:35.211	f	0	+201001234567	\N	\N	f	Cairo	Egypt	t	SELLER	Email	TestTwo	\N	en	t	\N	OTHER	\N	\N	f	f	\N	\N	\N	\N	\N	2026-08-20 14:51:35.211+00	\N	1	2026-08-20 14:51:35.211+00
cmt1nd18c0000zcl8wqdbe5xb	Final TestUser	fidelis-final-test@temp-mail.org	$2b$12$lwHaLDL2PYfRVRZBptEFpuFDxdEnd7NxVHh80AzUXXcODoYzkXdoC	2026-08-20 15:00:03.324	2026-08-20 15:00:03.324	460301	2026-08-20 15:10:03.291	f	0	+201001234567	\N	\N	f	Cairo	Egypt	t	SELLER	Final	TestUser	\N	en	t	\N	OTHER	\N	\N	f	f	\N	\N	\N	\N	\N	2026-08-20 15:00:03.293+00	\N	1	2026-08-20 15:00:03.293+00
cmt1nenj90000t8l8eyq7f5nf	Code Test	fidelis-code-test@temp-mail.org	$2b$12$Vzxe3UIAkAKVAgTLwTKNMOUDvWl8VtEvy65IggDSemt0TVca73mYi	2026-08-20 15:01:18.885	2026-08-20 15:01:33.917	\N	\N	t	0	+201001234567	\N	\N	f	Cairo	Egypt	t	SELLER	Code	Test	\N	en	t	\N	OTHER	\N	\N	f	f	\N	\N	\N	\N	\N	2026-08-20 15:01:33.908+00	102.43.228.253	2	2026-08-20 15:01:33.908+00
cmsfost9900021fl8tuxu8djm	Test User	user@fidelisauto.com	$2b$10$QkBkTULDV6IwddfIHLKUfOkPlmrgA3SRZ0wOIKlzVvst7v2yrH3OK	2026-08-05 06:09:23.229	2026-08-18 13:47:30.407	\N	\N	t	0	\N	\N	\N	f	\N	\N	t	BUYER	\N	\N	\N	en	t	\N	\N	VIP lead from Facebook	vip,followup	f	f	\N	\N	\N	e99b5b7f1bf9ebc2a82a54d8d4ae526ec85f9c3a68bcf1a04178bd7dcf47182c	2026-08-20 13:47:30.405+00	\N	\N	0	\N
cmsyqds3e00026dl87y9ui8pn	CRM Test	test-crm3@test.com	$2b$12$JsZkiQbp89odlUmZkr9nr.ARNzkIgdZRCYWfHrbBKydFMtFMKkKo6	2026-08-18 14:01:18.458	2026-08-18 14:01:18.458	750783	2026-08-18 14:11:18.455	f	0	+20123456789	\N	\N	f	Cairo	Egypt	t	SELLER	CRM	Test	\N	en	t	\N	Google Search	\N	\N	f	f	\N	\N	\N	\N	\N	2026-08-18 14:01:18.455+00	\N	1	2026-08-18 14:01:18.455+00
cmsdg9ehs000056l8o6r64gb3	Qadir Baqi	aeeg.education@gmail.com	$2b$12$.W8Vgjv4kf1zUalJKfc74eQCNkMUrCw20.71NsRtku1LCMZaBL2DO	2026-08-03 16:34:48.352	2026-08-20 21:19:28.397	\N	\N	t	1	+201060618899	458021	2026-08-03 16:49:09.374	f	\N	\N	t	ADMINISTRATOR	\N	\N	\N	en	f	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	2026-08-20 21:19:28.372+00	102.43.228.253	3	2026-08-20 21:19:28.372+00
cmt1nqez70005t8l8oth71yqx	Admin User	newadmin@fidelisauto.com	$2b$12$2XciEvYyADL83jmGBXSUyuHRt56Fy9pSFliVYAf5IAxqtJOgon8K.	2026-08-20 15:10:27.667	2026-08-20 15:10:37.703	\N	\N	t	0	+201001234567	\N	\N	f	Cairo	Egypt	t	SUPER_ADMIN	Admin	User	\N	en	t	\N	OTHER	\N	\N	f	f	\N	\N	\N	\N	\N	2026-08-20 15:10:37.7+00	102.43.228.253	2	2026-08-20 15:10:37.7+00
cmtcqiztt000007l8gxq3ee9n	Auto ApproveTest	autoappr-test-1787908442@temp-mail.org	$2b$12$YudS1SOWBfLV.1ZOm.lzp.XdLEls2yPPmGb7Hd7lXTlQrXSSWNAMi	2026-08-28 09:14:08.225	2026-08-28 09:14:08.225	242895	2026-08-28 09:24:08.217	f	0	+201006455665	\N	\N	f	Cairo	Egypt	t	SELLER	Auto	ApproveTest	\N	en	f	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	0	\N
cmtcqjif4000107l8eahpdyud	Auto ApproveTest	autoappr-test-1787908468@temp-mail.org	$2b$12$p/0wVyJ3yMjPlAHQOs4Gd.nNlAvrRrnvkkVNZiCeAjnE7uG6pce.a	2026-08-28 09:14:32.321	2026-08-28 09:14:32.321	783353	2026-08-28 09:24:32.32	f	0	+201024533363	\N	\N	f	Cairo	Egypt	t	SELLER	Auto	ApproveTest	\N	en	f	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	0	\N
\.


--
-- Data for Name: UserActivity; Type: TABLE DATA; Schema: public; Owner: hermes_car
--

COPY public."UserActivity" (id, "userId", action, details, "ipAddress", "userAgent", "createdAt") FROM stdin;
cmsypb78j0002owl8qho6qnwo	cmsfost8t00001fl8c67l72sy	login	{"loginCount":1}	191.218.165.228	curl/8.5.0	2026-08-18 13:31:18.499+00
cmsypfkmn0001qtl8k6fxvd58	cmsfost8t00001fl8c67l72sy	login	{"loginCount":2}	102.43.228.253	curl/8.5.0	2026-08-18 13:34:42.479+00
cmsypogsu00015fl8ro2gmeh4	cmsfost8t00001fl8c67l72sy	login	{"loginCount":3}	191.218.165.228	curl/8.5.0	2026-08-18 13:41:37.422+00
cmsypvcal0001wwl8kxwt1nl3	cmsfost8t00001fl8c67l72sy	login	{"loginCount":4}	191.218.165.228	curl/8.5.0	2026-08-18 13:46:58.174+00
cmsyqb5fp00016dl8ptp0qwyl	cmsfost8t00001fl8c67l72sy	login	{"loginCount":5}	191.218.165.228	curl/8.5.0	2026-08-18 13:59:15.781+00
cmsyqds3j00036dl8sawoty8z	cmsyqds3e00026dl87y9ui8pn	registration	{"leadSource":"Google Search","preferredLanguage":"en","marketingConsent":true,"preferredChannels":null}	191.218.165.228	curl/8.5.0	2026-08-18 14:01:18.463+00
cmsyqgtbt0001ywl8p1pd0bvn	cmsfost8t00001fl8c67l72sy	login	{"loginCount":6}	191.218.165.228	curl/8.5.0	2026-08-18 14:03:40.025+00
cmsyqgtxs0003ywl8kmakbw15	cmsyqgtxk0002ywl8hzuq9r39	registration	{"leadSource":"Google Search","preferredLanguage":"en","marketingConsent":true,"preferredChannels":null}	191.218.165.228	curl/8.5.0	2026-08-18 14:03:40.816+00
cmsyqgubb0005ywl8slx1jn02	cmsyqgub60004ywl8609tm8od	registration	{"leadSource":null,"preferredLanguage":"en","marketingConsent":false,"preferredChannels":null}	191.218.165.228	curl/8.5.0	2026-08-18 14:03:41.303+00
cmsyqo9b80001d6l8s9ax9vpo	cmsfost8t00001fl8c67l72sy	login	{"loginCount":7}	191.218.165.228	curl/8.5.0	2026-08-18 14:09:27.332+00
cmt1jx6160001jdl8uurnru3r	cmt1jx60h0000jdl82lya5av2	registration	{"leadSource":"GOOGLE_SEARCH","preferredLanguage":"en","marketingConsent":true,"preferredChannels":["EMAIL"]}	102.43.228.253	Mozilla/5.0 (X11; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	2026-08-20 13:23:44.202+00
cmt1k0jkk0003jdl8utwlnp41	cmsdg9ehs000056l8o6r64gb3	login	{"loginCount":1}	102.43.228.253	Mozilla/5.0 (X11; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	2026-08-20 13:26:21.716+00
cmt1msqw80001o6l8csa28loc	cmt1msqw10000o6l8kh4azl8k	registration	{"leadSource":"OTHER","preferredLanguage":"en","marketingConsent":true,"preferredChannels":null}	102.43.228.253	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/151.0.0.0 Safari/537.36	2026-08-20 14:44:16.808+00
cmt1n256s0001wul8lo0iaqj5	cmt1n256e0000wul809rzl49j	registration	{"leadSource":"OTHER","preferredLanguage":"en","marketingConsent":true,"preferredChannels":null}	102.43.228.253	curl/8.5.0	2026-08-20 14:51:35.236+00
cmt1nd1960001zcl80to23po3	cmt1nd18c0000zcl8wqdbe5xb	registration	{"leadSource":"OTHER","preferredLanguage":"en","marketingConsent":true,"preferredChannels":null}	102.43.228.253	curl/8.5.0	2026-08-20 15:00:03.354+00
cmt1nenjh0001t8l8l9mkk2rj	cmt1nenj90000t8l8eyq7f5nf	registration	{"leadSource":"OTHER","preferredLanguage":"en","marketingConsent":true,"preferredChannels":null}	102.43.228.253	curl/8.5.0	2026-08-20 15:01:18.894+00
cmt1nez4y0004t8l841refthg	cmt1nenj90000t8l8eyq7f5nf	login	{"loginCount":2}	102.43.228.253	curl/8.5.0	2026-08-20 15:01:33.922+00
cmt1nqezc0006t8l89iru5dhf	cmt1nqez70005t8l8oth71yqx	registration	{"leadSource":"OTHER","preferredLanguage":"en","marketingConsent":true,"preferredChannels":null}	102.43.228.253	curl/8.5.0	2026-08-20 15:10:27.672+00
cmt1nqmq30009t8l8xtoykwk0	cmt1nqez70005t8l8oth71yqx	login	{"loginCount":2}	102.43.228.253	curl/8.5.0	2026-08-20 15:10:37.707+00
cmt1o5h44000bt8l8n5hd4a1c	cmsfost8t00001fl8c67l72sy	login	{"loginCount":8}	102.43.228.253	curl/8.5.0	2026-08-20 15:22:10.276+00
cmt1o5hng000dt8l8koxgk9q2	cmsfost8t00001fl8c67l72sy	login	{"loginCount":9}	102.43.228.253	curl/8.5.0	2026-08-20 15:22:10.972+00
cmt1o6lts000ft8l8jfkjhwg7	cmsfost8t00001fl8c67l72sy	login	{"loginCount":10}	102.43.228.253	curl/8.5.0	2026-08-20 15:23:03.04+00
cmt1o6vca000ht8l8jubcuwc5	cmsfost8t00001fl8c67l72sy	login	{"loginCount":11}	102.43.228.253	curl/8.5.0	2026-08-20 15:23:15.37+00
cmt1tuoeb0001o2l8bxqbx8jf	cmsdg9ehs000056l8o6r64gb3	login	{"loginCount":2}	::1	curl/8.5.0	2026-08-20 18:01:44.195+00
cmt20wyvp0001vhl80c2cu3pb	cmsdg9ehs000056l8o6r64gb3	login	{"loginCount":3}	102.43.228.253	Mozilla/5.0 (X11; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	2026-08-20 21:19:28.405+00
\.


--
-- Data for Name: UserNote; Type: TABLE DATA; Schema: public; Owner: hermes_car
--

COPY public."UserNote" (id, "userId", "authorId", content, "isPrivate", "createdAt", "updatedAt") FROM stdin;
cmsypp4if00035fl8f3iad89v	cmsfost9900021fl8tuxu8djm	cmsfost8t00001fl8c67l72sy	Interested in the 1956 Beetle. Follow up next week.	t	2026-08-18 13:42:08.151+00	2026-08-18 13:42:08.151+00
\.


--
-- Data for Name: Vehicle; Type: TABLE DATA; Schema: public; Owner: hermes_car
--

COPY public."Vehicle" (id, slug, title, year, make, model, "trim", vin, mileage, "mileageUnit", "exteriorColor", "interiorColor", engine, transmission, drivetrain, price, status, "descriptionEn", "descriptionAr", "storyEn", "storyAr", "isFeatured", "isPublished", "order", "createdAt", "updatedAt", category, "featuredUntil", "ownerId") FROM stdin;
\.


--
-- Data for Name: VehicleImage; Type: TABLE DATA; Schema: public; Owner: hermes_car
--

COPY public."VehicleImage" (id, "vehicleId", src, alt, width, height, size, "isPrimary", category, "sortOrder", "exifData", "createdAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
5c737a0d-e485-472c-8c19-101622d06d88	64c91a990563844118c4c21352c81d52e013c48fcad36f6f1731fd20d34251b7	2026-08-11 15:42:45.303579+00	20260804_add_category_and_featureduntil		\N	2026-08-11 15:42:45.303579+00	0
3f5f6a09-c995-4c60-a39d-5bae15dc7dae	5d5fed3825162017a03e4c363393825fb53f2cce540a8bab4bc1e9d2b0054eaf	2026-08-11 15:42:47.302113+00	20260811_phase1_unified_auth_and_dealers		\N	2026-08-11 15:42:47.302113+00	0
8a892036-211c-415c-bb50-88ec91a6c810	cc6a79f9dd7849ebab2c6944d8318f6649947a9420c17d73aaeb6213692141d8	2026-08-11 15:42:49.31444+00	20260811_phase1_audit_governance	\N	\N	2026-08-11 15:42:49.293331+00	1
82475efa-00b8-407c-9b95-84b1bfdb526f	b2e98386381cf6850a5c08a5c81e70f9cf638a6686b37b208e4de1d28ce042d3	2026-08-11 15:42:49.36273+00	20260811_phase1_legacy_schema_reconciliation	\N	\N	2026-08-11 15:42:49.315222+00	1
1afa4e0f-33cf-45ff-9882-7512d00377d6	19a2b8087cd6f50a003f34a788399a03b45a0974bdc4a6ff6b2d0b8c233b63ee	2026-08-11 16:24:31.779245+00	20260811_phase2_listing_moderation_audit	\N	\N	2026-08-11 16:24:31.772062+00	1
b079102b-9e4f-48b0-b021-990ba50da448	63df78d7c4223a107beca17b1d12bfb15434846576c05299da08638f3976a21b	2026-08-11 16:24:31.791171+00	20260811_phase3_services_marketplace	\N	\N	2026-08-11 16:24:31.780035+00	1
\.


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: AuthSession AuthSession_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuthSession"
    ADD CONSTRAINT "AuthSession_pkey" PRIMARY KEY (id);


--
-- Name: Conversation Conversation_pkey; Type: CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_pkey" PRIMARY KEY (id);


--
-- Name: DealerProfile DealerProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DealerProfile"
    ADD CONSTRAINT "DealerProfile_pkey" PRIMARY KEY (id);


--
-- Name: Dealer Dealer_pkey; Type: CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."Dealer"
    ADD CONSTRAINT "Dealer_pkey" PRIMARY KEY (id);


--
-- Name: Document Document_pkey; Type: CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_pkey" PRIMARY KEY (id);


--
-- Name: Favorite Favorite_pkey; Type: CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_pkey" PRIMARY KEY (id);


--
-- Name: Inquiry Inquiry_pkey; Type: CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."Inquiry"
    ADD CONSTRAINT "Inquiry_pkey" PRIMARY KEY (id);


--
-- Name: JournalEntry JournalEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."JournalEntry"
    ADD CONSTRAINT "JournalEntry_pkey" PRIMARY KEY (id);


--
-- Name: ListingRequest ListingRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."ListingRequest"
    ADD CONSTRAINT "ListingRequest_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: ModerationLog ModerationLog_pkey; Type: CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."ModerationLog"
    ADD CONSTRAINT "ModerationLog_pkey" PRIMARY KEY (id);


--
-- Name: NewsletterSubscription NewsletterSubscription_pkey; Type: CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."NewsletterSubscription"
    ADD CONSTRAINT "NewsletterSubscription_pkey" PRIMARY KEY (id);


--
-- Name: Promotion Promotion_pkey; Type: CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."Promotion"
    ADD CONSTRAINT "Promotion_pkey" PRIMARY KEY (id);


--
-- Name: ProvenanceMilestone ProvenanceMilestone_pkey; Type: CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."ProvenanceMilestone"
    ADD CONSTRAINT "ProvenanceMilestone_pkey" PRIMARY KEY (id);


--
-- Name: ServiceListing ServiceListing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ServiceListing"
    ADD CONSTRAINT "ServiceListing_pkey" PRIMARY KEY (id);


--
-- Name: UserActivity UserActivity_pkey; Type: CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."UserActivity"
    ADD CONSTRAINT "UserActivity_pkey" PRIMARY KEY (id);


--
-- Name: UserNote UserNote_pkey; Type: CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."UserNote"
    ADD CONSTRAINT "UserNote_pkey" PRIMARY KEY (id);


--
-- Name: User User_passwordResetToken_key; Type: CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_passwordResetToken_key" UNIQUE ("passwordResetToken");


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: VehicleImage VehicleImage_pkey; Type: CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."VehicleImage"
    ADD CONSTRAINT "VehicleImage_pkey" PRIMARY KEY (id);


--
-- Name: Vehicle Vehicle_pkey; Type: CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."Vehicle"
    ADD CONSTRAINT "Vehicle_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AuditLog_action_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_action_createdAt_idx" ON public."AuditLog" USING btree (action, "createdAt");


--
-- Name: AuditLog_actorId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_actorId_createdAt_idx" ON public."AuditLog" USING btree ("actorId", "createdAt");


--
-- Name: AuditLog_targetId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_targetId_createdAt_idx" ON public."AuditLog" USING btree ("targetId", "createdAt");


--
-- Name: AuthSession_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuthSession_expiresAt_idx" ON public."AuthSession" USING btree ("expiresAt");


--
-- Name: AuthSession_tokenHash_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "AuthSession_tokenHash_key" ON public."AuthSession" USING btree ("tokenHash");


--
-- Name: AuthSession_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuthSession_userId_idx" ON public."AuthSession" USING btree ("userId");


--
-- Name: Conversation_participant1Id_participant2Id_key; Type: INDEX; Schema: public; Owner: hermes_car
--

CREATE UNIQUE INDEX "Conversation_participant1Id_participant2Id_key" ON public."Conversation" USING btree ("participant1Id", "participant2Id");


--
-- Name: DealerProfile_approvalStatus_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "DealerProfile_approvalStatus_idx" ON public."DealerProfile" USING btree ("approvalStatus");


--
-- Name: DealerProfile_country_city_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "DealerProfile_country_city_idx" ON public."DealerProfile" USING btree (country, city);


--
-- Name: DealerProfile_ownerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "DealerProfile_ownerId_key" ON public."DealerProfile" USING btree ("ownerId");


--
-- Name: Dealer_email_key; Type: INDEX; Schema: public; Owner: hermes_car
--

CREATE UNIQUE INDEX "Dealer_email_key" ON public."Dealer" USING btree (email);


--
-- Name: Favorite_userId_vehicleId_key; Type: INDEX; Schema: public; Owner: hermes_car
--

CREATE UNIQUE INDEX "Favorite_userId_vehicleId_key" ON public."Favorite" USING btree ("userId", "vehicleId");


--
-- Name: JournalEntry_slug_key; Type: INDEX; Schema: public; Owner: hermes_car
--

CREATE UNIQUE INDEX "JournalEntry_slug_key" ON public."JournalEntry" USING btree (slug);


--
-- Name: NewsletterSubscription_email_key; Type: INDEX; Schema: public; Owner: hermes_car
--

CREATE UNIQUE INDEX "NewsletterSubscription_email_key" ON public."NewsletterSubscription" USING btree (email);


--
-- Name: Promotion_expiresAt_idx; Type: INDEX; Schema: public; Owner: hermes_car
--

CREATE INDEX "Promotion_expiresAt_idx" ON public."Promotion" USING btree ("expiresAt");


--
-- Name: Promotion_vehicleId_status_idx; Type: INDEX; Schema: public; Owner: hermes_car
--

CREATE INDEX "Promotion_vehicleId_status_idx" ON public."Promotion" USING btree ("vehicleId", status);


--
-- Name: ServiceListing_isPublished_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ServiceListing_isPublished_category_idx" ON public."ServiceListing" USING btree ("isPublished", category);


--
-- Name: ServiceListing_ownerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ServiceListing_ownerId_idx" ON public."ServiceListing" USING btree ("ownerId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: hermes_car
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Vehicle_ownerId_idx; Type: INDEX; Schema: public; Owner: hermes_car
--

CREATE INDEX "Vehicle_ownerId_idx" ON public."Vehicle" USING btree ("ownerId");


--
-- Name: Vehicle_slug_key; Type: INDEX; Schema: public; Owner: hermes_car
--

CREATE UNIQUE INDEX "Vehicle_slug_key" ON public."Vehicle" USING btree (slug);


--
-- Name: idx_moderationlog_moderator; Type: INDEX; Schema: public; Owner: hermes_car
--

CREATE INDEX idx_moderationlog_moderator ON public."ModerationLog" USING btree ("moderatorId", "createdAt");


--
-- Name: idx_moderationlog_request; Type: INDEX; Schema: public; Owner: hermes_car
--

CREATE INDEX idx_moderationlog_request ON public."ModerationLog" USING btree ("listingRequestId", "createdAt");


--
-- Name: idx_moderationlog_target; Type: INDEX; Schema: public; Owner: hermes_car
--

CREATE INDEX idx_moderationlog_target ON public."ModerationLog" USING btree ("targetUserId", "createdAt");


--
-- Name: idx_moderationlog_vehicle; Type: INDEX; Schema: public; Owner: hermes_car
--

CREATE INDEX idx_moderationlog_vehicle ON public."ModerationLog" USING btree ("vehicleId", "createdAt");


--
-- Name: idx_useractivity_action; Type: INDEX; Schema: public; Owner: hermes_car
--

CREATE INDEX idx_useractivity_action ON public."UserActivity" USING btree (action, "createdAt");


--
-- Name: idx_useractivity_user; Type: INDEX; Schema: public; Owner: hermes_car
--

CREATE INDEX idx_useractivity_user ON public."UserActivity" USING btree ("userId", "createdAt");


--
-- Name: idx_usernote_user; Type: INDEX; Schema: public; Owner: hermes_car
--

CREATE INDEX idx_usernote_user ON public."UserNote" USING btree ("userId", "createdAt");


--
-- Name: AuthSession AuthSession_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuthSession"
    ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Conversation Conversation_participant1Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_participant1Id_fkey" FOREIGN KEY ("participant1Id") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Conversation Conversation_participant2Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_participant2Id_fkey" FOREIGN KEY ("participant2Id") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DealerProfile DealerProfile_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DealerProfile"
    ADD CONSTRAINT "DealerProfile_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Document Document_vehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES public."Vehicle"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Favorite Favorite_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Favorite Favorite_vehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES public."Vehicle"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: JournalEntry JournalEntry_vehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."JournalEntry"
    ADD CONSTRAINT "JournalEntry_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES public."Vehicle"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ListingRequest ListingRequest_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."ListingRequest"
    ADD CONSTRAINT "ListingRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Message Message_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."Conversation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_receiverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Message Message_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ModerationLog ModerationLog_moderatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."ModerationLog"
    ADD CONSTRAINT "ModerationLog_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES public."User"(id);


--
-- Name: ModerationLog ModerationLog_targetUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."ModerationLog"
    ADD CONSTRAINT "ModerationLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES public."User"(id);


--
-- Name: Promotion Promotion_vehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."Promotion"
    ADD CONSTRAINT "Promotion_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES public."Vehicle"(id) ON DELETE CASCADE;


--
-- Name: ProvenanceMilestone ProvenanceMilestone_vehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."ProvenanceMilestone"
    ADD CONSTRAINT "ProvenanceMilestone_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES public."Vehicle"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ServiceListing ServiceListing_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ServiceListing"
    ADD CONSTRAINT "ServiceListing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserActivity UserActivity_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."UserActivity"
    ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: UserNote UserNote_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."UserNote"
    ADD CONSTRAINT "UserNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id);


--
-- Name: UserNote UserNote_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."UserNote"
    ADD CONSTRAINT "UserNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: VehicleImage VehicleImage_vehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."VehicleImage"
    ADD CONSTRAINT "VehicleImage_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES public."Vehicle"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Vehicle Vehicle_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hermes_car
--

ALTER TABLE ONLY public."Vehicle"
    ADD CONSTRAINT "Vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO hermes_car;


--
-- Name: TYPE "AccountRole"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TYPE public."AccountRole" TO hermes_car;


--
-- Name: TYPE "AuditAction"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TYPE public."AuditAction" TO hermes_car;


--
-- Name: TYPE "DealerApprovalStatus"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TYPE public."DealerApprovalStatus" TO hermes_car;


--
-- Name: TABLE "AuditLog"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."AuditLog" TO hermes_car;


--
-- Name: TABLE "AuthSession"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."AuthSession" TO hermes_car;


--
-- Name: TABLE "DealerProfile"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."DealerProfile" TO hermes_car;


--
-- Name: TABLE "ServiceListing"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."ServiceListing" TO hermes_car;


--
-- Name: TABLE _prisma_migrations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public._prisma_migrations TO hermes_car;


--
-- PostgreSQL database dump complete
--

\unrestrict cjOUppdmZcYtEN80MaxTn09GqN8PamXpl0NSyy34fkCGwDD2Lb4th1fnSHdOhGL

