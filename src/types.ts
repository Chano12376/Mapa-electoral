export interface Leader {
  name: string;
  since: string | null;
  party: { qid: string; name: string } | null;
  source: string;
  sourceUrl: string;
  retrievedAt: string;
  reviewed: boolean;
}

export interface Ideology {
  score: number;
  scale: string;
  source: string;
  sourceUrl: string;
}

export interface Indicator {
  series: { year: number; value: number }[];
  source: string;
}

export interface NextElection {
  date: string;
  type: string;
  whatIsElected: string;
  dateStatus: string;
  source: string;
  sourceUrl: string;
}

export interface PartyResult {
  name: string;
  fullName?: string;
  candidate?: string;
  votePct: number;
  seats?: number;
  color: string;
  inGovt: boolean;
}

export interface ElectionResult {
  electionDate: string;
  electionType: string;
  resultType: "presidencial" | "legislativo";
  totalSeats?: number;
  seatsLabel?: string;
  turnoutPct?: number;
  note?: string;
  source: string;
  sourceUrl: string;
  retrievedAt: string;
  parties: PartyResult[];
}

export interface FreedomHouseIndex {
  year: number;
  score: number;
  status: "Free" | "Partly Free" | "Not Free";
  politicalRights: number;
  civilLiberties: number;
  source: string;
  sourceUrl: string;
  retrievedAt: string;
}

export interface EiuIndex {
  year: number;
  score: number;
  category: "Full democracy" | "Flawed democracy" | "Hybrid regime" | "Authoritarian";
  rank: number;
  source: string;
  sourceUrl: string;
  retrievedAt: string;
}

export interface DemocracyIndices {
  freedomHouse?: FreedomHouseIndex;
  eiu?: EiuIndex;
}

export interface PollParty {
  name: string;
  fullName?: string;
  pct: number;
  color: string;
  inGovt?: boolean;
}

export interface Poll {
  pollster: string;
  fieldwork: string;        // "2025-10" o "2025-10-15"
  sampleSize?: number;
  votingIntention?: PollParty[];
  govtApproval?: {
    approve: number;
    disapprove: number;
    neutral?: number;
  };
  source: string;
  sourceUrl: string;
  retrievedAt: string;
}

export interface CountryPolls {
  note?: string;
  polls: Poll[];
}

export interface CountryData {
  iso3: string;
  name: string;
  region: string;
  headOfState: Leader | null;
  headOfGovernment: Leader | null;
  ideology: { headOfState: Ideology | null; headOfGovernment: Ideology | null };
  nextElection: NextElection | null;
  indicators: {
    gdpUsd: Indicator | null;
    gdpGrowth: Indicator | null;
    inflation: Indicator | null;
    unemployment: Indicator | null;
  };
  builtAt: string;
}
