import { move, heal } from "../../reveng";
import { boardState, team1, team2,  move_shortnames as m  } from "./baltimore-info";

export let battleLog2 = [
    // Intimidate
    () => team1.Kingambit.pokemon.boosts.atk -= 1,
    () => team1.Chomp.pokemon.boosts.atk -= 1,
    // Defiant
    () => team1.Kingambit.pokemon.boosts.atk += 2,
    () => move(team2.Incin, team1.Kingambit,m.FO, 95, boardState),
    () => move(team1.Chomp, team2.Incin,m.Stomp, 61, boardState),// false, undefined, undefined, true),
    // Rillaboom in
    () => boardState.terrain = 'Grassy',
    () => move(team1.Chomp, team2.Incin,m.Stomp, 25, boardState),
    () => heal(team2.Incin, 50, 2),
    () => move(team1.Kingambit, team2.Rilla,m.Kowtow, 34, boardState),
    // Parting Shot
    () => team1.Kingambit.pokemon.boosts.atk -= 1,
    () => team1.Kingambit.pokemon.boosts.atk += 2,
    () => team1.Kingambit.pokemon.boosts.spa -= 1,
    () => team1.Kingambit.pokemon.boosts.atk += 2,
    // Indeedee in
    () => boardState.terrain = 'Psychic',
    // Incin in, intimidate
    () => team1.Gard.pokemon.boosts.atk -= 1,
    () => team1.Indeedee.pokemon.boosts.atk -= 1,
    () => move(team1.Gard, team2.Gengar,m.EForce, 0, boardState),
    // Helping hand Hyper Voice
    () => boardState.attackerSide.isHelpingHand = true,
    () => move(team1.Gard, team2.Incin,m.HVoice, 0, boardState),
    () => boardState.attackerSide.isHelpingHand = false,
];