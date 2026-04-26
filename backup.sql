--
-- PostgreSQL database dump
--

\restrict CooPGJ7McbH646zR97SP8m8er5AZm5XkaZYRkFcmdcpyNQ5tXRaWk8Ox9c8OXIq

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: kyc_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.kyc_status_enum AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE public.kyc_status_enum OWNER TO postgres;

--
-- Name: kycstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.kycstatus AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE public.kycstatus OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    bank_name character varying(100) NOT NULL,
    account_type character varying(20) NOT NULL,
    masked_account character varying(20) NOT NULL,
    currency character(3) DEFAULT 'INR'::bpchar,
    balance numeric(14,2) DEFAULT 0.00,
    is_primary boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- Name: accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accounts_id_seq OWNER TO postgres;

--
-- Name: accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accounts_id_seq OWNED BY public.accounts.id;


--
-- Name: admin_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_logs (
    id integer NOT NULL,
    admin_id integer NOT NULL,
    action text NOT NULL,
    target_type character varying(100) NOT NULL,
    target_id integer NOT NULL,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admin_logs OWNER TO postgres;

--
-- Name: admin_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_logs_id_seq OWNER TO postgres;

--
-- Name: admin_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_logs_id_seq OWNED BY public.admin_logs.id;


--
-- Name: alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alerts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying(50) NOT NULL,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.alerts OWNER TO postgres;

--
-- Name: alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alerts_id_seq OWNER TO postgres;

--
-- Name: alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.alerts_id_seq OWNED BY public.alerts.id;


--
-- Name: bills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bills (
    id integer NOT NULL,
    user_id integer NOT NULL,
    biller_name character varying(100) NOT NULL,
    due_date date NOT NULL,
    amount_due numeric(14,2) NOT NULL,
    status character varying(15) DEFAULT 'upcoming'::character varying,
    auto_pay boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    paid_date timestamp without time zone,
    CONSTRAINT bills_status_check CHECK (((status)::text = ANY ((ARRAY['upcoming'::character varying, 'paid'::character varying, 'overdue'::character varying])::text[])))
);


ALTER TABLE public.bills OWNER TO postgres;

--
-- Name: bills_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bills_id_seq OWNER TO postgres;

--
-- Name: bills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bills_id_seq OWNED BY public.bills.id;


--
-- Name: budget_alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budget_alerts (
    id integer NOT NULL,
    budget_id integer NOT NULL,
    user_id integer NOT NULL,
    category character varying(50) NOT NULL,
    alert_type character varying(20) NOT NULL,
    threshold_reached integer DEFAULT 0,
    current_spending numeric(14,2) NOT NULL,
    message character varying(255) NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.budget_alerts OWNER TO postgres;

--
-- Name: budget_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.budget_alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.budget_alerts_id_seq OWNER TO postgres;

--
-- Name: budget_alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.budget_alerts_id_seq OWNED BY public.budget_alerts.id;


--
-- Name: budget_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budget_history (
    id integer NOT NULL,
    budget_id integer NOT NULL,
    user_id integer NOT NULL,
    category character varying(50) NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    limit_amount numeric(14,2) NOT NULL,
    spent_amount numeric(14,2) DEFAULT 0.00,
    remaining_amount numeric(14,2) DEFAULT 0.00,
    usage_percent numeric(5,2) DEFAULT 0.00,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.budget_history OWNER TO postgres;

--
-- Name: budget_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.budget_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.budget_history_id_seq OWNER TO postgres;

--
-- Name: budget_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.budget_history_id_seq OWNED BY public.budget_history.id;


--
-- Name: budget_recommendations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budget_recommendations (
    id integer NOT NULL,
    user_id integer NOT NULL,
    category character varying(50) NOT NULL,
    current_budget numeric(14,2),
    recommended_budget numeric(14,2) NOT NULL,
    average_spend numeric(14,2) NOT NULL,
    confidence_score numeric(5,2) DEFAULT 0.00,
    reasoning character varying(500),
    is_applied boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    applied_at timestamp without time zone
);


ALTER TABLE public.budget_recommendations OWNER TO postgres;

--
-- Name: budget_recommendations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.budget_recommendations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.budget_recommendations_id_seq OWNER TO postgres;

--
-- Name: budget_recommendations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.budget_recommendations_id_seq OWNED BY public.budget_recommendations.id;


--
-- Name: budget_subcategories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budget_subcategories (
    id integer NOT NULL,
    budget_id integer NOT NULL,
    user_id integer NOT NULL,
    parent_category character varying(50) NOT NULL,
    subcategory_name character varying(50) NOT NULL,
    limit_amount numeric(14,2) NOT NULL,
    spent_amount numeric(14,2) DEFAULT 0.00,
    month integer NOT NULL,
    year integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.budget_subcategories OWNER TO postgres;

--
-- Name: budget_subcategories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.budget_subcategories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.budget_subcategories_id_seq OWNER TO postgres;

--
-- Name: budget_subcategories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.budget_subcategories_id_seq OWNED BY public.budget_subcategories.id;


--
-- Name: budgets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budgets (
    id integer NOT NULL,
    user_id integer NOT NULL,
    category character varying(50) NOT NULL,
    limit_amount numeric(14,2) NOT NULL,
    spent_amount numeric(14,2) DEFAULT 0.00,
    month integer NOT NULL,
    year integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    rollover_enabled boolean DEFAULT false,
    is_spending_frozen boolean DEFAULT false,
    color_code character varying(20) DEFAULT 'default'::character varying,
    CONSTRAINT budgets_month_check CHECK (((month >= 1) AND (month <= 12))),
    CONSTRAINT budgets_year_check CHECK ((year >= 2000))
);


ALTER TABLE public.budgets OWNER TO postgres;

--
-- Name: budgets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.budgets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.budgets_id_seq OWNER TO postgres;

--
-- Name: budgets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.budgets_id_seq OWNED BY public.budgets.id;


--
-- Name: custom_budget_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_budget_categories (
    id integer NOT NULL,
    user_id integer NOT NULL,
    category_name character varying(50) NOT NULL,
    icon_emoji character varying(10) DEFAULT '💰'::character varying,
    color_hex character varying(7) DEFAULT '#2563eb'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.custom_budget_categories OWNER TO postgres;

--
-- Name: custom_budget_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_budget_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_budget_categories_id_seq OWNER TO postgres;

--
-- Name: custom_budget_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_budget_categories_id_seq OWNED BY public.custom_budget_categories.id;


--
-- Name: custom_goals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_goals (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(500),
    goal_type character varying(20) NOT NULL,
    target_value numeric(12,2) NOT NULL,
    current_value numeric(12,2) DEFAULT 0,
    category character varying(50) NOT NULL,
    target_date date,
    priority character varying(20) DEFAULT 'medium'::character varying,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.custom_goals OWNER TO postgres;

--
-- Name: custom_goals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_goals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_goals_id_seq OWNER TO postgres;

--
-- Name: custom_goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_goals_id_seq OWNED BY public.custom_goals.id;


--
-- Name: email_otps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_otps (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    otp_hash character varying(255) NOT NULL,
    purpose character varying(50) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    is_used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.email_otps OWNER TO postgres;

--
-- Name: email_otps_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.email_otps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_otps_id_seq OWNER TO postgres;

--
-- Name: email_otps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.email_otps_id_seq OWNED BY public.email_otps.id;


--
-- Name: redemptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.redemptions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    redemption_type character varying(50) NOT NULL,
    points_used integer NOT NULL,
    amount_value numeric(12,2) NOT NULL,
    partner character varying(100),
    status character varying(20) DEFAULT 'Pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone
);


ALTER TABLE public.redemptions OWNER TO postgres;

--
-- Name: redemptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.redemptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.redemptions_id_seq OWNER TO postgres;

--
-- Name: redemptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.redemptions_id_seq OWNED BY public.redemptions.id;


--
-- Name: referrals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.referrals (
    id integer NOT NULL,
    referrer_id integer NOT NULL,
    referred_email character varying(100) NOT NULL,
    referred_user_id integer,
    referral_code character varying(50) NOT NULL,
    bonus_points integer DEFAULT 500,
    status character varying(20) DEFAULT 'Pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone
);


ALTER TABLE public.referrals OWNER TO postgres;

--
-- Name: referrals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.referrals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.referrals_id_seq OWNER TO postgres;

--
-- Name: referrals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.referrals_id_seq OWNED BY public.referrals.id;


--
-- Name: rewards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rewards (
    id integer NOT NULL,
    user_id integer NOT NULL,
    program_name character varying(100) NOT NULL,
    points_balance integer DEFAULT 0,
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.rewards OWNER TO postgres;

--
-- Name: rewards_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rewards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rewards_id_seq OWNER TO postgres;

--
-- Name: rewards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rewards_id_seq OWNED BY public.rewards.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    account_id integer NOT NULL,
    description character varying(255),
    category character varying(50),
    merchant character varying(100),
    amount numeric(14,2) NOT NULL,
    currency character(3) DEFAULT 'INR'::bpchar,
    txn_type character varying(10) NOT NULL,
    status character varying(15) DEFAULT 'posted'::character varying,
    txn_date timestamp without time zone NOT NULL,
    posted_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    bill_id integer,
    CONSTRAINT transactions_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'posted'::character varying, 'failed'::character varying, 'reversed'::character varying])::text[]))),
    CONSTRAINT transactions_txn_type_check CHECK (((txn_type)::text = ANY ((ARRAY['debit'::character varying, 'credit'::character varying])::text[])))
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_id_seq OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: user_goals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_goals (
    id integer NOT NULL,
    user_id integer NOT NULL,
    savings_goal double precision DEFAULT 20.0,
    spending_goal double precision DEFAULT 100000.0,
    bills_goal double precision DEFAULT 100.0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_goals OWNER TO postgres;

--
-- Name: user_goals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_goals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_goals_id_seq OWNER TO postgres;

--
-- Name: user_goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_goals_id_seq OWNED BY public.user_goals.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(200) NOT NULL,
    phone character varying(10) NOT NULL,
    kyc_status public.kyc_status_enum DEFAULT 'unverified'::public.kyc_status_enum,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts ALTER COLUMN id SET DEFAULT nextval('public.accounts_id_seq'::regclass);


--
-- Name: admin_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_logs ALTER COLUMN id SET DEFAULT nextval('public.admin_logs_id_seq'::regclass);


--
-- Name: alerts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts ALTER COLUMN id SET DEFAULT nextval('public.alerts_id_seq'::regclass);


--
-- Name: bills id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills ALTER COLUMN id SET DEFAULT nextval('public.bills_id_seq'::regclass);


--
-- Name: budget_alerts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_alerts ALTER COLUMN id SET DEFAULT nextval('public.budget_alerts_id_seq'::regclass);


--
-- Name: budget_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_history ALTER COLUMN id SET DEFAULT nextval('public.budget_history_id_seq'::regclass);


--
-- Name: budget_recommendations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_recommendations ALTER COLUMN id SET DEFAULT nextval('public.budget_recommendations_id_seq'::regclass);


--
-- Name: budget_subcategories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_subcategories ALTER COLUMN id SET DEFAULT nextval('public.budget_subcategories_id_seq'::regclass);


--
-- Name: budgets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets ALTER COLUMN id SET DEFAULT nextval('public.budgets_id_seq'::regclass);


--
-- Name: custom_budget_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_budget_categories ALTER COLUMN id SET DEFAULT nextval('public.custom_budget_categories_id_seq'::regclass);


--
-- Name: custom_goals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_goals ALTER COLUMN id SET DEFAULT nextval('public.custom_goals_id_seq'::regclass);


--
-- Name: email_otps id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_otps ALTER COLUMN id SET DEFAULT nextval('public.email_otps_id_seq'::regclass);


--
-- Name: redemptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.redemptions ALTER COLUMN id SET DEFAULT nextval('public.redemptions_id_seq'::regclass);


--
-- Name: referrals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.referrals ALTER COLUMN id SET DEFAULT nextval('public.referrals_id_seq'::regclass);


--
-- Name: rewards id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rewards ALTER COLUMN id SET DEFAULT nextval('public.rewards_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: user_goals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_goals ALTER COLUMN id SET DEFAULT nextval('public.user_goals_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounts (id, user_id, bank_name, account_type, masked_account, currency, balance, is_primary, created_at) FROM stdin;
4	32	Chase Bank	current	96789634243	INR	179112.00	f	2025-12-26 18:16:06.201751
17	32	PDCCB	savings	40456714585	INR	202200.00	t	2025-12-28 17:50:20.795085
5	32	Bank of America	savings	789546684444	INR	118998.00	f	2025-12-26 18:16:06.201751
\.


--
-- Data for Name: admin_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_logs (id, admin_id, action, target_type, target_id, "timestamp") FROM stdin;
\.


--
-- Data for Name: alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alerts (id, user_id, type, message, created_at) FROM stdin;
\.


--
-- Data for Name: bills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bills (id, user_id, biller_name, due_date, amount_due, status, auto_pay, created_at, paid_date) FROM stdin;
29	32	Swiggy	2026-01-15	550.00	paid	f	2026-01-12 12:02:45.661779	\N
30	32	BSNL	2026-01-13	420.00	paid	f	2026-01-12 15:41:11.237977	\N
31	32	Zomato	2026-01-12	782.00	paid	f	2026-01-12 15:45:26.056979	\N
34	32	Water	2026-01-13	755.00	paid	f	2026-01-13 04:04:06.977867	\N
33	32	Internet	2026-01-14	500.00	paid	f	2026-01-12 15:55:52.069767	\N
35	32	Flipkart	2026-01-23	165.00	paid	f	2026-01-13 06:00:44.557865	\N
36	32	Rapido	2026-01-17	554.00	paid	f	2026-01-13 06:07:42.656416	2026-01-13 11:37:50.841458
37	32	Amazon	2026-01-24	7444.00	paid	f	2026-01-13 06:12:56.319032	2026-01-13 11:43:00.622411
38	32	Internet 	2026-01-17	665.00	paid	f	2026-01-13 06:44:13.085158	2026-01-13 12:14:33.277991
39	32	Amazon	2026-01-14	2235.00	paid	f	2026-01-13 06:55:18.506075	2026-01-13 12:42:51.138655
41	32	Zomato	2026-01-13	420.00	paid	f	2026-01-14 10:04:29.714217	2026-01-14 16:21:31.819674
42	32	Gas Connection	2026-01-14	890.00	paid	f	2026-01-14 10:50:50.487214	2026-01-14 22:41:37.050437
40	32	Flipkart	2026-01-15	623.00	paid	f	2026-01-13 06:57:51.963623	2026-01-15 09:18:21.699551
43	32	Swiggy	2026-01-16	741.00	paid	f	2026-01-15 15:11:48.463948	2026-01-16 11:44:54.731278
44	32	Internet Bill	2026-01-17	7841.00	paid	f	2026-01-16 11:11:22.590527	2026-01-16 16:41:29.183958
45	32	Home Rent	2026-01-15	10000.00	paid	f	2026-01-16 12:02:30.880932	2026-01-16 17:33:25.916507
46	32	Home Rent	2026-01-15	10000.00	paid	f	2026-01-16 12:17:19.81081	2026-01-18 10:55:57.150055
47	32	Zomato	2026-01-23	5000.00	paid	f	2026-01-18 05:26:21.838827	2026-01-18 10:56:27.833116
48	32	swiggy	2026-01-24	10000.00	paid	f	2026-01-18 05:42:34.688518	2026-01-18 11:12:39.235783
49	32	Home rent	2026-01-08	15000.00	paid	f	2026-01-18 05:58:31.775132	2026-01-18 11:28:36.83058
50	32	Gas	2025-12-21	15000.00	paid	f	2026-01-18 06:10:57.360062	2026-01-18 11:41:04.211932
51	32	water	2025-12-22	15000.00	paid	f	2026-01-18 06:17:23.574594	2026-01-18 11:47:30.312706
53	32	Zomato	2026-01-02	400.00	paid	f	2026-01-18 06:43:26.189606	2026-01-18 12:13:33.524856
28	32	Swiggy	2026-01-12	558.00	paid	f	2026-01-12 10:59:52.21977	\N
52	32	Internet	2026-01-08	5000.00	paid	f	2026-01-18 06:37:27.757688	2026-01-18 12:13:38.162809
54	32	Gas Connection	2026-01-17	890.00	paid	f	2026-01-19 12:01:26.232749	2026-01-19 18:08:20.911419
56	32	Internet 	2026-01-19	500.00	paid	f	2026-01-19 12:02:08.022621	2026-01-19 18:09:12.004148
55	32	Home rent	2026-02-01	10000.00	paid	f	2026-01-19 12:01:49.54257	2026-02-07 10:38:59.720606
57	32	Amazon	2026-02-13	2000.00	paid	f	2026-02-11 09:16:55.444185	2026-02-11 16:32:25.679908
61	32	Swiggy	2026-02-11	550.00	paid	f	2026-02-11 11:04:09.03438	2026-02-11 16:34:13.547781
60	32	Gas Connection	2026-02-01	850.00	paid	f	2026-02-11 11:03:36.76381	2026-02-11 17:33:51.708524
59	32	Water Bill	2026-02-11	1000.00	paid	f	2026-02-11 11:03:16.864409	2026-02-11 17:34:47.877703
58	32	Internet Provider	2026-02-13	4500.00	paid	f	2026-02-11 11:02:58.343887	2026-04-25 17:26:17.579851
62	32	Electricity	2026-05-01	10000.00	paid	f	2026-04-25 11:56:52.917747	2026-04-25 17:26:57.518793
63	32	Zomato	2026-04-30	4200.00	paid	f	2026-04-25 12:04:52.692685	2026-04-25 17:34:55.650615
64	32	Flipkart	2026-04-30	12000.00	paid	f	2026-04-25 12:08:44.432797	2026-04-25 17:38:47.441112
65	32	Kelvin	2026-04-28	5000.00	paid	f	2026-04-25 12:11:31.542475	2026-04-25 17:41:34.884984
66	32	Ajio	2026-04-29	1087.00	paid	f	2026-04-25 12:16:46.024463	2026-04-25 17:46:48.632159
\.


--
-- Data for Name: budget_alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.budget_alerts (id, budget_id, user_id, category, alert_type, threshold_reached, current_spending, message, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: budget_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.budget_history (id, budget_id, user_id, category, month, year, limit_amount, spent_amount, remaining_amount, usage_percent, created_at) FROM stdin;
\.


--
-- Data for Name: budget_recommendations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.budget_recommendations (id, user_id, category, current_budget, recommended_budget, average_spend, confidence_score, reasoning, is_applied, created_at, applied_at) FROM stdin;
\.


--
-- Data for Name: budget_subcategories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.budget_subcategories (id, budget_id, user_id, parent_category, subcategory_name, limit_amount, spent_amount, month, year, created_at) FROM stdin;
\.


--
-- Data for Name: budgets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.budgets (id, user_id, category, limit_amount, spent_amount, month, year, created_at, rollover_enabled, is_spending_frozen, color_code) FROM stdin;
2	32	Shopping	9000.00	0.00	1	2026	2026-01-03 07:41:49.710689	f	f	default
1	32	Utilities	110000.00	0.00	1	2026	2026-01-02 18:30:29.453599	f	f	default
5	32	Food	140000.00	0.00	1	2026	2026-01-03 13:40:36.346517	f	f	default
6	39	Utilities	20000.00	0.00	1	2026	2026-01-19 04:55:19.348746	f	f	default
7	39	Food	25000.00	0.00	1	2026	2026-01-19 04:56:37.945999	f	f	default
8	39	Transport	10000.00	0.00	1	2026	2026-01-19 04:56:53.141294	f	f	default
9	39	Shopping	15000.00	0.00	1	2026	2026-01-19 04:57:06.492493	f	f	default
11	32	Food	10000.00	0.00	2	2026	2026-02-11 09:16:21.594758	f	f	default
10	32	Utilities	8000.00	0.00	2	2026	2026-02-07 05:08:48.549597	f	f	default
\.


--
-- Data for Name: custom_budget_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_budget_categories (id, user_id, category_name, icon_emoji, color_hex, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: custom_goals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_goals (id, user_id, name, description, goal_type, target_value, current_value, category, target_date, priority, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: email_otps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_otps (id, email, otp_hash, purpose, expires_at, is_used, created_at) FROM stdin;
1	bajibabu692@gmail.com	$2b$12$GaXHXySLWvX8nfbUzRjaZ.d77GKcGYflBokmmA8tIJ4LuSB5F6Y6.	register	2025-12-20 07:44:53.033154	f	2025-12-20 07:39:53.03415
37	bajibabu692@gmail.com	$2b$12$P1umUypTP6fB42SQyRLH.eK/w/nYg0qIpgORTbWMxKLtENcosv6Xy	register	2025-12-22 11:11:37.976168	t	2025-12-22 11:06:37.986004
2	bajibabu692@gmail.com	$2b$12$hcWYG/BTqfEOjYVZEuLzG.R1VZSi7X9aifaCDFkEbDOmck03pnvt.	register	2025-12-20 08:03:02.064206	t	2025-12-20 07:58:02.064206
3	bajibabumiriyala82@gmail.com	$2b$12$KY9XHPKrxKGWCRLDPYfN8uoDeHckr/dbYpc1btPD5a2xVI2rZjj5W	register	2025-12-21 17:04:24.491028	t	2025-12-21 16:59:24.499098
4	bajibabu692@gmail.com	$2b$12$vkXB/QF2CKFbwxbbkAzJt.9tDIo70KvCPkzojdamHms7q1CeYlo4O	register	2025-12-22 01:02:34.143752	f	2025-12-22 00:57:34.143752
5	bajibabu692@gmail.com	$2b$12$cFIrY8tsba.vrRkRx.foBujFK/YaEMyO/8BVkrH.SkVBhx0M.i/6m	register	2025-12-22 01:03:39.286149	f	2025-12-22 00:58:39.287149
6	bajibabu692@gmail.com	$2b$12$RN5Gfli3ByA03PDIkIqyue72Hy6c094CuppJdUFOYhW3ZlGzt/P9S	register	2025-12-22 01:17:01.133793	f	2025-12-22 01:12:01.133793
7	bajibabu692@gmail.com	$2b$12$xEv9J/lNqx6Nn47R9CkQdeBV5YJmVPHWuHCb8ht8w6kfuV3Apsbj6	register	2025-12-22 05:35:00.289456	t	2025-12-22 05:30:00.303453
8	baji.anu20041@gmail.com	$2b$12$SFTN4CgYuRFNVsbxp7rjFePbBRj2Q2kLKdtpFEDe62F5SM.n4pDwW	register	2025-12-22 05:38:38.658696	f	2025-12-22 05:33:38.658696
9	baji.anu20041@gmail.com	$2b$12$/4H8bVuePXcmMIno3tl/3Onx2Xh0bnT9i8h0TTQjIbj03PEL2IScy	register	2025-12-22 05:48:26.87728	f	2025-12-22 05:43:26.881388
10	bajibabu692@gmail.com	$2b$12$FIkpJ78GOLjnKZDVicclnOC.C.Sp4P55OSxusuv/X0mQDqkk3hd0q	register	2025-12-22 07:49:58.906888	f	2025-12-22 07:44:58.917905
11	bajibabu692@gmail.com	$2b$12$0hw./4fcoPoXEhUPpufUietZn6NAIvBQPHcxeoxHS6Oi8wzBGb9aK	register	2025-12-22 13:46:17.996324	f	2025-12-22 08:11:17.996324
12	bajibabu692@gmail.com	$2b$12$ZzXxLir1wQrv6ARMZPOWUOGj4p5KxTKRVn3DY3oC9XNfSo3/vLY6.	register	2025-12-22 13:50:11.021221	f	2025-12-22 08:15:11.023221
13	bajibabu692@gmail.com	$2b$12$GjizP.ExTipOsn/hQJfWZeAnsuHGHtcyi3AQNDSDy9S6r05vnRhf2	register	2025-12-22 08:24:24.692957	t	2025-12-22 08:19:24.708665
14	bajibabu692@gmail.com	$2b$12$rRwt27cVMqrJr/YnMscCT.aVXH37sXCIng8hmsARiPr30ADr8liwu	reset	2025-12-22 08:25:32.250279	f	2025-12-22 08:20:32.25128
15	bajibabu692@gmail.com	$2b$12$xkKpD8XSJs64tYMdqDceT.6P12v3.7jcBpPhrOslkuUtpauADp6qO	reset	2025-12-22 08:26:42.253913	f	2025-12-22 08:21:42.254913
16	bajibabu692@gmail.com	$2b$12$r/KATkgzk2FvNzOYkiQx4eb7cMN3DpsJMgukGEfPEfLqowRfBvc0.	reset	2025-12-22 08:31:02.280033	f	2025-12-22 08:26:02.280033
17	bajibabu692@gmail.com	$2b$12$2OiXnJTnrFQ1CqHOuxbJieh6zB/k1PJctXeNE3OzYzAtaY1F1viTu	reset	2025-12-22 08:38:08.910755	f	2025-12-22 08:33:08.910755
18	bajibabu692@gmail.com	$2b$12$mXKYehkdtqamEPZ891AzuOfgE4gASlxJ8LGnb4XhCXOG2/ZytnG1y	reset	2025-12-22 08:41:05.655667	f	2025-12-22 08:36:05.655667
19	bajibabu692@gmail.com	$2b$12$RJieIse3PQ6UytWwqgY9buPkwTdvFscWLr5dM7GULDTbSKQPI8T0e	reset	2025-12-22 09:16:23.734719	f	2025-12-22 09:11:23.737626
20	bajibabumiriyala82@gmail.com	$2b$12$.FUaPy42Vxp8Urf00Ohm0umiPmV5WdQIR.RnIMyLmORAR/ta0r9We	register	2025-12-22 09:17:43.456149	t	2025-12-22 09:12:43.457149
21	bajibabumiriyala82@gmail.com	$2b$12$dV.SKIYCMoCJOQl8ZgJWEO9dFzQwpI48LOw.HpftXXrNjgkV/lJQW	reset	2025-12-22 09:20:51.001208	f	2025-12-22 09:15:51.003208
22	bajibabumiriyala82@gmail.com	$2b$12$0CwsXae1qmICQ2Kl7EBImuFKJKy4.lzOEpzbl5v5EyInp5U3AvQFO	reset	2025-12-22 09:22:57.957456	f	2025-12-22 09:17:57.957456
23	bajibabu692@gmail.com	$2b$12$ldpmerAjvpFQdF08X8jxZe7VmGvjrpG56aILiljcLREqlkLsiq5.K	reset	2025-12-22 09:24:36.664221	f	2025-12-22 09:19:36.664221
24	bajibabu692@gmail.com	$2b$12$480/2mP/fg6C/cyMUwnIO.2q4idYfCVe1J/BXKoI1kDFbiG16CtIW	reset	2025-12-22 09:43:08.924117	f	2025-12-22 09:38:08.92612
25	bajibabu692@gmail.com	$2b$12$hKtt4q2NhXtGivVO3LzhReMHnl2gY4Lkn9nWb2KryKdR38m28XnH2	reset	2025-12-22 09:45:37.709564	f	2025-12-22 09:40:37.709564
26	bajibabu692@gmail.com	$2b$12$GOZjrPY42labCLfXUVJOL.Zpmkiq2Acwnjv8UrtUjWo2RuFdvt8py	reset	2025-12-22 09:56:55.733321	f	2025-12-22 09:51:55.734321
27	bajibabu692@gmail.com	$2b$12$E3GC/nlgoNnmyErr7mp38u9IoSnVs.QZ2v4.bvXWYfoYoMDo4SzEC	reset	2025-12-22 10:02:08.639201	f	2025-12-22 09:57:08.639201
28	bajibabu692@gmail.com	$2b$12$K1xKBscD1Qy82.rDph0dreZ/OwscvSIXsbBZf7Wb8c/lL1jK6K2U.	reset	2025-12-22 10:10:52.5811	f	2025-12-22 10:05:52.5831
29	bajibabu692@gmail.com	$2b$12$Npe9xv6yf3dU2Qoe8.1P3.N4nJq1wusyyAEZKhA9ZHKvfPNPGVMCa	reset	2025-12-22 10:17:02.781906	f	2025-12-22 10:12:02.786189
30	bajibabu692@gmail.com	$2b$12$jGDXlMWXglWdDNYhs9hHr.tZGXdu92WQRk9j/uHRXjHTnPmABbQSa	reset	2025-12-22 10:24:12.917453	t	2025-12-22 10:19:12.917453
31	bajibabumiriyala82@gmail.com	$2b$12$a4kf1Uitm2yIWe4UapVhtOxcyOcENERJ5j9bM.BvMmrko2mMTKO7m	reset	2025-12-22 10:26:05.430652	t	2025-12-22 10:21:05.430652
32	bajibabu692@gmail.com	$2b$12$0jJRwIHOzZHNGtbZhbaPgeBlawThvqjuYQ/NTIlqlW2CFvunWhB8W	reset	2025-12-22 10:34:25.721521	t	2025-12-22 10:29:25.726668
33	bajibabumiriyala82@gmail.com	$2b$12$KyC6s2phArKCIL3/d0v7UODP8zIcgjgbGAJDurhvZ779Qrd3zI5CG	register	2025-12-22 10:36:20.306473	t	2025-12-22 10:31:20.307473
34	bajibabumiriyala82@gmail.com	$2b$12$sdK2FL89l3YYTkvAV5Ml9.K7CP5n/2YIsBPAINlBWWUocwZuKMC0y	reset	2025-12-22 10:37:19.469929	f	2025-12-22 10:32:19.469929
35	bajibabumiriyala82@gmail.com	$2b$12$xbntEZGRs.TAH/9TV7aUGO3ODQAa36D5uCHXw24WV8lDjY4SSEVhy	reset	2025-12-22 10:43:53.332069	t	2025-12-22 10:38:53.332069
36	bajibabu692@gmail.com	$2b$12$YITUYotBVNqunx7mG8idf.zKMJgJlvAP0J/nViIVYiH0stxrV9L1.	register	2025-12-22 10:45:28.487428	t	2025-12-22 10:40:28.487428
38	bajibabu692@gmail.com	$2b$12$./UUL81kcPKzCrwjgaqNo.V1eSAWSXFRgAvKqWlRLVng3endabejS	reset	2025-12-22 11:12:34.888134	f	2025-12-22 11:07:34.890136
39	bajibabumiriyala82@gmail.com	$2b$12$TahdSUqDOs/p7SoAbuVwQO8.yPszqUy/CZtlDw.2hIoGbOVOXg7uu	register	2025-12-22 11:18:03.50659	f	2025-12-22 11:13:03.50659
40	bajibabumiriyala82@gmail.com	$2b$12$nLo..hMrFCdQMY/OzgVfqemLaWdCtTp.lXoTCLTAJwVidxg0BwpsO	register	2025-12-22 11:19:38.189036	t	2025-12-22 11:14:38.189036
41	bajibabu692@gmail.com	$2b$12$.szhm37DyrRmppEllxurT.ESej/7xjw.kIo/x8Ngb.NdtDEai7bRW	reset	2025-12-22 11:20:20.712172	f	2025-12-22 11:15:20.712172
42	bajibabu692@gmail.com	$2b$12$MpMvxq0LPQaJELQGcd4JNev8U40xV.ytV0.rLJlVyvEDFFp4rsG..	register	2025-12-22 12:27:27.494708	t	2025-12-22 12:22:27.500709
43	bajibabu692@gmail.com	$2b$12$7ilTmA.Fash99IsgSiLSs.j5x6bk9PrfLu5ye9TOY6BmheSgJQA9.	reset	2025-12-22 12:28:50.197096	t	2025-12-22 12:23:50.198293
44	bajibabumiriyala82@gmail.com	$2b$12$yV6d7DaDn2/EPPA61O9gfe2r6/0zh2sQFQD2B3958kg6vME/ioYo.	register	2025-12-25 07:39:50.832997	t	2025-12-25 07:34:50.832997
45	bajibabu692@gmail.com	$2b$12$KyQ3nRDXV/R1CTsQObMtyuU4g/8A8nkSuJayWgtMiKA00tlCsBZVm	reset	2025-12-25 07:51:02.152434	f	2025-12-25 07:46:02.155437
46	bajibabu692@gmail.com	$2b$12$SWscd9m.4xUR1yQoiUno6.OYRZgDzyIm8r8Pnl6c0j3X3sKA33.mC	reset	2025-12-25 07:52:13.36531	f	2025-12-25 07:47:13.36531
47	bajibabumiriyala82@gmail.com	$2b$12$b.wqSqG5mgESUQdcqLkdbO6T9GLbKXEE1ElO8gpnLBXKevh5VE9Ky	register	2025-12-26 03:17:09.072307	f	2025-12-26 03:12:09.07431
48	bajibabumiriyala82@gmail.com	$2b$12$XRY8ZKa4Tr7ZNDe7S2bnf.qbXfKAnG4xaf5T5weX7qcVsXyiq7jcG	register	2025-12-26 03:18:25.096801	t	2025-12-26 03:13:25.096801
49	bajibabumiriyala82@gmail.com	$2b$12$qqAofX5LKAT8WGRMkgIT5O0szFbG8tYUIHMjJSMipgfDERy8U0jJW	reset	2025-12-26 03:19:29.914743	f	2025-12-26 03:14:29.916486
50	bajibabumiriyala82@gmail.com	$2b$12$3/Xoy8Hc6wFyuuvOwuX3B.eOcNMJcLA5Z.RDqamjBAjxDpWMu.BCK	reset	2025-12-26 03:20:42.712258	f	2025-12-26 03:15:42.712258
51	bajibabumiriyala82@gmail.com	$2b$12$xPVmbC9NMwXOyt6EhAExhuc0eR/onz/O5jbQof61N8rnSAkNJ2rpC	reset	2025-12-26 03:22:51.60909	f	2025-12-26 03:17:51.60909
52	bajibabumiriyala82@gmail.com	$2b$12$M3.JqkKD1oxI3iAxVFzxKuN2IbmsHKw5I.oSX9cqIiXGiwnhmli5.	reset	2025-12-26 03:25:18.595589	t	2025-12-26 03:20:18.596589
53	bajibabumiriyala82@gmail.com	$2b$12$TbU2xMnqNl6feS0V4HORXu6/.r7VAiZGEP9Ryo.R2Aj5F7dpmeIzy	reset	2025-12-26 03:26:50.798182	f	2025-12-26 03:21:50.800183
54	bajibabumiriyala82@gmail.com	$2b$12$uxPeqCzDsjuI1qtSaJJL9O/06l.1dxF8kTHpfT8WnbVt/3Oxz.5QS	reset	2025-12-26 03:27:38.862536	f	2025-12-26 03:22:38.862536
55	bajibabu692@gmail.com	$2b$12$4hzAnIuwhPMHWq9SmaeyMeusLFOdkEmWIZux07LH5bDB7tP3mq5nS	reset	2025-12-26 03:29:07.057032	f	2025-12-26 03:24:07.058032
56	bajibabu692@gmail.com	$2b$12$DdZdBLkwbo.SWJz89NPGzOfPV4HU4dbBSpPkKt0gftq6jfWOFY38O	reset	2025-12-26 03:30:11.955709	f	2025-12-26 03:25:11.957709
57	bajibabu692@gmail.com	$2b$12$odeERATNSGt.pSxmo.5TpOmHibWICzXIO2u6hxaK.i7An351/UhP2	reset	2025-12-26 03:31:16.718503	f	2025-12-26 03:26:16.718503
58	bajibabumiriyala82@gmail.com	$2b$12$aSysh0EZIJte7pY8u35t..T4WX1hSJ3s75v1VIXeMwK2b2MJPFZSu	reset	2025-12-26 03:36:40.714822	f	2025-12-26 03:31:40.71582
59	bajibabu692@gmail.com	$2b$12$pRanbYwDWIqB9zP4zri3E.3abR8VDstb63CU.i7FnaM2P82iB.8kS	reset	2025-12-26 03:54:20.805881	f	2025-12-26 03:49:20.808423
60	bajibabu692@gmail.com	$2b$12$bh.ubypKuCg52C9PVbbXWeuH4oYSF3pEBtJFJ5ftztZ8ADdgzLIda	reset	2025-12-26 03:59:05.028159	f	2025-12-26 03:54:05.028159
61	bajibabu692@gmail.com	$2b$12$GNvr.dBFskWSJyXlXRgwwujFirOSzGcXgu.87eGZIzsEAdJsbOCW2	reset	2025-12-26 04:00:04.395889	t	2025-12-26 03:55:04.395889
62	bajibabu692@gmail.com	$2b$12$LkeRMyuyuqQpYYtAqOW8f.2JRxWRiCLc/r/1Rs6b1CcqXoIn1A3ni	reset	2025-12-26 04:16:47.069316	f	2025-12-26 04:11:47.069316
63	bajibabumiriyala82@gmail.com	$2b$12$v.ob7dzhjdWyloAL/kjm6eA3gRaVYMQp355YhB8hc6w.ir9XosJ.u	reset	2025-12-26 04:22:13.386368	f	2025-12-26 04:17:13.40205
64	baji.anu20041@gmail.com	$2b$12$FypFlKGGlnCGk.rv8X/JJuDkGDDxrtVTgw2GG4k6sZPCvonHi/0Uy	register	2025-12-26 12:32:59.835444	t	2025-12-26 12:27:59.835444
65	baji.anu20041@gmail.com	$2b$12$PvGOjLpoeU.ReU8sFiYE..rf0FgbNvAHdZTpPZmYvJsxXfRjpIe56	reset	2025-12-26 12:34:33.787483	f	2025-12-26 12:29:33.787483
66	bajibabu692@gmail.com	$2b$12$M9uP7gwkQohAQJYclrJzp.Dyq9IVfwis7R2eO/vViftPWZ7mtcXzO	reset	2025-12-27 06:02:31.006559	f	2025-12-27 05:57:31.024471
67	baji.anu20041@gmail.com	$2b$12$ZDol..MewL4cQN1bki9kWu7HfWE.cgrjz0qYlQGWCqFpWsv9Hy7Iu	register	2025-12-27 14:58:08.169857	t	2025-12-27 14:53:08.170857
68	bajibabumiriyala82@gmail.com	$2b$12$Qw51UT6uOevADQ0gwckYnOAH390Tj7CNUM6LUyZyStO5x0u9EO8JS	register	2025-12-29 11:37:00.445118	t	2025-12-29 11:32:00.475184
69	bajibabumiriyala82@gmail.com	$2b$12$5Lf1RCCpg0bmTxirTQpMq.Qet73cmC.KPGlDpn14S1svYCEhBLgyy	reset	2025-12-29 11:37:46.716737	t	2025-12-29 11:32:46.716737
70	baji.anu20041@gmail.com	$2b$12$jWfkkNqMdlh/n0RI0lM8E.k2AQivVjcpKgN5c7bhNTMSHXhTN3JZ2	reset	2026-01-02 17:33:29.512753	t	2026-01-02 17:28:29.525303
71	baji.twitter0099@gmail.com	$2b$12$sPUXv06pv1ckWn84S5GsQuV2/pet.7XNXNRfM4p0RoiKgbeEuPLOG	register	2026-01-15 14:44:22.486942	f	2026-01-15 14:39:22.491742
72	baji.twitter0099@gmail.com	$2b$12$VH5fMu0Z5VNoHFqWifTTH.sWlz5/CipJZtQ.hlEB2lJOpB0xDx/2m	register	2026-01-15 14:48:52.343406	f	2026-01-15 14:43:52.355022
73	bajibabu692@gmail.com	$2b$12$e.TaBTyGnwSCMzaMWZDfIec6edufXkXzqJ7tYCQX2CcJfudEmlBmO	reset	2026-01-15 15:01:22.405458	f	2026-01-15 14:56:22.411908
74	bajibabu692@gmail.com	$2b$12$Gexo/fb90PaE2J5iuRqNlu.uGw05QBZJ1r0KGsl4vTm8lLsLlgMIW	reset	2026-01-15 15:12:52.218512	t	2026-01-15 15:07:52.218512
75	baji.twitter0099@gmail.com	$2b$12$PibaUv..ZOLX1bUT4XfU7eq.u91vIy.uPQzxgw/T/gPIPx690ir2y	register	2026-01-15 15:14:35.845959	t	2026-01-15 15:09:35.846933
76	baji.anu20041@gmail.com	$2b$12$Rfgu1ejedzbfSu6pZQGFR.eRf4/IKdvRrd.zqzR09nMRyYQvPHRWG	reset	2026-01-15 15:36:14.36199	t	2026-01-15 15:31:14.37389
77	bajibabu692@gmail.com	$2b$12$ROEQjZJ8VCKWTJxvZWdvW.rF5FCbvI5u7CHZu1DhqUJfpYYG4KHYC	reset	2026-01-18 12:14:18.514418	t	2026-01-18 12:09:18.519617
78	baji.anu20041@gmail.com	$2b$12$Ayy6MMkdwF0shPuY6x.55.Lk6QxAlMS9Rl09gHr2Qdr4G0L5eW7ZG	email_change	2026-01-18 12:53:22.370853	t	2026-01-18 12:43:22.38243
79	bajibabu692@gmail.com	$2b$12$aYzd9WguTtXvs4gCMwOhPOcnG26RSm0pwqDBvZtVffq9VNDQFmPKe	email_change	2026-01-18 12:55:25.444219	t	2026-01-18 12:45:25.444219
80	baji.anu20041@gmail.com	$2b$12$YWPeacuXXy4d9NJthoSCyeH9cYvCNEa1trBYs8acskWvxVwxT7LJS	email_change	2026-01-18 13:04:35.5341	f	2026-01-18 12:54:35.542275
81	baji.anu20041@gmail.com	$2b$12$Gi9I8OtXEby3bwgHVDn/teNDk2kw8gMuWKiBxKRoka3kim.9SQLRC	email_change	2026-01-18 13:05:24.344301	t	2026-01-18 12:55:24.344301
82	bajibabu692@gmail.com	$2b$12$j32rbG9dfrJre5lGbwm4Su4TssOnSdX5lbvh8JyZ561TE1U5nRzEC	email_change	2026-01-18 13:10:46.683509	t	2026-01-18 13:00:46.683509
83	baji.anu20041@gmail.com	$2b$12$0zjYCX34SnTE9kxnIPpHQ.bI8Hee1aUyaAt8Yic0aS0Fu6KC55vDG	register	2026-01-18 13:17:25.554326	f	2026-01-18 13:12:25.603543
84	bajibabu692@gmail.com	$2b$12$xk5GkDGzvbYw6Q72Qc7YZ.6uXY3Vj/lVkMNE4W5DeE.bIPHWahbgS	reset	2026-01-18 13:18:36.921452	f	2026-01-18 13:13:36.921452
85	bajibabu692@gmail.com	$2b$12$iSCcUs3UJZXCHNrBoFQAeOe8WA9iqfGMcu2PMoZtyl7n5tyV2m7wG	reset	2026-01-18 13:22:33.236984	f	2026-01-18 13:17:33.236984
86	bajibabu692@gmail.com	$2b$12$gFCmA7d.Fo2YKzUyk1MRt.tstEN/sAMC32L3Ngi6iDEaCiZcmxS2.	reset	2026-01-18 13:24:24.442905	f	2026-01-18 13:19:24.443905
87	bajibabu692@gmail.com	$2b$12$VrlsU0RRCiBst4ogLov2NujhOaHSahnCRij/YNW6gCiu8A3XyxBAO	reset	2026-01-18 13:26:42.10381	f	2026-01-18 13:21:42.10381
88	bajibabu692@gmail.com	$2b$12$EpBfb3A.Oq.MOkK7mVxveuP9j9yLJpy1W9/q5dgWh5EigDHkQXg.W	reset	2026-01-18 13:29:12.670658	f	2026-01-18 13:24:12.671658
89	baji.anu20041@gmail.com	$2b$12$am2xEayr1DmUwH61fMalMORy.yJa6wl1voCZU5yUn5EpUaQGcVSBK	register	2026-01-18 13:30:44.941971	t	2026-01-18 13:25:44.941971
90	bajibabumiriyala82@gmail.com	$2b$12$djHqn6xkj1siZvn4S.Rmb.7heHwvgmSSTMYrSm6EqXOI7nHylnXNe	email_change	2026-01-18 13:37:07.265724	f	2026-01-18 13:27:07.265724
91	baji.anu20041@gmail.com	$2b$12$Tc6oebhK2pQMD66Vs0gRmetgwLcbF2WeVMF7nZfM.sTVrPUN3nbhu	reset	2026-01-18 13:34:37.355942	f	2026-01-18 13:29:37.355942
92	baji.anu20041@gmail.com	$2b$12$/lRolclX1i4LCfe56.FdceZrY.pTz3zSzXNRh7w4mHaYEIraLsIqq	reset	2026-01-18 13:35:48.830812	f	2026-01-18 13:30:48.831812
93	bajibabu69@gmail.com	$2b$12$7hHU8Ty3QaNDln8J6X7w9eY0j6ZthPT4RNkq.AAOxfTXpYdH1aMaC	email_change	2026-01-18 13:41:23.762924	f	2026-01-18 13:31:23.763926
94	bajibabu69@gmail.com	$2b$12$JDArSrvUIm8UmPTCgWaAXOiHl5grO9QBhibC2KUxav0k4.I0ruduO	email_change	2026-01-18 13:42:31.642422	f	2026-01-18 13:32:31.642422
95	bajibabu692@gmail.com	$2b$12$0/4JQAgWN/klizTknofGMerCLbC69VaFDm6cweEscGqDPv/6C0S/m	reset	2026-01-19 05:35:12.934516	f	2026-01-19 05:30:12.941515
96	bajibabu692@gmail.com	$2b$12$GzR2hmJqbylB9O.BvsWEauA1BLRtC2KWhEmXIIJtV3Jc9BMlZlSvi	reset	2026-01-19 12:09:43.777253	f	2026-01-19 12:04:43.779764
97	bajibabumiriyala82@gmail.com	$2b$12$W1gytxRbpQXAcwJ7eGCz7exGXYPfS4zfPNxBHgRb7NKZ1mDLKz9uq	email_change	2026-01-19 12:51:49.378208	t	2026-01-19 12:41:49.379208
98	bajibabu692@gmail.com	$2b$12$fJQLR/7q5/lEBfdkR/OR9O.EiX.2kLBJoAmbwYzIpk28iOBLtP8G.	email_change	2026-01-23 11:38:46.337079	t	2026-01-23 11:28:46.339079
99	bajibabu692@gmail.com	$2b$12$5mbb6yR3l/vaU/q04IuSjeXY5TzaK9rK9fZeqimDTI8bewD1AddqK	reset	2026-03-17 15:04:59.353278	t	2026-03-17 14:59:59.355281
100	bajibabu692@gmail.com	$2b$12$HQOKCRPd9XsmwsKvaLj0HeJTE8WcZodbnk4RanM7aGb6Z4QVWNM0m	reset	2026-04-25 12:33:18.983575	t	2026-04-25 12:28:18.990059
\.


--
-- Data for Name: redemptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.redemptions (id, user_id, redemption_type, points_used, amount_value, partner, status, created_at, completed_at) FROM stdin;
27	32	Cashback	100	1.00	\N	Completed	2026-04-25 12:05:21.646655	\N
31	32	Cashback	100	1.00	\N	Completed	2026-04-25 12:06:54.645839	\N
32	32	Gift Cards	500	4.75	\N	Pending	2026-04-25 12:15:56.924493	\N
33	32	Cashback	100	1.00	\N	Completed	2026-04-25 12:16:02.516653	\N
34	32	Cashback	100	1.00	\N	Completed	2026-04-25 12:32:37.575154	\N
35	32	Cashback	100	1.00	\N	Completed	2026-04-25 16:37:10.674308	\N
\.


--
-- Data for Name: referrals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.referrals (id, referrer_id, referred_email, referred_user_id, referral_code, bonus_points, status, created_at, completed_at) FROM stdin;
\.


--
-- Data for Name: rewards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rewards (id, user_id, program_name, points_balance, last_updated) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, account_id, description, category, merchant, amount, currency, txn_type, status, txn_date, posted_date, bill_id) FROM stdin;
169	17	Internet Provider	Utilities	BSNL	500.00	INR	debit	posted	2026-01-02 12:00:00	2026-04-25 11:42:17.53505	\N
170	17	Salary Credit	Income	Company XYZ	45000.00	INR	credit	posted	2026-01-01 12:00:00	2026-04-25 11:42:17.53505	\N
171	17	Water Bill	Utilities	Municipality	750.00	INR	debit	posted	2026-01-03 12:00:00	2026-04-25 11:42:17.53505	\N
172	17	Grocery Shopping	Food	Whole Foods	1200.00	INR	debit	posted	2026-01-04 12:00:00	2026-04-25 11:42:17.53505	\N
173	4	Internet Provider	Utilities	BSNL	500.00	INR	debit	posted	2026-01-02 12:00:00	2026-04-25 11:42:39.376021	\N
174	4	Salary Credit	Income	Company XYZ	45000.00	INR	credit	posted	2026-01-01 12:00:00	2026-04-25 11:42:39.376021	\N
175	4	Water Bill	Utilities	Municipality	750.00	INR	debit	posted	2026-01-03 12:00:00	2026-04-25 11:42:39.376021	\N
176	4	Grocery Shopping	Food	Whole Foods	1200.00	INR	debit	posted	2026-01-04 12:00:00	2026-04-25 11:42:39.376021	\N
177	4	Rent	Uncategorized	Landlord	15000.00	INR	debit	posted	2026-01-05 12:00:00	2026-04-25 11:42:39.376021	\N
178	4	Uber Ride	Transport	Uber	850.00	INR	debit	posted	2026-01-06 12:00:00	2026-04-25 11:42:39.376021	\N
179	4	Zomato Order	Food	Zomato	1200.00	INR	debit	posted	2026-01-07 12:00:00	2026-04-25 11:42:39.376021	\N
180	4	Electricity Bill	Utilities	Power Corp	2500.00	INR	debit	posted	2026-01-08 12:00:00	2026-04-25 11:42:39.376021	\N
181	4	Phone Recharge	Uncategorized	Airtel	599.00	INR	debit	posted	2026-01-09 12:00:00	2026-04-25 11:42:39.376021	\N
182	4	Netflix Subscription	Uncategorized	Netflix	499.00	INR	debit	posted	2026-01-10 12:00:00	2026-04-25 11:42:39.376021	\N
183	4	Amazon Purchase	Shopping	Amazon	3200.00	INR	debit	posted	2026-01-11 12:00:00	2026-04-25 11:42:39.376021	\N
184	4	Coffee Shop	Uncategorized	Starbucks	450.00	INR	debit	posted	2026-01-12 12:00:00	2026-04-25 11:42:39.376021	\N
185	4	Gym Membership	Uncategorized	FitLife	2500.00	INR	debit	posted	2026-01-13 12:00:00	2026-04-25 11:42:39.376021	\N
186	4	Restaurant Dinner	Food	Fine Dining	2200.00	INR	debit	posted	2026-01-14 12:00:00	2026-04-25 11:42:39.376021	\N
187	4	Gas Refill	Utilities	Petrol Pump	3500.00	INR	debit	posted	2026-01-15 12:00:00	2026-04-25 11:42:39.376021	\N
188	4	Credit Card Bill	Income	Amex	12000.00	INR	debit	posted	2026-01-16 12:00:00	2026-04-25 11:42:39.376021	\N
189	4	Grocery Shopping	Food	Whole Foods	950.00	INR	debit	posted	2026-01-17 12:00:00	2026-04-25 11:42:39.376021	\N
190	4	Taxi Fare	Transport	Ola	650.00	INR	debit	posted	2026-01-18 12:00:00	2026-04-25 11:42:39.376021	\N
191	4	Movie Tickets	Uncategorized	Cinema	800.00	INR	debit	posted	2026-01-19 12:00:00	2026-04-25 11:42:39.376021	\N
192	4	Online Course	Uncategorized	Coursera	999.00	INR	debit	posted	2026-01-20 12:00:00	2026-04-25 11:42:39.376021	\N
193	5	Internet Provider	Utilities	BSNL	500.00	INR	debit	posted	2026-01-02 12:00:00	2026-04-25 11:47:39.100309	\N
194	5	Salary Credit	Income	Company XYZ	45000.00	INR	credit	posted	2026-01-01 12:00:00	2026-04-25 11:47:39.100309	\N
195	5	Water Bill	Utilities	Municipality	750.00	INR	debit	posted	2026-01-03 12:00:00	2026-04-25 11:47:39.100309	\N
196	5	Grocery Shopping	Food	Whole Foods	1200.00	INR	debit	posted	2026-01-04 12:00:00	2026-04-25 11:47:39.100309	\N
197	5	Rent	Uncategorized	Landlord	15000.00	INR	debit	posted	2026-01-05 12:00:00	2026-04-25 11:47:39.100309	\N
198	5	Uber Ride	Transport	Uber	850.00	INR	debit	posted	2026-01-06 12:00:00	2026-04-25 11:47:39.100309	\N
199	5	Zomato Order	Food	Zomato	1200.00	INR	debit	posted	2026-01-07 12:00:00	2026-04-25 11:47:39.100309	\N
200	5	Electricity Bill	Utilities	Power Corp	2500.00	INR	debit	posted	2026-01-08 12:00:00	2026-04-25 11:47:39.100309	\N
201	5	Phone Recharge	Uncategorized	Airtel	599.00	INR	debit	posted	2026-01-09 12:00:00	2026-04-25 11:47:39.100309	\N
203	5	Amazon Purchase	Shopping	Amazon	3200.00	INR	debit	posted	2026-01-11 12:00:00	2026-04-25 11:47:39.100309	\N
204	5	Coffee Shop	Uncategorized	Starbucks	450.00	INR	debit	posted	2026-01-12 12:00:00	2026-04-25 11:47:39.100309	\N
205	5	Gym Membership	Uncategorized	FitLife	2500.00	INR	debit	posted	2026-01-13 12:00:00	2026-04-25 11:47:39.100309	\N
206	5	Restaurant Dinner	Food	Fine Dining	2200.00	INR	debit	posted	2026-01-14 12:00:00	2026-04-25 11:47:39.100309	\N
207	5	Gas Refill	Utilities	Petrol Pump	3500.00	INR	debit	posted	2026-01-15 12:00:00	2026-04-25 11:47:39.100309	\N
208	5	Credit Card Bill	Income	Amex	12000.00	INR	debit	posted	2026-01-16 12:00:00	2026-04-25 11:47:39.100309	\N
209	5	Grocery Shopping	Food	Whole Foods	950.00	INR	debit	posted	2026-01-17 12:00:00	2026-04-25 11:47:39.100309	\N
210	5	Taxi Fare	Transport	Ola	650.00	INR	debit	posted	2026-01-18 12:00:00	2026-04-25 11:47:39.100309	\N
211	5	Movie Tickets	Uncategorized	Cinema	800.00	INR	debit	posted	2026-01-19 12:00:00	2026-04-25 11:47:39.100309	\N
212	5	Online Course	Uncategorized	Coursera	999.00	INR	debit	posted	2026-01-20 12:00:00	2026-04-25 11:47:39.100309	\N
213	17	Bill Payment – Internet Provider	Utilities	Internet Provider	4500.00	INR	debit	posted	2026-04-25 00:00:00	2026-04-25 11:56:17.590223	\N
214	5	Bill Payment – Electricity	Utilities	Electricity	10000.00	INR	debit	posted	2026-04-25 00:00:00	2026-04-25 11:56:57.520402	\N
202	5	Netflix Subscription	Utilities	Netflix	499.00	INR	debit	posted	2026-01-10 12:00:00	2026-04-25 11:47:39.100309	\N
215	17	Bill Payment – Zomato	Food	Zomato	4200.00	INR	debit	posted	2026-04-25 00:00:00	2026-04-25 12:04:55.655329	\N
216	5	HD Cashback	Cashback	HD Banking Rewards	1.00	INR	credit	posted	2026-04-25 17:35:21.652299	2026-04-25 12:05:21.655833	\N
217	5	HD Cashback	Cashback	HD Banking Rewards	1.00	INR	credit	posted	2026-04-25 17:36:54.647362	2026-04-25 12:06:54.648363	\N
218	17	Bill Payment – Flipkart	Shopping	Flipkart	12000.00	INR	debit	posted	2026-04-25 00:00:00	2026-04-25 12:08:47.446639	\N
219	5	Bill Payment – Kelvin	Uncategorized	Kelvin	5000.00	INR	debit	posted	2026-04-25 00:00:00	2026-04-25 12:11:34.889083	\N
220	5	HD Cashback	Cashback	HD Banking Rewards	1.00	INR	credit	posted	2026-04-25 17:46:02.520738	2026-04-25 12:16:02.521761	\N
221	17	Bill Payment – Ajio	Uncategorized	Ajio	1087.00	INR	debit	posted	2026-04-25 00:00:00	2026-04-25 12:16:48.633157	\N
222	5	HD Cashback	Cashback	HD Banking Rewards	1.00	INR	credit	posted	2026-04-25 18:02:37.578197	2026-04-25 12:32:37.581119	\N
223	5	HD Cashback	Cashback	HD Banking Rewards	1.00	INR	credit	posted	2026-04-25 22:07:10.691743	2026-04-25 16:37:10.697258	\N
\.


--
-- Data for Name: user_goals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_goals (id, user_id, savings_goal, spending_goal, bills_goal, created_at, updated_at) FROM stdin;
1	32	40	150000	100	2026-01-18 07:22:59.517134	2026-01-19 12:00:29.281481
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, phone, kyc_status, created_at) FROM stdin;
32	Baji Babu Miriyala	bajibabu692@gmail.com	$2b$12$agXTTFlS9335uLGCCnbR6uHtwdZZnr/O5PgPSR1CBOG9qcLSrBCtu	8652674666	verified	2026-01-19 04:43:25.872664
\.


--
-- Name: accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accounts_id_seq', 24, true);


--
-- Name: admin_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_logs_id_seq', 1, false);


--
-- Name: alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.alerts_id_seq', 1, false);


--
-- Name: bills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bills_id_seq', 66, true);


--
-- Name: budget_alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.budget_alerts_id_seq', 1, false);


--
-- Name: budget_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.budget_history_id_seq', 1, false);


--
-- Name: budget_recommendations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.budget_recommendations_id_seq', 1, false);


--
-- Name: budget_subcategories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.budget_subcategories_id_seq', 1, false);


--
-- Name: budgets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.budgets_id_seq', 11, true);


--
-- Name: custom_budget_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_budget_categories_id_seq', 1, false);


--
-- Name: custom_goals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_goals_id_seq', 1, false);


--
-- Name: email_otps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.email_otps_id_seq', 100, true);


--
-- Name: redemptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.redemptions_id_seq', 35, true);


--
-- Name: referrals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.referrals_id_seq', 12, true);


--
-- Name: rewards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rewards_id_seq', 1, false);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 223, true);


--
-- Name: user_goals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_goals_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 39, true);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: admin_logs admin_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_pkey PRIMARY KEY (id);


--
-- Name: alerts alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_pkey PRIMARY KEY (id);


--
-- Name: bills bills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_pkey PRIMARY KEY (id);


--
-- Name: budget_alerts budget_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_alerts
    ADD CONSTRAINT budget_alerts_pkey PRIMARY KEY (id);


--
-- Name: budget_history budget_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_history
    ADD CONSTRAINT budget_history_pkey PRIMARY KEY (id);


--
-- Name: budget_recommendations budget_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_recommendations
    ADD CONSTRAINT budget_recommendations_pkey PRIMARY KEY (id);


--
-- Name: budget_subcategories budget_subcategories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_subcategories
    ADD CONSTRAINT budget_subcategories_pkey PRIMARY KEY (id);


--
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (id);


--
-- Name: custom_budget_categories custom_budget_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_budget_categories
    ADD CONSTRAINT custom_budget_categories_pkey PRIMARY KEY (id);


--
-- Name: custom_goals custom_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_goals
    ADD CONSTRAINT custom_goals_pkey PRIMARY KEY (id);


--
-- Name: email_otps email_otps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_otps
    ADD CONSTRAINT email_otps_pkey PRIMARY KEY (id);


--
-- Name: redemptions redemptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.redemptions
    ADD CONSTRAINT redemptions_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_referral_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referral_code_key UNIQUE (referral_code);


--
-- Name: rewards rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rewards
    ADD CONSTRAINT rewards_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users unique_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_email UNIQUE (email);


--
-- Name: users unique_phone; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_phone UNIQUE (phone);


--
-- Name: user_goals user_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_goals
    ADD CONSTRAINT user_goals_pkey PRIMARY KEY (id);


--
-- Name: user_goals user_goals_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_goals
    ADD CONSTRAINT user_goals_user_id_key UNIQUE (user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_admin_logs_admin_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_logs_admin_id ON public.admin_logs USING btree (admin_id);


--
-- Name: idx_admin_logs_target_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_logs_target_type ON public.admin_logs USING btree (target_type);


--
-- Name: idx_admin_logs_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_logs_timestamp ON public.admin_logs USING btree ("timestamp");


--
-- Name: idx_alerts_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alerts_type ON public.alerts USING btree (type);


--
-- Name: idx_alerts_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alerts_user_id ON public.alerts USING btree (user_id);


--
-- Name: idx_budget_alerts_budget; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_budget_alerts_budget ON public.budget_alerts USING btree (budget_id);


--
-- Name: idx_budget_alerts_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_budget_alerts_user ON public.budget_alerts USING btree (user_id);


--
-- Name: idx_budget_history_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_budget_history_category ON public.budget_history USING btree (category);


--
-- Name: idx_budget_history_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_budget_history_user ON public.budget_history USING btree (user_id);


--
-- Name: idx_budget_recommendations_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_budget_recommendations_user ON public.budget_recommendations USING btree (user_id);


--
-- Name: idx_budget_subcategories_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_budget_subcategories_user ON public.budget_subcategories USING btree (user_id);


--
-- Name: idx_custom_budget_categories_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_custom_budget_categories_user ON public.custom_budget_categories USING btree (user_id);


--
-- Name: idx_email_otps_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_email_otps_email ON public.email_otps USING btree (email);


--
-- Name: idx_email_otps_purpose; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_email_otps_purpose ON public.email_otps USING btree (purpose);


--
-- Name: idx_redemptions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_redemptions_status ON public.redemptions USING btree (status);


--
-- Name: idx_redemptions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_redemptions_user_id ON public.redemptions USING btree (user_id);


--
-- Name: idx_referrals_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_referrals_code ON public.referrals USING btree (referral_code);


--
-- Name: idx_referrals_referrer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_referrals_referrer_id ON public.referrals USING btree (referrer_id);


--
-- Name: idx_referrals_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_referrals_status ON public.referrals USING btree (status);


--
-- Name: idx_rewards_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rewards_user_id ON public.rewards USING btree (user_id);


--
-- Name: accounts accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: admin_logs admin_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: alerts alerts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: bills bills_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: custom_goals custom_goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_goals
    ADD CONSTRAINT custom_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: redemptions redemptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.redemptions
    ADD CONSTRAINT redemptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: referrals referrals_referred_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referred_user_id_fkey FOREIGN KEY (referred_user_id) REFERENCES public.users(id);


--
-- Name: referrals referrals_referrer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.users(id);


--
-- Name: rewards rewards_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rewards
    ADD CONSTRAINT rewards_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_bill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES public.bills(id);


--
-- Name: user_goals user_goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_goals
    ADD CONSTRAINT user_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict CooPGJ7McbH646zR97SP8m8er5AZm5XkaZYRkFcmdcpyNQ5tXRaWk8Ox9c8OXIq

