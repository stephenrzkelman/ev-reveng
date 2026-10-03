import { gen, move, heal, selfdmg } from "../../reveng";
import { Move } from "../../../calc/src";
import { boardState, team1, team2,  move_shortnames as m  } from "./baltimore-info";

export let battleLog1 = [
    // Rillaboom In
    (() => boardState.terrain='Grassy'),
    // Charizard mega evolves
    (() => boardState.weather='Sun'),
    () => move(team2.Rilla, team1.Aero, new Move(gen, 'Grassy Glide'), 54, boardState),
    () => move(team1.Zard, team2.Sneasler, m.HW, 29, boardState),
    () => move(team1.Zard, team2['Kommo-o'],m.HW, 66, boardState),
    // Terrain
    () => heal(team2['Sneasler'], 35, 4),
    () => heal(team2['Kommo-o'], 73, 4),
    // Leftovers
    () => heal(team2['Kommo-o'], 79, 4),
    () => move(team1.Zard, team2['Kommo-o'],m.HW, 47, boardState),
    // Clangorous Soul
    () => selfdmg(team2['Kommo-o'], 14, 3),
    () => team2['Kommo-o'].pokemon.boosts = {hp: 0, atk:1, def: 1, spa: 1, spd: 1, spe: 1},
    // Terrain
    () => heal(team2['Sneasler'], 41, 4),
    () => heal(team2['Kommo-o'], 20, 4),
    // Leftovers
    () => heal(team2['Kommo-o'], 26, 4),
    // Incin switches in
    () => team1.Zard.pokemon.boosts.atk -= 1,
    () => team1.Aero.pokemon.boosts.atk -= 1,
    () => move(team1.Zard, team2.Incin,m.HW, 77, boardState),
    // Terrain
    () => heal(team2['Kommo-o'], 33, 4),
    () => heal(team2['Incin'], 83, 4),
    // Lefties
    () => heal(team2['Kommo-o'], 39, 4),
    // Terrain Ends
    () => boardState.terrain = undefined,
    () => move(team1.Aero, team2.Incin,m.RS, 55, boardState),
    () => move(team1.Aero, team2['Kommo-o'],m.RS, 33, boardState),
    () => move(team2['Kommo-o'], team1.Aero, new Move(gen, 'Aura Sphere'), 0, boardState),
    // Lefties
    () => heal(team2['Kommo-o'], 40, 4),
    // Sun Ends
    () => boardState.weather = undefined,
    // Rilla swaps in
    () => boardState.terrain = 'Grassy',
    () => move(team1.Chomp, team2.Rilla, new Move(gen, 'Earthquake'), 92, boardState),
    // Eject button ==> incin
    () => team1.Chomp.pokemon.boosts.atk -= 1,
    () => team1.Zard.pokemon.boosts.atk -= 1,
    () => move(team1.Zard, team2.Incin,m.HW, 39, boardState),
    // Sitrus
    () => heal(team2.Incin, 64, 2),
    // Terrain
    () => heal(team2['Kommo-o'], 46, 4),
    () => heal(team2.Incin, 70, 4),
    // Lefties
    () => heal(team2['Kommo-o'], 52, 4),
    () => move(team2['Kommo-o'], team1.Kingambit,m.ClangScale, 73, boardState),
    () => team2['Kommo-o'].pokemon.boosts.def -= 1,
    () => move(team2.Incin, team1.Kingambit, new Move(gen, 'Flare Blitz'), 8, boardState, true, 3, 48),
    // Terrain
    () => heal(team2['Kommo-o'], 58, 4),
    () => heal(team1.Kingambit, 14, 4),
    () => heal(team2.Incin, 54, 4),
    // Lefties
    () => heal(team2['Kommo-o'], 65, 4),
    () => move(team2['Kommo-o'], team1.Kingambit,m.ClangScale, 0, boardState),
    () => move(team2['Kommo-o'], team1.Chomp,m.ClangScale, 0, boardState),
    () => team2['Kommo-o'].pokemon.boosts.def -= 1,
    // Terrain
    () => heal(team2['Kommo-o'], 71, 4),
    () => heal(team2.Sneasler, 47, 4),
    // Lefties
    () => heal(team2['Kommo-o'], 77, 4),
]