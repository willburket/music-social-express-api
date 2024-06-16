interface BetSlip {
  id: number | null;
  username: string | null;
  user_id: number | null;
  bet_1_id: number | null;
  bet_1_odds: number | null;
  bet_2_id: number | null;
  bet_2_odds: number | null;
  bet_3_id: number | null;
  bet_3_odds: number | null;
  bet_4_id: number | null;
  bet_4_odds: number | null;
  bet_5_id: number | null;
  bet_5_odds: number | null;
  odds: number | null;
  wager: number | null;
  payout: number | null;
  outcome: string | null;
}

export default BetSlip;
