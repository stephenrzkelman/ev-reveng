import { Generations } from "./calc/src/data";
import { StatsTable } from '@pkmn/dex';
import { Pokemon } from "./calc/src";
import { Move } from './calc/src';
import { Field } from "./calc/src";
import { calcStat } from './calc/src';
import { 
    AugmentedMon,
    move_eliminateImpossibleEvSpreads,
    heal_eliminateImpossibleEvSpreads,
    selfdmg_eliminateImpossibleEvSpreads,
    resetHps
} from "./reveng";

const gen = Generations.get(0);
const boardState = new Field(
    {
        gameType: 'Doubles'
    }
);

var team1 = {
    "Zard": new AugmentedMon(
            new Pokemon(gen, 'Charizard-Mega-Y', {
            level: 50,
            ability: 'Drought',
            item: 'Charizardite Y',
            nature: 'Modest',
            evs: {},
            boosts: {}
        }),
        undefined,
        new Set([0,1])
    ),
    "Aero": new AugmentedMon(
        new Pokemon(
            gen,
            "Aerodactyl",
            {
                level: 50,
                ability: 'Unnerve',
                item: "Focus Sash",
                nature: 'Jolly',
            }
        ), 
        new Map<StatsTable<number>, Set<number>>([
            [{ hp: 2, atk: 32, spa:0, spe: 32, def: 0, spd: 0 }, new Set([157])]
        ])
    ),
    "Chomp": new AugmentedMon(
        new Pokemon(
            gen, "Garchomp",
            {
                level: 50,
                ability: 'Rough Skin',
                item: "Sitrus Berry",
                nature: 'Jolly',
            }
        )
    ),
    "Kingambit": new AugmentedMon(
        new Pokemon(
            gen, "Kingambit",
            {
                level: 50,
                ability: 'Defiant',
                item: 'Chople Berry',
                nature: 'Adamant'
            }
        )
    ),
    "Indeedee": new AugmentedMon(
        new Pokemon(
            gen, "Indeedee-F",
            {
                level: 50,
                ability: 'Psychic Surge',
                item: 'Rocky Helmet',
                nature: 'Bold'
            }
        )
    ),
    "Gard": new AugmentedMon(
        new Pokemon(
            gen, "Gardevoir-Mega",
            {
                level: 50,
                ability: 'Pixilate',
                item: 'Gardevoirite',
                nature: 'Modest'
            }
        )
    )
}

var team2 = {
    "Rilla": new AugmentedMon(
        new Pokemon(gen, 'Rillaboom', {
            level: 50,
            ability: 'Grassy Surge',
            item: 'Eject Button',
            nature: 'Sassy',
        })
    ),
    "Sneasler": new AugmentedMon(
        new Pokemon(gen, 'Sneasler', {
            level: 50,
            ability: 'Unburden',
            item: 'Grassy Seed',
            nature: 'Adamant',
        })
    ),
    "Kommo-o": new AugmentedMon(
        new Pokemon(gen, 'Kommo-o', {
            level: 50,
            ability: 'Soundproof',
            item: 'Leftovers',
            nature: 'Modest'
        })
    ),
    "Incin": new AugmentedMon(
        new Pokemon(gen, "Incineroar", {
            level: 50,
            ability: 'Intimidate',
            item: 'Sitrus Berry',
            nature: 'Sassy'
        })
    ),
    "Gengar": new AugmentedMon(
        new Pokemon(gen, "Gengar-Mega", {
            level: 50,
            ability: 'Shadow Tag',
            item: 'Gengarite',
            nature: 'Modest'
        })
    )
}


let HW = new Move(gen, 'Heat Wave');
let ClangScale = new Move(gen, 'Clanging Scales');
let RS = new Move(gen, 'Rock Slide');
let FO = new Move(gen, 'Fake Out');
let Stomp = new Move(gen, 'Stomping Tantrum');
let Kowtow = new Move(gen, 'Kowtow Cleave');
let EForce = new Move(gen, 'Expanding Force');
let HVoice = new Move(gen, 'Hyper Voice');

let game1Log = [
    // Rillaboom In
    (() => boardState.terrain='Grassy'),
    // Charizard mega evolves
    (() => boardState.weather='Sun'),
    () => move_eliminateImpossibleEvSpreads(team2.Rilla, team1.Aero, new Move(gen, 'Grassy Glide'), 54),
    () => move_eliminateImpossibleEvSpreads(team1.Zard, team2.Sneasler, HW, 29),
    () => move_eliminateImpossibleEvSpreads(team1.Zard, team2['Kommo-o'], HW, 66),
    // Terrain
    () => heal_eliminateImpossibleEvSpreads(team2['Sneasler'], 35, 4),
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 73, 4),
    // Leftovers
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 79, 4),
    () => move_eliminateImpossibleEvSpreads(team1.Zard, team2['Kommo-o'], HW, 47),
    // Clangorous Soul
    () => selfdmg_eliminateImpossibleEvSpreads(team2['Kommo-o'], 14, 3),
    () => team2['Kommo-o'].pokemon.boosts = {hp: 0, atk:1, def: 1, spa: 1, spd: 1, spe: 1},
    // Terrain
    () => heal_eliminateImpossibleEvSpreads(team2['Sneasler'], 41, 4),
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 20, 4),
    // Leftovers
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 26, 4),
    // Incin switches in
    () => team1.Zard.pokemon.boosts.atk -= 1,
    () => team1.Aero.pokemon.boosts.atk -= 1,
    () => move_eliminateImpossibleEvSpreads(team1.Zard, team2.Incin, HW, 77),
    // Terrain
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 33, 4),
    () => heal_eliminateImpossibleEvSpreads(team2['Incin'], 83, 4),
    // Lefties
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 39, 4),
    // Terrain Ends
    () => boardState.terrain = undefined,
    () => move_eliminateImpossibleEvSpreads(team1.Aero, team2.Incin, RS, 55),
    () => move_eliminateImpossibleEvSpreads(team1.Aero, team2['Kommo-o'], RS, 33),
    () => move_eliminateImpossibleEvSpreads(team2['Kommo-o'], team1.Aero, new Move(gen, 'Aura Sphere'), 0),
    // Lefties
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 40, 4),
    // Sun Ends
    () => boardState.weather = undefined,
    // Rilla swaps in
    () => boardState.terrain = 'Grassy',
    () => move_eliminateImpossibleEvSpreads(team1.Chomp, team2.Rilla, new Move(gen, 'Earthquake'), 92),
    // Eject button ==> incin
    () => team1.Chomp.pokemon.boosts.atk -= 1,
    () => team1.Zard.pokemon.boosts.atk -= 1,
    () => move_eliminateImpossibleEvSpreads(team1.Zard, team2.Incin, HW, 39),
    // Sitrus
    () => heal_eliminateImpossibleEvSpreads(team2.Incin, 64, 2),
    // Terrain
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 46, 4),
    () => heal_eliminateImpossibleEvSpreads(team2.Incin, 70, 4),
    // Lefties
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 52, 4),
    () => move_eliminateImpossibleEvSpreads(team2['Kommo-o'], team1.Kingambit, ClangScale, 73),
    () => team2['Kommo-o'].pokemon.boosts.def -= 1,
    () => move_eliminateImpossibleEvSpreads(team2.Incin, team1.Kingambit, new Move(gen, 'Flare Blitz'), 8, true, 3, 48),
    // Terrain
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 58, 4),
    () => heal_eliminateImpossibleEvSpreads(team1.Kingambit, 14, 4),
    () => heal_eliminateImpossibleEvSpreads(team2.Incin, 54, 4),
    // Lefties
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 65, 4),
    () => move_eliminateImpossibleEvSpreads(team2['Kommo-o'], team1.Kingambit, ClangScale, 0),
    () => move_eliminateImpossibleEvSpreads(team2['Kommo-o'], team1.Chomp, ClangScale, 0),
    () => team2['Kommo-o'].pokemon.boosts.def -= 1,
    // Terrain
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 71, 4),
    () => heal_eliminateImpossibleEvSpreads(team2.Sneasler, 47, 4),
    // Lefties
    () => heal_eliminateImpossibleEvSpreads(team2['Kommo-o'], 77, 4),
];
let game2Log = [
    // Intimidate
    () => team1.Kingambit.pokemon.boosts.atk -= 1,
    () => team1.Chomp.pokemon.boosts.atk -= 1,
    // Defiant
    () => team1.Kingambit.pokemon.boosts.atk += 2,
    () => move_eliminateImpossibleEvSpreads(team2.Incin, team1.Kingambit, FO, 95),
    () => move_eliminateImpossibleEvSpreads(team1.Chomp, team2.Incin, Stomp, 61),
    // Rillaboom in
    () => boardState.terrain = 'Grassy',
    () => move_eliminateImpossibleEvSpreads(team1.Chomp, team2.Incin, Stomp, 25),
    () => heal_eliminateImpossibleEvSpreads(team2.Incin, 50, 2),
    () => move_eliminateImpossibleEvSpreads(team1.Kingambit, team2.Rilla, Kowtow, 34),
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
    () => move_eliminateImpossibleEvSpreads(team1.Gard, team2.Gengar, EForce, 0),
    () => move_eliminateImpossibleEvSpreads(team1.Gard, team2.Incin, HVoice, 0)
];
console.log("#########################################");
console.log("################# GAME 1 ################");
console.log("#########################################");
for(const event of game1Log){
    event();
}
resetHps(team1);
resetHps(team2);
boardState.weather = undefined;
boardState.terrain = undefined;
console.log();
console.log("#########################################");
console.log("################# GAME 2 ################");
console.log("#########################################");
for(const event of game2Log){
    event();
}
console.log("Kommo-o has ", team2['Kommo-o'].possibleDefensiveSpreads.size, " possible defensive spreads");
console.log("Sneasler has ", team2['Sneasler'].possibleDefensiveSpreads.size, " possible defensive spreads");